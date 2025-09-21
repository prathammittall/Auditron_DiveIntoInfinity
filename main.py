import os
import uuid
import shutil
import logging
import time
import asyncio
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict, deque

from fastapi import FastAPI, UploadFile, Form, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from PyPDF2 import PdfReader
from PyPDF2.errors import PdfReadError

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains.question_answering import load_qa_chain
from langchain.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI

import uvicorn
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("❌ GOOGLE_API_KEY not found in environment variables")


# -------------------------
# Rate Limiting Classes
# -------------------------
class RateLimiter:
    """Token bucket rate limiter for API calls"""
    
    def __init__(self, max_requests: int = 60, time_window: int = 60):
        self.max_requests = max_requests
        self.time_window = time_window
        self.requests = deque()
        self.lock = asyncio.Lock()
    
    async def can_proceed(self) -> bool:
        """Check if request can proceed based on rate limit"""
        async with self.lock:
            now = time.time()
            
            # Remove requests outside the time window
            while self.requests and now - self.requests[0] > self.time_window:
                self.requests.popleft()
            
            # Check if we're within limits
            if len(self.requests) < self.max_requests:
                self.requests.append(now)
                return True
            
            return False
    
    def get_reset_time(self) -> int:
        """Get seconds until rate limit resets"""
        if not self.requests:
            return 0
        
        oldest_request = self.requests[0]
        reset_time = oldest_request + self.time_window
        return max(0, int(reset_time - time.time()))

class APIUsageTracker:
    """Track API usage and costs"""
    
    def __init__(self):
        self.daily_usage = defaultdict(int)
        self.monthly_usage = defaultdict(int)
        self.total_tokens = 0
        self.last_reset = datetime.now()
    
    def track_usage(self, tokens_used: int):
        """Track token usage"""
        today = datetime.now().strftime("%Y-%m-%d")
        month = datetime.now().strftime("%Y-%m")
        
        self.daily_usage[today] += tokens_used
        self.monthly_usage[month] += tokens_used
        self.total_tokens += tokens_used
        
        logger.info(f"API Usage - Tokens: {tokens_used}, Daily: {self.daily_usage[today]}, Monthly: {self.monthly_usage[month]}")
    
    def get_usage_stats(self) -> Dict:
        """Get current usage statistics"""
        today = datetime.now().strftime("%Y-%m-%d")
        month = datetime.now().strftime("%Y-%m")
        
        return {
            "daily_tokens": self.daily_usage[today],
            "monthly_tokens": self.monthly_usage[month],
            "total_tokens": self.total_tokens,
            "last_update": datetime.now().isoformat()
        }

# -------------------------
# Enhanced Configuration
# -------------------------
class Config:
    MAX_FILE_SIZE_MB = 50
    MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
    CHUNK_SIZE = 1000  # Increased for fewer chunks
    CHUNK_OVERLAP = 150
    MAX_CHUNKS_FOR_PROCESSING = 100  # Reduced to limit API calls
    SIMILARITY_SEARCH_K = 5  # Reduced from 8
    SIMILARITY_THRESHOLD = 1.2  # More restrictive
    MAX_WORKERS = 2  # Reduced workers
    EMBEDDINGS_MODEL = "sentence-transformers/all-MiniLM-L6-v2"
    LLM_MODEL = "gemini-2.5-flash"  # Use Flash model for cost efficiency
    LLM_TEMPERATURE = 0.2  # Lower temperature for consistency
    LLM_MAX_TOKENS = 1000  # Reduced token limit
    PROGRESS_UPDATE_INTERVAL = 20
    FAISS_INDEX_DIR = "faiss_index"
    UPLOADS_DIR = "uploads"
    STATIC_DIR = "static"
    
    # Rate limiting settings
    MAX_REQUESTS_PER_MINUTE = 15  # Conservative limit
    MAX_DAILY_TOKENS = 50000  # Daily token limit
    COOLDOWN_PERIOD = 5  # Seconds between requests
    
    # Caching settings
    ENABLE_RESPONSE_CACHE = True
    CACHE_TTL_SECONDS = 3600  # 1 hour cache

# -------------------------
# Response Cache
# -------------------------
class ResponseCache:
    """Simple in-memory response cache"""
    
    def __init__(self, ttl_seconds: int = 3600):
        self.cache = {}
        self.ttl = ttl_seconds
    
    def _generate_key(self, question: str, doc_hash: str = "") -> str:
        """Generate cache key"""
        import hashlib
        combined = f"{question.strip().lower()}_{doc_hash}"
        return hashlib.md5(combined.encode()).hexdigest()
    
    def get(self, question: str, doc_hash: str = "") -> Optional[Dict]:
        """Get cached response"""
        key = self._generate_key(question, doc_hash)
        if key in self.cache:
            entry = self.cache[key]
            if time.time() - entry['timestamp'] < self.ttl:
                logger.info(f"Cache hit for question: {question[:50]}...")
                return entry['response']
            else:
                del self.cache[key]
        return None
    
    def set(self, question: str, response: Dict, doc_hash: str = ""):
        """Cache response"""
        key = self._generate_key(question, doc_hash)
        self.cache[key] = {
            'response': response,
            'timestamp': time.time()
        }
        logger.info(f"Cached response for: {question[:50]}...")

# -------------------------
# Enhanced Global State Management
# -------------------------
class AppState:
    def __init__(self):
        self.progress_data: Dict[str, Dict] = {}
        self.task_store: Dict[str, Dict] = {}
        self.embeddings_model: Optional[HuggingFaceEmbeddings] = None
        self.executor: Optional[ThreadPoolExecutor] = None
        self.conversational_chain = None
        
        # Rate limiting components
        self.rate_limiter = RateLimiter(
            max_requests=Config.MAX_REQUESTS_PER_MINUTE,
            time_window=60
        )
        self.usage_tracker = APIUsageTracker()
        self.response_cache = ResponseCache(Config.CACHE_TTL_SECONDS)
        self.last_api_call = 0

    def initialize_embeddings(self):
        """Initialize embeddings model at startup"""
        try:
            logger.info("Initializing embeddings model...")
            self.embeddings_model = HuggingFaceEmbeddings(
                model_name=Config.EMBEDDINGS_MODEL,
                model_kwargs={'device': 'cpu'}
            )
            logger.info("Embeddings model initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize embeddings model: {e}")
            self.embeddings_model = None

    def initialize_executor(self):
        """Initialize thread pool executor"""
        self.executor = ThreadPoolExecutor(max_workers=Config.MAX_WORKERS)

    async def check_rate_limits(self) -> bool:
        """Check if request can proceed based on rate limits"""
        # Check daily token limit
        today = datetime.now().strftime("%Y-%m-%d")
        if self.usage_tracker.daily_usage[today] >= Config.MAX_DAILY_TOKENS:
            raise HTTPException(
                status_code=429,
                detail=f"Daily token limit ({Config.MAX_DAILY_TOKENS}) exceeded. Try again tomorrow."
            )
        
        # Check rate limiter
        if not await self.rate_limiter.can_proceed():
            reset_time = self.rate_limiter.get_reset_time()
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {reset_time} seconds."
            )
        
        # Enforce cooldown
        now = time.time()
        if now - self.last_api_call < Config.COOLDOWN_PERIOD:
            wait_time = Config.COOLDOWN_PERIOD - (now - self.last_api_call)
            await asyncio.sleep(wait_time)
        
        self.last_api_call = time.time()
        return True

    def get_conversational_chain(self):
        """Get or create conversational chain with optimized settings"""
        if self.conversational_chain is None:
            self.conversational_chain = self._create_conversational_chain()
        return self.conversational_chain

    def _create_conversational_chain(self):
        """Create enhanced conversational chain with cost optimization"""
        # Shorter, more focused prompt to reduce token usage
        prompt_template = """
You are Lawgic AI, a legal assistant. 
Use the provided context to answer. 
If the context does not contain the answer, clearly say: 
"I could not find this in the document, but here’s a general insight."

Context:
{context}

Question: {question}

Answer diplomatically:
"""

        try:
            model = ChatGoogleGenerativeAI(
    model=Config.LLM_MODEL,
    temperature=Config.LLM_TEMPERATURE,
    max_output_tokens=Config.LLM_MAX_TOKENS,
    google_api_key=GOOGLE_API_KEY,
    top_p=0.8,
    top_k=20
)

            prompt = PromptTemplate(
                template=prompt_template, 
                input_variables=["context", "question"]
            )
            return load_qa_chain(model, chain_type="stuff", prompt=prompt)
        except Exception as e:
            logger.error(f"Failed to create conversational chain: {e}")
            raise

# Initialize global state
app_state = AppState()

# -------------------------
# Core Functions (Optimized)
# -------------------------
def get_pdf_pages(pdf_file) -> List[Tuple[int, str]]:
    """Extract per-page text from uploaded PDF and return list of (page_number, text)."""
    pages = []
    try:
        if hasattr(pdf_file.file, 'seek'):
            pdf_file.file.seek(0)
        
        pdf_reader = PdfReader(pdf_file.file)
        total_pages = len(pdf_reader.pages)
        
        # Limit pages processed to control costs
        max_pages = min(total_pages, 50)  # Process max 50 pages
        
        for idx in range(max_pages):
            try:
                page = pdf_reader.pages[idx]
                page_text = page.extract_text() or ""
                if page_text.strip():
                    pages.append((idx + 1, page_text))
                
                if idx % 10 == 0:
                    progress = 15 + (idx / max_pages) * 30
                    current_task = getattr(pdf_file, '_task_id', None)
                    if current_task and current_task in app_state.progress_data:
                        app_state.progress_data[current_task].update({
                            "progress": int(progress),
                            "message": f"Extracting text... {idx+1}/{max_pages} pages"
                        })
            except Exception as e:
                logger.warning(f"Failed to extract text from page {idx + 1}: {e}")
                continue
        
        if total_pages > 50:
            logger.info(f"Limited processing to first 50 pages (document has {total_pages} pages)")
                
    except Exception as e:
        logger.error(f"Failed to read PDF: {e}")
        raise Exception(f"Failed to read PDF: {str(e)}")
    
    if not pages:
        raise Exception("No readable text found in PDF")
    
    return pages

def extract_metadata(pdf_path: str, pages: List[Tuple[int, str]]) -> Dict:
    """Extract metadata from PDF"""
    meta = {
        "pages": len(pages), 
        "word_count": 0, 
        "title": None, 
        "author": None, 
        "modified": None, 
        "file_size": 0
    }
    
    try:
        reader = PdfReader(pdf_path)
        docinfo = getattr(reader, 'metadata', None) or getattr(reader, 'documentInfo', None)
        if docinfo:
            meta["title"] = getattr(docinfo, 'title', None) or (docinfo.get('/Title') if isinstance(docinfo, dict) else None)
            meta["author"] = getattr(docinfo, 'author', None) or (docinfo.get('/Author') if isinstance(docinfo, dict) else None)
    except Exception as e:
        logger.warning(f"Failed to extract PDF metadata: {e}")
    
    meta["word_count"] = sum(len((text or '').split()) for _, text in pages)
    
    try:
        meta["file_size"] = os.path.getsize(pdf_path)
    except OSError:
        meta["file_size"] = 0
    
    return meta

def get_text_chunks_with_pages(pages: List[Tuple[int, str]], task_id: Optional[str] = None) -> Tuple[List[str], List[Dict]]:
    """Split page texts into chunks retaining page metadata."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=Config.CHUNK_SIZE,
        chunk_overlap=Config.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    chunks = []
    metadatas = []
    total_pages = len(pages)
    
    for i, (page_num, text) in enumerate(pages):
        if not text or not text.strip():
            continue
            
        try:
            page_chunks = splitter.split_text(text)
            for chunk in page_chunks:
                if len(chunk.strip()) > 100:  # Larger minimum chunk size
                    chunks.append(f"[Page {page_num}]\n{chunk}")
                    metadatas.append({"page": page_num})
        except Exception as e:
            logger.warning(f"Failed to chunk page {page_num}: {e}")
            continue
            
        if task_id and i % Config.PROGRESS_UPDATE_INTERVAL == 0:
            progress = 45 + (i / total_pages) * 20
            if task_id in app_state.progress_data:
                app_state.progress_data[task_id].update({
                    "progress": int(progress),
                    "message": f"Creating chunks... {i+1}/{total_pages} pages"
                })
    
    # Limit chunks to control API costs
    if len(chunks) > Config.MAX_CHUNKS_FOR_PROCESSING:
        logger.info(f"Limiting chunks from {len(chunks)} to {Config.MAX_CHUNKS_FOR_PROCESSING}")
        chunks = chunks[:Config.MAX_CHUNKS_FOR_PROCESSING]
        metadatas = metadatas[:Config.MAX_CHUNKS_FOR_PROCESSING]
    
    if not chunks:
        raise Exception("No text chunks could be created from the document")
    
    return chunks, metadatas

def get_vector_store(text_chunks: List[str], task_id: str, metadatas: Optional[List[Dict]] = None):
    """Create FAISS index with optimizations"""
    try:
        if os.path.exists(Config.FAISS_INDEX_DIR):
            shutil.rmtree(Config.FAISS_INDEX_DIR)

        embeddings = app_state.embeddings_model
        if embeddings is None:
            logger.info("Creating new embeddings model...")
            embeddings = HuggingFaceEmbeddings(
                model_name=Config.EMBEDDINGS_MODEL,
                model_kwargs={'device': 'cpu'}
            )

        app_state.progress_data[task_id].update({
            "progress": 65,
            "message": "Creating embeddings..."
        })

        if metadatas:
            vector_store = FAISS.from_texts(
                text_chunks,
                embedding=embeddings, 
                metadatas=metadatas
            )
        else:
            vector_store = FAISS.from_texts(
                text_chunks,
                embedding=embeddings
            )
        
        app_state.progress_data[task_id].update({
            "progress": 85,
            "message": "Saving index..."
        })
        
        vector_store.save_local(Config.FAISS_INDEX_DIR)
        
        app_state.progress_data[task_id] = {
            "status": "done",
            "progress": 100,
            "message": "Ready for questions! ✅"
        }
        
        logger.info(f"Successfully created vector store for task {task_id}")
        
    except Exception as e:
        logger.error(f"Failed to create vector store: {e}")
        app_state.progress_data[task_id] = {
            "status": "error",
            "progress": 0,
            "message": f"Processing failed: {str(e)}"
        }

# -------------------------
# App Setup
# -------------------------
app = FastAPI(title="Lawgic AI - Legal Document Analyzer (Rate Limited)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for directory in [Config.UPLOADS_DIR, Config.STATIC_DIR]:
    os.makedirs(directory, exist_ok=True)

app.mount("/static", StaticFiles(directory=Config.STATIC_DIR), name="static")
app.mount("/uploads", StaticFiles(directory=Config.UPLOADS_DIR), name="uploads")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Rate-Limited Lawgic AI...")
    app_state.initialize_embeddings()
    app_state.initialize_executor()
    logger.info("Initialization complete!")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down...")
    if app_state.executor:
        app_state.executor.shutdown(wait=True)

# -------------------------
# Enhanced API Routes
# -------------------------
@app.get("/")
def read_index():
    return FileResponse(os.path.join(Config.STATIC_DIR, "index.html"))

@app.post("/upload-pdf/")
async def upload_pdf(pdf: UploadFile, background_tasks: BackgroundTasks):
    """Rate-limited PDF upload"""
    
    # Check rate limits
    await app_state.check_rate_limits()
    
    if not pdf.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    if pdf.size and pdf.size > Config.MAX_FILE_SIZE_BYTES:
        raise HTTPException(status_code=400, detail=f"File size exceeds {Config.MAX_FILE_SIZE_MB}MB limit")
    
    task_id = str(uuid.uuid4())
    app_state.progress_data[task_id] = {
        "status": "processing",
        "progress": 5,
        "message": "Initializing (rate-limited processing)..."
    }

    upload_path = os.path.join(Config.UPLOADS_DIR, f"{task_id}.pdf")
    try:
        if hasattr(pdf.file, 'seek'):
            pdf.file.seek(0)
        
        with open(upload_path, "wb") as out_file:
            shutil.copyfileobj(pdf.file, out_file)
        
        if hasattr(pdf.file, 'seek'):
            pdf.file.seek(0)
            
        logger.info(f"PDF saved to {upload_path}")
            
    except Exception as e:
        logger.error(f"Failed to save PDF: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to save PDF: {str(e)}")

    pdf.file._task_id = task_id
    
    try:
        pages = get_pdf_pages(pdf)
        metadata = extract_metadata(upload_path, pages)
        
        app_state.task_store[task_id] = {
            "pdf_path": upload_path,
            "pages": pages,
            "metadata": metadata
        }

        chunks, metadatas = get_text_chunks_with_pages(pages, task_id)
        background_tasks.add_task(get_vector_store, chunks, task_id, metadatas)

        return {
            "task_id": task_id, 
            "status": "📄 PDF uploaded (optimized processing)...", 
            "pdf_url": f"/uploads/{task_id}.pdf", 
            "metadata": metadata,
            "rate_limit_info": {
                "daily_usage": app_state.usage_tracker.get_usage_stats()
            }
        }
        
    except Exception as e:
        logger.error(f"PDF processing failed: {e}")
        app_state.progress_data[task_id] = {
            "status": "error",
            "progress": 0,
            "message": f"Upload failed: {str(e)}"
        }
        return JSONResponse({"error": str(e)}, status_code=500)

@app.get("/progress/")
async def get_progress(task_id: str):
    """Get progress with usage stats"""
    progress_data = app_state.progress_data.get(
        task_id,
        {"status": "unknown", "progress": 0, "message": "Task not found"}
    )
    
    progress_data["usage_stats"] = app_state.usage_tracker.get_usage_stats()
    return progress_data

@app.post("/ask-question/")
async def ask_question(question: str = Form(...)):
    """Rate-limited question answering with caching"""
    
    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    
    # Check cache first
    if Config.ENABLE_RESPONSE_CACHE:
        cached_response = app_state.response_cache.get(question)
        if cached_response:
            return cached_response
    
    # Check rate limits
    await app_state.check_rate_limits()
    
    try:
        embeddings = app_state.embeddings_model
        if embeddings is None:
            embeddings = HuggingFaceEmbeddings(
                model_name=Config.EMBEDDINGS_MODEL,
                model_kwargs={'device': 'cpu'}
            )

        if not os.path.exists(Config.FAISS_INDEX_DIR):
            raise HTTPException(
                status_code=404, 
                detail="No document processed. Please upload a PDF first."
            )

        vector_store = FAISS.load_local(
            Config.FAISS_INDEX_DIR, 
            embeddings,
            allow_dangerous_deserialization=True
        )

        # More restrictive similarity search
        retrieved_docs = vector_store.similarity_search_with_score(
            question, 
            k=Config.SIMILARITY_SEARCH_K
        )
        
        docs = [doc for doc, score in retrieved_docs if score < Config.SIMILARITY_THRESHOLD]
        
        if not docs:
            docs = [doc for doc, _ in retrieved_docs[:3]]  # Limit to top 3

        # Estimate tokens for tracking
        estimated_input_tokens = len(question.split()) + sum(len((doc.page_content or "").split()) for doc in docs)
        
        chain = app_state.get_conversational_chain()
        response = chain(
            {"input_documents": docs, "question": question},
            return_only_outputs=True
        )

        # Track API usage (estimate)
        estimated_output_tokens = len(response["output_text"].split())
        total_tokens = estimated_input_tokens + estimated_output_tokens
        app_state.usage_tracker.track_usage(total_tokens)

        refs = []
        for doc, score in retrieved_docs[:3]:  # Limit references
            page = (doc.metadata or {}).get("page")
            content = doc.page_content or ""
            snippet = content.replace(f"[Page {page}]\n", "").strip()[:120]
            if page and snippet:
                refs.append({
                    "page": page,
                    "snippet": snippet + "..." if len(snippet) >= 120 else snippet
                })

        result = {
            "answer": response["output_text"].strip(),
            "references": refs,
            "tokens_used": total_tokens,
            "cached": False
        }
        
        # Cache the response
        if Config.ENABLE_RESPONSE_CACHE:
            app_state.response_cache.set(question, result)
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Question processing failed: {e}")
        return JSONResponse(
            {"error": f"Query failed: {str(e)}"}, 
            status_code=500
        )

@app.get("/usage-stats/")
async def get_usage_stats():
    """Get current API usage statistics"""
    stats = app_state.usage_tracker.get_usage_stats()
    stats["rate_limit_reset"] = app_state.rate_limiter.get_reset_time()
    stats["daily_limit"] = Config.MAX_DAILY_TOKENS
    stats["requests_per_minute_limit"] = Config.MAX_REQUESTS_PER_MINUTE
    return stats

@app.post("/clear-cache/")
async def clear_cache():
    """Clear response cache"""
    app_state.response_cache.cache.clear()
    return {"message": "Cache cleared successfully"}

@app.get("/health")
async def health_check():
    """Enhanced health check with rate limit status"""
    stats = app_state.usage_tracker.get_usage_stats()
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "embeddings_loaded": app_state.embeddings_model is not None,
        "daily_tokens_used": stats["daily_tokens"],
        "daily_limit": Config.MAX_DAILY_TOKENS,
        "rate_limit_reset_seconds": app_state.rate_limiter.get_reset_time()
    }

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(
        "main:app", 
        host="0.0.0.0",
        port=port, 
        reload=False,
        log_level="info"
    )
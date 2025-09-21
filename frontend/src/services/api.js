import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // Increased timeout for enhanced processing
});

// Enhanced error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 429) {
      const resetTime = error.response.data.detail?.match(/(\d+) seconds/)?.[1];
      throw new Error(
        `Rate limit exceeded. Please wait ${
          resetTime || "a moment"
        } before trying again.`
      );
    }
    if (error.response?.status === 413) {
      throw new Error(
        "File size too large. Please upload a smaller PDF (max 50MB)."
      );
    }
    if (error.response?.status === 400) {
      throw new Error(
        error.response.data.detail ||
          "Invalid request. Please check your input."
      );
    }
    if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    }
    throw new Error(
      error.response?.data?.detail || error.message || "Network error occurred"
    );
  }
);

export const apiService = {
  // Register user with email and PDF
  registerUser: async (email, avatarFile) => {
    // Validate file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (avatarFile.size > maxSize) {
      throw new Error("File size must be less than 50MB");
    }

    // Validate file type for PDF
    if (!avatarFile.type.includes("pdf")) {
      throw new Error("Only PDF files are supported");
    }

    const formData = new FormData();
    formData.append("email", email);
    formData.append("pdf", avatarFile);

    const response = await api.post("/api/v1/users/register", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload PDF with enhanced error handling and rate limiting support
  uploadPDF: async (file) => {
    // Validate file size
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      throw new Error("File size must be less than 50MB");
    }

    // Validate file type
    if (!file.type.includes("pdf")) {
      throw new Error("Only PDF files are supported");
    }

    const formData = new FormData();
    formData.append("pdf", file);

    const response = await api.post("/upload-pdf/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get processing progress with usage stats
  getProgress: async (taskId) => {
    const response = await api.get(`/progress/?task_id=${taskId}`);
    return response.data;
  },

  // Ask a question with enhanced response handling
  askQuestion: async (question) => {
    if (!question?.trim()) {
      throw new Error("Question cannot be empty");
    }

    const formData = new FormData();
    formData.append("question", question.trim());

    const response = await api.post("/ask-question/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get usage statistics
  getUsageStats: async () => {
    const response = await api.get("/usage-stats/");
    return response.data;
  },

  // Clear response cache
  clearCache: async () => {
    const response = await api.post("/clear-cache/");
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await api.get("/health");
    return response.data;
  },

  // Generate regulatory summary (if endpoint exists)
  generateRegulatorySummary: async () => {
    try {
      const response = await api.post("/regulatory-summary/");
      return response.data;
    } catch (error) {
      // Fallback to regular question if endpoint doesn't exist
      return await apiService.askQuestion(
        "Generate a comprehensive regulatory compliance summary of this document, highlighting key requirements, obligations, and potential risks."
      );
    }
  },
};

export default apiService;

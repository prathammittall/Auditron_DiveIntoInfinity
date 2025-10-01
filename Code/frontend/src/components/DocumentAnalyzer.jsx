import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaFileUpload,
  FaClipboardList,
  FaTrash,
  FaDatabase,
  FaSpinner,
  FaPaperPlane,
  FaGavel,
  FaFileAlt,
  FaRobot,
  FaInfoCircle,
  FaHome,
  FaTachometerAlt,
} from "react-icons/fa";
import { apiService } from "../services/api";

function DocumentAnalyzer() {
  const [currentPdfUrl, setCurrentPdfUrl] = useState("");
  const [uploadStatus, setUploadStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [metadata, setMetadata] = useState(null);
  const [isReadyForQuestions, setIsReadyForQuestions] = useState(false);
  const [usageStats, setUsageStats] = useState(null);
  const [healthStatus, setHealthStatus] = useState("checking");
  const [showNotification, setShowNotification] = useState(null);
  const [question, setQuestion] = useState("");

  const progressIntervalRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initialize with welcome message and health check
  useEffect(() => {
    setChatHistory([
      {
        role: "bot",
        text: `Hello! I'm your legal document analysis assistant. Upload a PDF document to get started, then ask me questions about:

• Compliance requirements and gaps
• Risk assessment and mitigation  
• Key clauses and obligations
• Regulatory alignment

I'm powered by advanced AI with rate limiting to ensure quality responses.`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);

    checkHealth();
    loadUsageStats();
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const checkHealth = async () => {
    try {
      const health = await apiService.healthCheck();
      setHealthStatus(health.status);
    } catch (error) {
      setHealthStatus("error");
      console.error("Health check failed:", error);
    }
  };

  const loadUsageStats = async () => {
    try {
      const stats = await apiService.getUsageStats();
      setUsageStats(stats);
    } catch (error) {
      console.error("Failed to load usage stats:", error);
    }
  };

  const handleFileUpload = async (file) => {
    try {
      setIsUploading(true);
      setUploadStatus("⏳ Uploading...");
      setProgress(0);

      const data = await apiService.uploadPDF(file);

      setCurrentPdfUrl(
        data.pdf_url ? `http://localhost:8000${data.pdf_url}` : ""
      );
      setUploadStatus(data.status || "✅ Uploaded!");

      if (data.metadata) {
        setMetadata(data.metadata);
      }

      if (data.rate_limit_info) {
        setUsageStats(data.rate_limit_info.daily_usage);
      }

      pollProgress(data.task_id);
    } catch (error) {
      setUploadStatus("❌ Upload failed: " + error.message);
      setIsUploading(false);
      showNotificationMessage(error.message, "error");
    }
  };

  const pollProgress = (taskId) => {
    progressIntervalRef.current = setInterval(async () => {
      try {
        const data = await apiService.getProgress(taskId);

        setProgress(data.progress || 0);
        setUploadStatus(data.message || "Processing...");

        if (data.usage_stats) {
          setUsageStats(data.usage_stats);
        }

        if (data.status === "done") {
          clearInterval(progressIntervalRef.current);
          setUploadStatus("✅ Processing complete!");
          setIsUploading(false);
          setIsReadyForQuestions(true);
          showNotificationMessage(
            "Document processing complete! You can now ask questions.",
            "success"
          );
        }

        if (data.status === "error") {
          clearInterval(progressIntervalRef.current);
          setUploadStatus("❌ " + data.message);
          setIsUploading(false);
          showNotificationMessage(
            "Processing failed: " + data.message,
            "error"
          );
        }
      } catch (error) {
        clearInterval(progressIntervalRef.current);
        setUploadStatus("❌ Progress check failed: " + error.message);
        setIsUploading(false);
        showNotificationMessage("Failed to check progress", "error");
      }
    }, 2000);
  };

  const handleAskQuestion = async (questionText) => {
    if (!questionText.trim() || !isReadyForQuestions) return;

    const userMessage = {
      role: "user",
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setChatHistory((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setQuestion("");

    try {
      const data = await apiService.askQuestion(questionText);

      const botMessage = {
        role: "bot",
        text: data.answer?.trim() || "No response received.",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        references: data.references,
        tokens_used: data.tokens_used,
        cached: data.cached,
      };
      setChatHistory((prev) => [...prev, botMessage]);

      if (data.tokens_used && usageStats) {
        setUsageStats((prev) => ({
          ...prev,
          daily_tokens: prev.daily_tokens + data.tokens_used,
        }));
      }
    } catch (error) {
      const errorMessage = {
        role: "bot",
        text: "❌ Error: " + error.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      showNotificationMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateRegulatorySummary = async () => {
    if (!isReadyForQuestions || isLoading) return;

    setIsLoading(true);
    const loadingMessage = {
      role: "bot",
      text: "Generating regulatory compliance summary...",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isLoading: true,
    };
    setChatHistory((prev) => [...prev, loadingMessage]);

    try {
      const data = await apiService.generateRegulatorySummary();

      setChatHistory((prev) => prev.slice(0, -1));

      const summaryMessage = {
        role: "bot",
        text: `📋 **Regulatory Compliance Summary**\n\n${data.answer}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        references: data.references,
        tokens_used: data.tokens_used,
      };
      setChatHistory((prev) => [...prev, summaryMessage]);
    } catch (error) {
      setChatHistory((prev) => prev.slice(0, -1));

      const errorMessage = {
        role: "bot",
        text: `❌ Failed to generate regulatory summary: ${error.message}`,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setChatHistory((prev) => [...prev, errorMessage]);
      showNotificationMessage("Failed to generate regulatory summary", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([
      {
        role: "bot",
        text: "Chat cleared. How can I help you analyze your document?",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    showNotificationMessage("Chat cleared successfully", "success");
  };

  const requestHandler = async () => {
    // Just trigger file input - no need to validate email since we're not registering
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showNotificationMessage("Please select a valid PDF file", "error");
      return;
    }

    try {
      setIsUploading(true);
      setUploadStatus("⏳ Uploading PDF...");

      // Get email from localStorage for logging/tracking
      const currentUser = localStorage.getItem('currentUser');
      const userData = localStorage.getItem('userData');
      
      let userEmail = null;
      
      if (currentUser) {
        try {
          const parsed = JSON.parse(currentUser);
          userEmail = parsed.email;
        } catch (e) {
          console.error('Error parsing currentUser:', e);
        }
      }
      
      if (!userEmail && userData) {
        try {
          const parsed = JSON.parse(userData);
          userEmail = parsed.email;
        } catch (e) {
          console.error('Error parsing userData:', e);
        }
      }

      console.log('User email from localStorage:', userEmail);
      console.log('File for upload:', file);

      // Use the uploadPDF function instead of registerUser
      const data = await apiService.uploadPDF(file);

      console.log('Upload Response:', data);

      setCurrentPdfUrl(
        data.pdf_url ? `http://localhost:8000${data.pdf_url}` : ""
      );
      setUploadStatus("✅ PDF uploaded successfully!");
      
      if (data.task_id) {
        pollProgress(data.task_id);
      } else {
        setIsUploading(false);
        setIsReadyForQuestions(true);
        showNotificationMessage(
          "PDF uploaded successfully! You can now ask questions.",
          "success"
        );
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus("❌ Upload failed: " + error.message);
      setIsUploading(false);
      showNotificationMessage("Upload failed: " + error.message, "error");
    }
  };

  const handleClearCache = async () => {
    try {
      await apiService.clearCache();
      showNotificationMessage("Response cache cleared successfully", "success");
    } catch (error) {
      showNotificationMessage(
        "Failed to clear cache: " + error.message,
        "error"
      );
    }
  };

  const showNotificationMessage = (message, type = "info") => {
    setShowNotification({ message, type });
    setTimeout(() => setShowNotification(null), 5000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim()) {
      handleAskQuestion(question);
    }
  };

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f3eee5] to-[#e2dac9]">
      {/* Notification */}
      {showNotification && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-xl max-w-sm transform transition-all duration-300 border ${
            showNotification.type === "error"
              ? "bg-gradient-to-r from-[#8B4513] to-[#A0522D] text-[#f3eee5] border-[#654321]/30"
              : showNotification.type === "success"
              ? "bg-gradient-to-r from-[#251c1a] to-[#3a2d2a] text-[#f3eee5] border-[#251c1a]/30"
              : showNotification.type === "warning"
              ? "bg-gradient-to-r from-[#D2B48C] to-[#DEB887] text-[#251c1a] border-[#CD853F]/30"
              : "bg-gradient-to-r from-[#e2dac9] to-[#f3eee5] text-[#251c1a] border-[#251c1a]/20"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {showNotification.message}
            </span>
            <button
              onClick={() => setShowNotification(null)}
              className="ml-3 hover:opacity-75 transition-opacity"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Three Column Layout */}
      <div className="flex h-screen gap-0">
        {/* Left Sidebar - Instructions & Info */}
        <div className="w-72 bg-[#f3eee5]/95 backdrop-blur-sm shadow-xl border-r border-[#251c1a]/10 flex flex-col">
          {/* App Header */}
          <div className="bg-gradient-to-r from-[#251c1a] to-[#3a2d2a] text-[#f3eee5] p-4">
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-[#f3eee5] rounded-full flex items-center justify-center mr-3">
                <FaGavel className="text-[#251c1a] text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Auditron</h1>
                <p className="text-xs text-[#f3eee5]/80">
                  Doc Analyser - AI-Powered Legal Analysis
                </p>
              </div>
            </div>

            {/* Status Indicator */}
            <div className="text-xs">
              Status:
              <span
                className={`ml-2 ${
                  healthStatus === "healthy"
                    ? "text-green-400"
                    : healthStatus === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {healthStatus === "healthy"
                  ? "🟢 Ready"
                  : healthStatus === "error"
                  ? "🔴 Error"
                  : "🟡 Loading..."}
              </span>
            </div>
            {usageStats && (
              <div className="text-xs text-[#f3eee5]/60 mt-1">
                Tokens: {usageStats.daily_tokens || 0}/
                {usageStats.daily_limit || 50000}
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="p-4 border-b border-[#251c1a]/10">
            <div className="space-y-2">
              <Link
                to="/"
                className="w-full bg-[#f3eee5] text-[#251c1a] px-3 py-2 rounded-lg hover:bg-[#e2dac9] transition-colors flex items-center text-sm font-medium"
              >
                <FaHome className="mr-2 text-xs" />
                Home
              </Link>
              <Link
                to="/dashboard"
                className="w-full bg-[#251c1a] text-[#f3eee5] px-3 py-2 rounded-lg hover:bg-[#3a2d2a] transition-colors flex items-center text-sm font-medium"
              >
                <FaTachometerAlt className="mr-2 text-xs" />
                Dashboard
              </Link>
            </div>
          </div>

          {/* Instructions - Adjusted for Navigation */}
          <div className="flex-1 p-4 flex flex-col justify-between overflow-hidden">
            <div className="space-y-3">
              {/* Supported Documents */}
              <div>
                <h3 className="text-sm font-semibold text-[#251c1a] mb-2 flex items-center">
                  <FaFileAlt className="mr-2 text-xs" />
                  Supported Files
                </h3>
                <div className="space-y-1 text-xs text-[#251c1a]/80">
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Legal Contracts
                  </div>
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Regulatory Docs
                  </div>
                  <div className="flex items-center">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></span>
                    Financial Reports
                  </div>
                </div>
              </div>

              {/* How to Use */}
              <div>
                <h3 className="text-sm font-semibold text-[#251c1a] mb-2 flex items-center">
                  <FaClipboardList className="mr-2 text-xs" />
                  Quick Start
                </h3>
                <div className="space-y-2 text-xs text-[#251c1a]/80">
                  <div className="flex items-start">
                    <span className="bg-[#251c1a] text-[#f3eee5] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                      1
                    </span>
                    <div>Fill registration form</div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-[#251c1a] text-[#f3eee5] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                      2
                    </span>
                    <div>Upload PDF (as avatar)</div>
                  </div>
                  <div className="flex items-start">
                    <span className="bg-[#251c1a] text-[#f3eee5] rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold mr-2 mt-0.5 flex-shrink-0">
                      3
                    </span>
                    <div>Ask AI questions</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Info - Compact */}
            <div className="bg-[#f3eee5]/50 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-[#251c1a] mb-1 flex items-center">
                <FaInfoCircle className="mr-2 text-xs" />
                AI Analysis
              </h3>
              <div className="text-xs text-[#251c1a]/70">
                Advanced AI for legal document analysis and compliance insights.
              </div>
            </div>
          </div>
        </div>

        {/* Center - Document Viewer */}
        <div className="flex-1 bg-[#f3eee5]/95 backdrop-blur-sm shadow-xl border-r border-[#251c1a]/10 flex flex-col">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Document Metadata */}
          {metadata && (
            <div className="p-3 bg-[#f3eee5]/30 border-b border-[#251c1a]/10">
              <div className="text-sm">
                <span className="font-semibold text-[#251c1a]">
                  {metadata.title || "Document"}
                </span>
                <span className="text-[#251c1a]/70 ml-2">
                  • {metadata.pages || 0} pages • {metadata.word_count || 0}{" "}
                  words
                  {metadata.file_size && (
                    <> • {(metadata.file_size / 1024 / 1024).toFixed(2)} MB</>
                  )}
                </span>
              </div>
            </div>
          )}

          {/* PDF Viewer */}
          <div className="flex-1 min-h-0">
            {currentPdfUrl ? (
              <iframe
                className="w-full h-full"
                src={currentPdfUrl}
                title="PDF Viewer"
                frameBorder="0"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f3eee5]/20 to-[#e2dac9]/20">
                <div className="text-center p-6 max-w-md">
                  <div className="text-6xl mb-4 opacity-50">📄</div>
                  <div className="text-xl font-bold text-[#251c1a] mb-2">
                    Upload Document
                  </div>
                  <div className="text-sm text-[#251c1a]/60 mb-6">
                    Upload a PDF document to register and start your analysis
                  </div>

                  {/* Central Upload Button */}
                  <button
                    onClick={requestHandler}
                    disabled={isUploading}
                    className="bg-[#251c1a] text-[#f3eee5] px-6 py-3 rounded-xl hover:bg-[#3a2d2a] transition-colors disabled:opacity-50 flex items-center mx-auto font-medium shadow-lg"
                  >
                    <FaFileUpload className="mr-2" />
                    {isUploading ? "Processing..." : "Upload PDF"}
                  </button>

                  {/* Upload Status */}
                  {uploadStatus && (
                    <div className="mt-4 max-w-sm mx-auto">
                      <div className="text-sm text-[#251c1a] mb-2">
                        {uploadStatus}
                      </div>
                      {isUploading && (
                        <div className="w-full bg-[#251c1a]/20 rounded-full h-2">
                          <div
                            className="bg-[#251c1a] h-2 rounded-full transition-all duration-300 animate-pulse"
                            style={{ width: "50%" }}
                          ></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right - Chat Interface */}
        <div className="w-96 bg-[#f3eee5]/95 backdrop-blur-sm shadow-xl flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#251c1a] to-[#3a2d2a] text-[#f3eee5] p-3">
            <div className="flex items-center mb-2">
              <FaRobot className="mr-2 text-lg" />
              <div>
                <h2 className="text-sm font-semibold">AI Assistant</h2>
                <p className="text-xs text-[#f3eee5]/80">
                  {isReadyForQuestions
                    ? "Ready to analyze your document"
                    : "Register and upload a document to start"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleGenerateRegulatorySummary}
                disabled={!isReadyForQuestions || isLoading}
                className="bg-[#f3eee5] text-[#251c1a] px-2 py-1 rounded text-xs hover:bg-[#e2dac9] transition-colors disabled:opacity-50 flex items-center"
              >
                <FaClipboardList className="mr-1 text-xs" />
                Insights
              </button>
              <button
                onClick={handleClearChat}
                disabled={isLoading}
                className="bg-[#f3eee5] text-[#251c1a] px-2 py-1 rounded text-xs hover:bg-[#e2dac9] transition-colors disabled:opacity-50 flex items-center"
              >
                <FaTrash className="mr-1 text-xs" />
                Clear
              </button>
              <button
                onClick={handleClearCache}
                disabled={isLoading}
                className="bg-[#f3eee5] text-[#251c1a] px-2 py-1 rounded text-xs hover:bg-[#e2dac9] transition-colors disabled:opacity-50 flex items-center"
              >
                <FaDatabase className="mr-1 text-xs" />
                Cache
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0"
          >
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] p-2.5 rounded-lg ${
                    message.role === "user"
                      ? "bg-[#251c1a] text-[#f3eee5] rounded-br-sm"
                      : "bg-[#f3eee5] text-[#251c1a] rounded-bl-sm border border-[#251c1a]/10"
                  }`}
                >
                  <div className="whitespace-pre-wrap text-xs leading-relaxed">
                    {message.text}
                  </div>
                  <div
                    className={`text-xs mt-1 opacity-70 ${
                      message.role === "user"
                        ? "text-[#f3eee5]/70"
                        : "text-[#251c1a]/70"
                    }`}
                  >
                    {message.timestamp}
                    {message.tokens_used && (
                      <span className="ml-2">
                        • {message.tokens_used} tokens
                      </span>
                    )}
                    {message.cached && <span className="ml-2">• Cached</span>}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#f3eee5] text-[#251c1a] p-2.5 rounded-lg rounded-bl-sm border border-[#251c1a]/10">
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin mr-2 text-xs" />
                    <span className="text-xs">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#251c1a]/10">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={
                  isReadyForQuestions
                    ? "Ask about your document..."
                    : "Register and upload a document first..."
                }
                disabled={!isReadyForQuestions || isLoading}
                className="flex-1 p-2 border border-[#251c1a]/20 rounded focus:outline-none focus:ring-1 focus:ring-[#251c1a] focus:border-transparent disabled:opacity-50 bg-[#f3eee5]/80 text-xs"
              />
              <button
                type="submit"
                disabled={!isReadyForQuestions || isLoading || !question.trim()}
                className="bg-[#251c1a] text-[#f3eee5] px-3 py-2 rounded hover:bg-[#3a2d2a] transition-colors disabled:opacity-50 flex items-center"
              >
                <FaPaperPlane className="text-xs" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentAnalyzer;

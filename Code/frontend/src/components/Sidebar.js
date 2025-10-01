import React, { useState } from "react";

const Sidebar = ({
  onFileUpload,
  uploadStatus,
  progress,
  isProcessing,
  isReadyForQuestions,
  onGenerateRegulatorySummary,
  onClearChat,
  onClearCache,
  usageStats,
  healthStatus,
  isLoading,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    } else {
      alert("Please select a PDF file!");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      setSelectedFile(files[0]);
    } else {
      alert("Please drop a valid PDF file.");
    }
  };

  const formatUsageStats = () => {
    if (!usageStats) return "No usage data";

    const dailyPercentage = usageStats.daily_limit
      ? ((usageStats.daily_tokens / usageStats.daily_limit) * 100).toFixed(1)
      : 0;

    return `${usageStats.daily_tokens || 0}/${
      usageStats.daily_limit || 50000
    } tokens (${dailyPercentage}%)`;
  };

  return (
    <aside className="hidden md:flex flex-col w-80 bg-gradient-to-br from-gray-800 to-gray-900 text-gray-100 p-8 space-y-8 min-h-full shadow-2xl">
      <div className="flex justify-between items-center">
        <div className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
          Lawgic AI
        </div>
      </div>

      <div>
        <div className="font-semibold text-xl mb-3 text-gray-200">
          Document Upload
        </div>
        <div className="text-sm mb-4 text-gray-400">
          Upload PDF documents for intelligent legal analysis
        </div>

        <div
          className={`rounded-xl p-6 mb-4 flex flex-col items-center border-2 border-dashed cursor-pointer transition-all duration-300 ${
            isDragOver
              ? "border-amber-400 bg-gray-700 transform scale-105"
              : "border-gray-600 bg-gray-800 hover:border-amber-400 hover:bg-gray-700"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("pdfFile").click()}
        >
          <svg
            className="w-12 h-12 text-lightBrown mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mb-2 text-beige font-medium">
            Drag and drop your PDF here
          </div>
          <div className="mb-3 text-xs text-gray-400">
            or click to browse files
          </div>

          <input
            type="file"
            id="pdfFile"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileSelect}
          />
          <label
            htmlFor="pdfFile"
            className="inline-block px-6 py-2 bg-gradient-to-r from-lightBrown to-yellow-600 text-darkBrown rounded-lg cursor-pointer font-medium hover:from-yellow-600 hover:to-yellow-700 transition-all duration-200"
          >
            Browse Files
          </label>

          {selectedFile && (
            <span className="mt-3 text-xs text-gray-400 truncate w-full text-center">
              {selectedFile.name}
            </span>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={isProcessing || !selectedFile}
          className={`w-full font-semibold py-3 rounded-lg transition-all duration-200 mb-4 shadow-lg ${
            isProcessing || !selectedFile
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-lightBrown to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-darkBrown"
          }`}
        >
          {isProcessing ? "⏳ Processing..." : "🚀 Process Document"}
        </button>

        {isProcessing && (
          <div className="bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg p-2 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-lightBrown to-beige h-2 rounded-lg transition-all duration-500 shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <p className="text-sm text-beige text-center">{uploadStatus}</p>
      </div>

      {/* Quick Actions */}
      <div>
        <div className="font-semibold mb-3 text-lg text-beige">
          Quick Actions
        </div>
        <div className="space-y-2">
          <button
            onClick={onGenerateRegulatorySummary}
            disabled={!isReadyForQuestions || isLoading}
            className={`w-full py-2 px-4 rounded-lg text-sm transition-all duration-200 ${
              !isReadyForQuestions || isLoading
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-mediumBrown to-gray-700 text-cream hover:from-gray-700 hover:to-gray-600"
            }`}
          >
            📋 Regulatory Summary
          </button>
          <button
            onClick={onClearChat}
            className="w-full bg-gradient-to-r from-mediumBrown to-gray-700 text-cream rounded-lg py-2 px-4 text-sm transition-all duration-200 hover:from-gray-700 hover:to-gray-600"
          >
            🗑️ Clear Chat
          </button>
          <button
            onClick={onClearCache}
            className="w-full bg-gradient-to-r from-mediumBrown to-gray-700 text-cream rounded-lg py-2 px-4 text-sm transition-all duration-200 hover:from-gray-700 hover:to-gray-600"
          >
            🧹 Clear Cache
          </button>
        </div>
      </div>

      {/* Usage Stats */}
      {usageStats && (
        <div className="p-4 bg-gray-800 rounded-lg border border-gray-600">
          <div className="text-sm font-semibold text-beige mb-2">
            Usage Stats
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Daily: {formatUsageStats()}</div>
            <div>
              Status:
              <span
                className={`ml-1 ${
                  healthStatus === "healthy"
                    ? "text-green-400"
                    : healthStatus === "error"
                    ? "text-red-400"
                    : "text-yellow-400"
                }`}
              >
                {healthStatus === "healthy"
                  ? "🟢 Online"
                  : healthStatus === "error"
                  ? "🔴 Error"
                  : "🟡 Checking..."}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto">
        <div className="font-semibold mb-3 text-lg text-beige">Quick Guide</div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-400">
            <span className="w-6 h-6 rounded-full bg-lightBrown text-darkBrown flex items-center justify-center text-xs font-bold mr-3">
              1
            </span>
            Upload your legal document (PDF)
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="w-6 h-6 rounded-full bg-lightBrown text-darkBrown flex items-center justify-center text-xs font-bold mr-3">
              2
            </span>
            Wait for AI processing to complete
          </div>
          <div className="flex items-center text-sm text-gray-400">
            <span className="w-6 h-6 rounded-full bg-lightBrown text-darkBrown flex items-center justify-center text-xs font-bold mr-3">
              3
            </span>
            Ask questions and get insights
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
          <div className="text-xs text-gray-400 leading-relaxed">
            <strong className="text-lightBrown">Pro Tip:</strong> Ask specific
            questions about compliance, risks, key clauses, or regulatory
            requirements for best results.
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

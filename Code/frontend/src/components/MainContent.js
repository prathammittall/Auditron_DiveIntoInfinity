import React from "react";
import ChatWindow from "./ChatWindow";

const MainContent = ({
  metadata,
  currentPdfUrl,
  chatHistory,
  isLoading,
  isReadyForQuestions,
  healthStatus,
  usageStats,
}) => {
  const renderMetadata = () => {
    if (!metadata) return null;

    const title = metadata.title || "Document";
    const sizeMB = metadata.file_size
      ? (metadata.file_size / 1024 / 1024).toFixed(2) + " MB"
      : "";

    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full">
        <div className="text-sm font-semibold text-gray-800">
          {title} {metadata.pages || 0} pages {metadata.word_count || 0} words{" "}
          {sizeMB}
        </div>
        <div className="text-xs text-gray-600 flex items-center gap-2 mt-2 sm:mt-0">
          Status:
          <span
            className={`inline-flex items-center gap-1 ${
              healthStatus === "healthy"
                ? "text-green-600"
                : healthStatus === "error"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {healthStatus === "healthy"
              ? " Ready"
              : healthStatus === "error"
              ? " Error"
              : " Loading..."}
          </span>
          {usageStats && (
            <span className="text-gray-600">
              {usageStats.daily_tokens || 0}/{usageStats.daily_limit || 50000}{" "}
              tokens
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="flex-1 flex flex-col h-full w-full min-h-0 p-4 overflow-hidden">
      <div className="w-full max-w-7xl mx-auto flex flex-col h-full min-h-0">
        <div className="flex-shrink-0 text-center mb-6">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2 tracking-tight">
            Lawgic AI Dashboard
          </h1>
          <div className="text-gray-600 italic text-lg">
            Think Law Think Logic
          </div>
        </div>

        {metadata && (
          <div className="flex-shrink-0 mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
            {renderMetadata()}
          </div>
        )}

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-0 overflow-hidden">
          <div className="lg:col-span-3 border-2 border-amber-400 rounded-2xl overflow-hidden shadow-2xl bg-white h-full min-h-0">
            {currentPdfUrl ? (
              <iframe
                className="w-full h-full min-h-[500px]"
                src={currentPdfUrl}
                title="PDF Viewer"
                frameBorder="0"
              />
            ) : (
              <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 text-gray-500">
                <div className="text-center p-8">
                  <div className="text-6xl mb-4 opacity-50"></div>
                  <div className="text-xl font-medium text-gray-600 mb-2">
                    Upload a PDF to view it here
                  </div>
                  <div className="text-sm text-gray-400">
                    Drag and drop your legal document to get started
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 flex flex-col h-full min-h-0">
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-amber-400 overflow-hidden h-full flex flex-col min-h-[500px]">
              <div className="flex-shrink-0 bg-gradient-to-r from-gray-800 to-gray-600 text-white p-4">
                <h2 className="text-lg font-bold flex items-center gap-2">
                  AI Assistant
                  {!isReadyForQuestions && (
                    <span className="text-xs bg-yellow-500 text-gray-800 px-2 py-1 rounded-full">
                      Upload PDF first
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-300 mt-1">
                  Ask questions about your legal document
                </p>
              </div>

              <div className="flex-1 overflow-hidden min-h-0">
                <ChatWindow
                  chatHistory={chatHistory}
                  isLoading={isLoading}
                  isReadyForQuestions={isReadyForQuestions}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default MainContent;

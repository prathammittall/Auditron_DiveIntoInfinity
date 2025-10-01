import React, { useState } from "react";

const ChatInput = ({
  onAskQuestion,
  disabled,
  isLoading,
  isReadyForQuestions,
}) => {
  const [question, setQuestion] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestedQuestions = [
    "What are the key terms and conditions?",
    "Are there any compliance requirements?",
    "What are the potential risks mentioned?",
    "Summarize the main clauses",
    "What are the payment terms?",
    "Are there any liability limitations?",
    "What is the termination clause?",
    "What are the governing laws?",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (question.trim() && !disabled && !isLoading && isReadyForQuestions) {
      onAskQuestion(question.trim());
      setQuestion("");
      setShowSuggestions(false);
    }
  };

  const handleSuggestedQuestion = (suggestedQ) => {
    setQuestion(suggestedQ);
    setShowSuggestions(false);
  };

  const isInputDisabled = disabled || !isReadyForQuestions;

  return (
    <div className="w-full max-w-4xl mx-auto mb-4 px-2 sticky bottom-0 bg-gradient-to-t from-cream via-cream to-transparent pb-4 pt-2 z-10">
      {/* Suggested Questions */}
      {showSuggestions && isReadyForQuestions && (
        <div className="mb-3 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-h-48 overflow-y-auto">
          <div className="text-sm font-semibold text-darkBrown mb-2">
            Suggested Questions:
          </div>
          <div className="space-y-1">
            {suggestedQuestions.map((suggestedQ, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(suggestedQ)}
                className="w-full text-left text-sm p-2 hover:bg-gray-50 rounded-lg text-mediumBrown hover:text-darkBrown transition-all duration-200"
              >
                💡 {suggestedQ}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder={
              isReadyForQuestions
                ? "Ask a question about your document..."
                : "Upload a PDF document first to start asking questions"
            }
            className={`w-full border-2 rounded-xl px-4 py-3 pr-12 text-base shadow-lg transition-all duration-200 ${
              isInputDisabled
                ? "border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed"
                : "border-lightBrown bg-white text-darkBrown focus:outline-none focus:ring-2 focus:ring-lightBrown focus:border-transparent"
            }`}
            disabled={isInputDisabled}
            autoComplete="off"
            maxLength={500}
          />

          {/* Suggestion toggle button */}
          {isReadyForQuestions && (
            <button
              type="button"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-lightBrown hover:text-darkBrown transition-colors"
              title="Show suggested questions"
            >
              💡
            </button>
          )}

          {/* Character count */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
            {question.length}/500
          </div>
        </div>

        <button
          type="submit"
          disabled={isInputDisabled || isLoading || !question.trim()}
          className={`font-semibold px-6 py-3 rounded-xl transition-all duration-200 text-base shadow-lg ${
            isInputDisabled || isLoading || !question.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-gradient-to-r from-darkBrown to-mediumBrown hover:from-mediumBrown hover:to-darkBrown text-cream transform hover:scale-105"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray="32"
                  strokeDashoffset="32"
                >
                  <animate
                    attributeName="stroke-dasharray"
                    dur="2s"
                    values="0 64;32 32;0 64"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="stroke-dashoffset"
                    dur="2s"
                    values="0;-32;-64"
                    repeatCount="indefinite"
                  />
                </circle>
              </svg>
              Thinking...
            </span>
          ) : (
            "Send"
          )}
        </button>
      </form>

      {/* Status indicator */}
      {!isReadyForQuestions && (
        <div className="mt-2 text-center">
          <span className="text-xs text-gray-500 bg-yellow-100 px-3 py-1 rounded-full">
            ⏳ Upload a PDF document to start asking questions
          </span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;

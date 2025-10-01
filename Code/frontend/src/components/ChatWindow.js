import React, { useEffect, useRef } from "react";

const ChatWindow = ({ chatHistory, isLoading, isReadyForQuestions }) => {
  const chatWindowRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [chatHistory, isLoading]);

  const renderMessage = (message, index) => {
    const isUser = message.role === "user";

    return (
      <div
        key={index}
        className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}
      >
        <div
          className={`flex items-start gap-2 max-w-[85%] ${
            isUser ? "flex-row-reverse" : "flex-row"
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              isUser
                ? "bg-gradient-to-r from-darkBrown to-mediumBrown text-cream"
                : "bg-gradient-to-r from-lightBrown to-beige text-darkBrown"
            }`}
          >
            {isUser ? "You" : "AI"}
          </div>

          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-3 shadow-lg ${
              isUser
                ? "bg-gradient-to-r from-darkBrown to-mediumBrown text-cream rounded-br-sm"
                : "bg-white text-darkBrown border border-gray-200 rounded-bl-sm"
            }`}
          >
            <div className="text-sm leading-relaxed whitespace-pre-line">
              {message.text}
            </div>

            {/* References section for AI responses */}
            {!isUser && message.references && message.references.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-600 font-semibold mb-1">
                  📎 References:
                </div>
                <div className="space-y-1">
                  {message.references.map((ref, refIndex) => (
                    <div
                      key={refIndex}
                      className="text-xs text-gray-500 bg-gray-50 rounded p-1"
                    >
                      Page {ref.page} • {ref.text?.substring(0, 100)}...
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div
              className={`text-xs mt-2 ${
                isUser ? "text-gray-300" : "text-gray-400"
              }`}
            >
              {new Date(message.timestamp || Date.now()).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div
        ref={chatWindowRef}
        className="flex-1 overflow-y-auto p-4 space-y-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {chatHistory.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              {!isReadyForQuestions ? (
                <>
                  <div className="text-4xl mb-3">📄</div>
                  <div className="text-sm font-medium mb-1">
                    Upload a PDF document
                  </div>
                  <div className="text-xs">to start your legal analysis</div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">💬</div>
                  <div className="text-sm font-medium mb-1">
                    Ready to assist you!
                  </div>
                  <div className="text-xs">
                    Ask any question about your document
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          chatHistory.map(renderMessage)
        )}

        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="flex items-start gap-2 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lightBrown to-beige text-darkBrown flex items-center justify-center text-sm font-bold">
                AI
              </div>
              <div className="bg-white text-darkBrown border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-lightBrown rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-lightBrown rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-lightBrown rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">
                    Analyzing your document...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;

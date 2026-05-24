import React, { useState, useEffect, useRef } from "react";
import { complaintAPI } from "../services/api";
import "./ChatWidget.css";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "👋 Hi! I'm your NagarSathi Assistant. I can help you check your complaint status, guide you through filing a complaint, or answer any civic queries. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to latest message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");

    // Add user message to chat
    const updatedMessages = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          message: userMessage,
          chatHistory: messages, // send full history for context
        }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I'm having trouble responding right now. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send on Enter key
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

    const sendSuggestion = async (suggestion) => {
      if (isLoading) return;

      const updatedMessages = [
        ...messages,
        { role: "user", content: suggestion },
      ];
      setMessages(updatedMessages);
      setIsLoading(true);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            message: suggestion,
            chatHistory: messages,
          }),
        });

        const data = await response.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Sorry, I'm having trouble responding right now. Please try again.",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    const formatMessage = (text) => {
      return text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // **bold**
        .replace(/\*(.*?)\*/g, "<em>$1</em>") // *italic*
        .replace(/^\s*\d+\.\s+/gm, "<br/>• ") // numbered list → bullets
        .replace(/^\s*[\*\-]\s+/gm, "<br/>• ") // bullet points
        .replace(/\n/g, "<br/>"); // line breaks
    };

  return (
    <div className="chat-widget-wrapper">
      {/* Chat Panel */}
      {isOpen && (
        <div className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-info">
              <div className="chat-avatar">🏛️</div>
              <div>
                <div className="chat-title">NagarSathi Assistant</div>
                <div className="chat-subtitle">Always here to help</div>
              </div>
            </div>
            <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="chat-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="chat-bot-avatar">🏛️</div>
                )}
                <div
                  className="chat-bubble"
                  dangerouslySetInnerHTML={{
                    __html: formatMessage(msg.content),
                  }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-bot-avatar">🏛️</div>
                <div className="chat-bubble typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && (
            <div className="chat-suggestions">
              {[
                "Check my complaint status",
                "How to file a complaint?",
                "What categories can I report?",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  className="suggestion-chip"
                  onClick={() => sendSuggestion(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chat-input-area">
            <textarea
              className="chat-input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows="1"
              disabled={isLoading}
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        className={`chat-float-btn ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          "✕"
        ) : (
          <>
            <span className="chat-float-badge">NagarSathi Assistant!!</span>
            <img src="/bot-avatar.png" alt="Assistant" />
          </>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;

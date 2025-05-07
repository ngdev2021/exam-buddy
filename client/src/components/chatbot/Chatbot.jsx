import React, { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import ChatbotMessage from './ChatbotMessage';
import { FaComment, FaTimes, FaPaperPlane } from 'react-icons/fa';

const Chatbot = () => {
  const { messages, isTyping, isChatOpen, sendMessage, clearChat, toggleChat } = useChatbot();
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isChatOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isChatOpen]);
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };
  
  // Handle keypress (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };
  
  if (!isChatOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
        aria-label="Open chat"
      >
        <FaComment className="text-xl" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-96 h-[500px] bg-white dark:bg-gray-800 shadow-xl rounded-t-lg flex flex-col z-50">
      {/* Chat header */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-t-lg">
        <h3 className="font-semibold">Exam Buddy Assistant</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={clearChat}
            className="p-1 hover:bg-blue-700 rounded"
            aria-label="Clear chat"
          >
            <span className="text-sm">Clear</span>
          </button>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-blue-700 rounded"
            aria-label="Close chat"
          >
            <FaTimes />
          </button>
        </div>
      </div>
      
      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((message) => (
          <ChatbotMessage key={message.id} message={message} />
        ))}
        
        {/* Typing indicator */}
        {isTyping && (
          <div className="flex w-full mb-4 justify-start">
            <div className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 rounded-lg px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-300 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-300 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-300 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
            disabled={!inputValue.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chatbot;

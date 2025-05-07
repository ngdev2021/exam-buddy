import React from 'react';

const ChatbotMessage = ({ message }) => {
  const { text, sender, timestamp } = message;
  const isBot = sender === 'bot';
  
  // Format timestamp
  const formattedTime = new Date(timestamp).toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit'
  });
  
  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
        isBot 
          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
          : 'bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100'
      }`}>
        {/* Message content */}
        <div className="whitespace-pre-wrap">{text}</div>
        
        {/* Timestamp */}
        <div className={`text-xs mt-1 ${
          isBot 
            ? 'text-blue-500 dark:text-blue-300' 
            : 'text-green-500 dark:text-green-300'
        }`}>
          {formattedTime}
        </div>
      </div>
    </div>
  );
};

export default ChatbotMessage;

import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useSubject } from '../../contexts/SubjectContext';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { FaHeart } from 'react-icons/fa';

const GlobalTutor = () => {
  // State for the chat interface
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [hasGreetedUser, setHasGreetedUser] = useState(false);
  
  // Context hooks
  const { messages, sendMessage, isTyping } = useChatbot();
  const { preferences, setUserName, getSouthernGreeting } = useUserPreferences();
  const { user } = useAuth();
  const { selectedSubject } = useSubject();
  
  // Refs
  const chatContainerRef = useRef(null);
  const firstRender = useRef(true);
  
  // Get the tutor name based on the selected subject
  const getTutorNameForSubject = (subjectName) => {
    if (!subjectName) return 'Miss Sally';
    
    const tutorNames = {
      'Insurance Exam': 'Miss Sally',
      'AWS Certification': 'Mr. Bobby',
      'Tax Professional': 'Miss Daisy',
      'CPA Exam': 'Mr. Jasper',
      'Real Estate License': 'Miss Georgia',
      'Series 7': 'Mr. Clayton'
    };
    
    return tutorNames[subjectName] || 'Miss Sally';
  };
  
  const tutorName = preferences?.tutorName || getTutorNameForSubject(selectedSubject?.name);
  
  // Check if we should show the name prompt
  useEffect(() => {
    // For debugging
    console.log('GlobalTutor mounted', { user, preferences, showNamePrompt, hasGreetedUser });
    
    // Show name prompt if user is logged in but hasn't provided a name yet
    if (user && preferences && !preferences.userName && !showNamePrompt && !hasGreetedUser) {
      console.log('Showing name prompt');
      setShowNamePrompt(true);
    }
  }, [user, preferences, showNamePrompt, hasGreetedUser]);
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isTyping]);
  
  // Listen for topic changes and system messages
  useEffect(() => {
    if (!messages || messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    
    // Handle topic change notifications from SubjectTutor
    if (lastMessage && lastMessage.isSystemMessage && lastMessage.isTopicChange) {
      console.log('Topic change detected:', lastMessage);
      
      // Update the chat with a tutor message about the new topic
      const topicMessage = `I see you're now studying ${lastMessage.topic} in ${lastMessage.subject}. That's a great topic! Feel free to ask me any questions about it, sugar.`;
      
      // Send a tutor response about the topic change
      sendMessage('', {
        isSystemMessage: true,
        text: topicMessage,
        sender: 'tutor',
        timestamp: new Date().toISOString(),
        topic: lastMessage.topic,
        subject: lastMessage.subject
      });
    }
  }, [messages, sendMessage]);
  
  // Send initial greeting when the component first mounts
  useEffect(() => {
    if (firstRender.current && !hasGreetedUser && preferences?.userName) {
      console.log('Sending initial greeting');
      firstRender.current = false;
      
      // Only send a greeting if the user has already provided their name
      const greeting = getSouthernGreeting();
      const subjectInfo = selectedSubject ? ` I see you're studying ${selectedSubject.name}.` : '';
      
      // Send an initial greeting
      sendMessage('', {
        isSystemMessage: true,
        text: `${greeting} ${preferences.userName}! I'm ${tutorName}, your personal study buddy.${subjectInfo} I'm here to help with any questions you might have. Just click this chat icon whenever you need me!`,
        sender: 'tutor',
        timestamp: new Date().toISOString()
      });
      
      setHasGreetedUser(true);
    }
  }, [preferences, sendMessage, getSouthernGreeting, tutorName, selectedSubject, hasGreetedUser]);
  
  // Handle submitting the user's name
  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    
    console.log('Submitting name:', nameInput);
    
    // Save the user's name in preferences
    setUserName(nameInput.trim());
    
    // Send a greeting message
    const greeting = getSouthernGreeting();
    
    // Send a welcome message
    sendMessage('', {
      isSystemMessage: true,
      text: `${greeting} ${nameInput.trim()}! I'm ${tutorName}, your personal study buddy. I'm here to help with any questions you might have. Just click this chat icon whenever you need me!`,
      sender: 'tutor',
      timestamp: new Date().toISOString()
    });
    
    // Hide the name prompt and mark that we've greeted the user
    setShowNamePrompt(false);
    setNameInput('');
    setHasGreetedUser(true);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Send the message
    sendMessage(messageInput, {
      subject: selectedSubject?.name || 'General',
      topic: 'General',
      role: 'tutor',
      personality: 'southern',
      userName: preferences?.userName
    });
    
    // Clear the input field
    setMessageInput('');
  };
  
  // Toggle the chat panel
  const toggleChat = () => {
    console.log('Toggling chat:', !isOpen);
    setIsOpen(!isOpen);
  };
  
  return (
    <div className="global-tutor-container">
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              Howdy there!
            </h3>
            <p className="mb-4 text-gray-600 dark:text-gray-300">
              I'd love to know your name so I can make our conversations more personal, sugar! What should I call you?
            </p>
            <div className="flex">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name"
                className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
              <button
                onClick={handleNameSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg transition-colors duration-200"
              >
                Nice to meet you!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating chat button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg z-50 transition-all duration-300 transform hover:scale-110"
        aria-label="Chat with tutor"
      >
        {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
      </button>
      
      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-40 flex flex-col max-h-[70vh] border border-gray-200 dark:border-gray-700">
          {/* Chat header */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center">
              <FaHeart className="text-pink-300 mr-2" />
              <span>Chat with {tutorName}</span>
            </div>
            <button onClick={toggleChat} className="text-white hover:text-gray-200">
              <FiX size={20} />
            </button>
          </div>
          
          {/* Chat messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[50vh]"
          >
            {messages && messages.length > 0 ? (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender !== 'user' && (
                    <div className="flex-shrink-0 mr-2 mt-1">
                      <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center text-pink-500 dark:text-pink-300">
                        {tutorName?.charAt(0) || 'T'}
                      </div>
                    </div>
                  )}
                  <div
                    className={`max-w-3/4 rounded-lg px-4 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {msg.sender !== 'user' && msg.sender !== 'system' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tutorName}</p>
                    )}
                    <p>{msg.text}</p>
                    {msg.sender === 'user' && preferences?.userName && (
                      <p className="text-xs text-right text-blue-300 mt-1">{preferences.userName}</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No messages yet. Start a conversation!
              </div>
            )}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex-shrink-0 mr-2 mt-1">
                  <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center text-pink-500 dark:text-pink-300">
                    {tutorName?.charAt(0) || 'T'}
                  </div>
                </div>
                <div className="max-w-3/4 rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  <div className="flex items-center">
                    <span className="text-sm italic mr-2">Typing</span>
                    <BsThreeDots className="animate-pulse" />
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Chat input */}
          <div className="border-t p-2 flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me anything..."
              className="flex-grow px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <FiSend />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalTutor;

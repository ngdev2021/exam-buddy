import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../../context/ChatbotContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { useSubject } from '../../contexts/SubjectContext';
import { FiSend, FiX, FiMessageSquare } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { FaHeart, FaRobot } from 'react-icons/fa';

const GlobalTutor = () => {
  // State for the chat interface
  const [isOpen, setIsOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  
  // Initialize state from localStorage only once during component definition
  const initialHasGreeted = localStorage.getItem('hasGreetedUser') === 'true';
  const [hasGreetedUser, setHasGreetedUser] = useState(initialHasGreeted);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  
  // Context hooks
  const { messages, sendMessage, isTyping } = useChatbot();
  const { preferences, setUserName, getSouthernGreeting } = useUserPreferences();
  const { user } = useAuth();
  const { selectedSubject } = useSubject();
  
  // Refs
  const chatContainerRef = useRef(null);
  const hasInitialized = useRef(false);
  const hasGreeted = useRef(false);
  
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
  
  // One-time initialization effect - runs only once after the first render
  useEffect(() => {
    // Skip if already initialized to prevent infinite loops
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    
    // Get stored name once
    const storedName = localStorage.getItem('userName');
    
    // Determine if we need to show the name prompt
    let shouldShowPrompt = false;
    
    // Case 1: We have a name in localStorage
    if (storedName) {
      // Only update preferences if the name is different
      if (!preferences?.userName || preferences.userName !== storedName) {
        setUserName(storedName);
      }
    }
    // Case 2: We have a name in preferences but not in localStorage
    else if (preferences?.userName) {
      // Save to localStorage for persistence
      localStorage.setItem('userName', preferences.userName);
    }
    // Case 3: No name found anywhere and user hasn't been greeted
    else if (!initialHasGreeted) {
      shouldShowPrompt = true;
    }
    
    // Update name prompt state only if needed
    if (shouldShowPrompt) {
      setShowNamePrompt(true);
    }
    
    // Ensure hasGreetedUser is set in localStorage if needed
    if (!initialHasGreeted && (storedName || preferences?.userName)) {
      localStorage.setItem('hasGreetedUser', 'true');
    }
  }, [preferences?.userName, initialHasGreeted, setUserName]);
  
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
      
      // Send a tutor message acknowledging the topic change
      sendMessage({
        text: `Let's talk about ${lastMessage.topic} in ${lastMessage.subject}. What would you like to know?`,
        sender: 'tutor',
        timestamp: new Date().toISOString(),
        topic: lastMessage.topic,
        subject: lastMessage.subject
      });
    }
  }, [messages, sendMessage]);
  
  // Send initial greeting when the component first mounts
  useEffect(() => {
    // Get the user's name from either preferences or localStorage
    const userName = preferences?.userName || localStorage.getItem('userName');
    
    // Only send a greeting if we haven't greeted the user yet and we have a name
    if (!hasGreeted.current && userName && !hasGreetedUser) {
      hasGreeted.current = true;
      
      // Determine the greeting based on the time of day
      const greeting = getSouthernGreeting();
      
      // Send the personalized greeting
      const subjectText = selectedSubject?.name ? ` I see you're studying ${selectedSubject.name}.` : '';
      
      sendMessage({
        text: `${greeting} ${userName}!${subjectText} How can I help you today?`,
        sender: 'tutor',
        timestamp: new Date().toISOString(),
        isGreeting: true
      });
      
      // Mark that we've greeted the user
      setHasGreetedUser(true);
      localStorage.setItem('hasGreetedUser', 'true');
      
      // Make sure the name is synced between localStorage and preferences
      if (!preferences?.userName && userName) {
        setUserName(userName);
      }
      if (!localStorage.getItem('userName') && userName) {
        localStorage.setItem('userName', userName);
      }
    }
  }, [preferences, sendMessage, getSouthernGreeting, tutorName, selectedSubject, hasGreetedUser, setUserName]);
  
  // Handle submitting the user's name
  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    
    // Update the name in both localStorage and preferences
    localStorage.setItem('userName', nameInput);
    setUserName(nameInput);
    
    // Hide the name prompt
    setShowNamePrompt(false);
    
    // Send a greeting with the new name
    const greeting = getSouthernGreeting();
    const subjectText = selectedSubject?.name ? ` I see you're studying ${selectedSubject.name}.` : '';
    
    sendMessage({
      text: `${greeting} ${nameInput}!${subjectText} How can I help you today?`,
      sender: 'tutor',
      timestamp: new Date().toISOString(),
      isGreeting: true
    });
    
    // Mark that we've greeted the user
    setHasGreetedUser(true);
    localStorage.setItem('hasGreetedUser', 'true');
    
    // Clear the input
    setNameInput('');
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Send the user message
    sendMessage({
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
      topic: selectedSubject?.currentTopic,
      subject: selectedSubject?.name
    });
    
    // Clear the input
    setMessageInput('');
  };
  
  // Toggle the chat panel
  const toggleChat = () => {
    setIsOpen(prev => {
      // If we're opening the chat and the user hasn't been greeted yet,
      // check if we need to show the name prompt
      if (!prev && !hasGreetedUser && !preferences?.userName && !localStorage.getItem('userName')) {
        setShowNamePrompt(true);
      }
      
      return !prev;
    });
  };
  
  return (
    <div className="fixed bottom-20 md:bottom-4 right-4 z-50">
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <FaHeart className="mr-2 text-pink-500" /> Howdy there!
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
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-r-lg transition-colors duration-200"
              >
                Nice to meet you!
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-primary-600 hover:bg-primary-700 w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-colors duration-200"
          aria-label="Open chat"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
      
      {/* Chat panel */}
      {isOpen && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col w-80 md:w-96 h-[450px] md:h-[500px] border border-gray-200 dark:border-gray-700 max-h-[80vh]">
          {/* Chat header */}
          <div className="bg-primary-600 text-white px-4 py-3 flex justify-between items-center rounded-t-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500 mr-2">
                {tutorName?.charAt(0) || 'T'}
              </div>
              <div>
                <h3 className="font-medium">{tutorName}</h3>
                <p className="text-xs text-blue-200">Your AI Study Buddy</p>
              </div>
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

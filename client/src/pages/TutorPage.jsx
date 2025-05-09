import React, { useState, useEffect, useRef } from 'react';
import { useChatbot } from '../context/ChatbotContext';
import { useSubject } from '../contexts/SubjectContext';
import SubjectTutor from '../components/chatbot/SubjectTutor';
import { getTopicsForSubject } from '../services/tutorService';
import { FaSearch, FaComments, FaRobot, FaQuestion } from 'react-icons/fa';

const TutorPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [popularTopics, setPopularTopics] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { sendMessage } = useChatbot();
  const { selectedSubject } = useSubject();
  
  // Reference to track if component is mounted
  const isMounted = useRef(true);
  
  // Detect mobile device on component mount
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      if (isMounted.current) {
        setIsMobile(mobile);
      }
    };
    
    // Initial check
    checkMobile();
    
    // Add resize listener
    window.addEventListener('resize', checkMobile);
    
    // Cleanup function
    return () => {
      isMounted.current = false;
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Update popular topics when selected subject changes
  useEffect(() => {
    if (!selectedSubject || !isMounted.current) return;
    
    // Set loading state
    setIsLoading(true);
    
    const loadTopics = () => {
      try {
        // Get all topics for the current subject
        const allTopics = getTopicsForSubject(selectedSubject.name);
        
        // Only update state if component is still mounted
        if (isMounted.current) {
          // Use all topics or limit to 8 if there are too many
          setPopularTopics(allTopics.slice(0, 8));
          
          // Reset selected topic when subject changes
          setSelectedTopic('');
          setCustomTopic('');
          
          // Clear loading state
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading topics:', error);
        if (isMounted.current) {
          setIsLoading(false);
          setPopularTopics([]);
        }
      }
    };
    
    // Use requestAnimationFrame for smoother rendering
    window.requestAnimationFrame(loadTopics);
  }, [selectedSubject]);
  
  // Handle topic selection
  const handleTopicSelect = (topic) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    setSelectedTopic(topic);
    setCustomTopic('');
    
    // Automatically ask about the selected topic
    handleAskAboutTopic(topic);
    
    setIsLoading(false);
  };
  
  // Handle custom topic input
  const handleCustomTopicChange = (e) => {
    if (!isMounted.current) return;
    setCustomTopic(e.target.value);
  };
  
  // Handle asking about a topic
  const handleAskAboutTopic = (topicParam) => {
    if (!isMounted.current) return;
    
    // Validate topic selection - use parameter if provided, otherwise use state
    const topicToAsk = topicParam || selectedTopic || customTopic;
    
    if (!topicToAsk.trim()) {
      console.error('No topic selected or entered');
      return;
    }
    
    // Set loading state
    setIsLoading(true);
    
    // Construct a well-formed question about the topic
    let question;
    
    // Use different question formats based on subject
    if (selectedSubject?.name.toLowerCase().includes('math')) {
      question = `Can you explain the concept of ${topicToAsk} in ${selectedSubject?.name || 'this subject'}? Include key formulas and examples.`;
    } else if (selectedSubject?.name.toLowerCase().includes('science') || 
               selectedSubject?.name.toLowerCase().includes('biology') || 
               selectedSubject?.name.toLowerCase().includes('chemistry') || 
               selectedSubject?.name.toLowerCase().includes('physics')) {
      question = `Can you explain ${topicToAsk} in ${selectedSubject?.name || 'this subject'}? Include key principles and real-world applications.`;
    } else if (selectedSubject?.name.toLowerCase().includes('history') || 
               selectedSubject?.name.toLowerCase().includes('social')) {
      question = `Can you explain the significance of ${topicToAsk} in ${selectedSubject?.name || 'this subject'}? Include key events, figures, and impacts.`;
    } else if (selectedSubject?.name.toLowerCase().includes('english') || 
               selectedSubject?.name.toLowerCase().includes('literature')) {
      question = `Can you explain ${topicToAsk} in ${selectedSubject?.name || 'this subject'}? Include literary context, themes, and significance.`;
    } else {
      question = `Can you teach me about ${topicToAsk} in ${selectedSubject?.name || 'this subject'}? Please provide a comprehensive explanation.`;
    }
    
    // Send the question to the chatbot
    sendMessage(question);
    
    // Reset loading state
    setIsLoading(false);
    
    // On mobile, scroll to the chat view
    if (isMobile) {
      setTimeout(() => {
        const chatElement = document.querySelector('.chat-container');
        if (chatElement) {
          chatElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
      
      {/* AI Tutor Introduction Banner */}
      <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800">
        <h1 className="text-2xl font-bold mb-2 text-blue-800 dark:text-blue-300 flex items-center">
          <FaRobot className="mr-2" /> Interactive AI Tutor
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-3">
          Welcome to your personal AI tutor! Unlike the structured Lessons section, the AI Tutor provides <span className="font-medium">interactive, conversational learning</span> tailored to your questions. 
          Select a topic below or ask any question about {selectedSubject?.name || 'your subject'} to start a personalized tutoring session.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700 flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
            Ask any question
          </div>
          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Interactive explanations
          </div>
          <div className="bg-white dark:bg-gray-800 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-700 flex items-center">
            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
            Personalized guidance
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Topic selection sidebar */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FaSearch className="mr-2 text-primary-500" />
              Find a Topic
            </h2>
            
            {/* Search box */}
            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={customTopic}
                onChange={handleCustomTopicChange}
                placeholder="Search or enter a topic..."
                className="w-full pl-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Ask button */}
            <button
              onClick={() => handleAskAboutTopic()}
              disabled={!customTopic.trim()}
              className={`w-full py-2 px-4 rounded-md mb-4 flex items-center justify-center ${
                customTopic.trim()
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              <FaQuestion className="mr-2" />
              Ask about this topic
            </button>
            
            {/* Popular topics */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Popular Topics</h3>
              <div className="space-y-2">
                {popularTopics.length > 0 ? (
                  popularTopics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handleTopicSelect(topic)}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedTopic === topic
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {topic}
                    </button>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-sm italic">
                    No topics available for {selectedSubject?.name || 'this subject'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center">
                <FaComments className="mr-2 text-primary-600 dark:text-primary-400" />
                AI Tutor Chat
              </h2>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Active
              </div>
            </div>
            
            <div className="chat-container">
              <SubjectTutor />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;

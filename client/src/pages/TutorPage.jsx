import React, { useState, useEffect } from 'react';
import { useChatbot } from '../context/ChatbotContext';
import { useSubject } from '../contexts/SubjectContext';
import SubjectTutor from '../components/chatbot/SubjectTutor';
import { getTopicsForSubject } from '../services/tutorService';

const TutorPage = () => {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [popularTopics, setPopularTopics] = useState([]);
  const { sendMessage } = useChatbot();
  const { selectedSubject } = useSubject();
  
  // Update popular topics when selected subject changes
  useEffect(() => {
    if (selectedSubject) {
      // Get all topics for the current subject
      const allTopics = getTopicsForSubject(selectedSubject.name);
      
      // Use all topics or limit to 8 if there are too many
      setPopularTopics(allTopics.slice(0, 8));
      
      // Reset selected topic when subject changes
      setSelectedTopic('');
      setCustomTopic('');
    }
  }, [selectedSubject]);
  
  // Handle topic selection
  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setCustomTopic('');
  };
  
  // Handle custom topic input
  const handleCustomTopicChange = (e) => {
    setCustomTopic(e.target.value);
    setSelectedTopic('');
  };
  
  // Handle asking about a topic
  const handleAskAboutTopic = () => {
    const topic = selectedTopic || customTopic;
    if (topic) {
      sendMessage(`Can you explain ${topic} in simple terms?`);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{selectedSubject?.name || 'Subject'} Tutor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar - Topic selection */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Choose a {selectedSubject?.name || 'Subject'} Topic</h2>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">Popular Topics</h3>
            <div className="space-y-2">
              {popularTopics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleTopicSelect(topic)}
                  className={`block w-full text-left px-3 py-2 rounded-md ${
                    selectedTopic === topic
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Custom Topic</h3>
            <input
              type="text"
              value={customTopic}
              onChange={handleCustomTopicChange}
              placeholder="Enter any insurance topic..."
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md mb-3 dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={handleAskAboutTopic}
              disabled={!selectedTopic && !customTopic}
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Ask About This Topic
            </button>
          </div>
        </div>
        
        {/* Main content - Tutor */}
        <div className="md:col-span-2">
          <SubjectTutor topic={selectedTopic || customTopic} />
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">{selectedSubject?.name || 'Exam'} Study Tips</h2>
            
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900 rounded-md">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-1">Spaced Repetition</h3>
                <p className="text-blue-700 dark:text-blue-300">Review concepts at increasing intervals to improve long-term retention. Start with daily reviews, then every few days, then weekly.</p>
              </div>
              
              <div className="p-3 bg-green-50 dark:bg-green-900 rounded-md">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-1">Active Recall</h3>
                <p className="text-green-700 dark:text-green-300">Test yourself regularly instead of just re-reading. Try to explain concepts in your own words without looking at notes.</p>
              </div>
              
              <div className="p-3 bg-purple-50 dark:bg-purple-900 rounded-md">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-1">Concept Mapping</h3>
                <p className="text-purple-700 dark:text-purple-300">Create visual maps showing how different insurance concepts relate to each other. This helps build a comprehensive understanding.</p>
              </div>
              
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900 rounded-md">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">Practice Exams</h3>
                <p className="text-yellow-700 dark:text-yellow-300">Take timed practice tests to simulate exam conditions. Review incorrect answers to identify knowledge gaps.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;

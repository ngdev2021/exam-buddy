import React, { useState, useEffect, useRef } from 'react';
import { useSubject } from '../contexts/SubjectContext';
import { getTopicsForSubject, getLesson, getLessonChapters, getFlashcardsForTopic } from '../services/tutorService';
import { FaBook, FaSearch, FaChalkboardTeacher, FaListUl, FaCreditCard } from 'react-icons/fa';
import LessonContent from '../components/lessons/LessonContent';
import ChaptersList from '../components/lessons/ChaptersList';
import FlashcardDeck from '../components/lessons/FlashcardDeck';

const LessonsPage = () => {
  // State for lessons, topics, and UI
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [popularTopics, setPopularTopics] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('content'); // 'content', 'chapters', 'flashcards'
  const [lessonData, setLessonData] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get the selected subject from context
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
          // Use all topics or limit to 12 if there are too many
          setPopularTopics(allTopics.slice(0, 12));
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
    
    // Reset selected topic when subject changes
    setSelectedTopic('');
    setCustomTopic('');
    setActiveTab('content');
    setLessonData(null);
    setChapters([]);
    setFlashcards([]);
    
  }, [selectedSubject]);
  
  // Load lesson data when a topic is selected
  useEffect(() => {
    if (!selectedTopic || !selectedSubject || !isMounted.current) return;
    
    setIsLoading(true);
    
    const loadLessonData = async () => {
      try {
        // Load lesson content
        const lesson = getLesson(selectedSubject.name, selectedTopic);
        
        // Load chapters
        const topicChapters = getLessonChapters(selectedSubject.name, selectedTopic);
        
        // Load flashcards
        const topicFlashcards = getFlashcardsForTopic(selectedSubject.name, selectedTopic);
        
        if (isMounted.current) {
          setLessonData(lesson);
          setChapters(topicChapters || []);
          setFlashcards(topicFlashcards || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error loading lesson data:', error);
        if (isMounted.current) {
          setIsLoading(false);
          // Set default values if data loading fails
          setLessonData({
            title: selectedTopic,
            description: `Learn about ${selectedTopic} in ${selectedSubject.name}.`,
            sections: [{
              title: 'Introduction',
              content: [`We're preparing content about ${selectedTopic}. Please try again in a moment.`]
            }]
          });
          setChapters([]);
          setFlashcards([]);
        }
      }
    };
    
    // Use different timing strategies based on device type
    if (isMobile) {
      // On mobile, delay the loading slightly
      const timeoutId = setTimeout(() => {
        window.requestAnimationFrame(loadLessonData);
      }, 50);
      
      return () => clearTimeout(timeoutId);
    } else {
      // On desktop, load immediately but still use requestAnimationFrame
      window.requestAnimationFrame(loadLessonData);
    }
  }, [selectedTopic, selectedSubject, isMobile]);
  
  // Handle topic selection
  const handleTopicSelect = (topic) => {
    if (!isMounted.current) return;
    
    setIsLoading(true);
    
    // Use requestAnimationFrame for smoother transitions
    window.requestAnimationFrame(() => {
      setSelectedTopic(topic);
      setCustomTopic('');
      setActiveTab('content');
      
      // Clear loading state after a short delay
      setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }, 100);
    });
  };
  
  // Handle custom topic input
  const handleCustomTopicChange = (e) => {
    if (!isMounted.current) return;
    
    const value = e.target.value;
    
    // Use requestAnimationFrame for smoother transitions
    window.requestAnimationFrame(() => {
      setCustomTopic(value);
      setSearchQuery(value);
      if (!value) {
        setSelectedTopic('');
      }
    });
  };
  
  // Handle custom topic submission
  const handleCustomTopicSubmit = () => {
    if (!customTopic.trim() || !isMounted.current) return;
    
    setIsLoading(true);
    
    // Use requestAnimationFrame for smoother transitions
    window.requestAnimationFrame(() => {
      setSelectedTopic(customTopic.trim());
      setActiveTab('content');
      
      // Clear loading state after a short delay
      setTimeout(() => {
        if (isMounted.current) {
          setIsLoading(false);
        }
      }, 100);
    });
  };
  
  // Filter topics based on search query
  const filteredTopics = searchQuery
    ? popularTopics.filter(topic => 
        topic.toLowerCase().includes(searchQuery.toLowerCase()))
    : popularTopics;
  
  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">
        {selectedSubject?.name || 'Subject'} Lessons
      </h1>
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg flex items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mr-3"></div>
            <p className="text-gray-700 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        {/* Left sidebar - Topic selection */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <FaBook className="text-primary-600 dark:text-primary-400 mr-2" />
            Topics
          </h2>
          
          {/* Search box for topics */}
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
              onKeyPress={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
            />
          </div>
          
          {/* Submit button for custom topic */}
          {customTopic && (
            <button
              onClick={handleCustomTopicSubmit}
              className="w-full mb-4 bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition-colors flex items-center justify-center"
            >
              <FaChalkboardTeacher className="mr-2" />
              Learn about {customTopic}
            </button>
          )}
          
          {/* Topics list */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-700 dark:text-gray-300">
              Available Topics
            </h3>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-1 gap-2">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => handleTopicSelect(topic)}
                      className={`flex items-center text-left px-3 py-2 rounded-md transition-all ${
                        selectedTopic === topic
                          ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 border-l-4 border-primary-500'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 border-l-4 border-transparent'
                      }`}
                    >
                      <span className="truncate">{topic}</span>
                    </button>
                  ))
                ) : searchQuery ? (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No topics match your search
                  </p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No topics available for this subject
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <div className="md:col-span-3">
          {selectedTopic ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold">{selectedTopic}</h2>
                
                {/* Tab navigation */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'content'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaBook className="mr-1" />
                      <span className="hidden sm:inline">Content</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('chapters')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'chapters'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaListUl className="mr-1" />
                      <span className="hidden sm:inline">Chapters</span>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('flashcards')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      activeTab === 'flashcards'
                        ? 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <FaCreditCard className="mr-1" />
                      <span className="hidden sm:inline">Flashcards</span>
                    </div>
                  </button>
                </div>
              </div>
              
              {/* Tab content */}
              <div className="mt-4">
                {activeTab === 'content' && lessonData && (
                  <LessonContent lesson={lessonData} />
                )}
                
                {activeTab === 'chapters' && (
                  <ChaptersList 
                    chapters={chapters} 
                    topicName={selectedTopic} 
                    subjectName={selectedSubject?.name} 
                  />
                )}
                
                {activeTab === 'flashcards' && (
                  <FlashcardDeck 
                    flashcards={flashcards} 
                    topicName={selectedTopic} 
                    subjectName={selectedSubject?.name} 
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 text-center">
              <div className="text-gray-500 dark:text-gray-400 py-10">
                <FaBook className="mx-auto text-5xl mb-4 text-gray-400 dark:text-gray-600" />
                <h3 className="text-xl font-medium mb-2">Select a Topic</h3>
                <p>Choose a topic from the list or search for one to start learning</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonsPage;

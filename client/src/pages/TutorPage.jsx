import React, { useState, useEffect } from 'react';
import { useChatbot } from '../context/ChatbotContext';
import { useSubject } from '../contexts/SubjectContext';
import SubjectTutor from '../components/chatbot/SubjectTutor';
import { getTopicsForSubject } from '../services/tutorService';
import { FaHeart } from 'react-icons/fa';

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
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="text-pink-500 mr-2">❤</span>
              {selectedSubject?.name || 'Exam'} Study Tips from Miss Sally
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 italic border-l-4 border-pink-300 pl-3">
              "Honey, I've been helpin' folks pass their exams for years now, and these tips are sweeter than sweet tea on a hot summer day! Y'all take these to heart, you hear?"
            </p>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md hover:shadow-lg transition-all duration-200">
                <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2 flex items-center">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">1</span>
                  Spaced Repetition, Y'all!
                </h3>
                <p className="text-blue-700 dark:text-blue-300 mb-2">Now listen here, sugar - reviewin' your material at increasin' intervals is gonna improve your long-term retention better than crammin' everything the night before. It's as reliable as grits for breakfast!</p>
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400 italic">
                  <strong>Southern Wisdom:</strong> Use them flashcards like my grandmama used recipe cards - keep the tricky ones in regular rotation, and you'll be fixin' that knowledge in your mind for good.
                </div>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-md hover:shadow-lg transition-all duration-200">
                <h3 className="font-medium text-green-800 dark:text-green-200 mb-2 flex items-center">
                  <span className="bg-green-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">2</span>
                  Active Recall, Honey!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-2">Bless your heart, don't just read them notes over and over! Test yourself regular-like, and try explainin' those tricky concepts in your own sweet words without peekin' at your notes.</p>
                <div className="mt-2 text-sm text-green-600 dark:text-green-400 italic">
                  <strong>Miss Sally's Secret:</strong> After readin' a section, close that book up tight and write down everything you remember, just like writin' down a family recipe. Then check what you missed - that's where you need to focus, darlin'!
                </div>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900 rounded-md hover:shadow-lg transition-all duration-200">
                <h3 className="font-medium text-purple-800 dark:text-purple-200 mb-2 flex items-center">
                  <span className="bg-purple-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">3</span>
                  Connect the Dots, Sweetheart
                </h3>
                <p className="text-purple-700 dark:text-purple-300 mb-2">Now honey, you gotta create yourself some visual maps showin' how all them {selectedSubject?.name || 'exam'} concepts connect together - just like a big ol' family tree! It's gonna help you see the whole picture, clear as a bell on Sunday mornin'.</p>
                <div className="mt-2 text-sm text-purple-600 dark:text-purple-400 italic">
                  <strong>Miss Sally's Favorite Tools:</strong> Bless your heart, you don't need fancy paper - try them free digital tools like MindMeister or XMind. They're easier than makin' sweet tea, and twice as helpful!
                </div>
              </div>
              
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900 rounded-md hover:shadow-lg transition-all duration-200">
                <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2 flex items-center">
                  <span className="bg-yellow-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">4</span>
                  Practice Makes Perfect, Y'all
                </h3>
                <p className="text-yellow-700 dark:text-yellow-300 mb-2">Listen here, sugar - you gotta take them timed practice tests like you're sittin' for the real deal! Then go back and look at what you missed, just like checkin' a recipe when the biscuits don't rise right.</p>
                <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400 italic">
                  <strong>Miss Sally's Calendar Tip:</strong> Mark your calendar with practice exam days like they're Sunday dinner - sacred and non-negotiable! No peekin' at notes, and keep that timer tickin' just like the real thing.
                </div>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900 rounded-md hover:shadow-lg transition-all duration-200">
                <h3 className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center">
                  <span className="bg-red-600 text-white rounded-full w-6 h-6 inline-flex items-center justify-center mr-2">5</span>
                  Teach It Like You Preach It, Honey!
                </h3>
                <p className="text-red-700 dark:text-red-300 mb-2">Now listen here, darlin' - explainin' concepts to others is like bakin' a cake from memory. If you can teach it to your mama's bridge club, then you know it better than the back of your hand!</p>
                <div className="mt-2 text-sm text-red-600 dark:text-red-400 italic">
                  <strong>Miss Sally's Secret Sauce:</strong> Get yourself a phone and record yourself explainin' them key concepts like you're the teacher. Then listen back and catch where you stumbled - that's where you need more studyin', sweet pea!
                </div>
              </div>
              
              <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-md border-l-4 border-pink-500">
                <h3 className="font-medium mb-2 flex items-center">
                  <FaHeart className="text-pink-500 mr-2" />
                  Miss Sally's Special Advice for {selectedSubject?.name || 'Your Exam'}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">Now honey, remember that consistent, focused study sessions are sweeter than pie - and a whole lot more effective than crammin' the night before! Break down your {selectedSubject?.name || 'exam'} preparation into bite-sized pieces, just like you'd eat an elephant - one bite at a time, sugar!</p>
                <button className="mt-3 px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm flex items-center justify-center">
                  <FaHeart className="mr-2" /> Get Your Custom Study Plan, Darlin'
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorPage;

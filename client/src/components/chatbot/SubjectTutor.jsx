import React, { useState, useEffect, useRef } from 'react';
import { useSubject } from '../../contexts/SubjectContext';
import { useChatbot } from '../../context/ChatbotContext';
import { useUserPreferences } from '../../context/UserPreferencesContext';
import { useAuth } from '../../context/AuthContext';
import { getLesson, getQuizForTopic } from '../../services/tutorService';
import { FiSend } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';
import { FaHeart, FaSmile } from 'react-icons/fa';

// Helper function to get a tutor name based on the subject
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

const SubjectTutor = ({ topic }) => {
  const [activeSection, setActiveSection] = useState(0);
  const [lesson, setLesson] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [tutorMessages, setTutorMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [fullResponse, setFullResponse] = useState('');
  const [typingSpeed, setTypingSpeed] = useState({ min: 10, max: 50 });
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [tutorPersonality, setTutorPersonality] = useState('southern');
  
  // Context hooks
  const { selectedSubject } = useSubject();
  const { sendMessage, messages } = useChatbot();
  const { user } = useAuth();
  const { 
    preferences, 
    setUserName, 
    setHasGreeted, 
    addVisitedTopic,
    getSouthernGreeting,
    getSouthernEncouragement,
    getSouthernSympathy
  } = useUserPreferences();
  
  // Refs
  const chatContainerRef = useRef(null);
  const typingTimerRef = useRef(null);
  
  // Get the tutor and user names from preferences
  const tutorName = preferences.tutorName || getTutorNameForSubject(selectedSubject?.name);
  const userName = preferences.userName;

  // Check if we should show the name prompt
  useEffect(() => {
    if (user && !preferences.userName && !showNamePrompt) {
      setShowNamePrompt(true);
    }
  }, [user, preferences.userName, showNamePrompt]);
  
  // Store the current topic to prevent inconsistencies
  const [currentTopic, setCurrentTopic] = useState('');

  // Handle topic changes without adding chat messages (now handled by GlobalTutor)
  useEffect(() => {
    if (topic && selectedSubject) {
      // Get lesson content based on the selected subject and topic
      const lessonContent = getLesson(selectedSubject.name, topic);
      setLesson(lessonContent);
      
      // Track this topic in visited topics
      addVisitedTopic(topic);
      
      // Store the current topic to maintain consistency
      setCurrentTopic(topic);
      
      // Reset quiz state when topic changes
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setActiveSection(0);
      
      // Send a topic change notification to the global tutor via the ChatbotContext
      // This will be handled by the GlobalTutor component
      sendMessage('', {
        isSystemMessage: true,
        text: `I'm now studying ${topic} in ${selectedSubject.name}.`,
        sender: 'system',
        timestamp: new Date().toISOString(),
        topic: topic,
        subject: selectedSubject.name,
        isTopicChange: true
      });
    }
  }, [topic, selectedSubject, preferences.userName, tutorName, getSouthernGreeting, addVisitedTopic]);

  const handleSectionChange = (index) => {
    setActiveSection(index);
  };
  
  // Handle submitting the user's name
  const handleNameSubmit = () => {
    if (!nameInput.trim()) return;
    
    // Save the user's name in preferences
    setUserName(nameInput.trim());
    
    // Add a message from the user with their name
    const userMessage = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      text: nameInput.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add a response from the tutor acknowledging the name
    const tutorResponse = {
      id: `tutor_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      text: `${nameInput.trim()}! What a lovely name! It's a pleasure to meet you, sugar. Now, what would you like to know about ${topic}?`,
      sender: 'tutor',
      timestamp: new Date(Date.now() + 500).toISOString()
    };
    
    // Update the messages
    setTutorMessages(prev => [...prev, userMessage, tutorResponse]);
    
    // Hide the name prompt
    setShowNamePrompt(false);
    setNameInput('');
  };
  
  // Add southern charm to responses
  const addSouthernCharm = (text) => {
    // Southern phrases to randomly add to responses
    const southernPhrases = [
      'sugar',
      'honey',
      'darlin\'',
      'sweetheart',
      'y\'all',
      'bless your heart',
      'my goodness',
      'well I declare',
      'ain\'t that somethin\''
    ];
    
    // Southern expressions to randomly add to the end of sentences
    const southernExpressions = [
      'You hear?',
      'Bless your heart!',
      'Ain\'t that somethin\'?',
      'I do declare!',
      'Well, butter my biscuit!',
      'As sure as the day is long!',
      'That\'s the gospel truth!'
    ];
    
    // Randomly decide if we should add a southern phrase
    if (Math.random() > 0.7) {
      const phrase = southernPhrases[Math.floor(Math.random() * southernPhrases.length)];
      // Replace a period with a southern expression occasionally
      if (Math.random() > 0.8 && text.includes('.')) {
        const expression = southernExpressions[Math.floor(Math.random() * southernExpressions.length)];
        return text.replace('.', `, ${phrase}. ${expression} `);
      } else {
        // Otherwise just add the phrase somewhere in the text
        const sentences = text.split('. ');
        if (sentences.length > 1) {
          const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
          sentences[randomIndex] = `${sentences[randomIndex]}, ${phrase}`;
          return sentences.join('. ');
        } else {
          return `${text}, ${phrase}`;
        }
      }
    }
    
    return text;
  };
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Generate a unique message ID
    const messageId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new message object with current topic
    const newMessage = {
      id: messageId,
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toISOString(),
      topic: currentTopic // Use the stored current topic
    };
    
    // Add the message to our local state
    setTutorMessages(prev => [...prev, newMessage]);
    
    // Clear the input field
    setMessageInput('');
    
    // Send the message to the chatbot context with subject and topic info
    sendMessage(messageInput, {
      subject: selectedSubject.name,
      topic: currentTopic, // Use the stored current topic for consistency
      role: 'tutor',
      messageId: messageId,
      personality: 'southern', // Add personality hint
      userName: preferences.userName // Include the user's name if we have it
    });
    
    // Show typing indicator immediately
    setIsTyping(true);
    setTypingText('');
    
    // Log for debugging
    console.log(`Sent message with ID: ${messageId} for topic: ${currentTopic}`);
  };

  // Handle quiz answer selection
  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  // Handle quiz submission
  const handleQuizSubmit = () => {
    if (Object.keys(quizAnswers).length === 0) return;
    
    // Get the quiz questions
    const questions = lesson.quiz || [];
    
    // Calculate the score
    let correctAnswers = 0;
    questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correctAnswers++;
      }
    });
    
    const score = questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0;
    setQuizScore(score);
    setQuizSubmitted(true);
  };

  if (!topic) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">Select a Topic to Begin</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Choose a topic from the list or enter a custom topic to start learning.
          </p>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="text-center py-10">
          <h2 className="text-2xl font-semibold mb-4">Loading...</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Preparing your lesson content...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      {/* Name Prompt Modal */}
      {showNamePrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white flex items-center">
              <FaSmile className="mr-2 text-yellow-500" /> Howdy there!
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
      
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{lesson.title}</h2>
        <div className="text-sm text-gray-600 dark:text-gray-300 italic">
          Use the chat button in the bottom right corner to ask questions about this topic
        </div>
      </div>
      
      <div className="lesson-content">
        <h3 className="text-xl font-semibold mb-3">{lesson.sections[activeSection].title}</h3>
        {Array.isArray(lesson.sections[activeSection].content) ? (
          lesson.sections[activeSection].content.map((paragraph, idx) => (
            <p key={idx} className="mb-4">{paragraph}</p>
          ))
        ) : (
          <div className="mb-4" dangerouslySetInnerHTML={{ __html: lesson.sections[activeSection].content.replace(/\n/g, '<br/>') }} />
        )}
        
        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeSection > 0 
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600' 
                : 'invisible'
            }`}
            onClick={() => setActiveSection(activeSection - 1)}
            disabled={activeSection === 0}
          >
            Previous Section
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeSection < lesson.sections.length 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'invisible'
            }`}
            onClick={() => setActiveSection(activeSection + 1)}
            disabled={activeSection === lesson.sections.length}
          >
            {activeSection === lesson.sections.length - 1 && lesson.quiz ? 'Take Quiz' : 'Next Section'}
          </button>
        </div>
      </div>

      {/* Removed chat interface - now using global tutor */}
    </div>
  );
};

export default SubjectTutor;

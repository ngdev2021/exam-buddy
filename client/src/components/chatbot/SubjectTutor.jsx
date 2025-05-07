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

  // Handle topic changes and add southern hospitality
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
      
      // Add initial tutor message with southern hospitality
      let greeting = getSouthernGreeting();
      let nameGreeting = '';
      
      // Add personalized greeting if we know the user's name
      if (preferences.userName) {
        nameGreeting = ` ${preferences.userName},`;
      }
      
      // Create the initial message with southern charm - use consistent topic reference
      const initialMessage = {
        sender: 'tutor',
        text: `${greeting}${nameGreeting} I'm ${tutorName}, your ${selectedSubject.name} tutor. I'm just tickled pink to help you learn about ${topic}! What would you like to know, sugar?`,
        timestamp: new Date().toISOString(),
        topic: topic // Store the topic with the message
      };
      
      // If we don't know the user's name, add a follow-up message asking for it
      const messages = [initialMessage];
      if (!preferences.userName && !showNamePrompt) {
        const nameRequestMessage = {
          sender: 'tutor',
          text: `Before we dive in, I'd love to know your name, darlin'. It helps me make our conversations more personal!`,
          timestamp: new Date(Date.now() + 1000).toISOString(),
          topic: topic // Store the topic with the message
        };
        messages.push(nameRequestMessage);
        setShowNamePrompt(true);
      }
      
      // Clear previous messages to prevent topic mixing
      setTutorMessages(messages);
      setShowChat(true);
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
        <button 
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showChat ? 'Hide Chat' : 'Ask Tutor'}
        </button>
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

      {/* Chat interface with southern charm */}
      {showChat && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 font-medium border-b flex items-center">
            <FaHeart className="text-pink-500 mr-2" />
            Chat with {tutorName} - Your {selectedSubject.name} Tutor
          </div>
          
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800"
          >
            {/* Display only messages related to the current topic */}
            {tutorMessages
              .filter(msg => !msg.topic || msg.topic === currentTopic)
              .map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'tutor' && (
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
                    {msg.sender === 'tutor' && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{tutorName}</p>
                    )}
                    <p>{msg.text}</p>
                    {msg.sender === 'user' && preferences.userName && (
                      <p className="text-xs text-right text-blue-300 mt-1">{preferences.userName}</p>
                    )}
                  </div>
                </div>
              ))}
              
            {/* Debug info - only in development */}
            {process.env.NODE_ENV === 'development' && (
              <div className="text-xs text-gray-400 mt-2 p-1 border border-gray-200 rounded">
                Current topic: {currentTopic}
              </div>
            )}
            
            {/* Display typing indicator and text being typed */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-3/4 rounded-lg px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                  {typingText.length === 0 ? (
                    <div className="flex items-center">
                      <span className="text-sm italic mr-2">Typing</span>
                      <BsThreeDots className="animate-pulse" />
                    </div>
                  ) : (
                    <p>{typingText}</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t p-2 flex">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask a question about this topic..."
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

export default SubjectTutor;

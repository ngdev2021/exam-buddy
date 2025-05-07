import React, { useState, useEffect, useRef } from 'react';
import { useSubject } from '../../contexts/SubjectContext';
import { useChatbot } from '../../context/ChatbotContext';
import { getLesson, getQuizForTopic } from '../../services/tutorService';
import { FiSend } from 'react-icons/fi';
import { BsThreeDots } from 'react-icons/bs';

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
  const { selectedSubject } = useSubject();
  const { sendMessage, messages } = useChatbot();
  const chatContainerRef = useRef(null);
  const typingTimerRef = useRef(null);

  useEffect(() => {
    if (topic && selectedSubject) {
      // Get lesson content based on the selected subject and topic
      const lessonContent = getLesson(selectedSubject.name, topic);
      setLesson(lessonContent);
      
      // Reset quiz state when topic changes
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
      setActiveSection(0);
      
          // Add initial tutor message when topic changes
      const initialMessage = {
        sender: 'tutor',
        text: `I'm your ${selectedSubject.name} tutor. How can I help you learn about ${topic}?`,
        timestamp: new Date().toISOString()
      };
      setTutorMessages([initialMessage]);
      
      // Reset any previous chat state
      setShowChat(false);
    }
  }, [topic, selectedSubject]);

  const handleSectionChange = (index) => {
    setActiveSection(index);
  };
  
  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    
    // Generate a unique message ID
    const messageId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Create a new message object
    const newMessage = {
      id: messageId,
      text: messageInput,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add the message to our local state
    setTutorMessages(prev => [...prev, newMessage]);
    
    // Clear the input field
    setMessageInput('');
    
    // Send the message to the chatbot context with subject and topic info
    sendMessage(messageInput, {
      subject: selectedSubject.name, // Use the name property of the subject object
      topic: topic,
      role: 'tutor',
      messageId: messageId // Add the message ID to track responses
    });
    
    // Log for debugging
    console.log(`Sent message with ID: ${messageId}`);
  };
  
  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [tutorMessages]);
  
  // Keep track of processed message IDs to prevent duplicates
  const [processedMessageIds, setProcessedMessageIds] = useState(new Set());
  
  // Listen for new messages from the chatbot context
  useEffect(() => {
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // Check if this message has already been processed
      if (lastMessage.id && !processedMessageIds.has(lastMessage.id)) {
        // Only add AI responses that match our topic and role
        if (lastMessage.sender === 'ai' && 
            lastMessage.context && 
            lastMessage.context.topic === topic &&
            lastMessage.context.role === 'tutor') {
          
          console.log('Adding tutor response:', lastMessage);
          
          // Mark this message as processed
          setProcessedMessageIds(prev => new Set([...prev, lastMessage.id]));
          
          // Start the typing effect instead of immediately adding the message
          setIsTyping(true);
          setFullResponse(lastMessage.text);
          setTypingText('');
        }
      }
    }
  }, [messages, processedMessageIds, topic]);
  
  // Handle the typing effect
  useEffect(() => {
    if (isTyping && fullResponse) {
      if (typingText.length < fullResponse.length) {
        // Clear any existing timer
        if (typingTimerRef.current) {
          clearTimeout(typingTimerRef.current);
        }
        
        // Set a random typing speed for a more natural feel
        const randomDelay = Math.floor(Math.random() * 
          (typingSpeed.max - typingSpeed.min + 1)) + typingSpeed.min;
        
        // Add the next character after a delay
        typingTimerRef.current = setTimeout(() => {
          setTypingText(fullResponse.substring(0, typingText.length + 1));
        }, randomDelay);
      } else {
        // Typing is complete
        setIsTyping(false);
        
        // Add the completed message to the conversation
        setTutorMessages(prev => [...prev, {
          sender: 'tutor',
          text: fullResponse,
          timestamp: new Date().toISOString()
        }]);
        
        // Reset for next message
        setFullResponse('');
        setTypingText('');
      }
    }
    
    // Clean up timer on unmount or when dependencies change
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [isTyping, fullResponse, typingText, typingSpeed]);

  const handleQuizAnswer = (questionId, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuizSubmit = () => {
    if (!lesson || !lesson.quiz) return;
    
    // Calculate score
    let correctAnswers = 0;
    const questions = lesson.quiz.questions || [];
    
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
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">{lesson.title}</h2>
        <button 
          onClick={() => setShowChat(!showChat)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          {showChat ? 'Hide Chat' : 'Ask Tutor'}
        </button>
      </div>
      
      {/* Section navigation */}
      <div className="flex flex-wrap gap-2 mb-6">
        {lesson.sections.map((section, index) => (
          <button
            key={index}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === index 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleSectionChange(index)}
          >
            {section.title}
          </button>
        ))}
        {lesson.quiz && (
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeSection === lesson.sections.length 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => handleSectionChange(lesson.sections.length)}
          >
            Quiz
          </button>
        )}
      </div>
      
      {/* Section content */}
      {activeSection < lesson.sections.length ? (
        <div className="prose dark:prose-invert max-w-none">
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
      ) : (
        /* Quiz section */
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6">Knowledge Check</h2>
          
          {!quizSubmitted ? (
            <div>
              <p className="mb-4">Let's test your understanding of {topic} with a quick quiz.</p>
              
              {lesson.quiz && lesson.quiz.length > 0 ? (
                <div className="space-y-6">
                  {lesson.quiz.map((question, qIndex) => (
                    <div key={qIndex} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="font-medium mb-3">{qIndex + 1}. {question.question || question.text}</p>
                      
                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <label key={oIndex} className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                            <input
                              type="radio"
                              name={`question-${qIndex}`}
                              value={oIndex}
                              checked={quizAnswers[qIndex] === oIndex}
                              onChange={() => handleQuizAnswer(qIndex, oIndex)}
                              className="mt-1 mr-2"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length === 0}
                    className={`mt-4 px-6 py-2 rounded-md transition-colors ${Object.keys(quizAnswers).length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                  >
                    Submit Answers
                  </button>
                  <p className="text-sm text-gray-500 mt-2">{Object.keys(quizAnswers).length === 0 ? 'Please answer at least one question to submit' : `${Object.keys(quizAnswers).length} of ${lesson.quiz.length} questions answered`}</p>
                </div>
              ) : (
                <div>
                  <p className="mb-4">No predefined quiz available for this topic. Here's a general knowledge check:</p>
                  <div className="space-y-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <p className="font-medium mb-3">1. Which of the following is most important when studying {topic}?</p>
                      <div className="space-y-2">
                        {['Understanding core concepts', 'Memorizing definitions', 'Practicing with examples', 'All of the above'].map((option, oIndex) => (
                          <label key={oIndex} className="flex items-start cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 p-2 rounded-md transition-colors">
                            <input
                              type="radio"
                              name="question-0"
                              value={oIndex}
                              checked={quizAnswers[0] === oIndex}
                              onChange={() => handleQuizAnswer(0, oIndex)}
                              className="mt-1 mr-2"
                            />
                            <span>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={handleQuizSubmit}
                      disabled={Object.keys(quizAnswers).length === 0}
                      className={`mt-4 px-6 py-2 rounded-md transition-colors ${Object.keys(quizAnswers).length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                      Submit Answer
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className={`p-4 rounded-lg mb-6 ${
                quizScore >= 70 ? 'bg-green-100 dark:bg-green-800' : 'bg-red-100 dark:bg-red-800'
              }`}>
                <h4 className="font-semibold text-lg mb-2">Your Score: {quizScore}%</h4>
                <p>{quizScore >= 70 
                  ? 'Great job! You have a good understanding of this topic.' 
                  : 'You might need to review this topic again to improve your understanding.'}</p>
              </div>
              
              {/* Show correct/incorrect answers */}
              <h4 className="font-semibold mb-3">Review:</h4>
              {(lesson.quiz.questions || []).map((question, index) => {
                const isCorrect = quizAnswers[index] === question.correctAnswer;
                return (
                  <div 
                    key={index} 
                    className={`mb-4 p-3 rounded-lg ${
                      isCorrect ? 'bg-green-50 dark:bg-green-900' : 'bg-red-50 dark:bg-red-900'
                    }`}
                  >
                    <p className="font-medium">{index + 1}. {question.text}</p>
                    <p className="mt-2">
                      <span className="font-medium">Your answer:</span> {question.options[quizAnswers[index]]}
                      {!isCorrect && (
                        <span className="block mt-1">
                          <span className="font-medium">Correct answer:</span> {question.options[question.correctAnswer]}
                        </span>
                      )}
                    </p>
                    {question.explanation && (
                      <p className="mt-2 text-sm italic">{question.explanation}</p>
                    )}
                  </div>
                );
              })}
              
              <div className="flex justify-between mt-6">
                <button
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
                  onClick={() => setActiveSection(lesson.sections.length - 1)}
                >
                  Back to Content
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                    setQuizScore(0);
                  }}
                >
                  Retake Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Chat interface */}
      {showChat && (
        <div className="mt-6 border rounded-lg overflow-hidden">
          <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 font-medium border-b">
            Chat with your {selectedSubject.name} Tutor
          </div>
          
          <div 
            ref={chatContainerRef}
            className="h-64 overflow-y-auto p-4 space-y-4 bg-white dark:bg-gray-800"
          >
            {/* Display all completed messages */}
            {tutorMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-3/4 rounded-lg px-4 py-2 ${
                    msg.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            
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

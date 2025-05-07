import React, { useState, useEffect, useCallback } from 'react';
import { useVoice } from '../../context/VoiceContext';
import VoiceInput from './VoiceInput';
import VoiceOutput from './VoiceOutput';
import axios from 'axios';

const VoiceExamSimulation = ({ 
  subject,
  difficulty = 'medium',
  timeLimit = 120, // seconds
  culturalVocabularyMode = false,
  onComplete
}) => {
  const { speak, transcript, isListening, startListening, stopListening } = useVoice();
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [examState, setExamState] = useState('intro'); // intro, question, review, complete
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [feedback, setFeedback] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  
  // Generate exam questions
  useEffect(() => {
    if (subject) {
      generateQuestions();
    }
  }, [subject]);
  
  // Timer for exam
  useEffect(() => {
    let timer;
    if (examState === 'question' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [examState, timeRemaining]);
  
  // Log voice interaction to the server
  const logVoiceInteraction = useCallback(async (data) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/voice/log`,
        data,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
    } catch (error) {
      console.error('Error logging voice interaction:', error);
    }
  }, []);
  
  // Generate questions for the exam
  const generateQuestions = () => {
    // In a real implementation, this would call an API to generate questions
    // For now, we'll use sample questions
    const sampleQuestions = [
      {
        id: 1,
        text: `What are the key components of ${subject}?`,
        expectedAnswer: `The key components of ${subject} include theoretical frameworks, practical applications, and evaluation methods.`
      },
      {
        id: 2,
        text: `Explain the importance of ${subject} in a professional context.`,
        expectedAnswer: `${subject} is important in professional contexts because it provides structured approaches to problem-solving, enhances decision-making, and improves overall efficiency.`
      },
      {
        id: 3,
        text: `What are the ethical considerations in ${subject}?`,
        expectedAnswer: `Ethical considerations in ${subject} include privacy concerns, fairness in application, transparency in methods, and accountability for outcomes.`
      }
    ];
    
    setQuestions(sampleQuestions);
    setUserAnswers(new Array(sampleQuestions.length).fill(''));
    setCurrentQuestionIndex(0);
    setTimeRemaining(timeLimit);
    setExamState('intro');
  };
  
  // Start the exam
  const startExam = () => {
    setExamState('question');
    // Speak the first question
    speak(questions[0].text);
  };
  
  // Handle when time is up for a question
  const handleTimeUp = () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(timeLimit);
      // Speak the next question
      speak(questions[currentQuestionIndex + 1].text);
    } else {
      // End of exam
      setExamState('review');
    }
  };
  
  // Handle user's spoken answer
  const handleTranscriptReady = (transcript) => {
    // Save the user's answer
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = transcript;
    setUserAnswers(updatedAnswers);
    
    // Log the interaction
    logVoiceInteraction({
      interactionType: 'exam',
      userInput: transcript,
      systemResponse: questions[currentQuestionIndex].text,
      culturalVocabularyMode,
      culturalVocabularyType: culturalVocabularyMode ? 'aave' : 'standard',
      metadata: {
        questionId: questions[currentQuestionIndex].id,
        subject,
        difficulty
      }
    });
    
    // Move to the next question or end the exam
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeRemaining(timeLimit);
      // Speak the next question
      setTimeout(() => {
        speak(questions[currentQuestionIndex + 1].text);
      }, 1000);
    } else {
      // End of exam
      setExamState('review');
    }
  };
  
  // Start listening for answer
  const handleListenForAnswer = async () => {
    await startListening(culturalVocabularyMode);
  };
  
  // Evaluate the user's answers
  const evaluateAnswers = async () => {
    setIsEvaluating(true);
    
    try {
      // In a real implementation, this would call an API to evaluate the answers
      // For now, we'll simulate the evaluation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const evaluationResults = userAnswers.map((answer, index) => {
        // Simple evaluation logic - in a real app, this would be more sophisticated
        const question = questions[index];
        const keyTerms = question.expectedAnswer.toLowerCase().split(' ');
        const userTerms = answer.toLowerCase().split(' ');
        
        // Count how many key terms the user mentioned
        const matchedTerms = keyTerms.filter(term => 
          userTerms.some(userTerm => userTerm.includes(term))
        );
        
        const score = Math.min(100, Math.round((matchedTerms.length / Math.min(10, keyTerms.length)) * 100));
        
        return {
          questionId: question.id,
          question: question.text,
          userAnswer: answer,
          expectedAnswer: question.expectedAnswer,
          score,
          feedback: score >= 70 
            ? 'Good answer! You covered most of the key points.' 
            : 'Your answer could be improved by including more key concepts.'
        };
      });
      
      // Calculate overall score
      const overallScore = Math.round(
        evaluationResults.reduce((sum, result) => sum + result.score, 0) / evaluationResults.length
      );
      
      setFeedback({
        results: evaluationResults,
        overallScore
      });
      
      setExamState('complete');
      
      // Call onComplete callback with results
      if (onComplete) {
        onComplete({
          questions,
          userAnswers,
          evaluationResults,
          overallScore
        });
      }
    } catch (error) {
      console.error('Error evaluating answers:', error);
    } finally {
      setIsEvaluating(false);
    }
  };
  
  // Format time remaining as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Render different exam states
  const renderExamContent = () => {
    switch (examState) {
      case 'intro':
        return (
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-4">Oral Exam: {subject}</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              This simulation will present you with {questions.length} questions about {subject}.
              You'll have {formatTime(timeLimit)} to answer each question verbally.
            </p>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Speak clearly and try to cover all the key points in your answers.
            </p>
            <button 
              className="btn-primary"
              onClick={startExam}
            >
              Start Exam
            </button>
          </div>
        );
        
      case 'question':
        return (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className={`font-mono text-lg font-bold ${
                timeRemaining < 30 ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-200'
              }`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Question</h3>
                <VoiceOutput text={questions[currentQuestionIndex].text} className="ml-2" />
              </div>
              <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                {questions[currentQuestionIndex].text}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Answer</h3>
              <VoiceInput 
                onTranscriptReady={handleTranscriptReady} 
                placeholder="Click the microphone and speak your answer..."
              />
              
              <div className="flex justify-center mt-4">
                <button 
                  className={`btn-primary ${isListening ? 'animate-pulse bg-red-500' : ''}`}
                  onClick={handleListenForAnswer}
                  disabled={isListening}
                >
                  {isListening ? 'Listening...' : 'Speak Answer'}
                </button>
              </div>
            </div>
          </div>
        );
        
      case 'review':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Review Your Answers</h2>
            
            <div className="mb-6">
              {questions.map((question, index) => (
                <div key={question.id} className="mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                  <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Question {index + 1}: {question.text}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-medium">Your answer:</span> {userAnswers[index] || 'No answer provided'}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button 
                className="btn-primary"
                onClick={evaluateAnswers}
                disabled={isEvaluating}
              >
                {isEvaluating ? 'Evaluating...' : 'Submit for Evaluation'}
              </button>
            </div>
          </div>
        );
        
      case 'complete':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Exam Results</h2>
            
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Overall Score
              </h3>
              <div className="text-3xl font-bold mb-2">
                {feedback?.overallScore}%
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                {feedback?.overallScore >= 70 
                  ? 'Great job! You demonstrated good knowledge of the subject.' 
                  : 'You might want to review this subject more thoroughly.'}
              </p>
            </div>
            
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                Detailed Feedback
              </h3>
              
              {feedback?.results.map((result, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                    Question {index + 1}: {result.question}
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-medium">Your answer:</span> {result.userAnswer || 'No answer provided'}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    <span className="font-medium">Expected answer:</span> {result.expectedAnswer}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      Score: {result.score}%
                    </span>
                    <span className={`text-sm ${
                      result.score >= 70 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                    }`}>
                      {result.feedback}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button 
                className="btn-primary"
                onClick={generateQuestions}
              >
                Start New Exam
              </button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="voice-exam-simulation card p-6">
      {renderExamContent()}
    </div>
  );
};

export default VoiceExamSimulation;

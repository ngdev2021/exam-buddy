import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import ScoreTracker from "../components/ScoreTracker";
import axios from "axios";
import mathTopics from "../shared/mathTopics";

// Topics now come from SubjectContext

const CACHE_SIZE = 5;

const topicToChapter = {
  "Risk Management": "Chapter 1 – Risk Management Principles",
  "Property Insurance": "Chapter 3 – Property Insurance Basics",
  "Casualty Insurance": "Chapter 5 – Casualty Insurance Essentials",
  "Texas Insurance Law": "Chapter 2 – Texas Insurance Law",
  "Policy Provisions": "Chapter 4 – Policy Provisions",
  "Underwriting": "Chapter 6 – Underwriting & Applications",
  "Claims Handling": "Chapter 7 – Claims Handling",
  "Ethics & Regulations": "Chapter 8 – Ethics & Regulations",
  "Math Calculations": "Math Calculations"
};

const PRACTICE_LENGTHS = [5, 10, 25];

export default function PracticePage() {
  const { user, token } = useAuth();
  const { selectedSubject } = useSubject();
  // Get topics from the selected subject
  const topics = selectedSubject.groups.flatMap(g => g.topics);
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mistakesByTopic, setMistakesByTopic] = useState({});
  const [practiceLength, setPracticeLength] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200">
          <h2 className="text-xl font-bold mb-2 dark:text-gray-200">Practice Mode</h2>
          <p className="mb-4 dark:text-gray-300">Please <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">log in</a> or <a href="/register" className="text-accent-600 dark:text-accent-400 hover:underline">register</a> to practice.</p>
        </div>
      </div>
    );
  }

  async function handleStart() {
    setSessionStarted(true);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
    setQuestions([]);
    setCurrentIndex(0);
    setShowSummary(false);
    if (timerEnabled) {
      setTimer(practiceLength * 60);
      setTimeLeft(practiceLength * 60);
    } else {
      setTimer(0);
      setTimeLeft(0);
    }
    setLoading(true);
    setError("");
    try {
      const requests = Array.from({ length: practiceLength }, () =>
        axios.post(`${import.meta.env.VITE_API_URL}/api/generate-question`, { 
          topic: selectedTopic,
          subject: selectedSubject.name 
        }).then(r => ({ ...r.data, topic: selectedTopic }))
      );
      const responses = await Promise.allSettled(requests);
      const valid = responses
        .filter(r => r.status === "fulfilled" && r.value && Array.isArray(r.value.choices) && r.value.choices.length === 4)
        .map(r => r.value);
      setQuestions(valid);
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleNextQuestion() {
    setScore(s => ({ ...s, total: s.total + 1 }));
    setCurrentIndex(i => {
      if (i + 1 >= questions.length) {
        setShowSummary(true);
        setSessionStarted(false);
        return i;
      }
      return i + 1;
    });
  }

  function handleScoreUpdate(isCorrect) {
    setScore(s => ({ ...s, correct: s.correct + (isCorrect ? 1 : 0) }));
    if (questions[currentIndex] && questions[currentIndex].topic) {
      const topic = questions[currentIndex].topic;
      setMistakesByTopic(prev => ({
        ...prev,
        ...(isCorrect ? {} : { [topic]: (prev[topic] || 0) + 1 })
      }));
      fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic, correct: isCorrect })
      });
    }
  }

  useEffect(() => {
    if (!sessionStarted || !timerEnabled || showSummary) return;
    if (timeLeft <= 0 && timerEnabled) {
      setShowSummary(true);
      setSessionStarted(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, sessionStarted, timerEnabled, showSummary]);

  useEffect(() => {
    setSessionStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
  }, [selectedTopic]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header with title and description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-800 dark:text-gray-200">Practice Mode</h1>
          <p className="text-gray-600 dark:text-gray-300">Sharpen your skills by focusing on specific topics</p>
        </div>
        
        {sessionStarted && (
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex flex-col items-center bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{score.correct}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
            </div>
            {timerEnabled && (
              <div className="flex flex-col items-center bg-accent-50 dark:bg-accent-900/20 rounded-lg px-4 py-2">
                <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2, '0')}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Time Left</span>
              </div>
            )}
          </div>
        )}
      </div>
      {!sessionStarted && !showSummary ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Configure Your Practice Session</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Topic:</label>
              <select 
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={selectedTopic}
                onChange={e => setSelectedTopic(e.target.value)}
              >
                <option value="">-- Select a Topic --</option>
                {topics.map(topic => (
                  <option key={topic} value={topic}>{topic}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Number of Questions:</label>
              <div className="flex flex-wrap gap-2">
                {PRACTICE_LENGTHS.map(length => (
                  <button
                    key={length}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${practiceLength === length ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setPracticeLength(length)}
                  >
                    {length}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center bg-gray-50 dark:bg-gray-700/30 p-3 rounded-lg">
              <input
                type="checkbox"
                id="timer-toggle"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                checked={timerEnabled}
                onChange={() => setTimerEnabled(!timerEnabled)}
              />
              <label htmlFor="timer-toggle" className="ml-2 text-gray-700 dark:text-gray-300">
                Enable Timer
                <span className="text-xs text-gray-500 dark:text-gray-400 block mt-0.5">Adds time pressure to simulate exam conditions</span>
              </label>
            </div>
            
            <button 
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
              disabled={!selectedTopic || loading}
              onClick={handleStart}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </>
              ) : (
                "Start Practice Session"
              )}
            </button>
          </div>
        </div>
      ) : showSummary ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Practice Results</h2>
            <div className="mt-2 sm:mt-0 bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2 flex items-center">
              <div className="mr-2">
                <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{questions.length ? Math.round((score.correct / questions.length) * 100) : 0}%</span>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <div>Score</div>
                <div className="font-medium">{score.correct}/{questions.length} correct</div>
              </div>
            </div>
          </div>
          
          {/* Performance Summary */}
          <div className="mb-8 bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/10 dark:to-accent-900/10 rounded-lg p-5 border border-primary-100 dark:border-primary-800/20">
            <div className="flex items-center mb-3">
              <svg className="w-6 h-6 text-primary-600 dark:text-primary-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Performance Summary</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-3">
              You completed {questions.length} questions on <span className="font-medium">{selectedTopic}</span>.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Correct</div>
                <div className="text-xl font-bold text-green-600 dark:text-green-400">{score.correct}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Incorrect</div>
                <div className="text-xl font-bold text-red-600 dark:text-red-400">{questions.length - score.correct}</div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400">Accuracy</div>
                <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{questions.length ? Math.round((score.correct / questions.length) * 100) : 0}%</div>
              </div>
            </div>
          </div>
          
          {/* Question Review */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Question Review
            </h3>
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {questions.map((q, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                  {/* Progress bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <span>Question {i + 1} of {questions.length}</span>
                      <span>{Math.round(((i + 1) / questions.length) * 100)}% Complete</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                        style={{ width: `${((i + 1) / questions.length) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Question */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">{q.question}</h3>
                    <div className="space-y-3">
                      {q.options.map((option, idx) => (
                        <button
                          key={idx}
                          className={`w-full text-left p-4 rounded-lg border ${q.userAnswer === option ? 'border-primary-600 bg-primary-50 dark:border-primary-400 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'} transition-colors duration-200`}
                        >
                          <div className="flex items-center">
                            <div className={`w-5 h-5 mr-3 rounded-full border-2 flex items-center justify-center ${q.userAnswer === option ? 'border-primary-600 dark:border-primary-400' : 'border-gray-400 dark:border-gray-500'}`}>
                              {q.userAnswer === option && (
                                <div className="w-3 h-3 rounded-full bg-primary-600 dark:bg-primary-400"></div>
                              )}
                            </div>
                            <span className="font-medium text-gray-800 dark:text-gray-200">{option}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors" 
              onClick={() => { setSessionStarted(false); setShowSummary(false); }}
            >
              Practice Again
            </button>
            <button 
              className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      ) : (
        <>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-lg mb-6 text-red-700 dark:text-red-400">
              {error}
            </div>
          )}
          
          {questions[currentIndex] ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Question {currentIndex + 1} of {questions.length}</span>
                  <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Question header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{questions[currentIndex].topic}</h3>
                    <span className="ml-3 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-full">
                      Question {currentIndex + 1}/{questions.length}
                    </span>
                  </div>
                </div>
                
                {timerEnabled && (
                  <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                    <div className="flex flex-col items-center bg-accent-50 dark:bg-accent-900/20 rounded-lg px-4 py-2">
                      <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2, '0')}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Time Left</span>
                    </div>
                  </div>
                )}
              </div>
              
              <QuestionCard
                question={{
                  ...questions[currentIndex],
                  isLastQuestion: currentIndex === questions.length - 1
                }}
                onScore={handleScoreUpdate}
                onNext={handleNextQuestion}
                theme="modern"
              />
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6 flex items-center justify-center">
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mb-4"></div>
                <p className="text-lg text-gray-700 dark:text-gray-300">Loading questions...</p>
              </div>
            </div>
          )}
        </>
      )}
      {/* Recommendations card */}
      {sessionStarted && score.total > 0 && !showSummary && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 dark:border-yellow-600 p-6 rounded-xl shadow transition-colors duration-200">
          <h3 className="text-lg font-bold mb-2 text-yellow-800 dark:text-yellow-400 flex items-center gap-2 transition-colors duration-200">📚 Recommended Study Areas</h3>
          {Object.keys(mistakesByTopic).length === 0 ? (
            <div className="text-green-700 dark:text-green-400 transition-colors duration-200">Great job! No weak areas detected this session.</div>
          ) : (
            <ul className="list-disc ml-6 space-y-1">
              {Object.entries(mistakesByTopic)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => (
                  <li key={topic}>
                    <span className="font-semibold text-yellow-900 dark:text-yellow-300 transition-colors duration-200">{topic}</span>:
                    <span className="ml-2 text-yellow-700 dark:text-yellow-400 transition-colors duration-200">Missed {count} time{count > 1 ? 's' : ''}</span>
                    <div className="text-sm text-gray-700 dark:text-gray-400 ml-2 transition-colors duration-200">Suggested: {topicToChapter[topic]}</div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

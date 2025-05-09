import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import ScoreTracker from "../components/ScoreTracker";
import axios from "axios";

// Topics now come from SubjectContext

const TEST_LENGTHS = [5, 10, 25, 50, 75, 100, 125, 150];
const CACHE_SIZE = 5;

export default function TestPage() {
  const { user, token } = useAuth();
  const { selectedSubject } = useSubject();
  const navigate = useNavigate();
  // Get topics from the selected subject
  const subjectTopics = selectedSubject.groups.flatMap(g => g.topics);
  const [selectedTopics, setSelectedTopics] = useState(subjectTopics);
  const [testLength, setTestLength] = useState(25);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mistakesByTopic, setMistakesByTopic] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 text-center transition-colors duration-200">
          <h2 className="text-xl font-bold mb-2 dark:text-gray-200">Test Mode</h2>
          <p className="mb-4 dark:text-gray-300">Please <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline">log in</a> or <a href="/register" className="text-accent-600 dark:text-accent-400 hover:underline">register</a> to take tests.</p>
        </div>
      </div>
    );
  }

  async function handleStart() {
    setStarted(true);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
    setQuestions([]);
    setCurrentIndex(0);
    setShowSummary(false);
    setLoading(true);
    setError("");
    try {
      const requests = Array.from({ length: testLength }, () => {
        const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
        return axios.post(`${import.meta.env.VITE_API_URL}/api/generate-question`, { 
          topic,
          subject: selectedSubject.name 
        }).then(res => ({ ...res.data, topic }));
      });
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
    setCurrentIndex(i => {
      if (i + 1 >= questions.length) {
        setShowSummary(true);
        return i;
      }
      return i + 1;
    });
  }

  function handleScoreUpdate(isCorrect) {
    setScore(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1
    }));

    if (questions[currentIndex] && questions[currentIndex].topic) {
      setMistakesByTopic(prev => {
        const newVal = { ...prev };
        if (!isCorrect) newVal[questions[currentIndex].topic] = (newVal[questions[currentIndex].topic] || 0) + 1;
        return newVal;
      });
      const topic = questions[currentIndex].topic;
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
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
  }, [selectedTopics, testLength]);
  
  // Update selectedTopics when subject changes
  useEffect(() => {
    setSelectedTopics(subjectTopics);
  }, [selectedSubject]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header with title and description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-gray-800 dark:text-gray-200">Test Mode</h1>
          <p className="text-gray-600 dark:text-gray-300">Challenge yourself with a full exam simulation</p>
        </div>
        
        {started && !showSummary && (
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <div className="flex flex-col items-center bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{currentIndex + 1}/{questions.length}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Question</span>
            </div>
            <div className="flex flex-col items-center bg-accent-50 dark:bg-accent-900/20 rounded-lg px-4 py-2">
              <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{score.correct}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Correct</span>
            </div>
          </div>
        )}
      </div>
      {!started ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Configure Your Exam</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Exam Length:</label>
              <div className="flex flex-wrap gap-2">
                {TEST_LENGTHS.map(len => (
                  <button
                    key={len}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${testLength === len ? 'bg-primary-600 hover:bg-primary-700 text-white' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200'}`}
                    onClick={() => setTestLength(len)}
                  >
                    {len} Questions
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Topics to Include:</label>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 max-h-64 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {subjectTopics.map(topic => (
                    <div key={topic} className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded transition-colors">
                      <input
                        type="checkbox"
                        id={`topic-${topic}`}
                        checked={selectedTopics.includes(topic)}
                        onChange={() => {
                          if (selectedTopics.includes(topic)) {
                            setSelectedTopics(selectedTopics.filter(t => t !== topic));
                          } else {
                            setSelectedTopics([...selectedTopics, topic]);
                          }
                        }}
                        className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <label htmlFor={`topic-${topic}`} className="text-gray-700 dark:text-gray-300">{topic}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <button 
                  className="text-primary-600 dark:text-primary-400 hover:underline" 
                  onClick={() => setSelectedTopics(subjectTopics)}
                >
                  Select All
                </button>
                <button 
                  className="text-gray-600 dark:text-gray-400 hover:underline" 
                  onClick={() => setSelectedTopics([])}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
                disabled={selectedTopics.length === 0 || loading}
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
                  "Start Exam"
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        showSummary ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Test Results</h2>
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
                You completed {questions.length} questions across {Object.keys((() => {
                  const topicStats = {};
                  questions.forEach(q => {
                    if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
                    topicStats[q.topic].total++;
                    if (q.userAnswer === q.answer) topicStats[q.topic].correct++;
                  });
                  return topicStats;
                })()).length} topics.
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
            
            {/* Topic Breakdown */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                Performance by Topic
              </h3>
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Questions</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Correct</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Score</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {(() => {
                        const topicStats = {};
                        questions.forEach(q => {
                          if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
                          topicStats[q.topic].total++;
                          if (q.userAnswer === q.answer) topicStats[q.topic].correct++;
                        });
                        return Object.entries(topicStats).map(([topic, stats]) => {
                          const percentage = stats.total ? Math.round((stats.correct / stats.total) * 100) : 0;
                          let colorClass = "text-red-600 dark:text-red-400";
                          if (percentage >= 80) colorClass = "text-green-600 dark:text-green-400";
                          else if (percentage >= 60) colorClass = "text-yellow-600 dark:text-yellow-400";
                          
                          return (
                            <tr key={topic} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-gray-200">{topic}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">{stats.total}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-600 dark:text-gray-300">{stats.correct}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} bg-opacity-10`}>
                                  {percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {/* Recommended Study Areas */}
            <div className="mb-8 bg-accent-50 dark:bg-accent-900/10 p-5 rounded-lg border border-accent-100 dark:border-accent-800/20">
              <div className="flex items-center mb-3">
                <svg className="w-6 h-6 text-accent-600 dark:text-accent-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">Recommended Study Areas</h3>
              </div>
              
              {(() => {
                const topicStats = {};
                questions.forEach(q => {
                  if (!topicStats[q.topic]) topicStats[q.topic] = { total: 0, correct: 0 };
                  topicStats[q.topic].total++;
                  if (q.userAnswer === q.answer) topicStats[q.topic].correct++;
                });
                const weak = Object.entries(topicStats)
                  .map(([topic, s]) => ({ topic, pct: s.total ? (s.correct / s.total) * 100 : 0 }))
                  .filter(t => t.pct < 75)
                  .sort((a, b) => a.pct - b.pct);
                  
                if (weak.length === 0) {
                  return (
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-200 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Great job! No weak areas detected in this test.
                    </div>
                  );
                }
                
                return (
                  <div className="space-y-4">
                    <p className="text-gray-700 dark:text-gray-300">Based on your performance, we recommend focusing on these topics:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {weak.map(w => (
                        <div key={w.topic} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center">
                          <div className="mr-3 w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 font-bold">
                            {Math.round(w.pct)}%
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">{w.topic}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Needs improvement</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Detailed Review */}
            <div className="mb-8">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Question Review
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {questions.map((q, i) => (
                  <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800/50">
                    <div className="font-medium text-gray-800 dark:text-gray-200 mb-2">Q{i+1}: {q.question}</div>
                    <div className="flex items-start mb-1">
                      <div className={`min-w-[80px] font-medium ${q.userAnswer === q.answer ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {q.userAnswer === q.answer ? 'Correct:' : 'Incorrect:'}
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">{q.answer}</div>
                    </div>
                    {q.userAnswer !== q.answer && (
                      <div className="flex items-start mb-1">
                        <div className="min-w-[80px] font-medium text-gray-600 dark:text-gray-400">Your answer:</div>
                        <div className="text-red-600 dark:text-red-400">{q.userAnswer || 'No answer provided'}</div>
                      </div>
                    )}
                    {q.explanation && (
                      <div className="mt-2 text-sm bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Explanation:</span> 
                        <span className="text-gray-600 dark:text-gray-400"> {q.explanation}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <button 
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors" 
                onClick={() => setStarted(false)}
              >
                Take Another Test
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
            
            {questions.length > 0 && !showSummary ? (
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
        )
      )}
    </div>
  );
}

// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";
import { useSubject } from "../contexts/SubjectContext";
import LoadingSpinner from "./ui/LoadingSpinner";
import ErrorDisplay from "./ui/ErrorDisplay";
import { generateMockQuestions } from "../utils/mockAuthService";

export default function CustomQuestionGenerator() {
  // Use global subject from context
  const { subjects, selectedSubject, setSelectedSubject } = useSubject();
  
  // Group topics by their group for the dropdown
  const topicsByGroup = selectedSubject.groups.reduce((acc, group) => {
    acc[group.name] = group.topics;
    return acc;
  }, {});
  
  const allTopics = selectedSubject.groups.flatMap(g => g.topics);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Find weak topics for the "Generate Weak Topic Quiz" feature
  const [userStats, setUserStats] = useState(null);
  
  React.useEffect(() => {
    // Clear questions when subject changes
    setQuestions([]);
    setSelectedTopic("");
    
    // Fetch user stats for weak topics - this would normally come from your stats API
    // For now we'll simulate it
    const fetchUserStats = async () => {
      try {
        // In a real app, this would be an API call
        // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/user-stats`);
        // setUserStats(response.data);
        
        // Simulated data
        setUserStats({
          weakTopics: allTopics.slice(0, 2)
        });
      } catch (err) {
        console.error("Failed to fetch user stats", err);
      }
    };
    
    fetchUserStats();
  }, [selectedSubject]);

  const handleGenerate = async (topic = selectedTopic) => {
    if (!topic) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      // Use mock service in development mode
      if (import.meta.env.DEV && (import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_URL === undefined)) {
        console.log('Using mock question generation service');
        const mockQuestions = await generateMockQuestions(topic, count);
        setQuestions(mockQuestions);
        return;
      }
      
      // Production question generation
      const requests = Array.from({ length: count }, () =>
        axios.post(
          `${import.meta.env.VITE_API_URL}/api/generate-question`,
          { topic, subject: selectedSubject.name }
        ).then(res => res.data)
      );
      const results = await Promise.allSettled(requests);
      const valid = results
        .filter(r => r.status === "fulfilled" && r.value)
        .map(r => r.value);
      setQuestions(valid);
      if (!valid.length) {
        setError("No questions generated. Please try again.");
      }
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const handleGenerateWeakTopicsQuiz = () => {
    if (!userStats?.weakTopics?.length) return;
    // Select the first weak topic
    const weakTopic = userStats.weakTopics[0];
    setSelectedTopic(weakTopic);
    handleGenerate(weakTopic);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Custom Question Generator
        </h2>
        
        {userStats?.weakTopics?.length > 0 && (
          <button
            className="mt-3 sm:mt-0 px-3 py-1.5 bg-accent-100 dark:bg-accent-900/30 hover:bg-accent-200 dark:hover:bg-accent-800/40 text-accent-700 dark:text-accent-300 rounded-full text-xs font-medium transition-colors duration-200 flex items-center"
            onClick={handleGenerateWeakTopicsQuiz}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Weak Topic Quiz
          </button>
        )}
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 sm:p-4 rounded-lg mb-4 sm:mb-6 border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="topic" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Select Topic:</label>
            <select
              id="topic"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-sm transition-all duration-200"
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
            >
              <option value="" className="dark:bg-gray-700 dark:text-gray-200">-- Choose Topic --</option>
              {Object.entries(topicsByGroup).map(([groupName, topics]) => (
                <optgroup key={groupName} label={`───── ${groupName} ─────`} className="dark:bg-gray-700 dark:text-gray-200 font-medium">
                  {topics.map(topic => (
                    <option key={topic} value={topic} className="dark:bg-gray-700 dark:text-gray-200">{topic}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="count" className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Questions:</label>
            <div className="flex items-center">
              <button 
                className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-l-md border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                onClick={() => setCount(Math.max(1, count - 1))}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <input
                id="count"
                type="number"
                min={1}
                max={10}
                value={count}
                onChange={e => setCount(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-y border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent text-center text-sm"
              />
              <button 
                className="px-3 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md border border-gray-300 dark:border-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                onClick={() => setCount(Math.min(10, count + 1))}
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          className="w-full sm:w-auto px-4 py-2.5 bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white rounded-lg text-sm font-medium shadow transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={() => handleGenerate()}
          disabled={!selectedTopic || loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Generate Questions</span>
            </>
          )}
        </button>
      </div>
      
      {error && <ErrorDisplay error={error} className="mb-6" />}
      
      {questions.length > 0 && (
        <div className="mt-6 space-y-6">
          {questions.map((q, i) => (
            <div key={i} className="card p-4 animate-fade-in bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <p className="font-semibold text-gray-800 dark:text-gray-100">Question {i+1}: {q.question}</p>
              <ul className="list-disc ml-6 mt-3 space-y-1 text-gray-700 dark:text-gray-300">
                {q.choices.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
              <div className="mt-3 p-2 bg-green-50 dark:bg-green-900 rounded-md">
                <p className="font-medium text-green-800 dark:text-green-200">Answer: {q.answer}</p>
                {q.explanation && (
                  <p className="mt-1 text-sm text-green-700 dark:text-green-300">{q.explanation}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

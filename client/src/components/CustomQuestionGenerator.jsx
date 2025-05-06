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
    <div className="card p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Custom Question Generator</h2>
        
        {userStats?.weakTopics?.length > 0 && (
          <button
            className="mt-2 sm:mt-0 btn-secondary flex items-center gap-2 text-sm"
            onClick={handleGenerateWeakTopicsQuiz}
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Weak Topic Quiz
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="topic" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Topic:</label>
          <select
            id="topic"
            className="input-field bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
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
          <label htmlFor="count" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Number of Questions:</label>
          <input
            id="count"
            type="number"
            min={1}
            max={10}
            value={count}
            onChange={e => setCount(parseInt(e.target.value) || 1)}
            className="input-field bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 rounded transition-colors duration-200"
          />
        </div>
      </div>
      
      <div className="flex justify-center mb-6">
        <button
          className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2"
          onClick={() => handleGenerate()}
          disabled={!selectedTopic || loading}
        >
          {loading ? (
            <>
              <LoadingSpinner size="sm" /> 
              Generating...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Generate Questions
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

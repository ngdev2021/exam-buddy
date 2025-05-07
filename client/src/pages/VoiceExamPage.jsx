import React, { useState, useEffect } from 'react';
import { useSubject } from '../contexts/SubjectContext';
import { useVoice } from '../context/VoiceContext';
import VoiceExamSimulation from '../components/voice/VoiceExamSimulation';
import axios from 'axios';

const VoiceExamPage = () => {
  const { selectedSubject } = useSubject();
  const { isSpeechRecognitionSupported } = useVoice();
  const [difficulty, setDifficulty] = useState('medium');
  const [timeLimit, setTimeLimit] = useState(120); // seconds
  const [culturalVocabularyMode, setCulturalVocabularyMode] = useState(false);
  const [culturalVocabularyType, setCulturalVocabularyType] = useState('standard');
  const [examResults, setExamResults] = useState(null);
  const [examHistory, setExamHistory] = useState([]);
  const [isExamActive, setIsExamActive] = useState(false);

  // Fetch exam history when component mounts
  useEffect(() => {
    fetchExamHistory();
  }, []);

  // Fetch the user's voice exam history
  const fetchExamHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/voice/log/stats`,
        {
          headers: {
            'Authorization': token ? `Bearer ${token}` : ''
          }
        }
      );
      
      // Filter only exam interactions from the stats
      if (response.data && response.data.recentActivity) {
        const examActivities = response.data.recentActivity.filter(
          activity => activity.type === 'exam'
        );
        setExamHistory(examActivities);
      }
    } catch (error) {
      console.error('Error fetching exam history:', error);
    }
  };

  // Handle exam completion
  const handleExamComplete = (results) => {
    setExamResults(results);
    setIsExamActive(false);
    // Refresh exam history
    fetchExamHistory();
  };

  // Start a new exam
  const startNewExam = () => {
    setExamResults(null);
    setIsExamActive(true);
  };

  // Cultural vocabulary options
  const culturalVocabularyOptions = [
    { value: 'standard', label: 'Standard' },
    { value: 'aave', label: 'AAVE (African American Vernacular English)' },
    { value: 'southern', label: 'Southern Slang' },
    { value: 'latino', label: 'Latino/Spanglish' },
    { value: 'caribbean', label: 'Caribbean/Creole' }
  ];

  // Difficulty options
  const difficultyOptions = [
    { value: 'easy', label: 'Easy (2 minutes per question)' },
    { value: 'medium', label: 'Medium (2 minutes per question)' },
    { value: 'hard', label: 'Hard (1 minute per question)' }
  ];

  return (
    <div className="container-layout pb-20">
      <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400 mb-6">Voice Exam Simulation</h1>
      
      {!isSpeechRecognitionSupported() ? (
        <div className="card p-6 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200">
          <h2 className="text-lg font-semibold mb-2">Speech Recognition Not Supported</h2>
          <p>Your browser does not support speech recognition. Please try using a modern browser like Chrome, Edge, or Safari.</p>
        </div>
      ) : (
        <>
          {!isExamActive && !examResults ? (
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Exam Settings</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      // Update time limit based on difficulty
                      if (e.target.value === 'easy') setTimeLimit(180);
                      else if (e.target.value === 'medium') setTimeLimit(120);
                      else if (e.target.value === 'hard') setTimeLimit(60);
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {difficultyOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject
                  </label>
                  <div className="p-2 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700">
                    {selectedSubject ? (
                      <span className="text-gray-800 dark:text-gray-200">{selectedSubject.name}</span>
                    ) : (
                      <span className="text-red-600 dark:text-red-400">Please select a subject from the dashboard</span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Cultural Vocabulary Settings */}
              <div className="mt-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="culturalVocabularyMode"
                      checked={culturalVocabularyMode}
                      onChange={(e) => setCulturalVocabularyMode(e.target.checked)}
                      className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="culturalVocabularyMode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Enable Cultural Vocabulary Support
                    </label>
                  </div>
                  
                  {culturalVocabularyMode && (
                    <div className="flex-1">
                      <select
                        value={culturalVocabularyType}
                        onChange={(e) => setCulturalVocabularyType(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        {culturalVocabularyOptions.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                {culturalVocabularyMode && (
                  <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    <p>Cultural vocabulary support helps improve recognition of diverse speech patterns and dialectal variations.</p>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-center">
                <button 
                  className="btn-primary"
                  onClick={startNewExam}
                  disabled={!selectedSubject}
                >
                  Start Exam
                </button>
              </div>
            </div>
          ) : null}
          
          {isExamActive && (
            <VoiceExamSimulation
              subject={selectedSubject?.name || 'General Knowledge'}
              difficulty={difficulty}
              timeLimit={timeLimit}
              culturalVocabularyMode={culturalVocabularyMode}
              onComplete={handleExamComplete}
            />
          )}
          
          {examResults && !isExamActive && (
            <div className="card p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Exam Results</h2>
              
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
                <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-2">
                  Overall Score
                </h3>
                <div className="text-3xl font-bold mb-2">
                  {examResults.overallScore}%
                </div>
              </div>
              
              <div className="flex justify-center">
                <button 
                  className="btn-primary"
                  onClick={startNewExam}
                >
                  Start New Exam
                </button>
              </div>
            </div>
          )}
          
          {/* Exam History */}
          {examHistory.length > 0 && !isExamActive && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Exam History</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Result
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                    {examHistory.map((exam, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(exam.date).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            exam.correct 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {exam.correct ? 'Passed' : 'Failed'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="mt-8 card p-6">
            <h2 className="text-lg font-semibold mb-2">How to Use Voice Exam Simulation</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300">
              <li>Select your preferred difficulty level and ensure a subject is selected.</li>
              <li>Enable Cultural Vocabulary Support if you have a specific dialect or accent.</li>
              <li>Click "Start Exam" to begin the simulation.</li>
              <li>Each question will be read aloud automatically.</li>
              <li>Click the "Speak Answer" button and provide your verbal response.</li>
              <li>Your answers will be evaluated and you'll receive detailed feedback.</li>
              <li>Results will be saved to your exam history.</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceExamPage;

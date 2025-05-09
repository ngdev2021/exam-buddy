import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { useNavigate } from "react-router-dom";
import { GRADIENTS, TEXT, BACKGROUNDS, BORDERS, BUTTONS, SHADOWS, ANIMATIONS } from "../styles/theme";

/**
 * @typedef {{ total: number, correct: number, incorrect: number }} TopicStats
 */
/** @typedef {{ [key: string]: TopicStats }} StatsMap */

// Topics now come from SubjectContext

/**
 * @param {number} pct
 */
function getBadge(pct) {
  if (pct >= 90) return { 
    label: 'Expert', 
    className: 'badge-success',
    animationClass: ''
  };
  if (pct >= 75) return { 
    label: 'Proficient', 
    className: 'badge-success',
    animationClass: ''
  };
  if (pct >= 50) return { 
    label: 'Learning', 
    className: 'badge-warning',
    animationClass: ''
  };
  return { 
    label: 'Needs Work', 
    className: 'badge-danger',
    animationClass: 'hover:animate-[shake_0.5s_ease-in-out]'
  };
}

/**
 * @param {number} pct
 * @returns {string} CSS color class for progress ring
 */
function getProgressColor(pct) {
  if (pct >= 90) return 'text-green-500 dark:text-green-400';
  if (pct >= 75) return 'text-green-400 dark:text-green-300';
  if (pct >= 50) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
}

import MobileNavBar from "../components/MobileNavBar";
import CustomQuestionGenerator from "../components/CustomQuestionGenerator";

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedSubject } = useSubject();
  // Get topics from the selected subject
  const topics = selectedSubject?.groups?.flatMap(g => g.topics) || [];
  const { stats: apiStats, isLoading, error, refetch, resetStats, isResetting } = useDashboardStats();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [resetSuccess, setResetSuccess] = useState(false);
  const [showAllTopics, setShowAllTopics] = useState(false);
  // Add local stats state that we can directly manipulate
  const [localStats, setLocalStats] = useState(apiStats);

  // Update localStats when apiStats changes
  React.useEffect(() => {
    if (apiStats) {
      setLocalStats(apiStats);
    }
  }, [apiStats]); // This dependency array ensures the effect only runs when apiStats changes

  // Show loading state
  if (isLoading && !localStats) {
    return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  }
  
  // Show error state with retry button
  if (error && !localStats) {
    return <ErrorDisplay error={error} fullPage onRetry={refetch} />;
  }

  // Defensive: always treat stats as {} if null/undefined
  const safeStats = localStats && typeof localStats === 'object' ? localStats : {};
  const allAnswered = topics.reduce((sum, t) => sum + (safeStats[t]?.total || 0), 0);
  const allCorrect = topics.reduce((sum, t) => sum + (safeStats[t]?.correct || 0), 0);

  // Find weakest topic(s)
  const weakTopics = topics
    .filter(t => (safeStats[t]?.total || 0) >= 5)
    .map(t => ({
      topic: t,
      pct: (safeStats[t]?.correct || 0) / (safeStats[t]?.total || 1) * 100
    }))
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 2);
    
  // Prepare topic cards data
  const topicCards = topics.map(topic => {
    const s = safeStats[topic] || { total: 0, correct: 0, incorrect: 0 };
    const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const badge = getBadge(pct);
    const progressColor = getProgressColor(pct);
    
    return {
      topic,
      stats: s,
      percentage: pct,
      badge,
      progressColor
    };
  });

  function handleReset() {
    if (window.confirm("Are you sure you want to reset all your progress? This cannot be undone.")) {
      try {
        // Immediately clear the local stats for instant UI feedback
        setLocalStats({});
        
        // Call the API reset function
        resetStats();
        
        // Show success message
        setResetSuccess(true);
        
        // Update the lastUpdated timestamp
        setLastUpdated(new Date());
        
        // Force a refetch to get the latest data
        setTimeout(() => {
          refetch();
        }, 1500);
        
        // Hide success message after 3 seconds
        setTimeout(() => setResetSuccess(false), 3000);
      } catch (error) {
        console.error("Error resetting stats:", error);
        alert("There was an error resetting your progress. Please try again later.");
      }
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <div>
          <h1 className={`${TEXT.heading} text-xl sm:text-2xl mb-1 flex flex-col sm:flex-row sm:items-center`}>
            <span>Dashboard</span>
            {selectedSubject && (
              <span className="text-primary-600 dark:text-primary-400 mt-1 sm:mt-0 sm:ml-2 text-lg sm:text-2xl font-medium">
                {selectedSubject.name}
              </span>
            )}
          </h1>
          <p className={`${TEXT.subtitle} text-sm sm:text-base`}>
            Track your progress and focus on areas that need improvement
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <button 
            onClick={handleReset} 
            className={`${BUTTONS.secondary} text-xs sm:text-sm py-1.5 px-3 flex items-center rounded-full ${isResetting ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={isResetting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isResetting ? 'Resetting...' : 'Reset Progress'}
          </button>
        </div>
      </div>
      
      {resetSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-3 rounded-lg mb-4 sm:mb-6 flex items-center text-sm animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Your progress has been reset successfully.</span>
        </div>
      )}
      
      {lastUpdated && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-right">
          <button 
            onClick={refetch}
            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button> · Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {/* Stats Widget */}
      <div className="mb-6 sm:mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className={`md:col-span-3 ${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.md} p-4 sm:p-6 border-l-4 border-primary-400 dark:border-primary-500 transition-all duration-300 hover:shadow-lg`}>
          {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center py-4 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No progress yet. Start practicing or testing to see your stats here!</p>
              <button 
                onClick={() => navigate('/practice')}
                className="mt-4 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors duration-200"
              >
                Start Practice
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="text-center sm:text-left">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Your Progress</h3>
                <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Questions</div>
                    <div className="font-bold text-primary-700 dark:text-primary-300 text-xl sm:text-2xl">{allAnswered}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Correct Answers</div>
                    <div className="font-bold text-green-600 dark:text-green-400 text-xl sm:text-2xl">{allCorrect}</div>
                  </div>
                </div>
              </div>
              
              {/* Progress ring */}
              <div className="relative w-28 h-28 mt-4 sm:mt-0 flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    className="stroke-current text-gray-200 dark:text-gray-700 fill-none"
                    strokeWidth="3"
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  <circle
                    className={`stroke-current ${allAnswered ? getProgressColor(Math.round(allCorrect/allAnswered*100)) : 'text-gray-400'} fill-none`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${allAnswered ? (Math.round(allCorrect/allAnswered*100) * 100) / 100 : 0}, 100`}
                    r="16"
                    cx="18"
                    cy="18"
                  />
                  <g className="transform rotate-90">
                    <text x="18" y="18" className="text-2xl font-bold" dominantBaseline="middle" textAnchor="middle" fill="currentColor">
                      {allAnswered ? Math.round(allCorrect/allAnswered*100) : 0}%
                    </text>
                    <text x="18" y="23" className="text-xs" dominantBaseline="middle" textAnchor="middle" fill="currentColor">
                      Accuracy
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className={`${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.md} ${BORDERS.light} flex flex-col justify-center items-center p-4 sm:p-6`}>
          <div className="text-center mb-3">
            <h3 className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">Quick Actions</h3>
          </div>
          <div className="grid grid-cols-1 gap-3 w-full">
            <button 
              onClick={() => navigate('/practice')}
              className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Practice Questions
            </button>
            <button 
              onClick={() => navigate('/test')}
              className="w-full bg-accent-600 hover:bg-accent-700 dark:bg-accent-700 dark:hover:bg-accent-800 text-white px-3 py-2 rounded-lg text-sm font-medium shadow transition flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Take a Test
            </button>
          </div>
        </div>
      </div>
      
      {/* Progress Cards */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <span className="border-b-2 border-primary-500 pb-1">Progress by Topic</span>
          </h3>
          
          <div className="flex items-center">
            <button 
              onClick={() => setShowAllTopics(!showAllTopics)}
              className="text-xs sm:text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center"
            >
              {showAllTopics ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  Show Less
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  Show All
                </>
              )}
            </button>
          </div>
        </div>
        
        {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 text-center flex flex-col items-center transition-all duration-300 hover:shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No data yet. Practice or take a test to see your topic breakdown.</p>
            <button 
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm transition-colors duration-200" 
              onClick={() => navigate('/practice')}
            >
              Start Practice
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicCards.slice(0, showAllTopics ? topicCards.length : 6).map(card => (
              <div 
                key={card.topic} 
                className={`group ${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.sm} hover:${SHADOWS.md} transition-all duration-300 p-4 relative overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-primary-200 dark:hover:border-primary-800`}
                onClick={() => navigate(`/practice?topic=${encodeURIComponent(card.topic)}`)}
              >
                <div className="absolute top-0 right-0 w-16 h-16 -mt-8 -mr-8 bg-gradient-to-bl from-primary-100 to-transparent dark:from-primary-900/30 dark:to-transparent rounded-full opacity-70 group-hover:opacity-100 transition-opacity"></div>
                
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1 truncate pr-2">{card.topic}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Answered: {card.stats.total} questions</p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${card.percentage >= 75 ? 'text-green-600 dark:text-green-400' : card.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                      {card.percentage}% Correct
                    </span>
                    <span className={`text-xs mt-0.5 ${card.badge.className} ${card.badge.animationClass}`}>
                      {card.badge.label}
                    </span>
                  </div>
                  
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-3">
                  <div 
                    className={`h-1.5 rounded-full ${card.percentage >= 75 ? 'bg-green-500' : card.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${card.percentage}%` }}
                  ></div>
                </div>
                
                {/* Button only shows on hover */}
                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <a 
                    href={`/practice?topic=${encodeURIComponent(card.topic)}`} 
                    className="block w-full text-center text-sm btn-primary py-1">
                    Review Topic
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Weakest Areas Card */}
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            <span className="border-b-2 border-accent-500 pb-1">Areas Needing Improvement</span>
          </h3>
        </div>
        
        <div className={`${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.md} p-4 sm:p-6 border-l-4 border-accent-400 dark:border-accent-500 transition-all duration-300 hover:shadow-lg`}>
          {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
            <div className="text-gray-600 dark:text-gray-400 text-center py-4 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>No data yet. Complete more questions to identify your weak areas.</p>
              <button 
                onClick={() => navigate('/practice')}
                className="mt-4 px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white rounded-lg text-sm transition-colors duration-200"
              >
                Start Practice
              </button>
            </div>
          ) : weakTopics.length === 0 ? (
            <div className="text-gray-600 dark:text-gray-400 text-center py-4 flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-green-500 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="font-medium text-green-600 dark:text-green-400">Great job! You're doing well across all topics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {weakTopics.map(topic => (
                <div 
                  key={topic.topic} 
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 hover:border-accent-200 dark:hover:border-accent-800 transition-all duration-300 hover:shadow-sm"
                  onClick={() => navigate(`/practice?topic=${encodeURIComponent(topic.topic)}`)}
                >
                  <div className="mb-2 sm:mb-0">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200 truncate max-w-[200px]">{topic.topic}</h4>
                    <div className="flex items-center mt-1">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                        <div 
                          className="h-1.5 rounded-full bg-accent-500"
                          style={{ width: `${topic.pct}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-accent-600 dark:text-accent-400">{Math.round(topic.pct)}% accuracy</p>
                    </div>
                  </div>
                  <button 
                    className="text-xs bg-accent-100 dark:bg-accent-900/30 hover:bg-accent-200 dark:hover:bg-accent-800/40 text-accent-700 dark:text-accent-300 px-3 py-1.5 rounded-full transition-colors duration-200 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    Practice Now
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Custom Question Generator */}
      <div className="mb-20">
        <CustomQuestionGenerator />
      </div>
      
      {/* Mobile NavBar */}
      <MobileNavBar />
    </div>
  );
}

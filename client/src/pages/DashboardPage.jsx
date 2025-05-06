import React from "react";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useDashboardStats } from "../hooks/useDashboardStats";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorDisplay from "../components/ui/ErrorDisplay";

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
  const { user } = useAuth();
  const { selectedSubject } = useSubject();
  // Get topics from the selected subject
  const topics = selectedSubject.groups.flatMap(g => g.topics);
  const { stats, isLoading, error, refetch, resetStats, isResetting } = useDashboardStats();
  const [lastUpdated] = React.useState(new Date());
  
  // Show loading state
  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  }
  
  // Show error state with retry button
  if (error) {
    return <ErrorDisplay error={error} fullPage onRetry={refetch} />;
  }

  // Defensive: always treat stats as {} if null/undefined
  const safeStats = stats && typeof stats === 'object' ? stats : {};
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
        resetStats();
      } catch (error) {
        console.error("Error resetting stats:", error);
        alert("There was an error resetting your progress. Please try again later.");
      }
    }
  }

  return (
    <div className="pb-20 container-layout">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center mb-6 gap-2 sm:gap-0">
        <h2 className="text-2xl font-bold text-primary-600 dark:text-primary-400 tracking-tight">Dashboard</h2>
        <button 
          className="sm:ml-auto w-full sm:w-auto btn-primary" 
          onClick={refetch}
        >
          <span className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </span>
        </button>
      </div>
      
      {lastUpdated && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center sm:text-left">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
      
      {/* Stats Widget */}
      <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3 card bg-gradient-to-br from-primary-50 to-white dark:from-primary-900 dark:to-gray-800 border-l-4 border-primary-400 dark:border-primary-500 p-6">
          {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
            <div className="text-gray-500 dark:text-gray-400 text-center">No progress yet. Start practicing or testing to see your stats here!</div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <div className="font-bold text-primary-700 dark:text-primary-300 text-xl mb-1">Total Questions: <span className="text-primary-800 dark:text-primary-200">{allAnswered}</span></div>
                <div className="text-green-600 dark:text-green-400 text-lg">Correct: {allCorrect} ({allAnswered ? Math.round(allCorrect/allAnswered*100) : 0}%)</div>
              </div>
              
              {/* Progress ring */}
              <div className="relative w-24 h-24 mt-4 sm:mt-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                  <path
                    className="stroke-current text-gray-200 dark:text-gray-700"
                    fill="none"
                    strokeWidth="3"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={`stroke-current ${allAnswered ? getProgressColor(Math.round(allCorrect/allAnswered*100)) : 'text-gray-400'}`}
                    fill="none"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${allAnswered ? Math.round(allCorrect/allAnswered*100) : 0}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <text x="18" y="20.35" className="text-lg font-bold" textAnchor="middle" fill="currentColor">
                    {allAnswered ? Math.round(allCorrect/allAnswered*100) : 0}%
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>
        
        <div className="card flex flex-col justify-center items-center p-6">
          <button 
            className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white px-4 py-3 rounded-md font-medium shadow transition disabled:opacity-50 flex items-center justify-center gap-2" 
            onClick={handleReset}
            disabled={isResetting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            {isResetting ? 'Resetting...' : 'Reset Progress'}
          </button>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">This will delete all your progress data</p>
        </div>
      </div>
      
      {/* Progress Cards */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary-600 dark:text-primary-400">Progress by Topic</h3>
        </div>
        
        {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
          <div className="card p-6 text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <p>No data yet. Practice or take a test to see your topic breakdown.</p>
            <button className="btn-primary mt-4">Start Practice</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topicCards.map(card => (
              <div key={card.topic} className="group bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all p-4 relative overflow-hidden border border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-1">{card.topic}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Answered: {card.stats.total}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-sm font-medium ${card.percentage >= 75 ? 'text-green-600 dark:text-green-400' : card.percentage >= 50 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                    {card.percentage}% Correct
                  </span>
                  <span className={`${card.badge.className} ${card.badge.animationClass}`}>
                    {card.badge.label}
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
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
      <div className="card bg-gradient-to-br from-accent-50 to-white dark:from-gray-900 dark:to-gray-800 border-l-4 border-accent-400 dark:border-accent-500 p-6 mb-8 transition-colors duration-200">
        <h3 className="text-lg font-bold mb-3 text-accent-700 dark:text-accent-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          Your Weakest Areas
        </h3>
        
        {allAnswered === 0 ? (
          <div className="text-gray-500 dark:text-gray-400">No data yet. Weak areas will be shown here after you answer some questions.</div>
        ) : weakTopics.length === 0 ? (
          <div className="text-green-600 dark:text-green-400 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No weak areas detected. Keep up the great work!
          </div>
        ) : (
          <div className="space-y-4">
            {weakTopics.map(w => (
              <div key={w.topic} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{w.topic}</h4>
                  <div className="flex items-center mt-1">
                    <span className={`text-sm ${w.pct < 50 ? 'text-red-600 dark:text-red-400 animate-pulse-once' : 'text-yellow-600 dark:text-yellow-400'}`}>
                      {Math.round(w.pct)}% correct
                    </span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      Needs improvement
                    </span>
                  </div>
                </div>
                <button className="mt-2 sm:mt-0 btn-primary text-sm py-1 px-3">
                  Practice Now
                </button>
              </div>
            ))}
          </div>
        )}
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

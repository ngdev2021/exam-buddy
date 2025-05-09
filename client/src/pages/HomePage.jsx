import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useUserStats } from "../hooks/useUserStats";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorDisplay from "../components/ui/ErrorDisplay";
import { GRADIENTS, TEXT, BACKGROUNDS, BORDERS, BUTTONS, SHADOWS, ANIMATIONS } from "../styles/theme";

export default function HomePage() {
  const { user } = useAuth();
  const { selectedSubject } = useSubject();
  const { stats, isLoading, error, refetch } = useUserStats();
  
  // Authentication is now handled by ProtectedRoute

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner fullPage text="Loading your dashboard..." />;
  }
  
  // Show error state with retry button
  if (error) {
    return <ErrorDisplay error={error} fullPage onRetry={refetch} />;
  }
  
  // Aggregate stats
  let total = 0, correct = 0, incorrect = 0;
  if (stats) {
    Object.values(stats).forEach(s => {
      total += s.total || 0;
      correct += s.correct || 0;
      incorrect += s.incorrect || 0;
    });
  }
  const mastery = total ? Math.round((correct / total) * 100) : 0;
  // Placeholder for avg session (future: store session history)
  const avgSession = total ? Math.max(10, Math.round(total / 5)) : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header with greeting and stats overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className={`${TEXT.heading} text-2xl sm:text-3xl mb-1 flex flex-col sm:flex-row sm:items-center`}>
            <span>Welcome to ExamBuddy</span>
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 sm:ml-2 mt-1 sm:mt-0">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </h1>
          <p className={`${TEXT.body} text-gray-600 dark:text-gray-300`}>Your all-in-one {selectedSubject.name} prep workspace</p>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <div className="flex flex-col items-center bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-2">
            <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">{mastery}%</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Mastery</span>
          </div>
          <div className="flex flex-col items-center bg-accent-50 dark:bg-accent-900/20 rounded-lg px-4 py-2">
            <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">{total}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">Questions</span>
          </div>
        </div>
      </div>
      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link to="/practice" className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg hover:border-primary-200 dark:hover:border-primary-800 group">
          <div className="flex items-start">
            <div className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full p-3 mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-gray-200 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">Practice Mode</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Sharpen your skills by topic with targeted practice sessions</p>
              <div className="mt-4 flex items-center text-primary-600 dark:text-primary-400 font-medium text-sm">
                Start Practice
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/test" className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg hover:border-accent-200 dark:hover:border-accent-800 group">
          <div className="flex items-start">
            <div className="bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-400 rounded-full p-3 mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a4 4 0 11-8 0 4 4 0 018 0zm0 0a4 4 0 018 0 4 4 0 01-8 0z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-gray-200 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">Test Mode</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Simulate a real exam with timed tests across multiple topics</p>
              <div className="mt-4 flex items-center text-accent-600 dark:text-accent-400 font-medium text-sm">
                Start Test
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </Link>
        
        <Link to="/lessons" className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-all duration-200 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-800 group">
          <div className="flex items-start">
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full p-3 mr-4">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1 text-gray-800 dark:text-gray-200 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Lessons</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Study comprehensive lessons on key topics and concepts</p>
              <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-medium text-sm">
                View Lessons
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </div>
            </div>
          </div>
        </Link>
      </div>
      {/* Progress Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Your Progress</h2>
          <Link to="/dashboard" className="text-primary-600 dark:text-primary-400 text-sm font-medium hover:underline flex items-center">
            View Details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg p-5 border border-primary-100 dark:border-primary-800/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Mastery Score</p>
                <h3 className="text-3xl font-bold text-primary-700 dark:text-primary-400 mt-1">{mastery}%</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Keep practicing to boost your score!</p>
          </div>
          
          <div className="bg-gradient-to-br from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 rounded-lg p-5 border border-accent-100 dark:border-accent-800/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Questions Answered</p>
                <h3 className="text-3xl font-bold text-accent-700 dark:text-accent-400 mt-1">{total}</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Great consistency!</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg p-5 border border-purple-100 dark:border-purple-800/30">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Avg. Session</p>
                <h3 className="text-3xl font-bold text-purple-700 dark:text-purple-400 mt-1">{avgSession} min</h3>
              </div>
              <div className="bg-white dark:bg-gray-800 p-2 rounded-full shadow-sm">
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Aim for 20+ min per session!</p>
          </div>
        </div>
      </div>
      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Recent Activity</h2>
          
          {total === 0 ? (
            <div className="text-center py-8">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="mt-4 text-gray-600 dark:text-gray-400">No activity yet. Start practicing to see your progress!</p>
              <Link to="/practice" className="mt-4 inline-block px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors">
                Start Practice
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-primary-100 dark:bg-primary-900/30 p-2 rounded-full">
                    <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">Completed {total} questions</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Across all topics</p>
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Recently</span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <div className="flex items-center">
                  <div className="bg-accent-100 dark:bg-accent-900/30 p-2 rounded-full">
                    <svg className="w-5 h-5 text-accent-600 dark:text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-gray-800 dark:text-gray-200 font-medium">Achieved {mastery}% mastery</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Keep going!</p>
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Overall</span>
              </div>
            </div>
          )}
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/practice" className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Continue Practice
            </Link>
            <Link to="/test" className="block w-full bg-gradient-to-r from-accent-500 to-primary-600 hover:from-accent-600 hover:to-primary-700 text-white text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Start New Test
            </Link>
            <Link to="/lessons" className="block w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 text-center py-3 px-4 rounded-lg font-medium transition-colors">
              Browse Lessons
            </Link>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm mt-12 mb-6">
        ExamBuddy &copy; {new Date().getFullYear()} &mdash; Your study, your pace.
      </div>
    </div>
  );
}

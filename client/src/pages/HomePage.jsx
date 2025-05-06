import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSubject } from "../contexts/SubjectContext";
import { useUserStats } from "../hooks/useUserStats";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorDisplay from "../components/ui/ErrorDisplay";

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
    <div className="min-h-[90vh] flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-white via-purple-50 dark:from-gray-900 dark:to-gray-800 dark:via-gray-850 px-4 py-8 transition-colors duration-200">
      {/* App-style Greeting */}
      <div className="w-full max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-800 dark:text-blue-400 mb-1 transition-colors duration-200">Welcome to ExamBuddy</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-200">Your all-in-one {selectedSubject.name} prep workspace</p>
      </div>
      {/* Quick Navigation Grid */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Link to="/practice" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 rounded-xl shadow hover:shadow-lg transition p-6 group focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors duration-200">
          <span className="bg-blue-100 text-blue-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 dark:text-gray-200 transition-colors duration-200">Practice</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">Sharpen your skills by topic</span>
        </Link>
        <Link to="/test" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-green-100 dark:border-green-900 rounded-xl shadow hover:shadow-lg transition p-6 group focus:outline-none focus:ring-2 focus:ring-green-400 transition-colors duration-200">
          <span className="bg-green-100 text-green-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a4 4 0 11-8 0 4 4 0 018 0zm0 0a4 4 0 018 0 4 4 0 01-8 0z" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-green-700 dark:group-hover:text-green-400 dark:text-gray-200 transition-colors duration-200">Test Mode</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">Simulate a real exam</span>
        </Link>
        <Link to="/dashboard" className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow hover:shadow-lg transition p-6 group focus:outline-none focus:ring-2 focus:ring-blue-300 transition-colors duration-200">
          <span className="bg-gray-200 text-blue-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 dark:text-gray-200 transition-colors duration-200">Dashboard</span>
          <span className="text-gray-500 dark:text-gray-400 text-sm transition-colors duration-200">View your progress</span>
        </Link>
      </div>
      {/* Progress Widget */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 mb-8">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-blue-100 dark:border-blue-900 p-6 flex flex-col items-center transition-colors duration-200">
          <span className="text-2xl font-bold text-blue-700 dark:text-blue-400 mb-1 transition-colors duration-200">{mastery}%</span>
          <span className="text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-200">Mastery Score</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs transition-colors duration-200">Keep practicing to boost your score!</span>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-green-100 dark:border-green-900 p-6 flex flex-col items-center transition-colors duration-200">
          <span className="text-2xl font-bold text-green-700 dark:text-green-400 mb-1 transition-colors duration-200">{total}</span>
          <span className="text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-200">Questions Answered</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs transition-colors duration-200">Great consistency!</span>
        </div>
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow border border-purple-100 dark:border-purple-900 p-6 flex flex-col items-center transition-colors duration-200">
          <span className="text-2xl font-bold text-purple-700 dark:text-purple-400 mb-1 transition-colors duration-200">Last session: {avgSession} min</span>
          <span className="text-gray-600 dark:text-gray-300 mb-1 transition-colors duration-200">Avg. Session</span>
          <span className="text-gray-400 dark:text-gray-500 text-xs transition-colors duration-200">Aim for 20+ min!</span>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 mb-8">
        <Link to="/practice" className="flex-1 bg-blue-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-400">Continue Practice</Link>
        <Link to="/test" className="flex-1 bg-green-600 text-white text-center py-4 rounded-xl font-bold text-lg shadow hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-400">Start New Test</Link>
      </div>
      {/* Minimal footer/info */}
      <div className="text-xs text-gray-400 dark:text-gray-500 mt-8 transition-colors duration-200">ExamBuddy &copy; {new Date().getFullYear()} &mdash; Your study, your pace.</div>
    </div>
  );
}

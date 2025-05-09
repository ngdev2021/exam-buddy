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
    <div className={`flex flex-col items-center justify-center ${GRADIENTS.subtlePrimary} px-4 py-8 transition-colors duration-200`}>
      {/* App-style Greeting */}
      <div className="w-full max-w-3xl mx-auto">
        <h1 className={`${TEXT.title} text-3xl sm:text-4xl text-primary-700 dark:text-primary-400 mb-1`}>Welcome to ExamBuddy</h1>
        <p className={`${TEXT.body} mb-6`}>Your all-in-one {selectedSubject.name} prep workspace</p>
      </div>
      {/* Quick Navigation Grid */}
      <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Link to="/practice" className={`flex flex-col items-center justify-center ${BACKGROUNDS.card} ${BORDERS.light} ${BORDERS.rounded} ${SHADOWS.card} hover:${SHADOWS.cardHover} ${ANIMATIONS.hover} p-6 group focus:outline-none focus:ring-2 focus:ring-primary-400`}>
          <span className="bg-primary-100 text-primary-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400 dark:text-gray-200">Practice</span>
          <span className={`${TEXT.small} text-sm`}>Sharpen your skills by topic</span>
        </Link>
        <Link to="/test" className={`flex flex-col items-center justify-center ${BACKGROUNDS.card} ${BORDERS.light} ${BORDERS.rounded} ${SHADOWS.card} hover:${SHADOWS.cardHover} ${ANIMATIONS.hover} p-6 group focus:outline-none focus:ring-2 focus:ring-accent-400`}>
          <span className="bg-accent-100 text-accent-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a4 4 0 018 0v2" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v4m0 0a4 4 0 11-8 0 4 4 0 018 0zm0 0a4 4 0 018 0 4 4 0 01-8 0z" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-accent-700 dark:group-hover:text-accent-400 dark:text-gray-200">Test Mode</span>
          <span className={`${TEXT.small} text-sm`}>Simulate a real exam</span>
        </Link>
        <Link to="/dashboard" className={`flex flex-col items-center justify-center ${BACKGROUNDS.card} ${BORDERS.light} ${BORDERS.rounded} ${SHADOWS.card} hover:${SHADOWS.cardHover} ${ANIMATIONS.hover} p-6 group focus:outline-none focus:ring-2 focus:ring-primary-400`}>
          <span className="bg-purple-100 text-purple-700 rounded-full p-3 mb-2"><svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" /><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6" /></svg></span>
          <span className="font-bold text-lg mb-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 dark:text-gray-200">Dashboard</span>
          <span className={`${TEXT.small} text-sm`}>View your progress</span>
        </Link>
      </div>
      {/* Progress Widget */}
      <div className="w-full max-w-3xl flex flex-col md:flex-row gap-6 mb-8">
        <div className={`flex-1 ${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.card} ${BORDERS.light} p-6 flex flex-col items-center ${ANIMATIONS.hover}`}>
          <span className="text-2xl font-bold text-primary-700 dark:text-primary-400 mb-1">{mastery}%</span>
          <span className={`${TEXT.body} mb-1`}>Mastery Score</span>
          <span className={`${TEXT.small} text-xs`}>Keep practicing to boost your score!</span>
        </div>
        <div className={`flex-1 ${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.card} ${BORDERS.light} p-6 flex flex-col items-center ${ANIMATIONS.hover}`}>
          <span className="text-2xl font-bold text-accent-700 dark:text-accent-400 mb-1">{total}</span>
          <span className={`${TEXT.body} mb-1`}>Questions Answered</span>
          <span className={`${TEXT.small} text-xs`}>Great consistency!</span>
        </div>
        <div className={`flex-1 ${BACKGROUNDS.card} ${BORDERS.rounded} ${SHADOWS.card} ${BORDERS.light} p-6 flex flex-col items-center ${ANIMATIONS.hover}`}>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">Last session: {avgSession} min</span>
          <span className={`${TEXT.body} mb-1`}>Avg. Session</span>
          <span className={`${TEXT.small} text-xs`}>Aim for 20+ min!</span>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="w-full max-w-3xl flex flex-col sm:flex-row gap-4 mb-8">
        <Link to="/practice" className={`flex-1 ${BUTTONS.primary} ${SHADOWS.md} ${ANIMATIONS.hover} text-center py-4 text-lg font-bold`}>Continue Practice</Link>
        <Link to="/test" className={`flex-1 ${GRADIENTS.primaryToAccent} text-white text-center py-4 rounded-lg font-bold text-lg ${SHADOWS.md} ${ANIMATIONS.hover}`}>Start New Test</Link>
      </div>
      {/* Minimal footer/info */}
      <div className={`${TEXT.small} mt-8`}>ExamBuddy &copy; {new Date().getFullYear()} &mdash; Your study, your pace.</div>
    </div>
  );
}

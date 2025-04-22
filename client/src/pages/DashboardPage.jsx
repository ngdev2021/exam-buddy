import React, { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const topics = [
  "Risk Management",
  "Property Insurance",
  "Casualty Insurance",
  "Texas Insurance Law",
  "Policy Provisions",
  "Underwriting",
  "Claims Handling",
  "Ethics & Regulations"
];

function getBadge(pct) {
  if (pct >= 90) return <span className="ml-2 px-2 py-1 rounded bg-green-200 text-green-800 text-xs font-bold">Expert</span>;
  if (pct >= 75) return <span className="ml-2 px-2 py-1 rounded bg-yellow-200 text-yellow-800 text-xs font-bold">Proficient</span>;
  if (pct >= 50) return <span className="ml-2 px-2 py-1 rounded bg-orange-200 text-orange-800 text-xs font-bold">Learning</span>;
  return <span className="ml-2 px-2 py-1 rounded bg-red-200 text-red-800 text-xs font-bold">Needs Work</span>;
}

import MobileNavBar from "../components/MobileNavBar";

export default function DashboardPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [lastUpdated, setLastUpdated] = React.useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
        headers: { 
          Authorization: `Bearer ${token}` 
        }
      });
      if (!res.ok) throw new Error("Failed to fetch stats");
      const data = await res.json();
      setStats(data && typeof data === 'object' ? data : {});
      setLastUpdated(new Date());
      console.log('Dashboard stats:', data);
    } catch (err) {
      setError("Could not load stats from server.");
      setStats(null);
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }
    fetchStats();
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Dashboard</h2>
          <p className="mb-4">Please <a href="/login" className="text-blue-600 underline">log in</a> or <a href="/register" className="text-green-600 underline">register</a> to view your dashboard.</p>
        </div>
      </div>
    );
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

  function handleReset() {
    if (window.confirm("Reset all your ExamBuddy progress?")) {
      localStorage.removeItem("examBuddyStats");
      setStats({});
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-blue-500 animate-spin mr-3">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
        </div>
        <span className="text-lg font-semibold">Loading your dashboard...</span>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-600">
        <div className="mb-2">{error}</div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded font-bold" onClick={fetchStats}>Retry</button>
      </div>
    );
  }
  if (stats === null) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">No stats available.</div>
    );
  }

  return (
    <div className="pb-20 px-2 sm:px-0 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center mb-4 gap-2 sm:gap-0">
        <h2 className="text-2xl font-bold text-blue-800 tracking-tight">Dashboard</h2>
        <button className="sm:ml-auto w-full sm:w-auto bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow hover:bg-blue-600 transition" onClick={fetchStats}>Refresh</button>
      </div>
      {lastUpdated && (
        <div className="text-xs text-gray-500 mb-2 text-center sm:text-left">Last updated: {lastUpdated.toLocaleTimeString()}</div>
      )}
      {/* Stats Widget */}
      <div className="mb-4 flex flex-col sm:flex-row flex-wrap gap-4 items-center">
        <div className="flex-1 w-full bg-gradient-to-br from-blue-100 via-white to-blue-50 border-l-4 border-blue-400 p-6 rounded-2xl shadow-xl mb-2 sm:mb-0">
          {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
            <div className="text-gray-500 text-center">No progress yet. Start practicing or testing to see your stats here!</div>
          ) : (
            <>
              <div className="font-bold text-blue-800 text-xl mb-1">Total Questions Answered: <span className="text-blue-900">{allAnswered}</span></div>
              <div className="text-green-700 text-lg">Correct: {allCorrect} ({allAnswered ? Math.round(allCorrect/allAnswered*100) : 0}%)</div>
            </>
          )}
        </div>
        <button className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded-full font-bold shadow hover:bg-red-700 transition" onClick={handleReset}>Reset Progress</button>
      </div>
      {/* Progress Table */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2 text-blue-700">Progress by Topic</h3>
        {typeof allAnswered !== 'number' || isNaN(allAnswered) || allAnswered === 0 ? (
          <div className="text-gray-500">No data yet. Practice or take a test to see your topic breakdown.</div>
        ) : (
          <div className="overflow-x-auto rounded-xl shadow border border-gray-200 bg-white">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-3 py-2">Topic</th>
                  <th className="px-3 py-2">Answered</th>
                  <th className="px-3 py-2">Correct (%)</th>
                  <th className="px-3 py-2">Incorrect</th>
                  <th className="px-3 py-2">Mastery</th>
                </tr>
              </thead>
              <tbody>
                {topics.map(topic => {
                  const s = safeStats[topic] || { total: 0, correct: 0, incorrect: 0 };
                  const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
                  return (
                    <tr key={topic} className="border-b">
                      <td className="px-3 py-2 font-semibold">{topic}</td>
                      <td className="px-3 py-2">{s.total}</td>
                      <td className="px-3 py-2">{pct}%</td>
                      <td className="px-3 py-2">{s.incorrect}</td>
                      <td className="px-3 py-2">{getBadge(pct)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Weakest Areas Card */}
      <div className="bg-gradient-to-br from-yellow-50 via-white to-yellow-100 border-l-4 border-yellow-400 p-6 rounded-2xl shadow-xl">
        <h3 className="text-lg font-bold mb-1 text-yellow-800">📈 Your Weakest Areas</h3>
        {allAnswered === 0 ? (
          <div className="text-gray-500">No data yet. Weak areas will be shown here after you answer some questions.</div>
        ) : weakTopics.length === 0 ? (
          <div className="text-green-700">No weak areas detected. Keep up the great work!</div>
        ) : (
          <ul className="list-disc ml-6">
            {weakTopics.map(w => (
              <li key={w.topic}>
                <span className="font-semibold text-yellow-900">{w.topic}</span>: <span className="text-yellow-700">{Math.round(w.pct)}% correct</span>
                {w.pct < 75 && <span className="ml-2 text-sm text-yellow-800">Review this topic for mastery!</span>}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Mobile NavBar */}
      <MobileNavBar />
    </div>
  );
}

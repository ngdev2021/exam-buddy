import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import ScoreTracker from "../components/ScoreTracker";
import axios from "axios";

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

const CACHE_SIZE = 5;

const topicToChapter = {
  "Risk Management": "Chapter 1 – Risk Management Principles",
  "Property Insurance": "Chapter 3 – Property Insurance Basics",
  "Casualty Insurance": "Chapter 5 – Casualty Insurance Essentials",
  "Texas Insurance Law": "Chapter 2 – Texas Insurance Law",
  "Policy Provisions": "Chapter 4 – Policy Provisions",
  "Underwriting": "Chapter 6 – Underwriting & Applications",
  "Claims Handling": "Chapter 7 – Claims Handling",
  "Ethics & Regulations": "Chapter 8 – Ethics & Regulations"
};

const PRACTICE_LENGTHS = [5, 10, 25];

export default function PracticePage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState("");
  const [sessionStarted, setSessionStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mistakesByTopic, setMistakesByTopic] = useState({});
  const [practiceLength, setPracticeLength] = useState(5);
  const [showSummary, setShowSummary] = useState(false);
  const [timerEnabled, setTimerEnabled] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Practice Mode</h2>
          <p className="mb-4">Please <a href="/login" className="text-blue-600 underline">log in</a> or <a href="/register" className="text-green-600 underline">register</a> to practice.</p>
        </div>
      </div>
    );
  }

  async function handleStart() {
    setSessionStarted(true);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
    setQuestions([]);
    setCurrentIndex(0);
    setShowSummary(false);
    if (timerEnabled) {
      setTimer(practiceLength * 60);
      setTimeLeft(practiceLength * 60);
    } else {
      setTimer(0);
      setTimeLeft(0);
    }
    setLoading(true);
    setError("");
    try {
      const requests = Array.from({ length: practiceLength }, () =>
        axios.post(`${import.meta.env.VITE_API_URL}/api/generate-question`, { topic: selectedTopic }).then(r => ({ ...r.data, topic: selectedTopic }))
      );
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
    setScore(s => ({ ...s, total: s.total + 1 }));
    setCurrentIndex(i => {
      if (i + 1 >= questions.length) {
        setShowSummary(true);
        setSessionStarted(false);
        return i;
      }
      return i + 1;
    });
  }

  function handleScoreUpdate(isCorrect) {
    setScore(s => ({ ...s, correct: s.correct + (isCorrect ? 1 : 0) }));
    if (questions[currentIndex] && questions[currentIndex].topic) {
      const topic = questions[currentIndex].topic;
      setMistakesByTopic(prev => ({
        ...prev,
        ...(isCorrect ? {} : { [topic]: (prev[topic] || 0) + 1 })
      }));
      fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        method: 'POST',
        body: JSON.stringify({ topic, correct: isCorrect })
      });
    }
  }

  useEffect(() => {
    if (!sessionStarted || !timerEnabled || showSummary) return;
    if (timeLeft <= 0 && timerEnabled) {
      setShowSummary(true);
      setSessionStarted(false);
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft(t => t > 0 ? t - 1 : 0);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft, sessionStarted, timerEnabled, showSummary]);

  useEffect(() => {
    setSessionStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
  }, [selectedTopic]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Practice Mode</h2>
      {!sessionStarted && !showSummary ? (
        <div className="mb-6 space-y-4">
          <div>
            <label className="block mb-2">Select a topic to begin:</label>
            <select
              className="border p-2 rounded mr-2"
              value={selectedTopic}
              onChange={e => setSelectedTopic(e.target.value)}
            >
              <option value="">-- Choose Topic --</option>
              {topics.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2">Session length:</label>
            <div className="flex gap-2">
              {PRACTICE_LENGTHS.map(len => (
                <button
                  key={len}
                  className={`px-3 py-1 rounded border-2 font-bold ${practiceLength===len ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-700 border-blue-400"}`}
                  onClick={() => setPracticeLength(len)}
                >
                  {len} Questions
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={timerEnabled} onChange={e => setTimerEnabled(e.target.checked)} />
              Timed session (1 min/question)
            </label>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            disabled={!selectedTopic || loading}
            onClick={handleStart}
          >
            {loading ? "Loading..." : "Start Practice"}
          </button>
        </div>
      ) : showSummary ? (
        <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Practice Complete!</h2>
          <div className="mb-2 text-lg">You answered <span className="font-bold">{score.correct}</span> out of <span className="font-bold">{questions.length}</span> questions correctly.</div>
          <div className="mb-6 text-xl font-semibold">Score: <span className="text-blue-700">{questions.length ? Math.round((score.correct / questions.length) * 100) : 0}%</span></div>
          <div className="mb-6">
            <h3 className="font-bold mb-2">Review Questions</h3>
            <ul className="text-left space-y-4">
              {questions.map((q, i) => (
                <li key={i} className="border-b pb-2">
                  <div className="font-semibold">Q{i+1}: {q.question}</div>
                  <div className="ml-2">Correct Answer: <span className="font-bold text-green-700">{q.answer}</span></div>
                  {q.explanation && <div className="ml-2 text-sm text-gray-600">Explanation: {q.explanation}</div>}
                </li>
              ))}
            </ul>
          </div>
          <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-bold" onClick={() => { setSessionStarted(false); setShowSummary(false); }}>Start New Session</button>
        </div>
      ) : (
        <>
          {timerEnabled && (
            <div className="mb-2 text-right text-blue-700 font-bold">
              Time Left: {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2, '0')}
            </div>
          )}
          <ScoreTracker correct={score.correct} total={questions.length} />
          {error && <div className="text-red-600 mb-4">{error}</div>}
          {questions[currentIndex] ? (
            <QuestionCard
              question={questions[currentIndex]}
              onScore={handleScoreUpdate}
              onNext={handleNextQuestion}
            />
          ) : (
            <div className="text-blue-600 text-lg p-6">Loading questions...</div>
          )}
        </>
      )}
      {/* Recommendations card */}
      {sessionStarted && score.total > 0 && !showSummary && (
        <div className="mt-10 max-w-xl mx-auto bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-xl shadow">
          <h3 className="text-lg font-bold mb-2 text-yellow-800 flex items-center gap-2">📚 Recommended Study Areas</h3>
          {Object.keys(mistakesByTopic).length === 0 ? (
            <div className="text-green-700">Great job! No weak areas detected this session.</div>
          ) : (
            <ul className="list-disc ml-6 space-y-1">
              {Object.entries(mistakesByTopic)
                .sort((a, b) => b[1] - a[1])
                .map(([topic, count]) => (
                  <li key={topic}>
                    <span className="font-semibold text-yellow-900">{topic}</span>:
                    <span className="ml-2 text-yellow-700">Missed {count} time{count > 1 ? 's' : ''}</span>
                    <div className="text-sm text-gray-700 ml-2">Suggested: {topicToChapter[topic]}</div>
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

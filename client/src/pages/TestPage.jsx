import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import QuestionCard from "../components/QuestionCard";
import ScoreTracker from "../components/ScoreTracker";
import axios from "axios";

const PCTopics = [
  "Risk Management",
  "Property Insurance",
  "Casualty Insurance",
  "Texas Insurance Law",
  "Policy Provisions",
  "Underwriting",
  "Claims Handling",
  "Ethics & Regulations"
];

const TEST_LENGTHS = [10, 25, 50, 75, 100, 125, 150];
const CACHE_SIZE = 5;

export default function TestPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [selectedTopics, setSelectedTopics] = useState(PCTopics);
  const [testLength, setTestLength] = useState(25);
  const [started, setStarted] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mistakesByTopic, setMistakesByTopic] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
    }
  }, [user, token, navigate]);

  if (!user) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-xl font-bold mb-2">Test Mode</h2>
          <p className="mb-4">Please <a href="/login" className="text-blue-600 underline">log in</a> or <a href="/register" className="text-green-600 underline">register</a> to take a test.</p>
        </div>
      </div>
    );
  }

  async function handleStart() {
    setStarted(true);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
    setQuestions([]);
    setCurrentIndex(0);
    setShowSummary(false);
    setLoading(true);
    setError("");
    try {
      const requests = Array.from({ length: testLength }, () => {
        const topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
        return axios.post(`${import.meta.env.VITE_API_URL}/api/generate-question`, { topic }).then(res => ({ ...res.data, topic }));
      });
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
    setCurrentIndex(i => {
      if (i + 1 >= questions.length) {
        setShowSummary(true);
        return i;
      }
      return i + 1;
    });
  }

  function handleScoreUpdate(isCorrect) {
    setScore(s => ({
      correct: s.correct + (isCorrect ? 1 : 0),
      total: s.total + 1
    }));
    if (questions[currentIndex] && questions[currentIndex].topic) {
      setMistakesByTopic(prev => {
        const newVal = { ...prev };
        if (!isCorrect) newVal[questions[currentIndex].topic] = (newVal[questions[currentIndex].topic] || 0) + 1;
        return newVal;
      });
      const topic = questions[currentIndex].topic;
      fetch(`${import.meta.env.VITE_API_URL}/api/user-stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ topic, correct: isCorrect })
      });
      // Auto-show summary for last question
      if (currentIndex === questions.length - 1) {
        setShowSummary(true);
      }
    }
  }

  useEffect(() => {
    setStarted(false);
    setQuestions([]);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setMistakesByTopic({});
  }, [selectedTopics, testLength]);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Test Mode</h2>
      {!started ? (
        <div className="mb-6">
          <div className="mb-4">
            <label className="block mb-2">Choose your test length:</label>
            <div className="flex gap-2 flex-wrap">
              {TEST_LENGTHS.map(len => (
                <button
                  key={len}
                  className={`px-4 py-2 rounded font-bold border-2 border-blue-500 ${testLength===len ? "bg-blue-600 text-white" : "bg-white text-blue-700"}`}
                  onClick={() => setTestLength(len)}
                >
                  {len} Questions
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block mb-2">Select categories:</label>
            <div className="flex gap-2 flex-wrap">
              {PCTopics.map(topic => (
                <label key={topic} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={selectedTopics.includes(topic)}
                    onChange={e => {
                      if (e.target.checked) setSelectedTopics(t => [...t, topic]);
                      else setSelectedTopics(t => t.filter(x => x !== topic));
                    }}
                  />
                  <span>{topic}</span>
                </label>
              ))}
            </div>
          </div>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded font-bold mt-4 disabled:opacity-50"
            disabled={selectedTopics.length===0 || loading}
            onClick={handleStart}
          >
            {loading ? "Loading..." : "Start Test"}
          </button>
        </div>
      ) : (
        showSummary ? (
          <div className="max-w-xl mx-auto mt-12 bg-white p-8 rounded-xl shadow text-center">
            <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
            <div className="mb-2 text-lg">You answered <span className="font-bold">{score.correct}</span> out of <span className="font-bold">{questions.length}</span> questions correctly.</div>
            <div className="mb-6 text-xl font-semibold">Score: <span className="text-blue-700">{questions.length ? Math.round((score.correct / questions.length) * 100) : 0}%</span></div>
            <a href="/dashboard" className="inline-block bg-blue-600 text-white px-6 py-3 rounded font-bold text-lg hover:bg-blue-700 transition">Go to Dashboard</a>
            <button className="mt-6 bg-blue-600 text-white px-6 py-2 rounded font-bold" onClick={() => setStarted(false)}>Take Another Test</button>
          </div>
        ) : (
          <>
            <ScoreTracker correct={score.correct} total={questions.length} />
            <div className="mb-4 text-gray-700 font-medium">
              Question {currentIndex + 1} of {questions.length}
            </div>
            {error && <div className="text-red-600 mb-4">{error}</div>}
            {questions.length > 0 && !showSummary ? (
              <QuestionCard
                question={questions[currentIndex]}
                onScore={handleScoreUpdate}
                onNext={handleNextQuestion}
              />
            ) : (
              <div className="text-blue-600 text-lg p-6">Loading questions...</div>
            )}
          </>
        )
      )}
    </div>
  );
}

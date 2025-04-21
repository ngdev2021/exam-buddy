import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuestionCard({ question, onScore, onNext }) {
  const [questionData, setQuestionData] = useState(question);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  // Progress bar (simulate fast learning)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setQuestionData(question);
    setSelected("");
    setFeedback("");
    setShowNext(false);
    setBookmarked(false);
    setError("");
    setLoading(false);
    setTimeout(() => setProgress(100), 200);
  }, [question]);

  // Handle answer selection
  const handleSelect = async (choice) => {
    setSelected(choice);
    setShowNext(false);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/evaluate-answer`, {
        userAnswer: choice,
        correctAnswer: questionData.answer,
        explanation: questionData.explanation
      });
      setFeedback(res.data.feedback);
      setShowNext(true);
      onScore(res.data.isCorrect, choice);
    } catch {
      setFeedback("Could not evaluate answer.");
      setShowNext(true);
    }
  };


  // Bookmark handler
  const handleBookmark = () => setBookmarked(true);

  if (loading)
    return (
      <div className="bg-white rounded-xl shadow-2xl p-8 mb-6 animate-pulse flex flex-col items-center">
        <div className="w-2/3 h-6 bg-blue-100 rounded mb-4"></div>
        <div className="w-full h-4 bg-yellow-100 rounded mb-2"></div>
        <div className="w-full h-4 bg-yellow-100 rounded mb-2"></div>
        <div className="w-1/2 h-4 bg-yellow-100 rounded mb-2"></div>
        <div className="w-1/3 h-8 bg-gray-200 rounded mt-6"></div>
      </div>
    );
  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-red-700 shadow">
        {error} <button className="ml-4 underline" onClick={fetchQuestion}>Retry</button>
      </div>
    );
  if (!questionData) return null;

  return (
    <div className="relative bg-white rounded-2xl shadow-2xl p-8 mb-8 max-w-xl mx-auto animate-fade-in-fast">
      {/* Progress bar */}
      <div className="absolute left-0 top-0 h-2 w-full bg-blue-100 rounded-t-2xl overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-blue-500 via-green-400 to-yellow-400 transition-all duration-700"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {/* Bookmark */}
      <button
        className={`absolute top-4 right-4 text-2xl transition-transform duration-200 ${bookmarked ? "text-yellow-400 scale-110" : "text-gray-300 hover:text-yellow-400"}`}
        aria-label="Bookmark question"
        onClick={handleBookmark}
        disabled={bookmarked}
      >
        {bookmarked ? "★" : "☆"}
      </button>
      <div className="mb-6">
        <span className="text-lg font-bold text-blue-900">Question:</span>
        <span className="ml-2 text-lg font-medium text-gray-900">{questionData.question}</span>
      </div>
      <div className="grid gap-4 mb-6">
        {Array.isArray(questionData.choices) ? (
          questionData.choices.map((c, i) => {
          const isSelected = selected === c;
          const isCorrect = c === questionData.answer;
          const base =
            "block w-full text-left px-6 py-4 rounded-xl border-2 shadow transition-all duration-200 text-lg font-semibold focus:outline-none";
          let color = "bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-400 text-gray-900";
          if (selected) {
            if (isSelected && isCorrect) color = "bg-green-100 border-green-400 text-green-800 scale-105";
            else if (isSelected) color = "bg-red-100 border-red-400 text-red-800 shake";
            else if (isCorrect) color = "bg-green-50 border-green-200 text-green-600";
            else color = "bg-gray-50 border-gray-100 text-gray-400";
          }
          return (
            <button
              key={c}
              className={`${base} ${color}`}
              disabled={!!selected}
              onClick={() => handleSelect(c)}
              tabIndex={0}
              aria-label={`Answer ${String.fromCharCode(65 + i)}: ${c}`}
            >
              <span className="font-bold mr-3 text-blue-700">{String.fromCharCode(65 + i)}.</span> {c}
              {selected && isSelected && (
                <span className="ml-4 text-xl align-middle">
                  {isCorrect ? "✅" : "❌"}
                </span>
              )}
              {selected && isCorrect && !isSelected && (
                <span className="ml-4 text-lg text-green-500">✔</span>
              )}
            </button>
          );
        })
        ) : (
          <div className="text-red-500">Error: No answer choices found.</div>
        )}
      </div>
      {feedback && (
        <div className={`mb-6 p-4 rounded-xl border-2 text-lg font-medium flex items-center gap-3 animate-fade-in-fast ${feedback.includes("Correct") ? "bg-green-50 border-green-400 text-green-800" : "bg-red-50 border-red-400 text-red-800"}`}>
          <span className="text-2xl">
            {feedback.includes("Correct") ? "🚀" : "💡"}
          </span>
          <span>{feedback}</span>
        </div>
      )}
      {showNext && (
        <button
          className="w-full bg-gradient-to-r from-blue-600 to-yellow-400 text-white font-bold text-lg py-3 rounded-xl shadow-lg mt-2 transition-transform hover:scale-105 focus:outline-none"
          onClick={onNext}
        >
          Next Question
        </button>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import axios from "axios";

export default function QuestionCard({ question, onScore, onNext, theme = 'default' }) {
  const [questionData, setQuestionData] = useState(question);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState("");
  const [pendingSelection, setPendingSelection] = useState(""); // For confirmation step
  const [showConfirmation, setShowConfirmation] = useState(false); // Show confirmation dialog
  const [feedback, setFeedback] = useState("");
  const [showNext, setShowNext] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [answered, setAnswered] = useState(false);

  // Progress bar (simulate fast learning)
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    setQuestionData(question);
    setSelected("");
    setPendingSelection("");
    setShowConfirmation(false);
    setFeedback("");
    setShowNext(false);
    setBookmarked(false);
    setError("");
    setLoading(false);
    setAnswered(false);
    setTimeout(() => setProgress(100), 200);
  }, [question]);

  // Handle initial selection - show confirmation
  const handleInitialSelect = (choice) => {
    if (answered) return; // Prevent multiple selections
    setPendingSelection(choice);
    setShowConfirmation(true);
  };

  // Handle confirmation of answer
  const handleConfirmSelection = async () => {
    if (answered || !pendingSelection) return;
    
    const choice = pendingSelection;
    setSelected(choice);
    setAnswered(true);
    setShowConfirmation(false);
    setShowNext(false);
    
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/evaluate-answer`, {
        userAnswer: choice,
        correctAnswer: questionData.answer,
        explanation: questionData.explanation
      });
      
      setFeedback(res.data.feedback);
      setShowNext(true);
      onScore(res.data.isCorrect);
      
      // For incorrect answers, don't auto-advance
      if (res.data.isCorrect && onNext && typeof onNext === 'function') {
        // Wait 2 seconds to show feedback before moving to next question
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setFeedback("Could not evaluate answer.");
      setShowNext(true);
    }
  };

  // Cancel selection
  const handleCancelSelection = () => {
    setPendingSelection("");
    setShowConfirmation(false);
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

  // Modern theme (matches DashboardPage style)
  if (theme === 'modern') {
    return (
      <div>
        {/* Question content */}
        <div className="mb-6 bg-gray-50 dark:bg-gray-800/50 p-5 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-lg text-gray-800 dark:text-gray-200">{questionData.question}</p>
        </div>
        
        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700 text-center">
            <p className="mb-3 text-gray-800 dark:text-gray-200">Are you sure you want to select this answer?</p>
            <p className="mb-4 font-medium text-primary-700 dark:text-primary-400">"{pendingSelection}"</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={handleCancelSelection}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
                type="button"
              >
                Confirm Answer
              </button>
            </div>
          </div>
        )}
        
        {/* Answer options */}
        <div className="space-y-3 mb-6">
          {questionData && questionData.choices && Array.isArray(questionData.choices) ? (
            questionData.choices.map((c, i) => {
              const isSelected = selected === c;
              const isPending = pendingSelection === c;
              const isCorrect = c === questionData.answer;
              const isIncorrectSelection = selected && isSelected && !isCorrect;
              
              let optionClass = "w-full text-left p-4 rounded-lg border transition-all duration-200 flex items-start";
              
              if (isPending) {
                optionClass += " bg-primary-50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-600 ring-2 ring-primary-300 dark:ring-primary-600";
              } else if (selected) {
                if (isSelected && isCorrect) {
                  optionClass += " bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400";
                } else if (isIncorrectSelection) {
                  optionClass += " bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400";
                } else if (isCorrect) {
                  optionClass += " bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400";
                } else {
                  optionClass += " bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600";
                }
              } else {
                optionClass += isSelected
                  ? " bg-primary-50 dark:bg-primary-900/20 border-primary-500 dark:border-primary-400 ring-2 ring-primary-500 dark:ring-primary-400"
                  : " bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-primary-300 dark:hover:border-primary-600";
              }
              
              return (
                <button
                  key={i}
                  className={optionClass}
                  disabled={answered || showConfirmation}
                  onClick={() => handleInitialSelect(c)}
                  type="button"
                  tabIndex={0}
                  aria-label={`Answer ${String.fromCharCode(65 + i)}: ${c}`}
                >
                  <div className={`flex items-center justify-center min-w-[28px] h-7 mr-3 rounded-full ${isSelected ? 'bg-primary-600 dark:bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 text-left">{c}</div>
                  {selected && isSelected && isCorrect && (
                    <svg className="ml-auto h-5 w-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {isIncorrectSelection && (
                    <svg className="ml-auto h-5 w-5 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {selected && isCorrect && !isSelected && (
                    <svg className="ml-auto h-5 w-5 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              );
            })
          ) : (
            <div className="text-red-600 dark:text-red-400 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
              Error: No answer choices found.
            </div>
          )}
        </div>
        
        {/* Explanation */}
        {selected && questionData.explanation && (
          <div className="mb-6 bg-accent-50 dark:bg-accent-900/10 p-4 rounded-lg border border-accent-100 dark:border-accent-800/20">
            <div className="flex items-center mb-2">
              <svg className="h-5 w-5 text-accent-600 dark:text-accent-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium text-accent-800 dark:text-accent-300">Explanation</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{questionData.explanation}</p>
          </div>
        )}
        
        {/* Feedback */}
        {feedback && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in-fast ${feedback.includes("Correct") ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-200"}`}>
            <span className="text-2xl">
              {feedback.includes("Correct") ? "✅" : "💡"}
            </span>
            <span>{feedback}</span>
          </div>
        )}
        
        {/* Navigation button */}
        {showNext && (
          <button
            className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center"
            onClick={onNext}
            type="button"
          >
            {onNext && typeof onNext === 'function' && onNext.name === 'handleNextQuestion' && questionData && questionData.isLastQuestion ? 'View Results' : 'Next Question'}
            <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    );
  }
  
  // Default theme (original style)
  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
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
        <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{questionData.question}</p>
      </div>
      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-700 text-center">
          <p className="mb-3 text-gray-800 dark:text-gray-200">Are you sure you want to select this answer?</p>
          <p className="mb-4 font-medium text-primary-700 dark:text-primary-400">"{pendingSelection}"</p>
          <div className="flex space-x-3 justify-center">
            <button
              onClick={handleCancelSelection}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors duration-200"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmSelection}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-200"
              type="button"
            >
              Confirm Answer
            </button>
          </div>
        </div>
      )}
      
      <div className="grid gap-4 mb-6">
        {questionData && questionData.choices && Array.isArray(questionData.choices) ? (
          questionData.choices.map((c, i) => {
          const isSelected = selected === c;
          const isPending = pendingSelection === c;
          const isCorrect = c === questionData.answer;
          const base =
            "block w-full text-left px-4 py-3 rounded-lg border transition-all duration-200 font-medium focus:outline-none";
          let color = "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-50 hover:border-primary-400 text-gray-800 dark:text-gray-200";
          if (isPending) {
            color = "bg-primary-50 dark:bg-primary-900/10 border-primary-300 dark:border-primary-600 text-primary-800 dark:text-primary-300 ring-2 ring-primary-300 dark:ring-primary-600";
          } else if (selected) {
            if (isSelected && isCorrect) color = "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-400 text-green-800 dark:text-green-200";
            else if (isSelected) color = "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-400 text-red-800 dark:text-red-200";
            else if (isCorrect) color = "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-700 dark:text-green-300";
            else color = "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400";
          }
          return (
            <button
              key={c}
              className={`${base} ${color}`}
              disabled={answered || showConfirmation}
              onClick={() => handleInitialSelect(c)}
              tabIndex={0}
              type="button"
              aria-label={`Answer ${String.fromCharCode(65 + i)}: ${c}`}
            >
              <div className="flex items-center">
                <span className="font-bold mr-3 text-primary-600 dark:text-primary-400">{String.fromCharCode(65 + i)}.</span> {c}
                {selected && isSelected && (
                  <span className="ml-auto">
                    {isCorrect ? "✅" : "❌"}
                  </span>
                )}
                {selected && isCorrect && !isSelected && (
                  <span className="ml-auto text-green-500 dark:text-green-400">✓</span>
                )}
              </div>
            </button>
          );
        })
        ) : (
          <div className="text-red-500 dark:text-red-400">Error: No answer choices found.</div>
        )}
      </div>
      {feedback && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 animate-fade-in-fast ${feedback.includes("Correct") ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/30 text-green-800 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30 text-red-800 dark:text-red-200"}`}>
          <span className="text-2xl">
            {feedback.includes("Correct") ? "✅" : "💡"}
          </span>
          <span>{feedback}</span>
        </div>
      )}
      {showNext && (
        <button
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-lg transition-colors duration-200"
          onClick={onNext}
          type="button"
        >
          Next Question
        </button>
      )}
    </div>
  );
}

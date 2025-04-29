// @ts-nocheck
import React, { useState } from "react";
import axios from "axios";

const topics = [
  "Risk Management",
  "Property Insurance",
  "Casualty Insurance",
  "Texas Insurance Law",
  "Policy Provisions",
  "Underwriting",
  "Claims Handling",
  "Ethics & Regulations",
  "Math Calculations"
];

export default function CustomQuestionGenerator() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [count, setCount] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!selectedTopic) return;
    setLoading(true);
    setError("");
    setQuestions([]);
    try {
      const requests = Array.from({ length: count }, () =>
        axios.post(`${import.meta.env.VITE_API_URL}/api/generate-question`, { topic: selectedTopic })
          .then(res => res.data)
      );
      const results = await Promise.allSettled(requests);
      const valid = results
        .filter(r => r.status === "fulfilled" && r.value)
        .map(r => r.value);
      setQuestions(valid);
      if (!valid.length) {
        setError("No questions generated. Please try again.");
      }
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Custom Question Generator</h2>
      <div className="mb-4">
        <label className="block mb-1">Select Topic:</label>
        <select
          className="w-full border p-2 rounded"
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
        >
          <option value="">-- Choose Topic --</option>
          {topics.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block mb-1">Number of Questions:</label>
        <input
          type="number"
          min={1}
          max={10}
          value={count}
          onChange={e => setCount(parseInt(e.target.value) || 1)}
          className="w-20 border p-2 rounded"
        />
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        onClick={handleGenerate}
        disabled={!selectedTopic || loading}
      >
        {loading ? "Generating..." : "Generate Questions"}
      </button>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      <div className="mt-6">
        {questions.map((q, i) => (
          <div key={i} className="mb-6">
            <p className="font-semibold">Q{i+1}: {q.question}</p>
            <ul className="list-disc ml-6 mt-2">
              {q.choices.map((c, idx) => (
                <li key={idx}>{c}</li>
              ))}
            </ul>
            <p className="mt-2"><strong>Answer:</strong> {q.answer}</p>
            {q.explanation && <p className="mt-1 text-sm text-gray-600">{q.explanation}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

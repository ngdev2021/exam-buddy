import React, { useState } from "react";
import { evaluate } from "mathjs";

export default function Calculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);

  const handleEvaluate = () => {
    try {
      const res = evaluate(expr);
      setResult(res.toString());
      setHistory(prev => [...prev, { expr, result: res.toString() }]);
    } catch (err) {
      setResult("Error");
    }
  };

  return (
    <div className="p-4 border rounded shadow bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-colors duration-200">
      <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">Calculator</h3>
      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 transition-colors duration-200"
          placeholder="Enter expression"
          value={expr}
          onChange={e => setExpr(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleEvaluate()}
        />
        <button
          onClick={handleEvaluate}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >=</button>
      </div>
      <div className="mb-2 text-gray-800 dark:text-gray-200 transition-colors duration-200">Result: <span className="font-mono">{result}</span></div>
      <div className="max-h-32 overflow-y-auto text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
        {history.map((h, i) => (
          <div key={i}>{h.expr} = {h.result}</div>
        ))}
      </div>
    </div>
  );
}

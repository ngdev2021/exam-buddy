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
    <div className="p-4 border rounded shadow bg-white">
      <h3 className="text-lg font-bold mb-2">Calculator</h3>
      <div className="flex space-x-2 mb-2">
        <input
          type="text"
          className="flex-1 border p-2 rounded"
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
      <div className="mb-2">Result: <span className="font-mono">{result}</span></div>
      <div className="max-h-32 overflow-y-auto text-sm text-gray-600">
        {history.map((h, i) => (
          <div key={i}>{h.expr} = {h.result}</div>
        ))}
      </div>
    </div>
  );
}

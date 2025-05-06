import React from "react";
import Calculator from "../components/Calculator";

export default function CalculatorPage() {
  return (
    <div className="max-w-xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-200 transition-colors duration-200">Calculator</h2>
      <Calculator />
    </div>
  );
}

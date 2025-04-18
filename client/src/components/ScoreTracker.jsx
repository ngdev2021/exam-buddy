import React from "react";

export default function ScoreTracker({ correct, total }) {
  return (
    <div className="sticky top-0 z-10 mb-6 flex items-center justify-between px-6 py-3 rounded-full bg-gradient-to-r from-blue-700 via-yellow-400 to-orange-400 shadow-xl text-white font-bold text-lg animate-fade-in">
      <span className="tracking-widest drop-shadow">Score</span>
      <span className="tracking-wide">
        <span className="text-3xl font-extrabold drop-shadow-lg">{correct}</span>
        <span className="mx-1 text-xl">/</span>
        <span className="text-2xl">{total}</span>
      </span>
      <span className="text-sm font-medium italic opacity-80">Keep going!</span>
    </div>
  );
}

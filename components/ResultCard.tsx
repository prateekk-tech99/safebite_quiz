
import React from 'react';
import { Difficulty } from '../types';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  difficulty: Difficulty | null;
}

export default function ResultCard({ score, totalQuestions, onRestart, difficulty }: ResultCardProps) {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getFeedback = () => {
    if (percentage >= 90) return { message: "Excellent!", style: "text-green-400" };
    if (percentage >= 70) return { message: "Good Job!", style: "text-yellow-400" };
    if (percentage >= 50) return { message: "Not Bad!", style: "text-orange-400" };
    return { message: "Keep Practicing!", style: "text-red-400" };
  };

  const feedback = getFeedback();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-1">Quiz Completed!</h1>
        {difficulty && <p className="text-lg text-cyan-400 font-semibold mb-2">{difficulty} Level</p>}
        <p className={`text-2xl font-bold mb-6 ${feedback.style}`}>{feedback.message}</p>

        <div className="relative inline-flex items-center justify-center mb-6">
            <svg className="w-40 h-40 transform -rotate-90">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r={radius} cx="80" cy="80" />
                <circle
                    className={feedback.style}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="80"
                    cy="80"
                    style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{percentage}%</span>
                <span className="text-slate-400 text-lg">{score} / {totalQuestions}</span>
            </div>
        </div>
        
        <p className="text-lg text-slate-300 mb-8">
            You answered {score} out of {totalQuestions} questions correctly.
        </p>

        <button
            onClick={onRestart}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
            Try Another Level
        </button>
    </div>
  );
}

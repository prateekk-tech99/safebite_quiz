import React, { useEffect, useState } from 'react';
import { Difficulty, Topic, BadgeId, Question } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUserProgress } from '../context/UserProgressContext';
import { achievements } from '../lib/achievements';
import Badge from './Badge';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  difficulty: Difficulty | null;
  topic: Topic | null;
  questions: Question[];
}

export default function ResultCard({ score, totalQuestions, onRestart, difficulty, topic, questions }: ResultCardProps) {
  const { t } = useTranslation();
  const { updateProgress } = useUserProgress();
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  useEffect(() => {
    if (topic) {
      const unlockedBadges = updateProgress(score, totalQuestions, topic, questions);
      setNewBadges(unlockedBadges);
    }
  }, [score, totalQuestions, topic, questions, updateProgress]);

  const getFeedback = () => {
    if (percentage >= 90) return { message: t('resultFeedbackExcellent'), style: "text-green-400" };
    if (percentage >= 70) return { message: t('resultFeedbackGood'), style: "text-yellow-400" };
    if (percentage >= 50) return { message: t('resultFeedbackNotBad'), style: "text-orange-400" };
    return { message: t('resultFeedbackKeepPracticing'), style: "text-red-400" };
  };

  const feedback = getFeedback();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in">
        <h1 className="text-3xl font-bold text-white mb-1">{t('resultTitle')}</h1>
        {difficulty && topic && <p className="text-lg text-cyan-400 font-semibold mb-2">{t('resultLevelTopic', difficulty, topic)}</p>}
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
        
        {newBadges.length > 0 && (
          <div className="mb-6 bg-slate-900/50 p-4 rounded-lg">
            <h3 className="text-lg font-bold text-yellow-300 mb-3">{t('newBadgeUnlocked')}</h3>
            <div className="flex justify-center items-center gap-4">
              {newBadges.map(badgeId => (
                <div key={badgeId} className="flex flex-col items-center">
                   <Badge badge={achievements[badgeId]} />
                   <p className="text-xs text-slate-300 mt-1">{achievements[badgeId].name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
            onClick={onRestart}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
            {t('resultRestartButton')}
        </button>
    </div>
  );
}
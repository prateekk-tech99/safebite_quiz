
import React, { useState } from 'react';
import { Difficulty, Topic, Language } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUserProgress } from '../context/UserProgressContext';
import { topics } from '../lib/topics';

interface QuizSetupProps {
  onStartQuiz: (difficulty: Difficulty, topic: Topic, download: boolean) => void;
  quizLength: number;
  onBack: () => void;
}

export default function QuizSetup({ onStartQuiz, quizLength, onBack }: QuizSetupProps) {
  const { language, setLanguage, t } = useTranslation();
  const { scores } = useUserProgress();
  const [selectedTopic, setSelectedTopic] = useState<Topic>(Topic.GENERAL);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.EASY);

  return (
    <div className="p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in text-white">
      <h1 className="text-3xl font-bold text-center mb-2">{t('quizSetupTitle')}</h1>
      <p className="text-lg text-slate-300 text-center mb-6">{t('quizSetupSubtitle')}</p>

      {/* Language Selector */}
      <div className="mb-6">
        <div className="inline-flex w-full justify-center rounded-lg shadow-sm bg-slate-900/50 p-1">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus:outline-none ${
                language === lang ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Selection */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">{t('selectTopic')}</h2>
        <div className="grid grid-cols-2 gap-3">
          {topics.map(topic => {
            const topicStats = scores[topic];
            const percentage = topicStats && topicStats.totalAttempted > 0
              ? Math.round((topicStats.totalCorrect / topicStats.totalAttempted) * 100)
              : 0;
              
            return (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`p-3 rounded-lg transition-colors duration-200 text-center ${
                  selectedTopic === topic ? 'bg-cyan-500 font-bold' : 'bg-slate-700 hover:bg-slate-600'
                }`}
              >
                <span className="text-sm">{topic}</span>
                {topicStats && topicStats.totalAttempted > 0 && (
                  <div className="w-full bg-slate-900/50 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-cyan-400 h-1.5 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Difficulty Selection */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-3">{t('selectDifficulty')}</h2>
        <div className="flex rounded-lg shadow-sm bg-slate-700 p-1">
          {Object.values(Difficulty).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`w-full py-3 text-center rounded-md transition-colors duration-200 font-semibold ${
                selectedDifficulty === diff ? 'bg-cyan-500 text-white shadow' : 'text-slate-300 hover:bg-cyan-600/50'
              }`}
            >
              {t(diff === Difficulty.EASY ? 'levelBeginner' : diff === Difficulty.MEDIUM ? 'levelIntermediate' : 'levelExpert')}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => onStartQuiz(selectedDifficulty, selectedTopic, false)}
          className="w-full bg-cyan-500 text-white font-bold py-3 rounded-lg text-lg hover:bg-cyan-600 transition-transform transform hover:scale-105"
        >
          {t('startQuiz')}
        </button>
        <button
          onClick={() => onStartQuiz(selectedDifficulty, selectedTopic, true)}
          className="w-full bg-slate-600 text-white font-bold py-3 rounded-lg text-lg hover:bg-slate-500 transition-transform transform hover:scale-105"
        >
          {t('downloadOffline')}
        </button>
        <button
          onClick={onBack}
          className="w-full text-slate-300 font-bold py-2 rounded-lg text-md hover:bg-slate-700 transition-colors"
        >
          {t('backButton')}
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center mt-6">{t('quizLengthInfo', quizLength)}</p>
    </div>
  );
}
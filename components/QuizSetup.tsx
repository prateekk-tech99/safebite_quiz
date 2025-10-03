
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
    <div className="p-8 bg-[#F2EAD3] rounded-2xl shadow-2xl border border-[#344F1F]/20 animate-fade-in text-[#344F1F]">
      <h1 className="text-3xl font-bold text-center mb-2">{t('quizSetupTitle')}</h1>
      <p className="text-lg text-[#344F1F]/80 text-center mb-6">{t('quizSetupSubtitle')}</p>

      {/* Language Selector */}
      <div className="mb-6">
        <div className="inline-flex w-full justify-center rounded-lg shadow-sm bg-[#EAE2CF] p-1">
          {Object.values(Language).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`w-full px-4 py-2 text-sm font-medium transition-colors duration-200 rounded-md focus:outline-none ${
                language === lang ? 'bg-[#F4991A] text-[#F9F5F0] shadow' : 'text-[#344F1F]/70 hover:bg-[#DCD0B9]'
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
                  selectedTopic === topic ? 'bg-[#F4991A] text-[#F9F5F0] font-bold' : 'bg-[#EAE2CF] hover:bg-[#DCD0B9]'
                }`}
              >
                <span className="text-sm">{topic}</span>
                {topicStats && topicStats.totalAttempted > 0 && (
                  <div className="w-full bg-[#344F1F]/10 rounded-full h-1.5 mt-2">
                    <div 
                      className="bg-[#F4991A] h-1.5 rounded-full" 
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
        <div className="flex rounded-lg shadow-sm bg-[#EAE2CF] p-1">
          {Object.values(Difficulty).map(diff => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`w-full py-3 text-center rounded-md transition-colors duration-200 font-semibold ${
                selectedDifficulty === diff ? 'bg-[#F4991A] text-[#F9F5F0] shadow' : 'text-[#344F1F]/80 hover:bg-[#F4991A]/50'
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
          className="w-full bg-[#F4991A] text-[#F9F5F0] font-bold py-3 rounded-lg text-lg hover:bg-[#E08D18] transition-transform transform hover:scale-105"
        >
          {t('startQuiz')}
        </button>
        <button
          onClick={() => onStartQuiz(selectedDifficulty, selectedTopic, true)}
          className="w-full bg-[#344F1F] text-[#F9F5F0] font-bold py-3 rounded-lg text-lg hover:bg-[#2A3F19] transition-transform transform hover:scale-105"
        >
          {t('downloadOffline')}
        </button>
        <button
          onClick={onBack}
          className="w-full text-[#344F1F]/70 font-bold py-2 rounded-lg text-md hover:bg-[#DCD0B9] transition-colors"
        >
          {t('backButton')}
        </button>
      </div>

      <p className="text-xs text-[#344F1F]/60 text-center mt-6">{t('quizLengthInfo', quizLength)}</p>
    </div>
  );
}

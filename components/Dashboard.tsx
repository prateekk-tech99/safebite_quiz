
import React from 'react';
import { AppView, OfflineQuiz } from '../types';
import { useUserProgress } from '../context/UserProgressContext';
import { useTranslation } from '../context/LanguageContext';
import { BrainIcon } from './icons/BrainIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { TrophyIcon } from './icons/TrophyIcon';
import { achievements } from '../lib/achievements';
import { topics } from '../lib/topics';
import Badge from './Badge';

interface DashboardProps {
  setAppView: (view: AppView) => void;
  startOfflineQuiz: (quiz: OfflineQuiz) => void;
}

export default function Dashboard({ setAppView, startOfflineQuiz }: DashboardProps) {
  const { streak, badges, offlineQuizzes, removeOfflineQuiz, scores } = useUserProgress();
  const { t } = useTranslation();

  const recentBadges = badges.slice(-3).map(id => achievements[id]);

  const handleStartOfflineQuiz = (quiz: OfflineQuiz) => {
    startOfflineQuiz(quiz);
    removeOfflineQuiz(quiz.id);
  };

  return (
    <div className="text-[#344F1F] p-4 animate-fade-in space-y-6">
      <header className="text-center">
        <h1 className="text-4xl font-bold">{t('dashboardTitle')}</h1>
        <p className="text-[#344F1F]/80 text-lg">{t('dashboardSubtitle')}</p>
      </header>

      {/* Stats Section */}
      <div className="grid grid-cols-2 gap-4 text-center">
        <div className="bg-[#F2EAD3] p-4 rounded-lg border border-[#344F1F]/20">
          <CalendarIcon className="h-8 w-8 mx-auto text-[#F4991A] mb-2" />
          <p className="text-3xl font-bold">{streak}</p>
          <p className="text-[#344F1F]/70">{t('dailyStreak')}</p>
        </div>
        <div className="bg-[#F2EAD3] p-4 rounded-lg border border-[#344F1F]/20">
          <TrophyIcon className="h-8 w-8 mx-auto text-[#F4991A] mb-2" />
          <p className="text-3xl font-bold">{badges.length}</p>
          <p className="text-[#344F1F]/70">{t('badges')}</p>
        </div>
      </div>

      {/* Topic Mastery */}
      <div className="bg-[#F2EAD3] p-4 rounded-lg border border-[#344F1F]/20">
        <h3 className="font-bold mb-4 text-lg text-center">{t('topicMastery')}</h3>
        <div className="space-y-3">
          {topics.map(topic => {
            const topicStats = scores[topic];
            const percentage = topicStats && topicStats.totalAttempted > 0
              ? Math.round((topicStats.totalCorrect / topicStats.totalAttempted) * 100)
              : 0;
            
            return (
              <div key={topic}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-[#344F1F]/90">{topic}</span>
                  <span className="text-sm font-medium text-[#344F1F]">{percentage}%</span>
                </div>
                <div className="w-full bg-[#EAE2CF] rounded-full h-2">
                  <div 
                    className="bg-[#F4991A] h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${percentage}%` }}>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Recent Badges */}
       {recentBadges.length > 0 && (
         <div className="bg-[#F2EAD3] p-4 rounded-lg border border-[#344F1F]/20">
            <h3 className="font-bold mb-3 text-lg">{t('badges')}</h3>
            <div className="flex justify-center items-center gap-4">
              {recentBadges.map(badge => (
                 <div key={badge.id} className="flex flex-col items-center text-center">
                    <Badge badge={badge} />
                    <p className="text-xs mt-1 w-20 truncate">{badge.name}</p>
                 </div>
              ))}
            </div>
         </div>
       )}

      {/* Actions */}
      <div className="space-y-4">
        <button
          onClick={() => setAppView(AppView.QUIZ_SETUP)}
          className="w-full flex items-center justify-center gap-3 bg-[#F4991A] text-[#F9F5F0] font-bold py-4 px-6 rounded-lg text-xl hover:bg-[#E08D18] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          <BrainIcon className="h-6 w-6" /> {t('startNewQuiz')}
        </button>
      </div>

      {/* Offline Quizzes */}
      <div className="bg-[#F2EAD3] p-4 rounded-lg border border-[#344F1F]/20">
        <h3 className="font-bold mb-3 text-lg">{t('offlineQuizzes')}</h3>
        {offlineQuizzes.length > 0 ? (
          <div className="space-y-2">
            {offlineQuizzes.map(quiz => (
              <button
                key={quiz.id}
                onClick={() => handleStartOfflineQuiz(quiz)}
                className="w-full text-left p-3 bg-[#EAE2CF] rounded-md hover:bg-[#DCD0B9] transition-colors"
              >
                <p className="font-semibold">{quiz.topic}</p>
                <p className="text-sm text-[#344F1F]/70">{quiz.difficulty}</p>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-[#344F1F]/70 text-center py-4">{t('noOfflineQuizzes')}</p>
        )}
      </div>
    </div>
  );
}

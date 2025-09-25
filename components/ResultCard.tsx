import React, { useEffect, useState } from 'react';
import { Difficulty, Topic, BadgeId, Question, WrongAnswerPayload } from '../types';
import { useTranslation } from '../context/LanguageContext';
import { useUserProgress } from '../context/UserProgressContext';
import { achievements } from '../lib/achievements';
import Badge from './Badge';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { generateFeedback } from '../services/geminiService';
import Loader from './Loader';
import { SparklesIcon } from './icons/SparklesIcon';

interface ResultCardProps {
  score: number;
  totalQuestions: number;
  onRestart: () => void;
  difficulty: Difficulty | null;
  topic: Topic | null;
  questions: Question[];
  userAnswers: (number | null)[];
  timeTaken: number | null;
  onPracticeTopic: () => void;
}

const ReviewAnswers = ({ questions, userAnswers }: { questions: Question[]; userAnswers: (number | null)[] }) => (
  <div className="space-y-4 text-left">
    {questions.map((q, index) => {
      const userAnswer = userAnswers[index];
      const isCorrect = userAnswer === q.correctAnswerIndex;

      return (
        <div key={index} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
          <p className="font-semibold text-slate-200 mb-3">{index + 1}. {q.question}</p>
          <div className="space-y-2">
            {q.options.map((option, optIndex) => {
              const isUserChoice = userAnswer === optIndex;
              const isCorrectChoice = q.correctAnswerIndex === optIndex;
              
              let optionClass = "text-slate-300";
              if (isCorrectChoice) optionClass = "text-green-400 font-bold";
              if (isUserChoice && !isCorrect) optionClass = "text-red-400 line-through";
              
              return (
                <div key={optIndex} className={`flex items-center p-2 rounded ${optionClass} ${isCorrectChoice ? 'bg-green-900/20' : ''} ${isUserChoice && !isCorrect ? 'bg-red-900/20' : ''}`}>
                  <span className="mr-2 font-mono">{String.fromCharCode(65 + optIndex)}.</span>
                  <span>{option}</span>
                  {isCorrectChoice && <CheckCircleIcon className="w-5 h-5 ml-auto text-green-400" />}
                  {isUserChoice && !isCorrect && <XCircleIcon className="w-5 h-5 ml-auto text-red-400" />}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-sm text-slate-400 bg-slate-800/50 p-3 rounded-md">{q.explanation}</p>
        </div>
      );
    })}
  </div>
);

const SimpleMarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <div className="space-y-3 text-left text-slate-300">
      {content.split('\n').map((line, index) => {
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>');
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
          return (
            <div key={index} className="flex items-start">
              <span className="mr-2 mt-1 text-cyan-400">&bull;</span>
              <p className="flex-1" dangerouslySetInnerHTML={{ __html: line.substring(line.indexOf(' ') + 1) }} />
            </div>
          );
        }
        if (line.trim() === '') {
          return null;
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: line }} />;
      })}
    </div>
  );
};


export default function ResultCard({ score, totalQuestions, onRestart, difficulty, topic, questions, userAnswers, timeTaken, onPracticeTopic }: ResultCardProps) {
  const { t, language } = useTranslation();
  const { scores, updateProgress } = useUserProgress();
  const [newBadges, setNewBadges] = useState<BadgeId[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [showAiFeedback, setShowAiFeedback] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const didStruggle = percentage < 70;

  useEffect(() => {
    if (topic && timeTaken !== null) {
      const unlockedBadges = updateProgress(score, totalQuestions, topic, questions, timeTaken);
      setNewBadges(unlockedBadges);
    }
  }, [score, totalQuestions, topic, questions, timeTaken, updateProgress]);

  const handleToggleAiFeedback = async () => {
    // If we're opening it for the first time and there are wrong answers
    if (!showAiFeedback && !aiFeedback && score < totalQuestions) {
        setIsFeedbackLoading(true);
        setFeedbackError(null);
        setShowAiFeedback(true);

        const wrongAnswersPayload: WrongAnswerPayload[] = questions
          .map((q, i) => ({ q, userAnswerIndex: userAnswers[i] }))
          .filter(item => item.userAnswerIndex !== null && item.userAnswerIndex !== item.q.correctAnswerIndex)
          .map(({ q, userAnswerIndex }) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.options[q.correctAnswerIndex],
            userAnswer: q.options[userAnswerIndex!],
          }));
        
        try {
            const feedback = await generateFeedback(topic!, difficulty!, wrongAnswersPayload, language);
            setAiFeedback(feedback);
        } catch (err) {
            setFeedbackError(t('aiFeedbackError'));
        } finally {
            setIsFeedbackLoading(false);
        }
    } else if (score === totalQuestions && !aiFeedback) {
        setAiFeedback(t('perfectScoreFeedback'));
        setShowAiFeedback(!showAiFeedback);
    } else {
        setShowAiFeedback(!showAiFeedback);
    }
  };

  const getFeedback = () => {
    if (percentage >= 90) return { message: t('resultFeedbackExcellent'), style: "text-green-400" };
    if (percentage >= 70) return { message: t('resultFeedbackGood'), style: "text-yellow-400" };
    if (percentage >= 50) return { message: t('resultFeedbackNotBad'), style: "text-orange-400" };
    return { message: t('resultFeedbackKeepPracticing'), style: "text-red-400" };
  };
  
  const formatTime = (totalSeconds: number | null) => {
    if (totalSeconds === null) return '--:--';
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const feedback = getFeedback();
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  const topicStats = topic ? scores[topic] : undefined;
  const overallPercentage = topic && topicStats && topicStats.totalAttempted > 0 
    ? Math.round((topicStats.totalCorrect / topicStats.totalAttempted) * 100)
    : 0;

  return (
    <div className="text-center p-8 bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 animate-fade-in w-full">
        <h1 className="text-3xl font-bold text-white mb-1">{t('resultTitle')}</h1>
        {difficulty && topic && <p className="text-lg text-cyan-400 font-semibold mb-2">{t('resultLevelTopic', difficulty, topic)}</p>}
        <p className={`text-2xl font-bold mb-2 ${feedback.style}`}>{feedback.message}</p>
        <p className="text-slate-400 text-sm mb-4">{t('timeTaken')}: {formatTime(timeTaken)}</p>

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

        {topic && topicStats && topicStats.totalAttempted > 0 && (
          <div className="my-6 p-4 bg-slate-900/50 rounded-lg text-left border border-slate-700">
            <h3 className="text-lg font-bold text-white mb-3">{t('topicPerformanceHistory', topic)}</h3>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-base font-medium text-cyan-400">{t('overallAccuracy')}</span>
                    <span className="text-sm font-medium text-cyan-400">{overallPercentage}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <div 
                        className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${overallPercentage}%` }}>
                    </div>
                </div>
                <p className="text-right text-sm text-slate-400 mt-1">{t('accuracyInfo', topicStats.totalCorrect, topicStats.totalAttempted)}</p>
            </div>
            {topicStats.totalAttempted === totalQuestions && (
              <p className="text-slate-400 text-xs mt-2">{t('noHistory')}</p>
            )}
          </div>
        )}
        
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

        {didStruggle && topic && (
          <div className="my-6 p-4 bg-yellow-900/30 rounded-lg text-center border border-yellow-800">
            <p className="font-semibold text-yellow-300">{t('resultStruggling', topic)}</p>
            <p className="text-sm text-yellow-400/80 mt-1">{t('resultStrugglingSuggestion')}</p>
            <button 
              onClick={onPracticeTopic} 
              className="mt-4 bg-yellow-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-yellow-600 transition-colors text-base"
            >
              {t('resultPracticeAgain', topic)}
            </button>
          </div>
        )}
        
        <div className="space-y-3 my-6">
          <button
              onClick={handleToggleAiFeedback}
              className="w-full flex items-center justify-center gap-3 bg-fuchsia-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-fuchsia-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <SparklesIcon className="h-5 w-5" /> {t('getAiFeedback')}
          </button>
          {showAiFeedback && (
            <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 animate-fade-in-up">
                <h3 className="text-lg font-bold text-fuchsia-400 mb-3">{t('aiFeedbackTitle')}</h3>
                {isFeedbackLoading && <Loader message={t('aiFeedbackLoading')} />}
                {feedbackError && <p className="text-red-400">{feedbackError}</p>}
                {aiFeedback && <SimpleMarkdownRenderer content={aiFeedback} />}
            </div>
          )}

          <button 
            onClick={() => setShowReview(!showReview)} 
            className="w-full text-left p-3 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors flex justify-between items-center font-semibold"
          >
            <span>{t('reviewAnswers')}</span>
            <span className="text-cyan-400">{showReview ? t('hide') : t('show')}</span>
          </button>
          {showReview && (
            <div className="mt-4 animate-fade-in-up">
              <ReviewAnswers questions={questions} userAnswers={userAnswers} />
            </div>
          )}
        </div>


        <button
            onClick={onRestart}
            className="w-full bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300"
        >
            {t('resultRestartButton')}
        </button>
    </div>
  );
}
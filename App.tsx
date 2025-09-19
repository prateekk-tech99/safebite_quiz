import React, { useState, useCallback } from 'react';
import { AppView, type Question, Difficulty, Topic } from './types';
import { generateQuizQuestions } from './services/geminiService';
import Quiz from './components/Quiz';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import QuizSetup from './components/QuizSetup';
import Dashboard from './components/Dashboard';
import { useTranslation } from './context/LanguageContext';
import { useUserProgress } from './context/UserProgressContext';

const QUIZ_LENGTH = 5;

export default function App() {
  const [appView, setAppView] = useState<AppView>(AppView.DASHBOARD);
  const [activeQuiz, setActiveQuiz] = useState<{ questions: Question[], difficulty: Difficulty, topic: Topic } | null>(null);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<(number | null)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { language, t } = useTranslation();
  const { addOfflineQuiz } = useUserProgress();

  const handleQuizRequest = useCallback(async (difficulty: Difficulty, topic: Topic, download: boolean = false) => {
    setAppView(AppView.LOADING);
    setError(null);
    try {
      const newQuestions = await generateQuizQuestions(QUIZ_LENGTH, difficulty, topic, language);
      if (newQuestions.length > 0) {
        if (download) {
          addOfflineQuiz({ id: `offline_${Date.now()}`, questions: newQuestions, difficulty, topic });
          setAppView(AppView.DASHBOARD); // Go back to dashboard after download
        } else {
          setActiveQuiz({ questions: newQuestions, difficulty, topic });
          setScore(0);
          setUserAnswers([]);
          setAppView(AppView.QUIZ);
        }
      } else {
        setError(t('errorGeneration'));
        setAppView(AppView.QUIZ_SETUP);
      }
    } catch (err) {
      console.error(err);
      setError(t('errorApi'));
      setAppView(AppView.QUIZ_SETUP);
    }
  }, [language, t, addOfflineQuiz]);

  const startOfflineQuiz = (quiz: { questions: Question[], difficulty: Difficulty, topic: Topic }) => {
    setActiveQuiz(quiz);
    setScore(0);
    setUserAnswers([]);
    setAppView(AppView.QUIZ);
  };

  const finishQuiz = useCallback((finalScore: number, finalAnswers: (number | null)[]) => {
    setScore(finalScore);
    setUserAnswers(finalAnswers);
    setAppView(AppView.FINISHED);
  }, []);

  const returnToDashboard = useCallback(() => {
    setActiveQuiz(null);
    setScore(0);
    setUserAnswers([]);
    setAppView(AppView.DASHBOARD);
  }, []);

  const renderContent = () => {
    switch (appView) {
      case AppView.LOADING:
        return <Loader message={t('loaderMessage')} />;
      case AppView.QUIZ:
        return activeQuiz ? <Quiz questions={activeQuiz.questions} onFinish={finishQuiz} /> : null;
      case AppView.FINISHED:
        return activeQuiz ? (
          <ResultCard 
            score={score} 
            totalQuestions={activeQuiz.questions.length} 
            onRestart={returnToDashboard} 
            difficulty={activeQuiz.difficulty}
            topic={activeQuiz.topic}
            questions={activeQuiz.questions}
            userAnswers={userAnswers}
            onPracticeTopic={
              activeQuiz 
                ? () => handleQuizRequest(activeQuiz.difficulty, activeQuiz.topic, false) 
                : () => {}
            }
          />
        ) : null;
      case AppView.QUIZ_SETUP:
        return (
          <div className="w-full">
            {error && <p className="w-full text-center text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
            <QuizSetup onStartQuiz={handleQuizRequest} quizLength={QUIZ_LENGTH} onBack={() => setAppView(AppView.DASHBOARD)} />
          </div>
        );
      case AppView.DASHBOARD:
      default:
        return <Dashboard setAppView={setAppView} startOfflineQuiz={startOfflineQuiz} />;
    }
  };

  return (
    <main className="bg-slate-900 min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black">
      <div className="w-full max-w-2xl mx-auto">
        {renderContent()}
      </div>
    </main>
  );
}

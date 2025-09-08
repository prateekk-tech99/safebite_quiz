
import React, { useState, useCallback } from 'react';
import { QuizState, type Question, Difficulty } from './types';
import { generateQuizQuestions } from './services/geminiService';
import Quiz from './components/Quiz';
import ResultCard from './components/ResultCard';
import Loader from './components/Loader';
import LevelSelection from './components/LevelSelection';

const QUIZ_LENGTH = 5;

export default function App() {
  const [quizState, setQuizState] = useState<QuizState>(QuizState.LEVEL_SELECTION);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<Difficulty | null>(null);

  const startQuiz = useCallback(async (difficulty: Difficulty) => {
    setQuizState(QuizState.LOADING);
    setCurrentDifficulty(difficulty);
    setError(null);
    try {
      const newQuestions = await generateQuizQuestions(QUIZ_LENGTH, difficulty);
      if (newQuestions.length > 0) {
        setQuestions(newQuestions);
        setScore(0);
        setQuizState(QuizState.ACTIVE);
      } else {
        setError('Failed to generate quiz questions. Please try again.');
        setQuizState(QuizState.LEVEL_SELECTION);
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while fetching the quiz. Please check your API key and try again.');
      setQuizState(QuizState.LEVEL_SELECTION);
    }
  }, []);

  const finishQuiz = useCallback((finalScore: number) => {
    setScore(finalScore);
    setQuizState(QuizState.FINISHED);
  }, []);

  const restartQuiz = useCallback(() => {
    setQuestions([]);
    setScore(0);
    setCurrentDifficulty(null);
    setQuizState(QuizState.LEVEL_SELECTION);
  }, []);

  const renderContent = () => {
    switch (quizState) {
      case QuizState.LOADING:
        return <Loader message={`Generating your ${currentDifficulty} quiz... this may take a moment.`} />;
      case QuizState.ACTIVE:
        return <Quiz questions={questions} onFinish={finishQuiz} />;
      case QuizState.FINISHED:
        return <ResultCard score={score} totalQuestions={questions.length} onRestart={restartQuiz} difficulty={currentDifficulty} />;
      case QuizState.LEVEL_SELECTION:
      default:
        return (
          <div className="w-full">
            {error && <p className="w-full text-center text-red-400 bg-red-900/50 p-3 rounded-lg mb-4">{error}</p>}
            <LevelSelection onSelectLevel={startQuiz} quizLength={QUIZ_LENGTH} />
          </div>
        );
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


import React, { useState } from 'react';
import type { Question } from '../types';
import QuestionCard from './QuestionCard';
import { useTranslation } from '../context/LanguageContext';

interface QuizProps {
  questions: Question[];
  onFinish: (score: number) => void;
}

export default function Quiz({ questions, onFinish }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const { t } = useTranslation();

  const handleNextQuestion = (isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      onFinish(score + (isCorrect ? 1 : 0));
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  return (
    <div className="w-full">
        <div className="mb-4">
            <div className="flex justify-between items-center text-white mb-2">
                <p className="font-semibold">{t('questionOf', currentQuestionIndex + 1, questions.length)}</p>
                <p className="font-semibold">{t('score')}: {score}</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5">
                <div 
                    className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${progressPercentage}%` }}>
                </div>
            </div>
        </div>

        <QuestionCard
            question={currentQuestion}
            onAnswer={handleNextQuestion}
        />
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import type { Question } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { useTranslation } from '../context/LanguageContext';

interface QuestionCardProps {
  question: Question;
  onAnswer: (isCorrect: boolean, selectedAnswer: number) => void;
}

export default function QuestionCard({ question, onAnswer }: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const { t } = useTranslation();

  // Fix: Reset state when the question prop changes to ensure a fresh card for each question.
  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
  }, [question]);

  const handleSelectAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return "bg-slate-700 hover:bg-slate-600";
    }
    if (index === question.correctAnswerIndex) {
      return "bg-green-600/80 border-green-400";
    }
    if (index === selectedAnswer) {
      return "bg-red-600/80 border-red-400";
    }
    return "bg-slate-800 text-slate-400 cursor-not-allowed";
  };

  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  return (
    <div className="p-6 bg-slate-800 rounded-2xl shadow-xl text-white border border-slate-700 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 leading-snug text-slate-100">{question.question}</h2>
      
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-lg text-lg transition-all duration-200 border-2 border-transparent ${getButtonClass(index)}`}
          >
            <span className="font-mono mr-3 text-cyan-400">{String.fromCharCode(65 + index)}.</span> {option}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className={`p-4 rounded-lg mt-6 animate-fade-in-up ${isCorrect ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isCorrect ? (
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-400" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-lg font-bold ${isCorrect ? 'text-green-300' : 'text-red-300'}`}>
                {isCorrect ? t('questionCorrect') : t('questionIncorrect')}
              </h3>
              <p className="mt-2 text-slate-300">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
      
      {isAnswered && (
        <button
          onClick={() => onAnswer(isCorrect, selectedAnswer as number)}
          className="w-full mt-6 bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg text-xl hover:bg-cyan-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {t('questionNextButton')}
        </button>
      )}
    </div>
  );
}

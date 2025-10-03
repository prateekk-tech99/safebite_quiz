
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
      return "bg-[#F9F5F0] hover:bg-[#EAE2CF] border-[#344F1F]/20";
    }
    if (index === question.correctAnswerIndex) {
      return "bg-[#344F1F] text-[#F9F5F0] border-[#344F1F]";
    }
    if (index === selectedAnswer) {
      return "bg-red-500 text-white border-red-500";
    }
    return "bg-[#F9F5F0]/50 text-[#344F1F]/50 border-transparent";
  };

  const isCorrect = selectedAnswer === question.correctAnswerIndex;

  return (
    <div className="p-6 bg-[#F2EAD3] rounded-2xl shadow-xl text-[#344F1F] border border-[#344F1F]/20 animate-fade-in">
      <h2 className="text-2xl font-semibold mb-6 leading-snug text-[#344F1F]">{question.question}</h2>
      
      <div className="space-y-3 mb-6">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleSelectAnswer(index)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-lg text-lg transition-all duration-200 border-2 ${getButtonClass(index)}`}
          >
            <span className="font-mono mr-3 text-[#F4991A]">{String.fromCharCode(65 + index)}.</span> {option}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className={`p-4 rounded-lg mt-6 animate-fade-in-up ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {isCorrect ? (
                <CheckCircleIcon className="h-6 w-6 text-green-700" />
              ) : (
                <XCircleIcon className="h-6 w-6 text-red-700" />
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-lg font-bold ${isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                {isCorrect ? t('questionCorrect') : t('questionIncorrect')}
              </h3>
              <p className="mt-2 text-[#344F1F]/90">{question.explanation}</p>
            </div>
          </div>
        </div>
      )}
      
      {isAnswered && (
        <button
          onClick={() => onAnswer(isCorrect, selectedAnswer as number)}
          className="w-full mt-6 bg-[#F4991A] text-[#F9F5F0] font-bold py-3 px-6 rounded-lg text-xl hover:bg-[#E08D18] transition-all duration-300 transform hover:scale-105 shadow-lg"
        >
          {t('questionNextButton')}
        </button>
      )}
    </div>
  );
}

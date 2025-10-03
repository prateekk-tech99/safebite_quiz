
import React, { useState, useEffect, useRef } from 'react';
import type { Question } from '../types';
import QuestionCard from './QuestionCard';
import { useTranslation } from '../context/LanguageContext';

interface QuizProps {
  questions: Question[];
  onFinish: (score: number, answers: (number | null)[], timeTaken: number) => void;
}

const TIME_PER_QUESTION = 30; // 30 seconds per question

export default function Quiz({ questions, onFinish }: QuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const { t } = useTranslation();

  const totalTime = questions.length * TIME_PER_QUESTION;
  const [timeLeft, setTimeLeft] = useState(totalTime);
  
  // Using refs to hold the latest state for the timer callback to avoid stale closures.
  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;
  const scoreRef = useRef(score);
  scoreRef.current = score;
  const answersRef = useRef(answers);
  answersRef.current = answers;

  useEffect(() => {
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timerId);
          // Time's up, finish the quiz with the current state.
          onFinishRef.current(scoreRef.current, answersRef.current, totalTime);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [totalTime]);


  const handleNextQuestion = (isCorrect: boolean, selectedAnswer: number) => {
    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore);
    
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      const timeTaken = totalTime - timeLeft;
      onFinish(newScore, newAnswers, timeTaken);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / questions.length) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="w-full">
        <div className="mb-4">
            <div className="flex justify-between items-center text-[#344F1F] mb-2">
                <p className="font-semibold">{t('questionOf', currentQuestionIndex + 1, questions.length)}</p>
                <div className="flex items-center gap-4">
                    <p className="font-semibold">{t('score')}: {score}</p>
                    <p className="font-semibold tabular-nums">{t('timeLeft')}: {minutes}:{seconds.toString().padStart(2, '0')}</p>
                </div>
            </div>
            <div className="w-full bg-[#EAE2CF] rounded-full h-2.5">
                <div 
                    className="bg-[#F4991A] h-2.5 rounded-full transition-all duration-500" 
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

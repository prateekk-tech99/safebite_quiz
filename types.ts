// Fix: Import React to resolve the 'React' namespace used in the Badge interface.
import React from 'react';

export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum AppView {
  DASHBOARD,
  QUIZ_SETUP,
  LOADING,
  QUIZ,
  FINISHED,
}

export enum Difficulty {
  EASY = 'Beginner',
  MEDIUM = 'Intermediate',
  HARD = 'Expert',
}

export enum Language {
  EN = 'English',
  ES = 'Español',
  FR = 'Français',
  HI = 'हिन्दी',
}

export enum Topic {
  GENERAL = 'General Food Safety',
  HACCP = 'HACCP',
  FOOD_MICROBIOLOGY = 'Food Microbiology',
  SANITATION = 'Sanitation',
  HYGIENE = 'Hygiene Standards',
  CHEMISTRY = 'Food Chemistry',
  FSSAI = 'FSSAI Regulations',
  LAWS = 'National & International Food Laws',
}

export type BadgeId = 
  | 'first-quiz' 
  | 'perfect-score' 
  | 'streak-3'
  | 'streak-7'
  | 'haccp-master'
  | 'micro-master'
  | 'sanitation-master'
  | 'general-master'
  | 'hygiene-master'
  | 'chemistry-master'
  | 'fssai-master'
  | 'laws-master';

export interface Badge {
  id: BadgeId;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface UserProgress {
  streak: number;
  lastPlayedDate: string | null;
  badges: BadgeId[];
  scores: {
    [key in Topic]?: { totalCorrect: number; totalAttempted: number };
  };
  questionBank: Question[];
}

export interface OfflineQuiz {
  id: string;
  questions: Question[];
  difficulty: Difficulty;
  topic: Topic;
}

export interface WrongAnswerPayload {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer: string;
}
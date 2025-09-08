
export interface Question {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export enum QuizState {
  LEVEL_SELECTION,
  LOADING,
  ACTIVE,
  FINISHED,
}

export enum Difficulty {
  EASY = 'Beginner',
  MEDIUM = 'Intermediate',
  HARD = 'Expert',
}

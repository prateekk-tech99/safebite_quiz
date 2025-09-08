import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { UserProgress, BadgeId, Topic, OfflineQuiz, Question } from '../types';
import { achievements, checkBadges } from '../lib/achievements';

interface UserProgressState extends UserProgress {
  offlineQuizzes: OfflineQuiz[];
}

type Action =
  | { type: 'SET_STATE'; payload: UserProgressState }
  | { type: 'UPDATE_PROGRESS'; payload: { score: number; total: number; topic: Topic; questions: Question[] } }
  | { type: 'ADD_OFFLINE_QUIZ'; payload: OfflineQuiz }
  | { type: 'REMOVE_OFFLINE_QUIZ'; payload: string };

const initialState: UserProgressState = {
  streak: 0,
  lastPlayedDate: null,
  badges: [],
  scores: {},
  offlineQuizzes: [],
  questionBank: [],
};

const UserProgressContext = createContext<{
  state: UserProgressState;
  updateProgress: (score: number, total: number, topic: Topic, questions: Question[]) => BadgeId[];
  addOfflineQuiz: (quiz: OfflineQuiz) => void;
  removeOfflineQuiz: (id: string) => void;
} | undefined>(undefined);

function progressReducer(state: UserProgressState, action: Action): UserProgressState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'UPDATE_PROGRESS': {
      const { score, total, topic, questions } = action.payload;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      const newStreak = state.lastPlayedDate === yesterday ? state.streak + 1 : 1;

      const newScores = { ...state.scores };
      if (!newScores[topic]) {
        newScores[topic] = { totalCorrect: 0, totalAttempted: 0 };
      }
      newScores[topic]!.totalCorrect += score;
      newScores[topic]!.totalAttempted += total;
      
      const newQuestions = questions.filter(
        q => !(state.questionBank || []).some(bankedQ => bankedQ.question === q.question)
      );
      const newQuestionBank = [...(state.questionBank || []), ...newQuestions];

      const updatedState = {
        ...state,
        streak: newStreak,
        lastPlayedDate: today,
        scores: newScores,
        questionBank: newQuestionBank,
      };

      const unlockedBadges = checkBadges(updatedState, score, total, topic);
      const newBadges = [...new Set([...state.badges, ...unlockedBadges])];
      
      return { ...updatedState, badges: newBadges };
    }
    case 'ADD_OFFLINE_QUIZ':
      return {
        ...state,
        offlineQuizzes: [...state.offlineQuizzes, action.payload],
      };
    case 'REMOVE_OFFLINE_QUIZ':
      return {
        ...state,
        offlineQuizzes: state.offlineQuizzes.filter(q => q.id !== action.payload),
      };
    default:
      return state;
  }
}

export const UserProgressProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(progressReducer, initialState);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('userProgress');
      if (storedState) {
        const parsedState = JSON.parse(storedState);
        // Ensure questionBank is an array even for older saved states
        if (!parsedState.questionBank) {
            parsedState.questionBank = [];
        }
        dispatch({ type: 'SET_STATE', payload: parsedState });
      }
    } catch (error) {
      console.error("Failed to load user progress from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('userProgress', JSON.stringify(state));
    } catch (error) {
      console.error("Failed to save user progress to localStorage", error);
    }
  }, [state]);

  const updateProgress = useCallback((score: number, total: number, topic: Topic, questions: Question[]): BadgeId[] => {
    const oldBadges = new Set(state.badges);
    const action = { type: 'UPDATE_PROGRESS' as const, payload: { score, total, topic, questions } };
    const newState = progressReducer(state, action);
    dispatch(action);
    const newBadges = newState.badges.filter(b => !oldBadges.has(b));
    return newBadges;
  }, [state]);

  const addOfflineQuiz = useCallback((quiz: OfflineQuiz) => {
    dispatch({ type: 'ADD_OFFLINE_QUIZ', payload: quiz });
  }, []);

  const removeOfflineQuiz = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_OFFLINE_QUIZ', payload: id });
  }, []);

  return (
    <UserProgressContext.Provider value={{ state, updateProgress, addOfflineQuiz, removeOfflineQuiz }}>
      {children}
    </UserProgressContext.Provider>
  );
};

export const useUserProgress = () => {
  const context = useContext(UserProgressContext);
  if (!context) {
    throw new Error('useUserProgress must be used within a UserProgressProvider');
  }
  return { ...context.state, ...context };
};
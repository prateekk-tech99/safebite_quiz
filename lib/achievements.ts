import { Badge, BadgeId, UserProgress, Topic } from '../types';
import { BrainIcon } from '../components/icons/BrainIcon';
import { CheckCircleIcon } from '../components/icons/CheckCircleIcon';
import { TrophyIcon } from '../components/icons/TrophyIcon';
import { CalendarIcon } from '../components/icons/CalendarIcon';
import { ClockIcon } from '../components/icons/ClockIcon';

export const achievements: Record<BadgeId, Badge> = {
  'first-quiz': { id: 'first-quiz', name: 'Getting Started', description: 'Complete your first quiz.', icon: BrainIcon },
  'perfect-score': { id: 'perfect-score', name: 'Perfectionist', description: 'Get a perfect score on any quiz.', icon: CheckCircleIcon },
  'streak-3': { id: 'streak-3', name: 'On a Roll', description: 'Maintain a 3-day streak.', icon: CalendarIcon },
  'streak-7': { id: 'streak-7', name: 'Committed Learner', description: 'Maintain a 7-day streak.', icon: TrophyIcon },
  'speed-demon': { id: 'speed-demon', name: 'Speed Demon', description: 'Complete a quiz with an average of 15 seconds or less per question.', icon: ClockIcon },
  'general-master': { id: 'general-master', name: 'Safety Specialist', description: 'Answer 20 General questions correctly.', icon: BrainIcon },
  'haccp-master': { id: 'haccp-master', name: 'HACCP Pro', description: 'Answer 20 HACCP questions correctly.', icon: BrainIcon },
  'micro-master': { id: 'micro-master', name: 'Microbe Hunter', description: 'Answer 20 Food Microbiology questions correctly.', icon: BrainIcon },
  'sanitation-master': { id: 'sanitation-master', name: 'Sanitation Guru', description: 'Answer 20 Sanitation questions correctly.', icon: BrainIcon },
  'hygiene-master': { id: 'hygiene-master', name: 'Hygiene Hero', description: 'Answer 20 Hygiene questions correctly.', icon: BrainIcon },
  'chemistry-master': { id: 'chemistry-master', name: 'Chemistry Whiz', description: 'Answer 20 Food Chemistry questions correctly.', icon: BrainIcon },
  'fssai-master': { id: 'fssai-master', name: 'FSSAI Expert', description: 'Answer 20 FSSAI Regulations questions correctly.', icon: BrainIcon },
  'laws-master': { id: 'laws-master', name: 'Law Scholar', description: 'Answer 20 Food Law questions correctly.', icon: BrainIcon },
};

export function checkBadges(progress: UserProgress, score: number, total: number, topic: Topic, timeTaken: number): BadgeId[] {
  const unlocked: BadgeId[] = [];
  
  // First quiz
  if (!progress.badges.includes('first-quiz')) {
    unlocked.push('first-quiz');
  }

  // Perfect score
  if (score === total && !progress.badges.includes('perfect-score')) {
    unlocked.push('perfect-score');
  }

  // Streaks
  if (progress.streak >= 3 && !progress.badges.includes('streak-3')) {
    unlocked.push('streak-3');
  }
  if (progress.streak >= 7 && !progress.badges.includes('streak-7')) {
    unlocked.push('streak-7');
  }

  // Speed Demon
  if (total > 0) {
    const avgTimePerQuestion = timeTaken / total;
    if (avgTimePerQuestion <= 15 && !progress.badges.includes('speed-demon')) {
      unlocked.push('speed-demon');
    }
  }
  
  // Topic mastery
  const checkTopicMastery = (topicEnum: Topic, badgeId: BadgeId) => {
    if (progress.scores[topicEnum] && progress.scores[topicEnum]!.totalCorrect >= 20 && !progress.badges.includes(badgeId)) {
      unlocked.push(badgeId);
    }
  };

  checkTopicMastery(Topic.GENERAL, 'general-master');
  checkTopicMastery(Topic.HACCP, 'haccp-master');
  checkTopicMastery(Topic.FOOD_MICROBIOLOGY, 'micro-master');
  checkTopicMastery(Topic.SANITATION, 'sanitation-master');
  checkTopicMastery(Topic.HYGIENE, 'hygiene-master');
  checkTopicMastery(Topic.CHEMISTRY, 'chemistry-master');
  checkTopicMastery(Topic.FSSAI, 'fssai-master');
  checkTopicMastery(Topic.LAWS, 'laws-master');

  return unlocked;
}
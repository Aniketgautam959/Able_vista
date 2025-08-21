import User from './User';
import Course from './Course';
import Chapter from './Chapter';
import Lesson from './Lesson';
import Instructor from './Instructor';
import Enrollment from './Enrollment';
import Progress from './Progress';
import Review from './Review';
import UserProfile from './UserProfile';
import { Achievement, UserAchievement } from './Achievement';
import Feedback from './Feedback';

export {
  User,
  Course,
  Chapter,
  Lesson,
  Instructor,
  Enrollment,
  Progress,
  Review,
  UserProfile,
  Achievement,
  UserAchievement,
  Feedback
};

interface IAchievementData {
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'speed' | 'engagement' | 'milestone' | 'special';
  criteria: {
    type: 'courses_completed' | 'lessons_completed' | 'streak_days' | 'total_hours' | 'perfect_scores' | 'first_course' | 'review_given' | 'profile_completed';
    value: number;
  };
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export async function initializeDefaultAchievements(): Promise<void> {
  const defaultAchievements: IAchievementData[] = [
    {
      title: "First Course Completed",
      description: "Completed your first course",
      icon: "Trophy",
      category: "completion",
      criteria: { type: "courses_completed", value: 1 },
      points: 50,
      rarity: "common"
    },
    {
      title: "Week Warrior",
      description: "7-day learning streak",
      icon: "Target",
      category: "streak",
      criteria: { type: "streak_days", value: 7 },
      points: 30,
      rarity: "common"
    },
    {
      title: "Speed Learner",
      description: "Completed 5 lessons in one day",
      icon: "TrendingUp",
      category: "speed",
      criteria: { type: "lessons_completed", value: 5 },
      points: 25,
      rarity: "uncommon"
    },
    {
      title: "Dedicated Student",
      description: "30-day learning streak",
      icon: "Award",
      category: "streak",
      criteria: { type: "streak_days", value: 30 },
      points: 100,
      rarity: "rare"
    },
    {
      title: "Course Master",
      description: "Completed 10 courses",
      icon: "BookOpen",
      category: "completion",
      criteria: { type: "courses_completed", value: 10 },
      points: 200,
      rarity: "epic"
    }
  ];

  try {
    for (const achievementData of defaultAchievements) {
      const existingAchievement = await Achievement.findOne({ 
        title: achievementData.title 
      });
      
      if (!existingAchievement) {
        await Achievement.create(achievementData);
        console.log(`Created achievement: ${achievementData.title}`);
      }
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
}
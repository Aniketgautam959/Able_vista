// Central export file for all models
import User from './User.js';
import Course from './Course.js';
import Chapter from './Chapter.js';
import Lesson from './Lesson.js';
import Instructor from './Instructor.js';
import Enrollment from './Enrollment.js';
import Progress from './Progress.js';
import Review from './Review.js';
import UserProfile from './UserProfile.js';
import { Achievement, UserAchievement } from './Achievement.js';
import Feedback from './Feedback.js';

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

// Helper function to initialize default achievements
export async function initializeDefaultAchievements() {
  const defaultAchievements = [
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
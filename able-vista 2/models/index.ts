import User from './User';
import Course from './Course';
import Chapter from './Chapter';
import Lesson from './Lesson';
import Instructor from './Instructor';
import Enrollment from './Enrollment';
import Progress from './Progress';
import Review from './Review';
import UserProfile from './UserProfile';
import AchievementModel, { UserAchievement } from './Achievement';
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
  AchievementModel as Achievement,
  UserAchievement,
  Feedback
};

interface IAchievementData {
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'milestone';
  criteria: {
    type: 'courses_completed' | 'lessons_completed' | 'streak_days' | 'total_hours';
    value: number;
  };
}

export async function initializeDefaultAchievements(): Promise<void> {
  const defaultAchievements: IAchievementData[] = [
    {
      title: "First Course Completed",
      description: "Completed your first course",
      icon: "Trophy",
      category: "completion",
      criteria: { type: "courses_completed", value: 1 }
    },
    {
      title: "Week Warrior",
      description: "7-day learning streak",
      icon: "Target",
      category: "streak",
      criteria: { type: "streak_days", value: 7 }
    },
    {
      title: "Dedicated Student",
      description: "30-day learning streak",
      icon: "Award",
      category: "streak",
      criteria: { type: "streak_days", value: 30 }
    },
    {
      title: "Course Master",
      description: "Completed 10 courses",
      icon: "BookOpen",
      category: "completion",
      criteria: { type: "courses_completed", value: 10 }
    }
  ];

  try {
    for (const achievementData of defaultAchievements) {
      const existingAchievement = await AchievementModel.findOne({ 
        title: achievementData.title 
      });
      
      if (!existingAchievement) {
        await AchievementModel.create(achievementData);
        console.log(`Created achievement: ${achievementData.title}`);
      }
    }
  } catch (error) {
    console.error('Error initializing achievements:', error);
  }
}
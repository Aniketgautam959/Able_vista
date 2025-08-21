import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICriteria {
  type: 'courses_completed' | 'lessons_completed' | 'streak_days' | 'total_hours' | 'perfect_scores' | 'first_course' | 'review_given' | 'profile_completed';
  value: number;
  comparison: 'gte' | 'lte' | 'eq';
}

export interface IAchievement extends Document {
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'speed' | 'engagement' | 'milestone' | 'special';
  criteria: ICriteria;
  points: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
  createdAt: Date;
}

export interface IUserAchievement extends Document {
  user: Types.ObjectId;
  achievement: Types.ObjectId;
  earnedAt: Date;
  progress: number;
  isCompleted: boolean;
  notified: boolean;
}

export interface IUserAchievementModel extends mongoose.Model<IUserAchievement> {
  checkAchievements(userId: Types.ObjectId): Promise<IAchievement[]>;
}

const achievementSchema = new Schema<IAchievement>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['completion', 'streak', 'speed', 'engagement', 'milestone', 'special']
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: [
        'courses_completed',
        'lessons_completed', 
        'streak_days',
        'total_hours',
        'perfect_scores',
        'first_course',
        'review_given',
        'profile_completed'
      ]
    },
    value: {
      type: Number,
      required: true
    },
    comparison: {
      type: String,
      enum: ['gte', 'lte', 'eq'],
      default: 'gte'
    }
  },
  points: {
    type: Number,
    default: 10,
    min: 1
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const userAchievementSchema = new Schema<IUserAchievement>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievement: {
    type: Schema.Types.ObjectId,
    ref: 'Achievement',
    required: true
  },
  earnedAt: {
    type: Date,
    default: Date.now
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  notified: {
    type: Boolean,
    default: false
  }
});

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

userAchievementSchema.statics.checkAchievements = async function(userId: Types.ObjectId): Promise<IAchievement[]> {
  const UserProfile = mongoose.model('UserProfile');
  const Achievement = mongoose.model('Achievement');
  const UserAchievement = this;
  
  const userProfile = await UserProfile.findOne({ user: userId });
  if (!userProfile) return [];
  
  const achievements = await Achievement.find({ isActive: true });
  const newAchievements: IAchievement[] = [];
  
  for (const achievement of achievements) {
    const existingAchievement = await UserAchievement.findOne({
      user: userId,
      achievement: achievement._id
    });
    
    if (existingAchievement && existingAchievement.isCompleted) {
      continue;
    }
    
    let userValue = 0;
    switch (achievement.criteria.type) {
      case 'courses_completed':
        userValue = userProfile.stats.completedCourses;
        break;
      case 'lessons_completed':
        userValue = userProfile.stats.completedLessons;
        break;
      case 'streak_days':
        userValue = userProfile.stats.currentStreak;
        break;
      case 'total_hours':
        userValue = userProfile.stats.totalHours;
        break;
    }
    
    let qualifies = false;
    switch (achievement.criteria.comparison) {
      case 'gte':
        qualifies = userValue >= achievement.criteria.value;
        break;
      case 'lte':
        qualifies = userValue <= achievement.criteria.value;
        break;
      case 'eq':
        qualifies = userValue === achievement.criteria.value;
        break;
    }
    
    if (qualifies) {
      if (existingAchievement) {
        existingAchievement.isCompleted = true;
        existingAchievement.progress = 100;
        existingAchievement.earnedAt = new Date();
        await existingAchievement.save();
      } else {
        await UserAchievement.create({
          user: userId,
          achievement: achievement._id,
          isCompleted: true,
          progress: 100
        });
      }
      
      newAchievements.push(achievement);
    } else if (!existingAchievement) {
      const progress = Math.min((userValue / achievement.criteria.value) * 100, 100);
      await UserAchievement.create({
        user: userId,
        achievement: achievement._id,
        progress: progress
      });
    }
  }
  
  return newAchievements;
};

const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema);
const UserAchievement = mongoose.models.UserAchievement || mongoose.model<IUserAchievement, IUserAchievementModel>('UserAchievement', userAchievementSchema);

export { Achievement, UserAchievement };
export default Achievement;
import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICriteria {
  type: 'courses_completed' | 'lessons_completed' | 'streak_days' | 'total_hours';
  value: number;
  comparison: 'gte' | 'lte' | 'eq';
}

export interface IAchievement extends Document {
  title: string;
  description: string;
  icon: string;
  category: 'completion' | 'streak' | 'milestone';
  criteria: ICriteria;
  isActive: boolean;
  createdAt: Date;
}

export interface IUserAchievement extends Document {
  user: Types.ObjectId;
  achievement: Types.ObjectId;
  earnedAt: Date;
  isCompleted: boolean;
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
    enum: ['completion', 'streak', 'milestone']
  },
  criteria: {
    type: {
      type: String,
      required: true,
      enum: [
        'courses_completed',
        'lessons_completed', 
        'streak_days',
        'total_hours'
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
  isCompleted: {
    type: Boolean,
    default: false
  }
});

userAchievementSchema.index({ user: 1, achievement: 1 }, { unique: true });

const Achievement = mongoose.models.Achievement || mongoose.model<IAchievement>('Achievement', achievementSchema);
const UserAchievement = mongoose.models.UserAchievement || mongoose.model<IUserAchievement>('UserAchievement', userAchievementSchema);

export { Achievement, UserAchievement };
export default Achievement;
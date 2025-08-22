import mongoose, { Document, Schema, Types } from 'mongoose';

interface ISocialLinks {
  linkedin?: string;
  github?: string;
  twitter?: string;
  portfolio?: string;
}

interface IPreferences {
  showProfile: boolean;
  showProgress: boolean;
}

interface IUserStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  totalLessons: number;
  completedLessons: number;
  totalHours: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: Date;
}

export interface IUserProfile extends Document {
  user: Types.ObjectId;
  bio?: string;
  avatar: string;
  location?: string;
  timezone: string;
  learningGoal?: string;
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredLearningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  socialLinks: ISocialLinks;
  preferences: IPreferences;
  stats: IUserStats;
  createdAt: Date;
  updatedAt: Date;
  calculateStats(): Promise<void>;
  updateStreak(): Promise<void>;
}

const userProfileSchema = new Schema<IUserProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  bio: {
    type: String,
    maxlength: 500
  },
  avatar: {
    type: String,
    default: '/placeholder-user.jpg'
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  learningGoal: {
    type: String,
    trim: true,
    maxlength: 200
  },
  interests: [{
    type: String,
    trim: true
  }],
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  preferredLearningStyle: {
    type: String,
    enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
    default: 'visual'
  },
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  preferences: {
    showProfile: {
      type: Boolean,
      default: true
    },
    showProgress: {
      type: Boolean,
      default: true
    }
  },
  stats: {
    totalCourses: {
      type: Number,
      default: 0
    },
    completedCourses: {
      type: Number,
      default: 0
    },
    inProgressCourses: {
      type: Number,
      default: 0
    },
    totalLessons: {
      type: Number,
      default: 0
    },
    completedLessons: {
      type: Number,
      default: 0
    },
    totalHours: {
      type: Number,
      default: 0
    },
    currentStreak: {
      type: Number,
      default: 0
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

userProfileSchema.methods.calculateStats = async function(): Promise<void> {
  const Enrollment = mongoose.model('Enrollment');
  const Progress = mongoose.model('Progress');
  
  const enrollments = await Enrollment.find({ user: this.user });
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const inProgressEnrollments = enrollments.filter(e => e.status === 'active');
  
  const allProgress = await Progress.find({ user: this.user });
  const completedLessons = allProgress.filter(p => p.status === 'completed');
  
  const totalMinutes = allProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
  const totalHours = Math.round(totalMinutes / 60);
  
  this.stats.totalCourses = enrollments.length;
  this.stats.completedCourses = completedEnrollments.length;
  this.stats.inProgressCourses = inProgressEnrollments.length;
  this.stats.totalLessons = allProgress.length;
  this.stats.completedLessons = completedLessons.length;
  this.stats.totalHours = totalHours;
  
  await this.save();
};

userProfileSchema.methods.updateStreak = async function(): Promise<void> {
  const Progress = mongoose.model('Progress');
  
  const recentActivity = await Progress.find({
    user: this.user,
    status: 'completed',
    completedAt: { $exists: true }
  }).sort({ completedAt: -1 });
  
  if (recentActivity.length === 0) {
    this.stats.currentStreak = 0;
    return;
  }
  
  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < recentActivity.length; i++) {
    const activityDate = new Date(recentActivity[i].completedAt);
    activityDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff > currentStreak) {
      break;
    }
  }
  
  this.stats.currentStreak = currentStreak;
  
  if (currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = currentStreak;
  }
  
  this.stats.lastActivityDate = new Date();
  await this.save();
};

export default mongoose.models.UserProfile || mongoose.model<IUserProfile>('UserProfile', userProfileSchema);
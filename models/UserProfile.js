import mongoose from 'mongoose';

const userProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
    emailNotifications: {
      courseUpdates: {
        type: Boolean,
        default: true
      },
      newCourses: {
        type: Boolean,
        default: true
      },
      achievements: {
        type: Boolean,
        default: true
      },
      reminders: {
        type: Boolean,
        default: true
      }
    },
    privacy: {
      showProfile: {
        type: Boolean,
        default: true
      },
      showProgress: {
        type: Boolean,
        default: true
      },
      showAchievements: {
        type: Boolean,
        default: true
      }
    },
    accessibility: {
      textToSpeech: {
        type: Boolean,
        default: false
      },
      speechToText: {
        type: Boolean,
        default: false
      },
      highContrast: {
        type: Boolean,
        default: false
      },
      fontSize: {
        type: String,
        enum: ['small', 'medium', 'large'],
        default: 'medium'
      }
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
    certificates: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },
  achievements: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
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
  this.updatedAt = Date.now();
  next();
});

// Calculate user statistics
userProfileSchema.methods.calculateStats = async function() {
  const Enrollment = mongoose.model('Enrollment');
  const Progress = mongoose.model('Progress');
  
  // Get enrollment stats
  const enrollments = await Enrollment.find({ user: this.user });
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');
  const inProgressEnrollments = enrollments.filter(e => e.status === 'active');
  
  // Get lesson progress stats
  const allProgress = await Progress.find({ user: this.user });
  const completedLessons = allProgress.filter(p => p.status === 'completed');
  
  // Calculate total time spent
  const totalMinutes = allProgress.reduce((sum, progress) => sum + progress.timeSpent, 0);
  const totalHours = Math.round(totalMinutes / 60);
  
  // Update stats
  this.stats.totalCourses = enrollments.length;
  this.stats.completedCourses = completedEnrollments.length;
  this.stats.inProgressCourses = inProgressEnrollments.length;
  this.stats.totalLessons = allProgress.length;
  this.stats.completedLessons = completedLessons.length;
  this.stats.totalHours = totalHours;
  
  await this.save();
};

// Update learning streak
userProfileSchema.methods.updateStreak = async function() {
  const Progress = mongoose.model('Progress');
  
  // Get recent activity (lessons completed in last few days)
  const recentActivity = await Progress.find({
    user: this.user,
    status: 'completed',
    completedAt: { $exists: true }
  }).sort({ completedAt: -1 });
  
  if (recentActivity.length === 0) {
    this.stats.currentStreak = 0;
    return;
  }
  
  // Calculate current streak
  let currentStreak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < recentActivity.length; i++) {
    const activityDate = new Date(recentActivity[i].completedAt);
    activityDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate - activityDate) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === currentStreak) {
      currentStreak++;
    } else if (daysDiff > currentStreak) {
      break;
    }
  }
  
  this.stats.currentStreak = currentStreak;
  
  // Update longest streak if current is higher
  if (currentStreak > this.stats.longestStreak) {
    this.stats.longestStreak = currentStreak;
  }
  
  this.stats.lastActivityDate = new Date();
  await this.save();
};

export default mongoose.models.UserProfile || mongoose.model('UserProfile', userProfileSchema);
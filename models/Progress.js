import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lesson',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  timeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  lastPosition: {
    type: Number,
    default: 0 // for video lessons, track last watched position in seconds
  },
  attempts: [{
    attemptNumber: Number,
    score: Number,
    maxScore: Number,
    answers: mongoose.Schema.Types.Mixed, // for quiz answers
    submittedAt: {
      type: Date,
      default: Date.now
    },
    feedback: String
  }],
  bestScore: {
    type: Number,
    default: 0
  },
  notes: [{
    content: String,
    timestamp: Number, // for video lessons
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  bookmarks: [{
    title: String,
    timestamp: Number,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  startedAt: Date,
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, status: 1 });

// Update last accessed time before saving
progressSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

// Mark lesson as completed
progressSchema.methods.markCompleted = function() {
  this.status = 'completed';
  this.completionPercentage = 100;
  this.completedAt = new Date();
  if (!this.startedAt) {
    this.startedAt = new Date();
  }
};

// Add attempt (for quizzes/assignments)
progressSchema.methods.addAttempt = function(score, maxScore, answers = null, feedback = null) {
  const attemptNumber = this.attempts.length + 1;
  
  this.attempts.push({
    attemptNumber,
    score,
    maxScore,
    answers,
    submittedAt: new Date(),
    feedback
  });
  
  // Update best score
  if (score > this.bestScore) {
    this.bestScore = score;
  }
  
  // Mark as completed if passing score is achieved
  const passingPercentage = 70; // Can be made configurable
  const scorePercentage = (score / maxScore) * 100;
  
  if (scorePercentage >= passingPercentage) {
    this.markCompleted();
  } else {
    this.status = 'in_progress';
    this.completionPercentage = scorePercentage;
  }
};

export default mongoose.models.Progress || mongoose.model('Progress', progressSchema);
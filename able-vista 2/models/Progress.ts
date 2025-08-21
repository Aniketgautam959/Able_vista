import mongoose, { Document, Schema, Types } from 'mongoose';

interface IAttempt {
  attemptNumber: number;
  score: number;
  maxScore: number;
  answers?: any;
  submittedAt: Date;
  feedback?: string;
}

interface INote {
  content: string;
  timestamp?: number;
  createdAt: Date;
}

interface IBookmark {
  title: string;
  timestamp?: number;
  createdAt: Date;
}

export interface IProgress extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  lesson: Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  timeSpent: number;
  lastPosition: number;
  attempts: IAttempt[];
  bestScore: number;
  notes: INote[];
  bookmarks: IBookmark[];
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  markCompleted(): void;
  addAttempt(score: number, maxScore: number, answers?: any, feedback?: string): void;
}

const progressSchema = new Schema<IProgress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    type: Schema.Types.ObjectId,
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
    default: 0
  },
  lastPosition: {
    type: Number,
    default: 0
  },
  attempts: [{
    attemptNumber: Number,
    score: Number,
    maxScore: Number,
    answers: Schema.Types.Mixed,
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
    timestamp: Number,
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

progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, course: 1 });
progressSchema.index({ user: 1, status: 1 });

progressSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

progressSchema.methods.markCompleted = function(): void {
  this.status = 'completed';
  this.completionPercentage = 100;
  this.completedAt = new Date();
  if (!this.startedAt) {
    this.startedAt = new Date();
  }
};

progressSchema.methods.addAttempt = function(
  score: number, 
  maxScore: number, 
  answers: any = null, 
  feedback: string | null = null
): void {
  const attemptNumber = this.attempts.length + 1;
  
  this.attempts.push({
    attemptNumber,
    score,
    maxScore,
    answers,
    submittedAt: new Date(),
    feedback
  });
  
  if (score > this.bestScore) {
    this.bestScore = score;
  }
  
  const passingPercentage = 70;
  const scorePercentage = (score / maxScore) * 100;
  
  if (scorePercentage >= passingPercentage) {
    this.markCompleted();
  } else {
    this.status = 'in_progress';
    this.completionPercentage = scorePercentage;
  }
};

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', progressSchema);
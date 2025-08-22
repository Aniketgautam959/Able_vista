import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProgress extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  lesson: Types.ObjectId;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  timeSpent: number;
  lastPosition: number;
  bestScore: number;
  startedAt?: Date;
  completedAt?: Date;
  lastAccessedAt: Date;
  markCompleted(): void;
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
  bestScore: {
    type: Number,
    default: 0
  },
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

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', progressSchema);
import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProgress extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  lesson: Types.ObjectId;
  bestScore: number;
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
  bestScore: {
    type: Number,
    default: 0
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  }
});

progressSchema.index({ user: 1, course: 1, lesson: 1 }, { unique: true });
progressSchema.index({ user: 1, course: 1 });

progressSchema.pre('save', function(next) {
  this.lastAccessedAt = new Date();
  next();
});

progressSchema.methods.markCompleted = function(): void {
  // Simplified completion marking - just update lastAccessedAt
  this.lastAccessedAt = new Date();
};

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', progressSchema);
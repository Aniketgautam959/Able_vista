import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IFeedback extends Document {
  user: Types.ObjectId;
  type: 'course' | 'lesson' | 'platform' | 'instructor' | 'bug_report' | 'feature_request';
  course?: Types.ObjectId;
  lesson?: Types.ObjectId;
  instructor?: Types.ObjectId;
  title: string;
  description: string;
  category: 'content_quality' | 'technical_issue' | 'user_experience' | 'suggestion' | 'complaint' | 'praise' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['course', 'lesson', 'platform', 'instructor', 'bug_report', 'feature_request']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course'
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'content_quality',
      'technical_issue',
      'user_experience',
      'suggestion',
      'complaint',
      'praise',
      'other'
    ],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
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

feedbackSchema.index({ user: 1, type: 1 });
feedbackSchema.index({ status: 1, priority: -1 });

feedbackSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);
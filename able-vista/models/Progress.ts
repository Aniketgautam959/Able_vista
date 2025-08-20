import mongoose, { Document, Schema } from 'mongoose'

export interface IProgress extends Document {
  user: mongoose.Types.ObjectId
  lesson: mongoose.Types.ObjectId
  status: 'not_started' | 'in_progress' | 'completed'
  score: number
  timeSpentSec: number
  createdAt: Date
  updatedAt: Date
}

const ProgressSchema = new Schema<IProgress>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  lesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson',
    required: [true, 'Lesson is required']
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  score: {
    type: Number,
    min: 0,
    max: 100
  },
  timeSpentSec: {
    type: Number
  }
}, {
  timestamps: true
})

// Create unique compound index for user and lesson
ProgressSchema.index({ user: 1, lesson: 1 }, { unique: true })

export default mongoose.models.Progress || mongoose.model<IProgress>('Progress', ProgressSchema)

import mongoose, { Document, Schema } from 'mongoose'

export interface IEnrollment extends Document {
  user: mongoose.Types.ObjectId
  course: mongoose.Types.ObjectId
  status: 'enrolled' | 'completed' | 'withdrawn'
  enrolledAt: Date
  completedAt: Date | null
  withdrawnAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const EnrollmentSchema = new Schema<IEnrollment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  status: {
    type: String,
    enum: ['enrolled', 'completed', 'withdrawn'],
    default: 'enrolled'
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  withdrawnAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// Create unique compound index for user and course
EnrollmentSchema.index({ user: 1, course: 1 }, { unique: true })

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema)

import mongoose, { Document, Schema } from 'mongoose'

export interface ICourse extends Document {
  title: string
  summary: string
  createdAt: Date
  updatedAt: Date
}

const CourseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  summary: {
    type: String,
    default: '',
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema)

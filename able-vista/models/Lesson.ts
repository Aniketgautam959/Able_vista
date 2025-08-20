import mongoose, { Document, Schema } from 'mongoose'

export interface ILesson extends Document {
  course: mongoose.Types.ObjectId
  title: string
  content: string
  readingLevel: number
  youtubeVideoLink: string
  notesLink: string
  index: number
  createdAt: Date
  updatedAt: Date
}

const LessonSchema = new Schema<ILesson>({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    default: '',
    trim: true
  },
  readingLevel: {
    type: Number,
    default: 1
  },
  youtubeVideoLink: {
    type: String,
    default: '',
    trim: true
  },
  notesLink: {
    type: String,
    default: '',
    trim: true
  },
  index: {
    type: Number,
    required: [true, 'Index is required'],
    min: 1
  }
}, {
  timestamps: true
})

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', LessonSchema)

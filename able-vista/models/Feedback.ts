import mongoose, { Document, Schema } from 'mongoose'

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId
  text: string
  rating: number
  category: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  text: {
    type: String,
    required: [true, 'Feedback text is required'],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  category: {
    type: String,
    default: 'general',
    trim: true
  }
}, {
  timestamps: true
})

export default mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema)

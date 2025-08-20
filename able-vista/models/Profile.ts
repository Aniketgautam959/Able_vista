import mongoose, { Document, Schema } from 'mongoose'

export interface IProfile extends Document {
  user: mongoose.Types.ObjectId
  neurotype: 'ADHD' | 'Autism' | 'Aphasia' | 'Other'
  prefs: {
    lowSensory: boolean
    ttsSpeed: number
    font: string
  }
  createdAt: Date
  updatedAt: Date
}

const ProfileSchema = new Schema<IProfile>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required'],
    unique: true
  },
  neurotype: {
    type: String,
    enum: ['ADHD', 'Autism', 'Aphasia', 'Other'],
    default: 'Other'
  },
  prefs: {
    lowSensory: {
      type: Boolean,
      default: false
    },
    ttsSpeed: {
      type: Number,
      default: 1.0
    },
    font: {
      type: String,
      default: 'system'
    }
  }
}, {
  timestamps: true
})

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema)

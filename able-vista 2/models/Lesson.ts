import mongoose, { Document, Schema, Types } from 'mongoose';

interface IAttachment {
  name: string;
  url: string;
  type: string;
}

interface ILessonContent {
  videoUrl?: string;
  textContent?: string;
  attachments?: IAttachment[];
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  chapter: Types.ObjectId;
  course: Types.ObjectId;
  order: number;
  type: 'video' | 'reading' | 'project';
  duration: string;
  durationMinutes: number;
  content: ILessonContent;
  isPublished: boolean;
  isFree: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const lessonSchema = new Schema<ILesson>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  chapter: {
    type: Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  order: {
    type: Number,
    required: true,
    min: 1
  },
  type: {
    type: String,
    required: true,
    enum: ['video', 'reading', 'project']
  },
  duration: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  content: {
    videoUrl: {
      type: String,
      validate: {
        validator: function(this: ILesson, v: string) {
          return this.type !== 'video' || (v && v.length > 0);
        },
        message: 'Video URL is required for video lessons'
      }
    },
    textContent: String,
    attachments: [{
      name: String,
      url: String,
      type: String
    }]
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isFree: {
    type: Boolean,
    default: false
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

lessonSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Lesson || mongoose.model<ILesson>('Lesson', lessonSchema);
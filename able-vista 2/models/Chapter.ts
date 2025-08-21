import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChapter extends Document {
  title: string;
  description?: string;
  course: Types.ObjectId;
  order: number;
  duration: string;
  lessons: Types.ObjectId[];
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const chapterSchema = new Schema<IChapter>({
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
  duration: {
    type: String,
    required: true
  },
  lessons: [{
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  }],
  isPublished: {
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

chapterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', chapterSchema);
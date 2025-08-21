import mongoose, { Document, Schema, Types } from 'mongoose';

interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface IQuiz {
  questions: IQuizQuestion[];
  passingScore: number;
}

interface IAssignment {
  instructions: string;
  submissionType: 'text' | 'file' | 'url' | 'code';
  maxScore: number;
}

interface ILessonContent {
  videoUrl?: string;
  textContent?: string;
  quiz?: IQuiz;
  assignment?: IAssignment;
}

export interface ILesson extends Document {
  title: string;
  description?: string;
  chapter: Types.ObjectId;
  course: Types.ObjectId;
  order: number;
  type: 'video' | 'assignment' | 'quiz' | 'reading' | 'project';
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
    enum: ['video', 'assignment', 'quiz', 'reading', 'project']
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
    quiz: {
      questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String
      }],
      passingScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 70
      }
    },
    assignment: {
      instructions: String,
      submissionType: {
        type: String,
        enum: ['text', 'file', 'url', 'code']
      },
      maxScore: {
        type: Number,
        default: 100
      }
    }
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
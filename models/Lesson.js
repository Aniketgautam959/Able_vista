import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema({
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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chapter',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
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
    required: true // e.g., "15 min", "45 min"
  },
  durationMinutes: {
    type: Number,
    required: true // duration in minutes for calculations
  },
  content: {
    videoUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return this.type !== 'video' || (v && v.length > 0);
        },
        message: 'Video URL is required for video lessons'
      }
    },
    textContent: String,
    attachments: [{
      name: String,
      url: String,
      type: String // pdf, doc, etc.
    }],
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
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
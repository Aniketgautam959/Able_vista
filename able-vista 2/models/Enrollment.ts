import mongoose, { Document, Schema, Types } from 'mongoose';

interface ICompletedLesson {
  lesson: Types.ObjectId;
  completedAt: Date;
  score?: number;
  timeSpent?: number;
}

export interface IEnrollment extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  status: 'active' | 'completed' | 'dropped' | 'paused';
  progress: number;
  completedLessons: ICompletedLesson[];
  totalTimeSpent: number;
  currentLesson?: Types.ObjectId;
  lastAccessedAt: Date;
  enrolledAt: Date;
  completedAt?: Date;
  certificateIssued: boolean;
  certificateUrl?: string;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentId?: string;
  amountPaid?: number;
  calculateProgress(): Promise<void>;
  completeLesson(lessonId: Types.ObjectId, score?: number, timeSpent?: number): Promise<void>;
}

const enrollmentSchema = new Schema<IEnrollment>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'paused'],
    default: 'active'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: [{
    lesson: {
      type: Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number,
    timeSpent: Number
  }],
  totalTimeSpent: {
    type: Number,
    default: 0
  },
  currentLesson: {
    type: Schema.Types.ObjectId,
    ref: 'Lesson'
  },
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateUrl: String,
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  amountPaid: Number
});

enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

enrollmentSchema.methods.calculateProgress = async function(): Promise<void> {
  const Lesson = mongoose.model('Lesson');
  
  const totalLessons = await Lesson.countDocuments({ 
    course: this.course, 
    isPublished: true 
  });
  
  if (totalLessons === 0) {
    this.progress = 0;
    return;
  }
  
  const completedCount = this.completedLessons.length;
  this.progress = Math.round((completedCount / totalLessons) * 100);
  
  if (this.progress === 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
};

enrollmentSchema.methods.completeLesson = async function(
  lessonId: Types.ObjectId, 
  score?: number, 
  timeSpent: number = 0
): Promise<void> {
  const existingCompletion = this.completedLessons.find(
    (completion: ICompletedLesson) => completion.lesson.toString() === lessonId.toString()
  );
  
  if (!existingCompletion) {
    this.completedLessons.push({
      lesson: lessonId,
      completedAt: new Date(),
      score: score,
      timeSpent: timeSpent
    });
    
    this.totalTimeSpent += timeSpent;
    this.lastAccessedAt = new Date();
    
    await this.calculateProgress();
  }
};

export default mongoose.models.Enrollment || mongoose.model<IEnrollment>('Enrollment', enrollmentSchema);
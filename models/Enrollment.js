import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    completedAt: {
      type: Date,
      default: Date.now
    },
    score: Number, // for quizzes/assignments
    timeSpent: Number // in minutes
  }],
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  currentLesson: {
    type: mongoose.Schema.Types.ObjectId,
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

// Compound index to ensure one enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Calculate progress based on completed lessons
enrollmentSchema.methods.calculateProgress = async function() {
  const Lesson = mongoose.model('Lesson');
  
  // Get total lessons in the course
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
  
  // Update status based on progress
  if (this.progress === 100 && this.status === 'active') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  await this.save();
};

// Mark lesson as completed
enrollmentSchema.methods.completeLesson = async function(lessonId, score = null, timeSpent = 0) {
  // Check if lesson is already completed
  const existingCompletion = this.completedLessons.find(
    completion => completion.lesson.toString() === lessonId.toString()
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

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
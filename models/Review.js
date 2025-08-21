import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: 200
  }],
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  votedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isHelpful: Boolean,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  moderationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  moderationNotes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one review per user per course
reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ instructor: 1, rating: -1 });

reviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update course and instructor ratings after review changes
reviewSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const Instructor = mongoose.model('Instructor');
  
  const course = await Course.findById(this.course);
  const instructor = await Instructor.findById(this.instructor);
  
  if (course) {
    await course.calculateAverageRating();
  }
  
  if (instructor) {
    await instructor.calculateStats();
  }
});

reviewSchema.post('remove', async function() {
  const Course = mongoose.model('Course');
  const Instructor = mongoose.model('Instructor');
  
  const course = await Course.findById(this.course);
  const instructor = await Instructor.findById(this.instructor);
  
  if (course) {
    await course.calculateAverageRating();
  }
  
  if (instructor) {
    await instructor.calculateStats();
  }
});

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);
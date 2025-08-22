import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IReview extends Document {
  user: Types.ObjectId;
  course: Types.ObjectId;
  instructor: Types.ObjectId;
  rating: number;
  title?: string;
  comment: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
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
  instructor: {
    type: Schema.Types.ObjectId,
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
  isPublished: {
    type: Boolean,
    default: true
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

reviewSchema.index({ user: 1, course: 1 }, { unique: true });
reviewSchema.index({ course: 1, rating: -1 });
reviewSchema.index({ instructor: 1, rating: -1 });

reviewSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

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

export default mongoose.models.Review || mongoose.model<IReview>('Review', reviewSchema);
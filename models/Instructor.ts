import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IInstructor extends Document {
  user: Types.ObjectId;
  title: string;
  company?: string;
  bio?: string;
  expertise: string[];
  avatar: string;
  rating: number;
  totalStudents: number;
  totalCourses: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  calculateStats(): Promise<void>;
}

const instructorSchema = new Schema<IInstructor>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 2000
  },
  expertise: [{
    type: String,
    trim: true
  }],
  avatar: {
    type: String,
    default: '/placeholder-user.jpg'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  totalCourses: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
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

instructorSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

instructorSchema.methods.calculateStats = async function(): Promise<void> {
  const Course = mongoose.model('Course');
  const Enrollment = mongoose.model('Enrollment');
  const Review = mongoose.model('Review');

  const totalCourses = await Course.countDocuments({ instructor: this._id, isPublished: true });
  
  const courses = await Course.find({ instructor: this._id }).select('_id');
  const courseIds = courses.map(course => course._id);
  
  const totalStudents = await Enrollment.distinct('user', { course: { $in: courseIds } });
  
  const ratingStats = await Review.aggregate([
    { $match: { course: { $in: courseIds } } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  this.totalCourses = totalCourses;
  this.totalStudents = totalStudents.length;
  
  if (ratingStats.length > 0) {
    this.rating = Math.round(ratingStats[0].averageRating * 10) / 10;
    this.totalReviews = ratingStats[0].totalReviews;
  }

  await this.save();
};

export default mongoose.models.Instructor || mongoose.model<IInstructor>('Instructor', instructorSchema);
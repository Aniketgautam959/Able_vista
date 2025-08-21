import mongoose from 'mongoose';

const instructorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
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
  experience: {
    type: String, // e.g., "8+ years"
    maxlength: 50
  },
  avatar: {
    type: String,
    default: '/placeholder-user.jpg'
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
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
  this.updatedAt = Date.now();
  next();
});

// Calculate instructor stats
instructorSchema.methods.calculateStats = async function() {
  const Course = mongoose.model('Course');
  const Enrollment = mongoose.model('Enrollment');
  const Review = mongoose.model('Review');

  // Get total courses
  const totalCourses = await Course.countDocuments({ instructor: this._id, isPublished: true });
  
  // Get total students (unique enrollments across all courses)
  const courses = await Course.find({ instructor: this._id }).select('_id');
  const courseIds = courses.map(course => course._id);
  
  const totalStudents = await Enrollment.distinct('user', { course: { $in: courseIds } });
  
  // Get average rating from course reviews
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

export default mongoose.models.Instructor || mongoose.model('Instructor', instructorSchema);
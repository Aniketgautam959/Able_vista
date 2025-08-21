import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  category: 'Web Development' | 'AI' | 'Design' | 'Data Science' | 'Mobile Development' | 'DevOps' | 'Other';
  instructor: Types.ObjectId;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  price: number;
  duration: string;
  estimatedHours: number;
  image: string;
  skills: string[];
  requirements: string[];
  whatYouLearn: string[];
  rating: number;
  totalReviews: number;
  totalStudents: number;
  isPublished: boolean;
  chapters: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
  calculateAverageRating(): Promise<void>;
}

const courseSchema = new Schema<ICourse>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'AI', 'Design', 'Data Science', 'Mobile Development', 'DevOps', 'Other']
  },
  instructor: {
    type: Schema.Types.ObjectId,
    ref: 'Instructor',
    required: true
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: String,
    required: true
  },
  estimatedHours: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String,
    default: 'from-blue-500 to-purple-600'
  },
  skills: [{
    type: String,
    trim: true
  }],
  requirements: [{
    type: String,
    trim: true
  }],
  whatYouLearn: [{
    type: String,
    trim: true
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  totalStudents: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  chapters: [{
    type: Schema.Types.ObjectId,
    ref: 'Chapter'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

courseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

courseSchema.methods.calculateAverageRating = async function(): Promise<void> {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { course: this._id } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }

  await this.save();
};

export default mongoose.models.Course || mongoose.model<ICourse>('Course', courseSchema);
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['course', 'lesson', 'platform', 'instructor', 'bug_report', 'feature_request']
  },
  relatedTo: {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course'
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson'
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Instructor'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  category: {
    type: String,
    enum: [
      'content_quality',
      'technical_issue',
      'user_experience',
      'accessibility',
      'performance',
      'suggestion',
      'complaint',
      'praise',
      'other'
    ],
    default: 'other'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed', 'duplicate'],
    default: 'open'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  browserInfo: {
    userAgent: String,
    platform: String,
    language: String,
    screenResolution: String
  },
  adminResponse: {
    message: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },
  internalNotes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  isPublic: {
    type: Boolean,
    default: false
  },
  upvotes: {
    type: Number,
    default: 0
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  resolvedAt: Date
});

feedbackSchema.index({ user: 1, type: 1 });
feedbackSchema.index({ status: 1, priority: -1 });
feedbackSchema.index({ type: 1, category: 1 });

feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  if (this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  next();
});

// Add upvote
feedbackSchema.methods.addUpvote = function(userId) {
  if (!this.upvotedBy.includes(userId)) {
    this.upvotedBy.push(userId);
    this.upvotes += 1;
  }
};

// Remove upvote
feedbackSchema.methods.removeUpvote = function(userId) {
  const index = this.upvotedBy.indexOf(userId);
  if (index > -1) {
    this.upvotedBy.splice(index, 1);
    this.upvotes -= 1;
  }
};

export default mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);
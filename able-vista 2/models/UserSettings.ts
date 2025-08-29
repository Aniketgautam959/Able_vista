import mongoose, { Document, Schema, Types } from 'mongoose';

interface INotifications {
  email: boolean;
  push: boolean;
  courseUpdates: boolean;
  achievementAlerts: boolean;
  weeklyReports: boolean;
}

interface IPrivacy {
  profileVisibility: 'public' | 'private' | 'friends';
  showProgress: boolean;
  showAchievements: boolean;
}

interface IAccessibility {
  textToSpeech: {
    enabled: boolean;
    rate: number;
    pitch: number;
    voice: string;
  };
  fontSize: {
    base: number;
    headings: number;
    body: number;
  };
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  reducedMotion: boolean;
  focusIndicator: boolean;
}

export interface IUserSettings extends Document {
  user: Types.ObjectId;
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  notifications: INotifications;
  privacy: IPrivacy;
  accessibility: IAccessibility;
  createdAt: Date;
  updatedAt: Date;
}

const notificationsSchema = new Schema<INotifications>({
  email: {
    type: Boolean,
    default: true
  },
  push: {
    type: Boolean,
    default: true
  },
  courseUpdates: {
    type: Boolean,
    default: true
  },
  achievementAlerts: {
    type: Boolean,
    default: true
  },
  weeklyReports: {
    type: Boolean,
    default: false
  }
});

const privacySchema = new Schema<IPrivacy>({
  profileVisibility: {
    type: String,
    enum: ['public', 'private', 'friends'],
    default: 'public'
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showAchievements: {
    type: Boolean,
    default: true
  }
});

const accessibilitySchema = new Schema<IAccessibility>({
  textToSpeech: {
    enabled: {
      type: Boolean,
      default: false
    },
    rate: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2
    },
    pitch: {
      type: Number,
      default: 1,
      min: 0.5,
      max: 2
    },
    voice: {
      type: String,
      default: 'default'
    }
  },
  fontSize: {
    base: {
      type: Number,
      default: 16,
      min: 12,
      max: 24
    },
    headings: {
      type: Number,
      default: 20,
      min: 16,
      max: 32
    },
    body: {
      type: Number,
      default: 16,
      min: 12,
      max: 24
    }
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  highContrast: {
    type: Boolean,
    default: false
  },
  reducedMotion: {
    type: Boolean,
    default: false
  },
  focusIndicator: {
    type: Boolean,
    default: true
  }
});

const userSettingsSchema = new Schema<IUserSettings>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  language: {
    type: String,
    default: 'en'
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  notifications: {
    type: notificationsSchema,
    default: () => ({})
  },
  privacy: {
    type: privacySchema,
    default: () => ({})
  },
  accessibility: {
    type: accessibilitySchema,
    default: () => ({})
  }
}, {
  timestamps: true
});

export default mongoose.models.UserSettings || mongoose.model<IUserSettings>('UserSettings', userSettingsSchema);

import mongoose, { Document, Schema } from 'mongoose';

export interface IAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  metadata?: {
    grade?: string;
    location?: string;
    count?: number;
    date?: Date;
    [key: string]: any;
  };
  createdAt: Date;
  updatedAt: Date;
}

const AchievementSchema = new Schema<IAchievement>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'first_climb',
      'first_send',
      'grade_milestone',
      'session_streak',
      'location_explorer',
      'social_climber',
      'consistency',
      'variety',
      'project_completion',
      'onsight',
      'flash',
      'personal_best'
    ]
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  unlockedAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
AchievementSchema.index({ userId: 1, type: 1 });
AchievementSchema.index({ userId: 1, unlockedAt: -1 });
AchievementSchema.index({ userId: 1, type: 1, unlockedAt: -1 });

export const Achievement = mongoose.model<IAchievement>('Achievement', AchievementSchema); 
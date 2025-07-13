import mongoose, { Document, Schema } from 'mongoose';

export interface IClimbingSession extends Document {
  userId: mongoose.Types.ObjectId;
  date: Date;
  location: string;
  climbingType: 'bouldering' | 'sport' | 'trad' | 'gym' | 'outdoor';
  routes: {
    name?: string;
    grade: string;
    type: 'bouldering' | 'sport' | 'trad';
    status: 'sent' | 'project' | 'attempted' | 'onsight' | 'flash';
    attempts?: number;
    notes?: string;
  }[];
  duration: number; // in minutes
  notes?: string;
  partners?: string[];
  weather?: string;
  conditions?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClimbingSessionSchema = new Schema<IClimbingSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  climbingType: {
    type: String,
    enum: ['bouldering', 'sport', 'trad', 'gym', 'outdoor'],
    required: true
  },
  routes: [{
    name: {
      type: String,
      trim: true,
      maxlength: 100
    },
    grade: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['bouldering', 'sport', 'trad'],
      required: true
    },
    status: {
      type: String,
      enum: ['sent', 'project', 'attempted', 'onsight', 'flash'],
      required: true
    },
    attempts: {
      type: Number,
      min: 1,
      default: 1
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }],
  duration: {
    type: Number,
    required: true,
    min: 1,
    max: 1440 // 24 hours in minutes
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  partners: [{
    type: String,
    trim: true,
    maxlength: 100
  }],
  weather: {
    type: String,
    trim: true,
    maxlength: 100
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: 200
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
ClimbingSessionSchema.index({ userId: 1, date: -1 });
ClimbingSessionSchema.index({ userId: 1, climbingType: 1 });
ClimbingSessionSchema.index({ userId: 1, location: 1 });

export const ClimbingSession = mongoose.model<IClimbingSession>('ClimbingSession', ClimbingSessionSchema); 
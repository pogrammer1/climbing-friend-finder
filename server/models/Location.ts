import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  name: string;
  type: 'gym' | 'outdoor' | 'crag' | 'boulder_field';
  address: string;
  city: string;
  state: string;
  country: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  description?: string;
  website?: string;
  phone?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  };
  amenities?: string[]; // ['parking', 'showers', 'rentals', 'cafe', 'shop']
  climbingTypes: string[]; // ['bouldering', 'sport', 'trad', 'top-rope']
  difficultyRange?: {
    min: string;
    max: string;
  };
  isActive: boolean;
  addedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  type: {
    type: String,
    enum: ['gym', 'outdoor', 'crag', 'boulder_field'],
    required: true
  },
  address: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  city: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  country: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
    default: 'USA'
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  website: {
    type: String,
    trim: true,
    maxlength: 200
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  hours: {
    monday: { type: String, trim: true },
    tuesday: { type: String, trim: true },
    wednesday: { type: String, trim: true },
    thursday: { type: String, trim: true },
    friday: { type: String, trim: true },
    saturday: { type: String, trim: true },
    sunday: { type: String, trim: true }
  },
  amenities: [{
    type: String,
    enum: ['parking', 'showers', 'rentals', 'cafe', 'shop', 'lockers', 'wifi', 'training_area']
  }],
  climbingTypes: [{
    type: String,
    enum: ['bouldering', 'sport', 'trad', 'top-rope', 'lead'],
    required: true
  }],
  difficultyRange: {
    min: {
      type: String,
      trim: true
    },
    max: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
LocationSchema.index({ coordinates: '2dsphere' }); // For geospatial queries
LocationSchema.index({ city: 1, state: 1 });
LocationSchema.index({ type: 1 });
LocationSchema.index({ climbingTypes: 1 });
LocationSchema.index({ isActive: 1 });

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
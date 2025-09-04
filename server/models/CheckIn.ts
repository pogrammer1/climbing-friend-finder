import mongoose, { Document, Schema } from 'mongoose';

export interface ICheckIn extends Document {
  userId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  checkedInAt: Date;
  checkedOutAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CheckInSchema = new Schema<ICheckIn>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  locationId: {
    type: Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  coordinates: {
    latitude: {
      type: Number,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180
    }
  },
  checkedInAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkedOutAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
CheckInSchema.index({ userId: 1, isActive: 1 });
CheckInSchema.index({ locationId: 1, isActive: 1 });
CheckInSchema.index({ coordinates: '2dsphere' });
CheckInSchema.index({ checkedInAt: -1 });

export const CheckIn = mongoose.model<ICheckIn>('CheckIn', CheckInSchema);
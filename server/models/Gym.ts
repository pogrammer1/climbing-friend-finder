import { Schema, model, Document } from 'mongoose';

export interface IGym extends Document {
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  // GeoJSON Point: { type: 'Point', coordinates: [lng, lat] }
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
}

const GymSchema = new Schema<IGym>({
  name: { type: String, required: true, unique: true },
  address: String,
  city: String,
  state: String,
  country: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  }
}, { timestamps: true });

// Create 2dsphere index for geospatial queries
GymSchema.index({ location: '2dsphere' });

export default model<IGym>('Gym', GymSchema);

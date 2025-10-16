import mongoose from 'mongoose';
import Gym from '../models/Gym';
import { connectDB } from '../config/database';

const gyms = [
  { name: 'Seattle Bouldering Project', city: 'Seattle', state: 'WA', country: 'USA', location: { type: 'Point', coordinates: [-122.3321, 47.6062] } },
  { name: 'Vertical World', city: 'Seattle', state: 'WA', country: 'USA', location: { type: 'Point', coordinates: [-122.3501, 47.6197] } },
  { name: 'Central Rock Gym - Boston', city: 'Boston', state: 'MA', country: 'USA', location: { type: 'Point', coordinates: [-71.0589, 42.3601] } },
  { name: 'Planet Granite - San Francisco', city: 'San Francisco', state: 'CA', country: 'USA', location: { type: 'Point', coordinates: [-122.4194, 37.7749] } },
  { name: 'The Cliffs at LIC', city: 'New York', state: 'NY', country: 'USA', location: { type: 'Point', coordinates: [-73.9496, 40.7440] } },
  { name: 'Boulders Gym', city: 'Los Angeles', state: 'CA', country: 'USA', location: { type: 'Point', coordinates: [-118.2437, 34.0522] } }
  ,{ name: 'Austin Bouldering Project', city: 'Austin', state: 'TX', country: 'USA', location: { type: 'Point', coordinates: [-97.7431, 30.2672] } },
  { name: 'Austin Rock Gym', city: 'Austin', state: 'TX', country: 'USA', location: { type: 'Point', coordinates: [-97.7469, 30.2711] } },
  { name: 'Crux Climbing Center', city: 'Austin', state: 'TX', country: 'USA', location: { type: 'Point', coordinates: [-97.7269, 30.2849] } }
];

async function seed() {
  try {
  await connectDB();
    console.log('Connected to DB, seeding gyms...');
    for (const g of gyms) {
      const exists = await Gym.findOne({ name: g.name });
      if (!exists) await new Gym(g).save();
    }
    console.log('Seeding complete');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

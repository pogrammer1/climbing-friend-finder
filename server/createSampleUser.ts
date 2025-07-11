import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

const createSampleUser = async () => {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/climbing-friend-finder';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if sample user already exists
    const existingUser = await User.findOne({ email: 'alex@example.com' });
    if (existingUser) {
      console.log('⚠️  Sample user already exists');
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('password123', 12);

    // Create sample user
    const sampleUser = new User({
      username: 'alexclimber',
      email: 'alex@example.com',
      password: hashedPassword,
      firstName: 'Alex',
      lastName: 'Johnson',
      bio: 'Passionate climber looking for partners to tackle new routes! I love both indoor and outdoor climbing.',
      location: 'Seattle, WA',
      experience: 'intermediate',
      climbingType: ['bouldering', 'sport', 'gym'],
      preferredGyms: ['Seattle Bouldering Project', 'Vertical World'],
      availability: {
        weekdays: true,
        weekends: true,
        evenings: true
      },
      climbingGrade: {
        bouldering: 'V4',
        sport: '5.10c'
      }
    });

    await sampleUser.save();
    console.log('✅ Sample user created successfully!');
    console.log('📧 Email: alex@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Username: alexclimber');

  } catch (error) {
    console.error('❌ Error creating sample user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

createSampleUser(); 
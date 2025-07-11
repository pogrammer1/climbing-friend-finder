import express from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Search for climbing partners
router.get('/search', auth, async (req: any, res) => {
  try {
    const currentUserId = req.user.user.id;
    const {
      location,
      experienceLevel,
      climbingTypes,
      availability,
      maxDistance,
      limit = 20,
      page = 1
    } = req.query;

    // Build search query
    const searchQuery: any = {
      _id: { $ne: currentUserId } // Exclude current user
    };

    // Location filter
    if (location) {
      searchQuery.location = { $regex: location, $options: 'i' };
    }

    // Experience level filter
    if (experienceLevel) {
      searchQuery.experience = experienceLevel;
    }

    // Climbing types filter
    if (climbingTypes) {
      const types = Array.isArray(climbingTypes) ? climbingTypes : [climbingTypes];
      searchQuery.climbingType = { $in: types };
    }

    // Availability filter
    if (availability) {
      const availDays = Array.isArray(availability) ? availability : [availability];
      
      // Convert day names to availability fields
      const availabilityQuery: any = {};
      if (availDays.includes('Monday') || availDays.includes('Tuesday') || availDays.includes('Wednesday') || 
          availDays.includes('Thursday') || availDays.includes('Friday')) {
        availabilityQuery.weekdays = true;
      }
      if (availDays.includes('Saturday') || availDays.includes('Sunday')) {
        availabilityQuery.weekends = true;
      }
      
      if (Object.keys(availabilityQuery).length > 0) {
        searchQuery.availability = availabilityQuery;
      }
    }

    console.log('Search query:', searchQuery);

    // Execute search with pagination
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const users = await User.find(searchQuery)
      .select('-password -email')
      .limit(parseInt(limit as string))
      .skip(skip)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(searchQuery);

    console.log(`Found ${users.length} users matching search criteria`);

    res.json({
      users,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / parseInt(limit as string)),
        hasMore: skip + users.length < total
      }
    });
  } catch (error) {
    console.error('User search error:', error);
    res.status(500).json({ message: 'Failed to search users' });
  }
});

// Get user profile
router.get('/profile', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    const { email, username, password, ...allowedUpdates } = updateData;

    console.log('Updating user profile:', userId, allowedUpdates);
    
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Profile updated successfully:', user);
    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Get user by ID (for viewing profiles) - This must come LAST
router.get('/:userId', auth, async (req: any, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password -email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Failed to get user' });
  }
});

export default router; 
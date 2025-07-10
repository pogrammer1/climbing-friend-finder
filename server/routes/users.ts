import express from 'express';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    const { email, username, password, ...allowedUpdates } = updateData;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
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

export default router; 
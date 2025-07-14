import express from 'express';
import { auth } from '../middleware/auth';
import { Notification } from '../models/Notification';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({ message: 'Failed to fetch notifications.' });
  }
});

// Mark a notification as read
router.post('/:id/read', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const notificationId = req.params.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { $set: { read: true } },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    res.json({ message: 'Notification marked as read.', notification });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Failed to mark notification as read.' });
  }
});

export default router; 
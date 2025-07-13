import express from 'express';
import mongoose from 'mongoose';
import { ClimbingSession } from '../models/ClimbingSession';
import { Achievement } from '../models/Achievement';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get all climbing sessions for a user
router.get('/sessions', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const { page = 1, limit = 10, climbingType, location } = req.query;

    const query: any = { userId };
    
    if (climbingType) {
      query.climbingType = climbingType;
    }
    
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    
    const sessions = await ClimbingSession.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit as string))
      .skip(skip);

    const total = await ClimbingSession.countDocuments(query);

    res.json({
      sessions,
      pagination: {
        current: parseInt(page as string),
        total: Math.ceil(total / parseInt(limit as string)),
        hasMore: skip + sessions.length < total
      }
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Failed to get climbing sessions' });
  }
});

// Get a specific climbing session
router.get('/sessions/:sessionId', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const { sessionId } = req.params;

    const session = await ClimbingSession.findOne({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: 'Climbing session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Failed to get climbing session' });
  }
});

// Create a new climbing session
router.post('/sessions', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const sessionData = req.body;

    const session = new ClimbingSession({
      ...sessionData,
      userId
    });

    await session.save();

    // Check for achievements after creating session
    await checkAndAwardAchievements(userId);

    res.status(201).json(session);
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ message: 'Failed to create climbing session' });
  }
});

// Update a climbing session
router.put('/sessions/:sessionId', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const { sessionId } = req.params;
    const updateData = req.body;

    const session = await ClimbingSession.findOneAndUpdate(
      { _id: sessionId, userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ message: 'Climbing session not found' });
    }

    // Check for achievements after updating session
    await checkAndAwardAchievements(userId);

    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Failed to update climbing session' });
  }
});

// Delete a climbing session
router.delete('/sessions/:sessionId', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;
    const { sessionId } = req.params;

    const session = await ClimbingSession.findOneAndDelete({ _id: sessionId, userId });

    if (!session) {
      return res.status(404).json({ message: 'Climbing session not found' });
    }

    res.json({ message: 'Climbing session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ message: 'Failed to delete climbing session' });
  }
});

// Get climbing statistics
router.get('/statistics', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;

    // Get total sessions
    const totalSessions = await ClimbingSession.countDocuments({ userId });

    // Get total climbing time
    const totalTimeResult = await ClimbingSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, totalTime: { $sum: '$duration' } } }
    ]);
    const totalTime = totalTimeResult[0]?.totalTime || 0;

    // Get sessions by climbing type
    const sessionsByType = await ClimbingSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$climbingType', count: { $sum: 1 } } }
    ]);

    // Get top locations
    const topLocations = await ClimbingSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // Get grade progression (highest grade by type)
    const gradeProgression = await ClimbingSession.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $unwind: '$routes' },
      { $match: { 'routes.status': 'sent' } },
      { $group: { _id: '$routes.type', highestGrade: { $max: '$routes.grade' } } }
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = await ClimbingSession.countDocuments({
      userId,
      date: { $gte: thirtyDaysAgo }
    });

    res.json({
      totalSessions,
      totalTime,
      sessionsByType,
      topLocations,
      gradeProgression,
      recentSessions
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Failed to get climbing statistics' });
  }
});

// Get user achievements
router.get('/achievements', auth, async (req: any, res) => {
  try {
    const userId = req.user.user.id;

    const achievements = await Achievement.find({ userId })
      .sort({ unlockedAt: -1 });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Failed to get achievements' });
  }
});

// Achievement checking function
async function checkAndAwardAchievements(userId: string) {
  try {
    // Get user's climbing data
    const sessions = await ClimbingSession.find({ userId }).sort({ date: -1 });
    
    if (sessions.length === 0) return;

    // Check for first climb achievement
    const firstClimbAchievement = await Achievement.findOne({
      userId,
      type: 'first_climb'
    });

    if (!firstClimbAchievement) {
      await new Achievement({
        userId,
        type: 'first_climb',
        title: 'First Steps',
        description: 'Completed your first climbing session!',
        icon: '🎯',
        metadata: {
          date: sessions[sessions.length - 1].date
        }
      }).save();
    }

    // Check for first send achievement
    const hasSentRoutes = sessions.some(session => 
      session.routes.some(route => route.status === 'sent')
    );

    if (hasSentRoutes) {
      const firstSendAchievement = await Achievement.findOne({
        userId,
        type: 'first_send'
      });

      if (!firstSendAchievement) {
        const firstSend = sessions.find(session => 
          session.routes.some(route => route.status === 'sent')
        );
        const firstSendRoute = firstSend?.routes.find(route => route.status === 'sent');

        await new Achievement({
          userId,
          type: 'first_send',
          title: 'First Send!',
          description: `Sent your first route: ${firstSendRoute?.grade || 'Unknown grade'}`,
          icon: '🏆',
          metadata: {
            grade: firstSendRoute?.grade,
            date: firstSend?.date
          }
        }).save();
      }
    }

    // Check for consistency achievement (5 sessions in 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentSessions = sessions.filter(session => session.date >= thirtyDaysAgo);
    
    if (recentSessions.length >= 5) {
      const consistencyAchievement = await Achievement.findOne({
        userId,
        type: 'consistency'
      });

      if (!consistencyAchievement) {
        await new Achievement({
          userId,
          type: 'consistency',
          title: 'Consistent Climber',
          description: 'Climbed 5+ times in the last 30 days',
          icon: '📈',
          metadata: {
            count: recentSessions.length
          }
        }).save();
      }
    }

    // Check for variety achievement (different climbing types)
    const climbingTypes = [...new Set(sessions.map(session => session.climbingType))];
    
    if (climbingTypes.length >= 3) {
      const varietyAchievement = await Achievement.findOne({
        userId,
        type: 'variety'
      });

      if (!varietyAchievement) {
        await new Achievement({
          userId,
          type: 'variety',
          title: 'Versatile Climber',
          description: 'Tried 3+ different types of climbing',
          icon: '🎭',
          metadata: {
            types: climbingTypes
          }
        }).save();
      }
    }

  } catch (error) {
    console.error('Achievement checking error:', error);
  }
}

export default router; 
import express, { Request, Response } from 'express';
import { CheckIn } from '../models/CheckIn';
import { Location } from '../models/Location';
import { User } from '../models/User';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get current user's active check-in
router.get('/current', auth, async (req: AuthRequest, res: Response) => {
  try {
    const checkIn = await CheckIn.findOne({ 
      userId: req.user.userId, 
      isActive: true 
    })
    .populate('locationId', 'name type address city state coordinates')
    .populate('userId', 'firstName lastName profilePicture');

    res.json(checkIn);
  } catch (error: any) {
    console.error('Error fetching current check-in:', error);
    res.status(500).json({ error: 'Failed to fetch check-in status' });
  }
});

// Create new check-in
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { locationId, coordinates } = req.body;

    // Check if user already has an active check-in
    const existingCheckIn = await CheckIn.findOne({
      userId: req.user.userId,
      isActive: true
    });

    if (existingCheckIn) {
      return res.status(400).json({ error: 'You are already checked in. Please check out first.' });
    }

    // Verify location exists
    const location = await Location.findById(locationId);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    // Create new check-in
    const checkIn = new CheckIn({
      userId: req.user.userId,
      locationId,
      coordinates,
      checkedInAt: new Date(),
      isActive: true
    });

    await checkIn.save();

    // Populate the response with location and user details
    const populatedCheckIn = await CheckIn.findById(checkIn._id)
      .populate('locationId', 'name type address city state coordinates')
      .populate('userId', 'firstName lastName profilePicture');

    res.status(201).json(populatedCheckIn);
  } catch (error: any) {
    console.error('Error creating check-in:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to check in' });
  }
});

// Check out (deactivate current check-in)
router.delete('/:id', auth, async (req: AuthRequest, res: Response) => {
  try {
    const checkIn = await CheckIn.findOne({
      _id: req.params.id,
      userId: req.user.userId,
      isActive: true
    });

    if (!checkIn) {
      return res.status(404).json({ error: 'Active check-in not found' });
    }

    checkIn.isActive = false;
    checkIn.checkedOutAt = new Date();
    await checkIn.save();

    res.json({ message: 'Checked out successfully' });
  } catch (error: any) {
    console.error('Error checking out:', error);
    res.status(500).json({ error: 'Failed to check out' });
  }
});

// Get nearby active check-ins
router.get('/nearby/:lat/:lng', auth, async (req: Request, res: Response) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 25 } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseInt(radius as string) * 1000;

    // Find check-ins near the specified location
    const checkIns = await CheckIn.find({
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusInMeters
        }
      }
    })
    .populate('locationId', 'name type address city state coordinates')
    .populate('userId', 'firstName lastName profilePicture')
    .sort({ checkedInAt: -1 });

    // Calculate distance and add to results
    const checkInsWithDistance = checkIns.map(checkIn => {
      const checkInObj = checkIn.toObject();
      if (checkIn.coordinates) {
        const distance = calculateDistance(
          latitude, longitude,
          checkIn.coordinates.latitude, checkIn.coordinates.longitude
        );
        return {
          ...checkInObj,
          location: {
            ...checkInObj.locationId,
            distance: Math.round(distance * 10) / 10
          }
        };
      }
      return checkInObj;
    });

    res.json(checkInsWithDistance);
  } catch (error: any) {
    console.error('Error fetching nearby check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch nearby climbers' });
  }
});

// Get check-ins at a specific location
router.get('/location/:locationId', auth, async (req: Request, res: Response) => {
  try {
    const { locationId } = req.params;

    const checkIns = await CheckIn.find({
      locationId,
      isActive: true
    })
    .populate('locationId', 'name type address city state coordinates')
    .populate('userId', 'firstName lastName profilePicture')
    .sort({ checkedInAt: -1 });

    res.json(checkIns);
  } catch (error: any) {
    console.error('Error fetching location check-ins:', error);
    res.status(500).json({ error: 'Failed to fetch check-ins at location' });
  }
});

// Get user's check-in history
router.get('/history', auth, async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const checkIns = await CheckIn.find({ userId: req.user.userId })
      .populate('locationId', 'name type address city state')
      .sort({ checkedInAt: -1 })
      .skip(skip)
      .limit(parseInt(limit as string));

    const total = await CheckIn.countDocuments({ userId: req.user.userId });

    res.json({
      checkIns,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error: any) {
    console.error('Error fetching check-in history:', error);
    res.status(500).json({ error: 'Failed to fetch check-in history' });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

export default router;
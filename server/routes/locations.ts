import express, { Request, Response } from 'express';
import { Location } from '../models/Location';
import { auth } from '../middleware/auth';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get all locations with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      city, 
      state, 
      climbingType, 
      lat, 
      lng, 
      radius = 50, // Default 50km radius
      limit = 50 
    } = req.query;

    let query: any = { isActive: true };

    // Filter by type
    if (type) {
      query.type = type;
    }

    // Filter by city/state
    if (city) {
      query.city = new RegExp(city as string, 'i');
    }
    if (state) {
      query.state = new RegExp(state as string, 'i');
    }

    // Filter by climbing type
    if (climbingType) {
      query.climbingTypes = { $in: [climbingType] };
    }

    let locations;

    // If lat/lng provided, find nearby locations
    if (lat && lng) {
      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);
      const radiusInMeters = parseInt(radius as string) * 1000; // Convert km to meters

      locations = await Location.find({
        ...query,
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude]
            },
            $maxDistance: radiusInMeters
          }
        }
      }).limit(parseInt(limit as string));
    } else {
      locations = await Location.find(query)
        .sort({ name: 1 })
        .limit(parseInt(limit as string));
    }

    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const location = await Location.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create new location (protected route)
router.post('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const locationData = {
      ...req.body,
      addedBy: req.user?.userId
    };

    const location = new Location(locationData);
    await location.save();
    
    res.status(201).json(location);
  } catch (error: any) {
    console.error('Error creating location:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create location' });
  }
});

// Update location (protected route)
router.put('/:id', auth, async (req: Request, res: Response) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(location);
  } catch (error: any) {
    console.error('Error updating location:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to update location' });
  }
});

// Delete location (protected route)
router.delete('/:id', auth, async (req: Request, res: Response) => {
  try {
    const location = await Location.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating location:', error);
    res.status(500).json({ error: 'Failed to deactivate location' });
  }
});

// Get locations near a specific point
router.get('/nearby/:lat/:lng', async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const { radius = 25, type, climbingType, limit = 20 } = req.query;

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusInMeters = parseInt(radius as string) * 1000;

    let query: any = { 
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
    };

    if (type) {
      query.type = type;
    }

    if (climbingType) {
      query.climbingTypes = { $in: [climbingType] };
    }

    const locations = await Location.find(query).limit(parseInt(limit as string));

    // Add distance to each location
    const locationsWithDistance = locations.map(location => {
      const distance = calculateDistance(
        latitude, longitude,
        location.coordinates.latitude, location.coordinates.longitude
      );
      return {
        ...location.toObject(),
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });

    res.json(locationsWithDistance);
  } catch (error) {
    console.error('Error fetching nearby locations:', error);
    res.status(500).json({ error: 'Failed to fetch nearby locations' });
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
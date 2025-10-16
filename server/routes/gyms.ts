import { Router } from 'express';
import Gym from '../models/Gym';
import { auth } from '../middleware/auth';

const router = Router();

// Public: list gyms with optional query (city or name)
router.get('/', async (req, res) => {
  try {
    const q = req.query.q as string;
    const filter: any = {};
    if (q) {
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { city: { $regex: q, $options: 'i' } }
      ];
    }
    const gyms = await Gym.find(filter).limit(50);
    res.json(gyms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list gyms' });
  }
});

// Nearby search using lat,lng and optional radius (in meters)
router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lng = parseFloat(req.query.lng as string);
    const radius = parseInt((req.query.radius as string) || '5000'); // default 5km

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'lat and lng query params required' });
    }

    const gyms = await Gym.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [lng, lat] },
          $maxDistance: radius
        }
      }
    }).limit(50);

    res.json(gyms);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to search nearby gyms' });
  }
});

// Protected: create a gym (could be limited to admins)
router.post('/', auth, async (req: any, res) => {
  try {
    const { name, address, city, state, country, coords } = req.body;
    const existing = await Gym.findOne({ name });
    if (existing) return res.status(400).json({ message: 'Gym already exists' });
    const gym = new Gym({ name, address, city, state, country, coords });
    await gym.save();
    res.status(201).json(gym);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create gym' });
  }
});

export default router;

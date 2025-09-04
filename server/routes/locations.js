"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Location_1 = require("../models/Location");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all locations with optional filtering
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, city, state, climbingType, lat, lng, radius = 50, // Default 50km radius
        limit = 50 } = req.query;
        let query = { isActive: true };
        // Filter by type
        if (type) {
            query.type = type;
        }
        // Filter by city/state
        if (city) {
            query.city = new RegExp(city, 'i');
        }
        if (state) {
            query.state = new RegExp(state, 'i');
        }
        // Filter by climbing type
        if (climbingType) {
            query.climbingTypes = { $in: [climbingType] };
        }
        let locations;
        // If lat/lng provided, find nearby locations
        if (lat && lng) {
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const radiusInMeters = parseInt(radius) * 1000; // Convert km to meters
            locations = yield Location_1.Location.find(Object.assign(Object.assign({}, query), { coordinates: {
                    $near: {
                        $geometry: {
                            type: 'Point',
                            coordinates: [longitude, latitude]
                        },
                        $maxDistance: radiusInMeters
                    }
                } })).limit(parseInt(limit));
        }
        else {
            locations = yield Location_1.Location.find(query)
                .sort({ name: 1 })
                .limit(parseInt(limit));
        }
        res.json(locations);
    }
    catch (error) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: 'Failed to fetch locations' });
    }
}));
// Get location by ID
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield Location_1.Location.findById(req.params.id);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    }
    catch (error) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: 'Failed to fetch location' });
    }
}));
// Create new location (protected route)
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const locationData = Object.assign(Object.assign({}, req.body), { addedBy: (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId });
        const location = new Location_1.Location(locationData);
        yield location.save();
        res.status(201).json(location);
    }
    catch (error) {
        console.error('Error creating location:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to create location' });
    }
}));
// Update location (protected route)
router.put('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield Location_1.Location.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json(location);
    }
    catch (error) {
        console.error('Error updating location:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to update location' });
    }
}));
// Delete location (protected route)
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const location = yield Location_1.Location.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        res.json({ message: 'Location deactivated successfully' });
    }
    catch (error) {
        console.error('Error deactivating location:', error);
        res.status(500).json({ error: 'Failed to deactivate location' });
    }
}));
// Get locations near a specific point
router.get('/nearby/:lat/:lng', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng } = req.params;
        const { radius = 25, type, climbingType, limit = 20 } = req.query;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInMeters = parseInt(radius) * 1000;
        let query = {
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
        const locations = yield Location_1.Location.find(query).limit(parseInt(limit));
        // Add distance to each location
        const locationsWithDistance = locations.map(location => {
            const distance = calculateDistance(latitude, longitude, location.coordinates.latitude, location.coordinates.longitude);
            return Object.assign(Object.assign({}, location.toObject()), { distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
             });
        });
        res.json(locationsWithDistance);
    }
    catch (error) {
        console.error('Error fetching nearby locations:', error);
        res.status(500).json({ error: 'Failed to fetch nearby locations' });
    }
}));
// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
}
exports.default = router;

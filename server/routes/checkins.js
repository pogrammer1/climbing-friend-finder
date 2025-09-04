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
const CheckIn_1 = require("../models/CheckIn");
const Location_1 = require("../models/Location");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get current user's active check-in
router.get('/current', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkIn = yield CheckIn_1.CheckIn.findOne({
            userId: req.user.userId,
            isActive: true
        })
            .populate('locationId', 'name type address city state coordinates')
            .populate('userId', 'firstName lastName profilePicture');
        res.json(checkIn);
    }
    catch (error) {
        console.error('Error fetching current check-in:', error);
        res.status(500).json({ error: 'Failed to fetch check-in status' });
    }
}));
// Create new check-in
router.post('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId, coordinates } = req.body;
        // Check if user already has an active check-in
        const existingCheckIn = yield CheckIn_1.CheckIn.findOne({
            userId: req.user.userId,
            isActive: true
        });
        if (existingCheckIn) {
            return res.status(400).json({ error: 'You are already checked in. Please check out first.' });
        }
        // Verify location exists
        const location = yield Location_1.Location.findById(locationId);
        if (!location) {
            return res.status(404).json({ error: 'Location not found' });
        }
        // Create new check-in
        const checkIn = new CheckIn_1.CheckIn({
            userId: req.user.userId,
            locationId,
            coordinates,
            checkedInAt: new Date(),
            isActive: true
        });
        yield checkIn.save();
        // Populate the response with location and user details
        const populatedCheckIn = yield CheckIn_1.CheckIn.findById(checkIn._id)
            .populate('locationId', 'name type address city state coordinates')
            .populate('userId', 'firstName lastName profilePicture');
        res.status(201).json(populatedCheckIn);
    }
    catch (error) {
        console.error('Error creating check-in:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Failed to check in' });
    }
}));
// Check out (deactivate current check-in)
router.delete('/:id', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkIn = yield CheckIn_1.CheckIn.findOne({
            _id: req.params.id,
            userId: req.user.userId,
            isActive: true
        });
        if (!checkIn) {
            return res.status(404).json({ error: 'Active check-in not found' });
        }
        checkIn.isActive = false;
        checkIn.checkedOutAt = new Date();
        yield checkIn.save();
        res.json({ message: 'Checked out successfully' });
    }
    catch (error) {
        console.error('Error checking out:', error);
        res.status(500).json({ error: 'Failed to check out' });
    }
}));
// Get nearby active check-ins
router.get('/nearby/:lat/:lng', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lng } = req.params;
        const { radius = 25 } = req.query;
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusInMeters = parseInt(radius) * 1000;
        // Find check-ins near the specified location
        const checkIns = yield CheckIn_1.CheckIn.find({
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
                const distance = calculateDistance(latitude, longitude, checkIn.coordinates.latitude, checkIn.coordinates.longitude);
                return Object.assign(Object.assign({}, checkInObj), { location: Object.assign(Object.assign({}, checkInObj.locationId), { distance: Math.round(distance * 10) / 10 }) });
            }
            return checkInObj;
        });
        res.json(checkInsWithDistance);
    }
    catch (error) {
        console.error('Error fetching nearby check-ins:', error);
        res.status(500).json({ error: 'Failed to fetch nearby climbers' });
    }
}));
// Get check-ins at a specific location
router.get('/location/:locationId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { locationId } = req.params;
        const checkIns = yield CheckIn_1.CheckIn.find({
            locationId,
            isActive: true
        })
            .populate('locationId', 'name type address city state coordinates')
            .populate('userId', 'firstName lastName profilePicture')
            .sort({ checkedInAt: -1 });
        res.json(checkIns);
    }
    catch (error) {
        console.error('Error fetching location check-ins:', error);
        res.status(500).json({ error: 'Failed to fetch check-ins at location' });
    }
}));
// Get user's check-in history
router.get('/history', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const checkIns = yield CheckIn_1.CheckIn.find({ userId: req.user.userId })
            .populate('locationId', 'name type address city state')
            .sort({ checkedInAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        const total = yield CheckIn_1.CheckIn.countDocuments({ userId: req.user.userId });
        res.json({
            checkIns,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    }
    catch (error) {
        console.error('Error fetching check-in history:', error);
        res.status(500).json({ error: 'Failed to fetch check-in history' });
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

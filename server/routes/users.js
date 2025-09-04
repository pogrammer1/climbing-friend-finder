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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const mongoose_1 = __importDefault(require("mongoose"));
const matching_1 = require("../utils/matching");
const router = express_1.default.Router();
// Search for climbing partners
router.get('/search', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.user.id;
        const { location, experienceLevel, climbingTypes, availability, maxDistance, limit = 20, page = 1 } = req.query;
        // Build search query
        const searchQuery = {
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
            const availabilityQuery = {};
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
        const skip = (parseInt(page) - 1) * parseInt(limit);
        // Fetch current user for scoring
        const currentUser = yield User_1.User.findById(currentUserId).select('-password -email');
        if (!currentUser) {
            return res.status(404).json({ message: 'Current user not found' });
        }
        const users = yield User_1.User.find(searchQuery)
            .select('-password -email')
            .limit(parseInt(limit))
            .skip(skip)
            .sort({ createdAt: -1 });
        // Add compatibility score to each user
        const usersWithScore = users.map((user) => {
            // If age is not present, you may want to add it to the schema and user data
            const score = (0, matching_1.getCompatibilityScore)(currentUser, user);
            return Object.assign(Object.assign({}, user.toObject()), { compatibilityScore: score });
        });
        // Sort users by compatibility score descending
        usersWithScore.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
        // Get total count for pagination
        const total = yield User_1.User.countDocuments(searchQuery);
        console.log(`Found ${usersWithScore.length} users matching search criteria`);
        res.json({
            users: usersWithScore,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                hasMore: skip + usersWithScore.length < total
            }
        });
    }
    catch (error) {
        console.error('User search error:', error);
        res.status(500).json({ message: 'Failed to search users' });
    }
}));
// Get user profile
router.get('/profile', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const user = yield User_1.User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Failed to get profile' });
    }
}));
// Update user profile
router.put('/profile', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const updateData = req.body;
        // Remove fields that shouldn't be updated
        const { email, username, password } = updateData, allowedUpdates = __rest(updateData, ["email", "username", "password"]);
        console.log('Updating user profile:', userId, allowedUpdates);
        const user = yield User_1.User.findByIdAndUpdate(userId, { $set: allowedUpdates }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Profile updated successfully:', user);
        res.json(user);
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
}));
// Test endpoint for debugging
router.get('/profile/picture/test', (req, res) => {
    console.log('Test endpoint hit');
    res.json({ message: 'Profile picture test endpoint working' });
});
// Upload profile picture
router.post('/profile/picture', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Profile picture upload request received');
    console.log('Request body:', req.body);
    try {
        const userId = req.user.user.id;
        const { profilePicture } = req.body;
        // Handle profile picture removal
        if (profilePicture === null) {
            const user = yield User_1.User.findByIdAndUpdate(userId, { $unset: { profilePicture: 1 } }, { new: true, runValidators: true }).select('-password');
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            console.log('Profile picture removed successfully');
            res.json({
                message: 'Profile picture removed successfully',
                profilePicture: null
            });
            return;
        }
        // Validate that profilePicture is a base64 string
        if (!profilePicture || typeof profilePicture !== 'string') {
            return res.status(400).json({ message: 'Profile picture data is required' });
        }
        // Basic validation for base64 image
        if (!profilePicture.startsWith('data:image/')) {
            return res.status(400).json({ message: 'Invalid image format' });
        }
        // Check file size (limit to 5MB)
        const base64Data = profilePicture.split(',')[1];
        const fileSizeInBytes = Math.ceil((base64Data.length * 3) / 4);
        const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
        if (fileSizeInMB > 5) {
            return res.status(400).json({ message: 'Image size must be less than 5MB' });
        }
        // Update user's profile picture
        const user = yield User_1.User.findByIdAndUpdate(userId, { profilePicture }, { new: true, runValidators: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        console.log('Profile picture updated successfully');
        res.json({
            message: 'Profile picture updated successfully',
            profilePicture: user.profilePicture
        });
    }
    catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Failed to upload profile picture' });
    }
}));
// Follow a user
router.post('/:id/follow', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.user.id;
        const targetUserId = req.params.id;
        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: 'You cannot follow yourself.' });
        }
        const currentUser = yield User_1.User.findById(currentUserId);
        const targetUser = yield User_1.User.findById(targetUserId);
        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Prevent duplicate follows
        if (targetUser.followers.some((id) => id.toString() === String(currentUser._id))) {
            return res.status(400).json({ message: 'Already following this user.' });
        }
        // Add to following/followers
        currentUser.following.push(new mongoose_1.default.Types.ObjectId(String(targetUser._id)));
        targetUser.followers.push(new mongoose_1.default.Types.ObjectId(String(currentUser._id)));
        yield currentUser.save();
        yield targetUser.save();
        // Create notification for the followed user
        yield Notification_1.Notification.create({
            user: targetUser._id,
            type: 'new_follower',
            data: {
                followerId: currentUser._id,
                followerUsername: currentUser.username
            },
            read: false
        });
        res.json({ message: 'User followed successfully.' });
    }
    catch (error) {
        console.error('Follow error:', error);
        res.status(500).json({ message: 'Failed to follow user.' });
    }
}));
// Unfollow a user
router.post('/:id/unfollow', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentUserId = req.user.user.id;
        const targetUserId = req.params.id;
        if (currentUserId === targetUserId) {
            return res.status(400).json({ message: 'You cannot unfollow yourself.' });
        }
        const currentUser = yield User_1.User.findById(currentUserId);
        const targetUser = yield User_1.User.findById(targetUserId);
        if (!currentUser || !targetUser) {
            return res.status(404).json({ message: 'User not found.' });
        }
        // Remove from following/followers
        currentUser.following = currentUser.following.filter((id) => id.toString() !== String(targetUser._id));
        targetUser.followers = targetUser.followers.filter((id) => id.toString() !== String(currentUser._id));
        yield currentUser.save();
        yield targetUser.save();
        res.json({ message: 'User unfollowed successfully.' });
    }
    catch (error) {
        console.error('Unfollow error:', error);
        res.status(500).json({ message: 'Failed to unfollow user.' });
    }
}));
// Get user by ID (for viewing profiles) - This must come LAST
router.get('/:userId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.params;
        const user = yield User_1.User.findById(userId).select('-password -email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Failed to get user' });
    }
}));
exports.default = router;

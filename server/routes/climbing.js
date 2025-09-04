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
const mongoose_1 = __importDefault(require("mongoose"));
const ClimbingSession_1 = require("../models/ClimbingSession");
const Achievement_1 = require("../models/Achievement");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all climbing sessions for a user
router.get('/sessions', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const { page = 1, limit = 10, climbingType, location } = req.query;
        const query = { userId };
        if (climbingType) {
            query.climbingType = climbingType;
        }
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sessions = yield ClimbingSession_1.ClimbingSession.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit))
            .skip(skip);
        const total = yield ClimbingSession_1.ClimbingSession.countDocuments(query);
        res.json({
            sessions,
            pagination: {
                current: parseInt(page),
                total: Math.ceil(total / parseInt(limit)),
                hasMore: skip + sessions.length < total
            }
        });
    }
    catch (error) {
        console.error('Get sessions error:', error);
        res.status(500).json({ message: 'Failed to get climbing sessions' });
    }
}));
// Get a specific climbing session
router.get('/sessions/:sessionId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const { sessionId } = req.params;
        const session = yield ClimbingSession_1.ClimbingSession.findOne({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Climbing session not found' });
        }
        res.json(session);
    }
    catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ message: 'Failed to get climbing session' });
    }
}));
// Create a new climbing session
router.post('/sessions', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const sessionData = req.body;
        const session = new ClimbingSession_1.ClimbingSession(Object.assign(Object.assign({}, sessionData), { userId }));
        yield session.save();
        // Check for achievements after creating session
        yield checkAndAwardAchievements(userId);
        res.status(201).json(session);
    }
    catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ message: 'Failed to create climbing session' });
    }
}));
// Update a climbing session
router.put('/sessions/:sessionId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const { sessionId } = req.params;
        const updateData = req.body;
        const session = yield ClimbingSession_1.ClimbingSession.findOneAndUpdate({ _id: sessionId, userId }, updateData, { new: true, runValidators: true });
        if (!session) {
            return res.status(404).json({ message: 'Climbing session not found' });
        }
        // Check for achievements after updating session
        yield checkAndAwardAchievements(userId);
        res.json(session);
    }
    catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({ message: 'Failed to update climbing session' });
    }
}));
// Delete a climbing session
router.delete('/sessions/:sessionId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const { sessionId } = req.params;
        const session = yield ClimbingSession_1.ClimbingSession.findOneAndDelete({ _id: sessionId, userId });
        if (!session) {
            return res.status(404).json({ message: 'Climbing session not found' });
        }
        res.json({ message: 'Climbing session deleted successfully' });
    }
    catch (error) {
        console.error('Delete session error:', error);
        res.status(500).json({ message: 'Failed to delete climbing session' });
    }
}));
// Get climbing statistics
router.get('/statistics', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.user.id;
        // Get total sessions
        const totalSessions = yield ClimbingSession_1.ClimbingSession.countDocuments({ userId });
        // Get total climbing time
        const totalTimeResult = yield ClimbingSession_1.ClimbingSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            { $group: { _id: null, totalTime: { $sum: '$duration' } } }
        ]);
        const totalTime = ((_a = totalTimeResult[0]) === null || _a === void 0 ? void 0 : _a.totalTime) || 0;
        // Get sessions by climbing type
        const sessionsByType = yield ClimbingSession_1.ClimbingSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            { $group: { _id: '$climbingType', count: { $sum: 1 } } }
        ]);
        // Get top locations
        const topLocations = yield ClimbingSession_1.ClimbingSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            { $group: { _id: '$location', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        // Get grade progression (highest grade by type)
        const gradeProgression = yield ClimbingSession_1.ClimbingSession.aggregate([
            { $match: { userId: new mongoose_1.default.Types.ObjectId(userId) } },
            { $unwind: '$routes' },
            { $match: { 'routes.status': 'sent' } },
            { $group: { _id: '$routes.type', highestGrade: { $max: '$routes.grade' } } }
        ]);
        // Get recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentSessions = yield ClimbingSession_1.ClimbingSession.countDocuments({
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
    }
    catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Failed to get climbing statistics' });
    }
}));
// Get user achievements
router.get('/achievements', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const achievements = yield Achievement_1.Achievement.find({ userId })
            .sort({ unlockedAt: -1 });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Failed to get achievements' });
    }
}));
// Achievement checking function
function checkAndAwardAchievements(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Get user's climbing data
            const sessions = yield ClimbingSession_1.ClimbingSession.find({ userId }).sort({ date: -1 });
            if (sessions.length === 0)
                return;
            // Check for first climb achievement
            const firstClimbAchievement = yield Achievement_1.Achievement.findOne({
                userId,
                type: 'first_climb'
            });
            if (!firstClimbAchievement) {
                yield new Achievement_1.Achievement({
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
            const hasSentRoutes = sessions.some(session => session.routes.some(route => route.status === 'sent'));
            if (hasSentRoutes) {
                const firstSendAchievement = yield Achievement_1.Achievement.findOne({
                    userId,
                    type: 'first_send'
                });
                if (!firstSendAchievement) {
                    const firstSend = sessions.find(session => session.routes.some(route => route.status === 'sent'));
                    const firstSendRoute = firstSend === null || firstSend === void 0 ? void 0 : firstSend.routes.find(route => route.status === 'sent');
                    yield new Achievement_1.Achievement({
                        userId,
                        type: 'first_send',
                        title: 'First Send!',
                        description: `Sent your first route: ${(firstSendRoute === null || firstSendRoute === void 0 ? void 0 : firstSendRoute.grade) || 'Unknown grade'}`,
                        icon: '🏆',
                        metadata: {
                            grade: firstSendRoute === null || firstSendRoute === void 0 ? void 0 : firstSendRoute.grade,
                            date: firstSend === null || firstSend === void 0 ? void 0 : firstSend.date
                        }
                    }).save();
                }
            }
            // Check for consistency achievement (5 sessions in 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentSessions = sessions.filter(session => session.date >= thirtyDaysAgo);
            if (recentSessions.length >= 5) {
                const consistencyAchievement = yield Achievement_1.Achievement.findOne({
                    userId,
                    type: 'consistency'
                });
                if (!consistencyAchievement) {
                    yield new Achievement_1.Achievement({
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
                const varietyAchievement = yield Achievement_1.Achievement.findOne({
                    userId,
                    type: 'variety'
                });
                if (!varietyAchievement) {
                    yield new Achievement_1.Achievement({
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
        }
        catch (error) {
            console.error('Achievement checking error:', error);
        }
    });
}
exports.default = router;

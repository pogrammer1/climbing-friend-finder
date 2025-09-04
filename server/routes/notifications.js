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
const auth_1 = require("../middleware/auth");
const Notification_1 = require("../models/Notification");
const router = express_1.default.Router();
// Get all notifications for the logged-in user
router.get('/', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const notifications = yield Notification_1.Notification.find({ user: userId })
            .sort({ createdAt: -1 });
        res.json(notifications);
    }
    catch (error) {
        console.error('Fetch notifications error:', error);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
}));
// Mark a notification as read
router.post('/:id/read', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const notificationId = req.params.id;
        const notification = yield Notification_1.Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { $set: { read: true } }, { new: true });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found.' });
        }
        res.json({ message: 'Notification marked as read.', notification });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        res.status(500).json({ message: 'Failed to mark notification as read.' });
    }
}));
exports.default = router;

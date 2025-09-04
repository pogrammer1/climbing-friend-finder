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
exports.setSocketIO = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Message_1 = __importDefault(require("../models/Message"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const User_1 = require("../models/User");
// Socket.IO instance (will be set from index.ts)
let io;
const setSocketIO = (socketIO) => {
    io = socketIO;
};
exports.setSocketIO = setSocketIO;
const router = express_1.default.Router();
// Get all conversations for the current user
router.get('/conversations', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const conversations = yield Conversation_1.default.find({
            participants: userId
        })
            .populate('participants', 'firstName lastName email profilePicture')
            .populate('lastMessage')
            .sort({ lastMessageAt: -1 });
        // Format conversations with unread counts
        const formattedConversations = conversations.map(conv => {
            const otherParticipant = conv.participants.find((p) => p._id.toString() !== userId);
            if (!otherParticipant) {
                return null;
            }
            return {
                _id: conv._id,
                participant: {
                    _id: otherParticipant._id,
                    name: `${otherParticipant.firstName} ${otherParticipant.lastName}`,
                    email: otherParticipant.email,
                    profilePicture: otherParticipant.profilePicture
                },
                lastMessage: conv.lastMessage,
                lastMessageAt: conv.lastMessageAt,
                unreadCount: conv.unreadCount[userId] || 0
            };
        }).filter(Boolean);
        res.json(formattedConversations);
    }
    catch (error) {
        console.error('Error fetching conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get messages for a specific conversation
router.get('/conversations/:conversationId', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { conversationId } = req.params;
        const userId = req.user.user.id;
        // Verify user is part of this conversation
        const conversation = yield Conversation_1.default.findOne({
            _id: conversationId,
            participants: userId
        });
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        // Get messages for this conversation
        const messages = yield Message_1.default.find({
            $or: [
                { sender: userId, recipient: { $in: conversation.participants } },
                { recipient: userId, sender: { $in: conversation.participants } }
            ]
        })
            .populate('sender', 'firstName lastName profilePicture')
            .populate('recipient', 'firstName lastName profilePicture')
            .sort({ createdAt: 1 });
        // Mark messages as read
        yield Message_1.default.updateMany({ recipient: userId, sender: { $in: conversation.participants }, isRead: false }, { isRead: true });
        // Reset unread count for this conversation
        yield Conversation_1.default.updateOne({ _id: conversationId }, { $set: { [`unreadCount.${userId}`]: 0 } });
        res.json(messages);
    }
    catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Send a message
router.post('/send', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId, content } = req.body;
        const senderId = req.user.user.id;
        if (!recipientId || !content) {
            return res.status(400).json({ message: 'Recipient ID and content are required' });
        }
        // Verify recipient exists
        const recipient = yield User_1.User.findById(recipientId);
        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }
        // Find or create conversation
        let conversation = yield Conversation_1.default.findOne({
            participants: { $all: [senderId, recipientId] }
        });
        if (!conversation) {
            conversation = new Conversation_1.default({
                participants: [senderId, recipientId],
                unreadCount: { [recipientId]: 1 }
            });
        }
        else {
            // Increment unread count for recipient
            const currentUnread = conversation.unreadCount[recipientId] || 0;
            conversation.unreadCount[recipientId] = currentUnread + 1;
        }
        // Create the message
        const message = new Message_1.default({
            sender: senderId,
            recipient: recipientId,
            content: content.trim()
        });
        yield message.save();
        // Update conversation
        conversation.lastMessage = message._id;
        conversation.lastMessageAt = new Date();
        yield conversation.save();
        // Populate sender info for response
        yield message.populate('sender', 'firstName lastName profilePicture');
        // Emit real-time message to conversation participants
        if (io) {
            io.to(`conversation_${conversation._id}`).emit('messageReceived', message);
        }
        res.json(message);
    }
    catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Get unread message count
router.get('/unread-count', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.user.id;
        const conversations = yield Conversation_1.default.find({
            participants: userId
        });
        const totalUnread = conversations.reduce((total, conv) => {
            return total + (conv.unreadCount[userId] || 0);
        }, 0);
        res.json({ unreadCount: totalUnread });
    }
    catch (error) {
        console.error('Error fetching unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
// Start a conversation with a user (from search results)
router.post('/start-conversation', auth_1.auth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { recipientId } = req.body;
        const senderId = req.user.user.id;
        if (!recipientId) {
            return res.status(400).json({ message: 'Recipient ID is required' });
        }
        // Check if conversation already exists
        let conversation = yield Conversation_1.default.findOne({
            participants: { $all: [senderId, recipientId] }
        });
        if (conversation) {
            return res.json({ conversationId: conversation._id });
        }
        // Create new conversation
        conversation = new Conversation_1.default({
            participants: [senderId, recipientId],
            unreadCount: {}
        });
        yield conversation.save();
        res.json({ conversationId: conversation._id });
    }
    catch (error) {
        console.error('Error starting conversation:', error);
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = router;

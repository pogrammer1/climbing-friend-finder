import express, { Request } from 'express';
import { auth } from '../middleware/auth';
import Message from '../models/Message';
import Conversation from '../models/Conversation';
import { User } from '../models/User';

interface AuthRequest extends Request {
  user?: any;
}

const router = express.Router();

// Get all conversations for the current user
router.get('/conversations', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    })
    .populate('participants', 'firstName lastName email profilePicture')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 });

    // Format conversations with unread counts
    const formattedConversations = conversations.map(conv => {
      const otherParticipant = conv.participants.find(
        (p: any) => p._id.toString() !== userId
      ) as any;
      
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
        unreadCount: (conv.unreadCount as { [key: string]: number })[userId] || 0
      };
    }).filter(Boolean);

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:conversationId', auth, async (req: AuthRequest, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.user.id;

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId
    });

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Get messages for this conversation
    const messages = await Message.find({
      $or: [
        { sender: userId, recipient: { $in: conversation.participants } },
        { recipient: userId, sender: { $in: conversation.participants } }
      ]
    })
    .populate('sender', 'firstName lastName profilePicture')
    .populate('recipient', 'firstName lastName profilePicture')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      { recipient: userId, sender: { $in: conversation.participants }, isRead: false },
      { isRead: true }
    );

    // Reset unread count for this conversation
    await Conversation.updateOne(
      { _id: conversationId },
      { $set: { [`unreadCount.${userId}`]: 0 } }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/send', auth, async (req: AuthRequest, res) => {
  try {
    const { recipientId, content } = req.body;
    const senderId = req.user.user.id;

    if (!recipientId || !content) {
      return res.status(400).json({ message: 'Recipient ID and content are required' });
    }

    // Verify recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
      conversation = new Conversation({
        participants: [senderId, recipientId],
        unreadCount: { [recipientId]: 1 }
      });
    } else {
      // Increment unread count for recipient
      const currentUnread = conversation.unreadCount[recipientId] || 0;
      conversation.unreadCount[recipientId] = currentUnread + 1;
    }

    // Create the message
    const message = new Message({
      sender: senderId,
      recipient: recipientId,
      content: content.trim()
    });

    await message.save();

    // Update conversation
    conversation.lastMessage = message._id as any;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Populate sender info for response
    await message.populate('sender', 'firstName lastName profilePicture');

    res.json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user.user.id;
    
    const conversations = await Conversation.find({
      participants: userId
    });

    const totalUnread = conversations.reduce((total, conv) => {
      return total + (conv.unreadCount[userId] || 0);
    }, 0);

    res.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start a conversation with a user (from search results)
router.post('/start-conversation', auth, async (req: AuthRequest, res) => {
  try {
    const { recipientId } = req.body;
    const senderId = req.user.user.id;

    if (!recipientId) {
      return res.status(400).json({ message: 'Recipient ID is required' });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, recipientId] }
    });

    if (conversation) {
      return res.json({ conversationId: conversation._id });
    }

    // Create new conversation
    conversation = new Conversation({
      participants: [senderId, recipientId],
      unreadCount: {}
    });

    await conversation.save();

    res.json({ conversationId: conversation._id });
  } catch (error) {
    console.error('Error starting conversation:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router; 
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import messageRoutes, { setSocketIO } from './routes/messages';
import climbingRoutes from './routes/climbing';
import notificationsRoutes from './routes/notifications';
import locationsRoutes from './routes/locations';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/climbing', climbingRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/locations', locationsRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ message: 'Climbing Friend Finder API is running!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Set Socket.IO instance for message routes
setSocketIO(io);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join user to their personal room
  socket.on('join', (userId: string) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  // Join conversation room
  socket.on('joinConversation', (conversationId: string) => {
    socket.join(`conversation_${conversationId}`);
    console.log(`User joined conversation: ${conversationId}`);
  });

  // Leave conversation room
  socket.on('leaveConversation', (conversationId: string) => {
    socket.leave(`conversation_${conversationId}`);
    console.log(`User left conversation: ${conversationId}`);
  });

  // Handle typing indicators
  socket.on('typing', (data: { conversationId: string; userId: string; isTyping: boolean }) => {
    console.log('Typing event:', data);
    socket.to(`conversation_${data.conversationId}`).emit('userTyping', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  // Handle new messages
  socket.on('newMessage', (data: { conversationId: string; message: any }) => {
    console.log('New message event:', data);
    socket.to(`conversation_${data.conversationId}`).emit('messageReceived', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket server ready`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 
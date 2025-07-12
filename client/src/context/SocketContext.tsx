import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  sendTypingIndicator: (conversationId: string, isTyping: boolean) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (user && token) {
      // Create socket connection
      const newSocket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        auth: {
          token
        }
      });

      // Socket event listeners
      newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        setIsConnected(true);
        
        // Join user's personal room
        newSocket.emit('join', user._id);
        console.log('Emitted join event for user:', user._id);
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from WebSocket server');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Disconnect if no user
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user, token]);

  const joinConversation = (conversationId: string) => {
    if (socket) {
      console.log('Joining conversation:', conversationId);
      socket.emit('joinConversation', conversationId);
    }
  };

  const leaveConversation = (conversationId: string) => {
    if (socket) {
      console.log('Leaving conversation:', conversationId);
      socket.emit('leaveConversation', conversationId);
    }
  };

  const sendTypingIndicator = (conversationId: string, isTyping: boolean) => {
    if (socket && user) {
      console.log('Sending typing indicator:', { conversationId, userId: user._id, isTyping });
      socket.emit('typing', {
        conversationId,
        userId: user._id,
        isTyping
      });
    }
  };

  const value: SocketContextType = {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    sendTypingIndicator
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 
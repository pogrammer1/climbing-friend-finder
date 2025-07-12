import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

interface Conversation {
  _id: string;
  participant: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  lastMessageAt: string;
  unreadCount: number;
}

interface Message {
  _id: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  recipient: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  content: string;
  isRead: boolean;
  createdAt: string;
}

const Messages: React.FC = () => {
  const { user, token } = useAuth();
  const { socket, isConnected, joinConversation, leaveConversation, sendTypingIndicator } = useSocket();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch conversations
  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        const errorData = await response.json();
        console.error('Error fetching conversations:', errorData);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages for a conversation
  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Send a message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const conversation = conversations.find(c => c._id === selectedConversation);
      if (!conversation) return;

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipientId: conversation.participant._id,
          content: newMessage.trim()
        })
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Refresh conversations to update last message
        fetchConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    fetchMessages(conversationId);
  };

  // Handle typing indicator with debounce
  const handleTyping = (isTyping: boolean) => {
    if (selectedConversation) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Send typing indicator immediately
      sendTypingIndicator(selectedConversation, isTyping);

      // If typing stopped, clear the timeout
      if (!isTyping) {
        typingTimeoutRef.current = null;
      } else {
        // Set timeout to stop typing indicator after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          sendTypingIndicator(selectedConversation, false);
          typingTimeoutRef.current = null;
        }, 3000);
      }
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (socket) {
      console.log('Setting up socket event listeners');
      
      // Clean up any existing listeners first
      socket.off('messageReceived');
      socket.off('userTyping');
      
      // Listen for new messages
      socket.on('messageReceived', (message: Message) => {
        console.log('Received new message:', message);
        setMessages(prev => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(m => m._id === message._id);
          if (messageExists) {
            console.log('Message already exists, not adding duplicate');
            return prev;
          }
          return [...prev, message];
        });
        // Refresh conversations to update last message
        fetchConversations();
      });

      // Listen for typing indicators
      socket.on('userTyping', (data: { userId: string; isTyping: boolean }) => {
        console.log('Received typing indicator:', data);
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (data.isTyping) {
            newSet.add(data.userId);
          } else {
            newSet.delete(data.userId);
          }
          return newSet;
        });
      });

      return () => {
        console.log('Cleaning up socket event listeners');
        socket.off('messageReceived');
        socket.off('userTyping');
      };
    }
  }, [socket]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join/leave conversation rooms
  useEffect(() => {
    if (selectedConversation && isConnected) {
      joinConversation(selectedConversation);
      return () => {
        leaveConversation(selectedConversation);
        // Clear typing timeout when leaving conversation
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
      };
    }
  }, [selectedConversation, isConnected, joinConversation, leaveConversation]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation);
    }
  }, [selectedConversation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Messages</h1>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3">
            <h2 className="text-lg font-semibold">Conversations</h2>
          </div>
          <div className="overflow-y-auto h-full">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet. Start chatting with climbers from the search page!
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationSelect(conversation._id)}
                  className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedConversation === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {conversation.participant?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {conversation.participant?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">
                        {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleDateString() : ''}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="inline-block bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="bg-gray-50 px-4 py-3 border-b">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {conversations.find(c => c._id === selectedConversation)?.participant?.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <h3 className="font-semibold text-gray-800">
                    {conversations.find(c => c._id === selectedConversation)?.participant?.name || 'Unknown User'}
                  </h3>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message._id}-${message.createdAt}-${index}`}
                    className={`flex ${message.sender._id === user?._id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender._id === user?._id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender._id === user?._id ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {`${message.sender.firstName} ${message.sender.lastName}`} • {new Date(message.createdAt).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicators */}
                {typingUsers.size > 0 && (
                  <div className="flex justify-start">
                    <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                      <p className="text-sm italic text-gray-600">
                        {Array.from(typingUsers).length === 1 ? 'Someone is typing...' : 'Multiple people are typing...'}
                      </p>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping(e.target.value.length > 0);
                    }}
                    onKeyPress={handleKeyPress}
                    onBlur={() => handleTyping(false)}
                    placeholder="Type your message..."
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={2}
                    disabled={sending}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sending}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages; 
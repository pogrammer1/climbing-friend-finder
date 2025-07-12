import mongoose, { Schema, Document } from 'mongoose';

export interface IConversation extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  lastMessageAt: Date;
  unreadCount: { [userId: string]: number };
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema: Schema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure participants are unique and sorted
ConversationSchema.pre('save', function(next) {
  this.participants = [...new Set(this.participants as mongoose.Types.ObjectId[])].sort();
  next();
});

// Index for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model<IConversation>('Conversation', ConversationSchema); 
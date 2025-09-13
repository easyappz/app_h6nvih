const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const ConversationSchema = new Schema(
  {
    members: {
      type: [{ type: ObjectId, ref: 'User', required: true }],
      validate: v => Array.isArray(v) && v.length === 2
    },
    lastMessage: { type: String, default: '' }
  },
  { timestamps: true }
);

ConversationSchema.index({ members: 1 });
ConversationSchema.index({ updatedAt: -1 });

module.exports = mongoose.model('Conversation', ConversationSchema);

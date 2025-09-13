const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const MessageSchema = new Schema(
  {
    conversation: { type: ObjectId, ref: 'Conversation', required: true, index: true },
    from: { type: ObjectId, ref: 'User', required: true, index: true },
    to: { type: ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' }
  },
  { timestamps: true }
);

MessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);

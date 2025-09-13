const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const CommentSchema = new Schema(
  {
    user: { type: ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const PostSchema = new Schema(
  {
    author: { type: ObjectId, ref: 'User', required: true, index: true },
    text: { type: String, default: '' },
    images: { type: [String], default: [] },
    likes: { type: [{ type: ObjectId, ref: 'User' }], default: [] },
    comments: { type: [CommentSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', PostSchema);

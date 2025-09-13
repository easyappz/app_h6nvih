const mongoose = require('mongoose');

const { Schema, Types } = mongoose;
const ObjectId = Types.ObjectId;

const FriendRequestsSchema = new Schema(
  {
    in: [{ type: ObjectId, ref: 'User', default: [] }],
    out: [{ type: ObjectId, ref: 'User', default: [] }]
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    username: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    coverUrl: { type: String, default: '' },
    passwordHash: { type: String, required: true },
    friends: [{ type: ObjectId, ref: 'User', default: [] }],
    friendRequests: { type: FriendRequestsSchema, default: () => ({ in: [], out: [] }) }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', UserSchema);

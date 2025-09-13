const mongoose = require('mongoose');
const User = require('@src/models/User');

function sanitize(u) {
  const obj = u.toObject ? u.toObject() : u;
  delete obj.passwordHash;
  return obj;
}

exports.sendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }
    if (String(userId) === String(req.userId)) {
      return res.status(400).json({ ok: false, error: 'CANNOT_FRIEND_SELF: You cannot send a friend request to yourself.' });
    }

    const [me, target] = await Promise.all([
      User.findById(req.userId),
      User.findById(userId)
    ]);

    if (!me || !target) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND: One of users does not exist.' });
    }

    if (me.friends.some(id => String(id) === String(userId))) {
      return res.status(400).json({ ok: false, error: 'ALREADY_FRIENDS: You are already friends.' });
    }

    const meOutHas = me.friendRequests?.out?.some(id => String(id) === String(userId));
    const meInHas = me.friendRequests?.in?.some(id => String(id) === String(userId));

    // If target already sent request to me -> accept immediately
    const targetOutHasMe = target.friendRequests?.out?.some(id => String(id) === String(req.userId));

    if (targetOutHasMe || meInHas) {
      await Promise.all([
        User.updateOne(
          { _id: req.userId },
          {
            $addToSet: { friends: userId },
            $pull: { 'friendRequests.in': userId, 'friendRequests.out': userId }
          }
        ),
        User.updateOne(
          { _id: userId },
          {
            $addToSet: { friends: req.userId },
            $pull: { 'friendRequests.in': req.userId, 'friendRequests.out': req.userId }
          }
        )
      ]);
      return res.json({ ok: true, data: { status: 'accepted' } });
    }

    if (meOutHas) {
      return res.json({ ok: true, data: { status: 'already_sent' } });
    }

    await Promise.all([
      User.updateOne({ _id: req.userId }, { $addToSet: { 'friendRequests.out': userId } }),
      User.updateOne({ _id: userId }, { $addToSet: { 'friendRequests.in': req.userId } })
    ]);

    return res.json({ ok: true, data: { status: 'sent' } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `SEND_REQUEST_FAILED: ${err.message}` });
  }
};

exports.acceptRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }

    const me = await User.findById(req.userId);
    if (!me) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND: Current user not found.' });
    }

    const hasIncoming = me.friendRequests?.in?.some(id => String(id) === String(userId));
    if (!hasIncoming) {
      return res.status(400).json({ ok: false, error: 'NO_REQUEST: No incoming request from this user.' });
    }

    await Promise.all([
      User.updateOne(
        { _id: req.userId },
        { $addToSet: { friends: userId }, $pull: { 'friendRequests.in': userId, 'friendRequests.out': userId } }
      ),
      User.updateOne(
        { _id: userId },
        { $addToSet: { friends: req.userId }, $pull: { 'friendRequests.in': req.userId, 'friendRequests.out': req.userId } }
      )
    ]);

    return res.json({ ok: true, data: { status: 'accepted' } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `ACCEPT_REQUEST_FAILED: ${err.message}` });
  }
};

exports.removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }

    await Promise.all([
      User.updateOne(
        { _id: req.userId },
        {
          $pull: { friends: userId, 'friendRequests.in': userId, 'friendRequests.out': userId }
        }
      ),
      User.updateOne(
        { _id: userId },
        {
          $pull: { friends: req.userId, 'friendRequests.in': req.userId, 'friendRequests.out': req.userId }
        }
      )
    ]);

    return res.json({ ok: true, data: { removed: true } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `REMOVE_FRIEND_FAILED: ${err.message}` });
  }
};

exports.getFriends = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ ok: false, error: 'VALIDATION_ERROR: userId is invalid.' });
    }

    const user = await User.findById(userId).select('friends');
    if (!user) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND: User does not exist.' });
    }

    const friends = await User.find({ _id: { $in: user.friends } }).select('-passwordHash');

    return res.json({ ok: true, data: { friends: friends.map(sanitize) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_FRIENDS_FAILED: ${err.message}` });
  }
};

exports.getRequests = async (req, res) => {
  try {
    const me = await User.findById(req.userId).select('friendRequests');
    if (!me) {
      return res.status(404).json({ ok: false, error: 'USER_NOT_FOUND: Current user not found.' });
    }

    const incomingIds = me.friendRequests?.in || [];
    const outgoingIds = me.friendRequests?.out || [];

    const [incoming, outgoing] = await Promise.all([
      User.find({ _id: { $in: incomingIds } }).select('-passwordHash'),
      User.find({ _id: { $in: outgoingIds } }).select('-passwordHash')
    ]);

    return res.json({ ok: true, data: { incoming: incoming.map(sanitize), outgoing: outgoing.map(sanitize) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `GET_REQUESTS_FAILED: ${err.message}` });
  }
};

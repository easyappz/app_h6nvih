const User = require('@src/models/User');

function sanitize(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.passwordHash;
  return u;
}

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'User id is required in path parameter.' });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }
    return res.json({ ok: true, data: { user: sanitize(user) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Failed to get user: ${err.message}` });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ ok: false, error: 'User id is required in path parameter.' });
    }
    if (req.userId !== id) {
      return res.status(403).json({ ok: false, error: 'You can update only your own profile.' });
    }

    const allowed = ['name', 'bio', 'avatarUrl', 'coverUrl', 'username'];
    const update = {};
    for (const key of allowed) {
      if (typeof req.body[key] !== 'undefined') update[key] = req.body[key];
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ ok: false, error: 'No valid fields to update.' });
    }

    if (update.username) {
      const exists = await User.findOne({ username: String(update.username).trim(), _id: { $ne: id } });
      if (exists) {
        return res.status(409).json({ ok: false, error: 'Username is already taken.' });
      }
      update.username = String(update.username).trim();
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }
    return res.json({ ok: true, data: { user: sanitize(user) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Failed to update user: ${err.message}` });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const query = String(q).trim();
    if (query.length === 0) {
      return res.json({ ok: true, data: { users: [] } });
    }

    const rx = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const users = await User.find({
      $or: [{ username: rx }, { name: rx }, { email: rx }]
    })
      .limit(20)
      .select('-passwordHash');

    return res.json({ ok: true, data: { users } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Failed to search users: ${err.message}` });
  }
};

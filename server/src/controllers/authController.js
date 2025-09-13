const bcrypt = require('bcryptjs');
const User = require('@src/models/User');
const { sign } = require('@src/utils/jwt');

function sanitize(user) {
  const u = user.toObject ? user.toObject() : user;
  delete u.passwordHash;
  return u;
}

exports.register = async (req, res) => {
  try {
    const { email, username, name = '', password } = req.body || {};
    if (!email || !username || !password) {
      return res.status(400).json({ ok: false, error: 'Validation error: email, username and password are required.' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ ok: false, error: 'Password must be at least 6 characters long.' });
    }

    const existingByEmail = await User.findOne({ email: String(email).toLowerCase() });
    if (existingByEmail) {
      return res.status(409).json({ ok: false, error: 'Email is already in use.' });
    }

    const existingByUsername = await User.findOne({ username: String(username).trim() });
    if (existingByUsername) {
      return res.status(409).json({ ok: false, error: 'Username is already taken.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: String(email).toLowerCase(),
      username: String(username).trim(),
      name: name || '',
      passwordHash
    });

    const token = sign({ id: user._id.toString() });

    return res.json({ ok: true, data: { token, user: sanitize(user) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Registration failed: ${err.message}` });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ ok: false, error: 'Validation error: email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found with provided email.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ ok: false, error: 'Incorrect password.' });
    }

    const token = sign({ id: user._id.toString() });

    return res.json({ ok: true, data: { token, user: sanitize(user) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Login failed: ${err.message}` });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found.' });
    }
    return res.json({ ok: true, data: { user: sanitize(user) } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: `Failed to fetch profile: ${err.message}` });
  }
};

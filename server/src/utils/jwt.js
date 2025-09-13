const jwt = require('jsonwebtoken');

// Hard-coded secret, as requested. In production, move this to a secure secret store.
const JWT_SECRET = 'super_secret_change_me_please_1234567890';

function sign(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d', ...options });
}

function verify(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  JWT_SECRET,
  sign,
  verify
};

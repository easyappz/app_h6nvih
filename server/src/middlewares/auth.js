const { verify } = require('@src/utils/jwt');

module.exports = function auth(req, res, next) {
  try {
    const header = req.headers['authorization'] || '';
    const [scheme, token] = header.split(' ');
    if (!token || scheme !== 'Bearer') {
      return res.status(401).json({ ok: false, error: 'Authorization header is missing or malformed. Expected: Bearer <token>.' });
    }
    const decoded = verify(token);
    if (!decoded || !decoded.id) {
      return res.status(401).json({ ok: false, error: 'Invalid token: user id is missing.' });
    }
    req.userId = decoded.id;
    return next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: `Unauthorized: ${err.message}` });
  }
};

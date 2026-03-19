const jwt = require('jsonwebtoken');

const rawSecret = process.env.JWT_SECRET;
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && (!rawSecret || String(rawSecret).includes('change-in-production'))) {
  throw new Error('JWT_SECRET must be set to a secure value in production. Set JWT_SECRET in .env');
}
const JWT_SECRET = rawSecret || 'development-secret-change-in-production';

function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
  }
  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
}

module.exports = { auth, JWT_SECRET };

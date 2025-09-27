// server/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const COOKIE_NAME = 'token';
const JWT_SECRET = process.env.JWT_SECRET || 'Nill@crushme09';

const userAuth = async (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') return next(); // let preflight pass

    let token = req.cookies?.[COOKIE_NAME];
    const h = req.headers.authorization;
    if (!token && h?.startsWith('Bearer ')) token = h.slice(7).trim();

    if (!token) return res.status(401).json({ message: 'Please login first' });

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        message: err.name === 'TokenExpiredError' ? 'Session expired. Please login again.' : 'Invalid token',
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    req.user = user;
    req.userId = String(user._id);
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed', error: error.message });
  }
};

module.exports = { userAuth };
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('Missing JWT_SECRET');

function signAccess(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

function signRefresh(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' });
}

function verify(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signAccess, signRefresh, verify };
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) return res.sendStatus(403);
    const user = await User.findByPk(payload.userId);
    if (!user) return res.sendStatus(401);
    req.user = user;
    next();
  });
}

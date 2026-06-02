import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import mongoose from 'mongoose';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_learning_planner_key_123');

      // Check if MongoDB is active
      const isConnected = mongoose.connection.readyState === 1;

      if (isConnected) {
        // Online: Fetch user details from DB (excluding password)
        req.user = await User.findById(decoded.id);
        if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user profile not found' });
        }
      } else {
        // Offline: Securely attach the decoded token ID directly
        console.log('Validating JWT token in Offline Mode...');
        req.user = { _id: decoded.id };
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      res.status(401).json({ message: 'Not authorized, token validation failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, token is missing from headers' });
  }
};

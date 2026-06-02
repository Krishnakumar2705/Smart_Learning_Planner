import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// In-Memory Database Simulator for Users
const MOCK_USERS_DB = [];

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'secret_learning_planner_key_123', {
    expiresIn: '30d',
  });
};

// Check if MongoDB is connected
const isConnected = () => mongoose.connection.readyState === 1;

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide username, email and password' });
    }

    if (isConnected()) {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      const user = await User.create({ username, email, password });
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      // OFFLINE MODE: In-Memory Fallback
      console.log('Registering user in memory (Offline Mode)...');
      const userExists = MOCK_USERS_DB.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ message: 'User already exists with this email' });
      }

      // Hash password in memory
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        _id: new mongoose.Types.ObjectId().toString(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date()
      };

      MOCK_USERS_DB.push(user);
      return res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    if (isConnected()) {
      const user = await User.findOne({ email }).select('+password');
      if (user && (await user.matchPassword(password))) {
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    } else {
      // OFFLINE MODE: In-Memory Fallback
      console.log('Logging in user in memory (Offline Mode)...');
      const user = MOCK_USERS_DB.find(u => u.email === email);
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          token: generateToken(user._id),
        });
      } else {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Simulate Google Authentication
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req, res) => {
  try {
    const { email, username, googleId, avatar } = req.body;

    if (!email || !googleId) {
      return res.status(400).json({ message: 'Google authentication details missing' });
    }

    if (isConnected()) {
      let user = await User.findOne({ email });

      if (!user) {
        user = await User.create({
          username: username || email.split('@')[0],
          email,
          googleId,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'google'}`,
        });
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
        await user.save();
      }

      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      // OFFLINE MODE: In-Memory Fallback
      console.log('Simulating Google Login in memory (Offline Mode)...');
      let user = MOCK_USERS_DB.find(u => u.email === email);

      if (!user) {
        user = {
          _id: new mongoose.Types.ObjectId().toString(),
          username: username || email.split('@')[0],
          email,
          googleId,
          avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'google'}`,
          createdAt: new Date()
        };
        MOCK_USERS_DB.push(user);
      } else if (!user.googleId) {
        user.googleId = googleId;
        if (avatar) user.avatar = avatar;
      }

      return res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Google Auth Server error', error: error.message });
  }
};

// @desc    Get user profile details
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    if (isConnected()) {
      const user = await User.findById(userId);
      if (user) {
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
        });
      } else {
        return res.status(404).json({ message: 'User not found' });
      }
    } else {
      // OFFLINE MODE: In-Memory Fallback
      const user = MOCK_USERS_DB.find(u => u._id === userId.toString());
      if (user) {
        return res.json({
          _id: user._id,
          username: user.username,
          email: user.email,
          avatar: user.avatar || '',
        });
      } else {
        // Fallback profile if token matches a simulated cache user
        return res.json({
          _id: userId,
          username: 'Consistent Learner',
          email: 'learner@domain.com',
          avatar: '',
        });
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

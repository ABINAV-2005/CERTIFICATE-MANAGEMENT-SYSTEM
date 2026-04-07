import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// 🔐 Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};



// =========================
// 🚀 REGISTER
// =========================
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });

    await ActivityLog.create({
      userId: user._id,
      action: 'register',
      description: `New user registered: ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// =========================
// 🔐 LOGIN (UPDATED + REALTIME)
// =========================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 📝 Log activity
    await ActivityLog.create({
      userId: user._id,
      action: 'login',
      description: `User logged in: ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 🔥 REAL-TIME LOGIN EVENT
    const io = req.app.get("io");
    if (io) {
      io.emit("user_login", {
        message: `${user.email} logged in`,
        time: new Date()
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// =========================
// 👤 GET CURRENT USER
// =========================
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



// =========================
// 🚪 LOGOUT
// =========================
router.post('/logout', protect, async (req, res) => {
  try {
    await ActivityLog.create({
      userId: req.user._id,
      action: 'logout',
      description: `User logged out: ${req.user.email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    // 🔥 REAL-TIME LOGOUT EVENT
    const io = req.app.get("io");
    if (io) {
      io.emit("user_logout", {
        message: `${req.user.email} logged out`,
        time: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});



export default router;
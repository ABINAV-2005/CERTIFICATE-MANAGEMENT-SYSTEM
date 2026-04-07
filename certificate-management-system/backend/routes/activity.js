import express from 'express';
import ActivityLog from '../models/ActivityLog.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, async (req, res) => {
  try {
    const { page = 1, limit = 15 } = req.query;
    const logs = await ActivityLog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivityLog.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      logs,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20, action, userId } = req.query;
    const query = {};
    if (action) query.action = action;
    if (userId) query.userId = userId;

    const logs = await ActivityLog.find(query)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await ActivityLog.countDocuments(query);

    res.json({
      success: true,
      logs,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

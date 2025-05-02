const express = require('express');
const User = require('../models/User');
const Resume = require('../models/Resume');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get all users (admin only)
router.get('/', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (admin only)
router.patch('/:id/role', adminAuth, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ message: 'User role updated', user: { id: user._id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get system statistics (admin only)
router.get('/stats/summary', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalResumes = await Resume.countDocuments();
    const pendingResumes = await Resume.countDocuments({ status: 'pending' });
    const processedResumes = await Resume.countDocuments({ status: 'processed' });
    const errorResumes = await Resume.countDocuments({ status: 'error' });
    
    // Get average resume score
    const resumeScores = await Resume.aggregate([
      { $match: { 'analysis.score': { $exists: true } } },
      { $group: { _id: null, avgScore: { $avg: '$analysis.score' } } }
    ]);
    
    const avgScore = resumeScores.length > 0 ? Math.round(resumeScores[0].avgScore) : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUploads = await Resume.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });
    
    res.json({
      users: {
        total: totalUsers,
        recent: recentUsers
      },
      resumes: {
        total: totalResumes,
        pending: pendingResumes,
        processed: processedResumes,
        error: errorResumes,
        recent: recentUploads,
        avgScore
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 
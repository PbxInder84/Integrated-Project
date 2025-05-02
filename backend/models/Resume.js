const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx'],
    required: true
  },
  parsedContent: {
    name: String,
    email: String,
    phone: String,
    education: [String],
    skills: [String]
  },
  analysis: {
    score: {
      type: Number,
      default: 0
    },
    feedback: [String]
  },
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    suggestions: [String],
    targetRoles: [String],
    overallFeedback: String,
    keywordMatch: Number,
    readabilityScore: Number,
    lastUpdated: {
      type: Date,
      default: null
    }
  },
  analysisHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    score: Number
  }],
  status: {
    type: String,
    enum: ['pending', 'processed', 'error'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for faster queries
ResumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Resume', ResumeSchema); 
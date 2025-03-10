const mongoose = require('mongoose');

const AtsScoreSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resumeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
  score: { type: Number, required: true },
  feedback: { type: String },
  analyzedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AtsScore', AtsScoreSchema);

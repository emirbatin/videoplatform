const mongoose = require('mongoose');

const viewHistorySchema = new mongoose.Schema({
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 
  }
});

viewHistorySchema.index({ videoId: 1, ip: 1, createdAt: -1 });

const ViewHistory = mongoose.models.ViewHistory || mongoose.model('ViewHistory', viewHistorySchema);
module.exports = ViewHistory;
const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  domain: { type: String, default: 'unknown' },
  category: { type: String, default: 'neutral' },
  seconds: { type: Number, default: 0 },
  ts: { type: Date, default: Date.now }
});

module.exports = mongoose.models.Usage || mongoose.model('Usage', usageSchema);

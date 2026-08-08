const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  groupName: { type: String, required: true },
  members: [{ type: String }],
  preferences: [{
    user: { type: String },
    genres: [{ type: Number }],
    languages: [{ type: String }],
    decade: { type: String },
    providers: [{ type: String }]
  }],
  votes: { type: mongoose.Schema.Types.Mixed, default: {} },
  locked: { type: Boolean, default: false },
  generating: { type: Boolean, default: false },
  recommendations: { type: Object, default: null },
  recommendationHistory: [{ type: Object }],
  watchlist: { type: Array, default: [] },
  leftMembers: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Group', GroupSchema);

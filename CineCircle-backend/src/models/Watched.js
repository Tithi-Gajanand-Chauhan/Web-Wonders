const mongoose = require('mongoose');

const WatchedSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: String, required: true },
  title: { type: String },
  poster_path: { type: String },
  vote_average: { type: Number },
  release_date: { type: String },
}, { timestamps: true });

WatchedSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Watched', WatchedSchema);

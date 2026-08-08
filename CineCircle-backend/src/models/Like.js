const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: String, required: true },
  title: { type: String },
  poster_path: { type: String },
  vote_average: { type: Number },
  release_date: { type: String },
  genre_ids: { type: [Number] },
}, { timestamps: true });

LikeSchema.index({ userId: 1, movieId: 1 }, { unique: true });

module.exports = mongoose.model('Like', LikeSchema);

const mongoose = require('mongoose');

const CustomListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  movies: [{
    id: { type: Number, required: true },
    title: { type: String, required: true },
    poster_path: { type: String },
    backdrop_path: { type: String },
    vote_average: { type: Number }
  }]
}, { timestamps: true });

module.exports = mongoose.model('CustomList', CustomListSchema);

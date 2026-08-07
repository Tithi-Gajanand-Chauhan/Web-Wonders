const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Watched = require('../models/Watched');

const WATCHED_FILE = path.join(__dirname, '../../data/watched.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_cinecircle';

function initWatchedDB() {
  const dir = path.dirname(WATCHED_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(WATCHED_FILE)) {
    fs.writeFileSync(WATCHED_FILE, JSON.stringify([]), 'utf8');
  }
}

function readJSONWatched() {
  try {
    initWatchedDB();
    const data = fs.readFileSync(WATCHED_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading watched database:', err);
    return [];
  }
}

function writeJSONWatched(watched) {
  try {
    initWatchedDB();
    fs.writeFileSync(WATCHED_FILE, JSON.stringify(watched, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to watched database:', err);
  }
}

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

// GET /api/watched/:movieId - Check if current user has watched the movie
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    let userWatched = false;

    const authHeader = req.headers['authorization'];
    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        try {
          const decoded = jwt.verify(parts[1], JWT_SECRET);
          const userId = decoded.id;

          if (isMongoActive()) {
            const entry = await Watched.findOne({ userId, movieId });
            userWatched = !!entry;
          } else {
            const allWatched = readJSONWatched();
            userWatched = allWatched.some(w => String(w.userId) === String(userId) && String(w.movieId) === String(movieId));
          }
        } catch (e) {
          // Fail silently
        }
      }
    }
    res.json({ userWatched });
  } catch (err) {
    console.error('Error fetching watched status:', err.message);
    res.status(500).json({ error: 'Failed to fetch watched status' });
  }
});

// POST /api/watched/:movieId/toggle - Toggle watched status
router.post('/:movieId/toggle', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;
    let userWatched = false;

    if (isMongoActive()) {
      const existing = await Watched.findOne({ userId, movieId });
      if (existing) {
        await Watched.findByIdAndDelete(existing._id);
        userWatched = false;
      } else {
        const newWatched = new Watched({ userId, movieId });
        await newWatched.save();
        userWatched = true;
      }
    } else {
      const allWatched = readJSONWatched();
      const existingIndex = allWatched.findIndex(w => String(w.userId) === String(userId) && String(w.movieId) === String(movieId));

      if (existingIndex !== -1) {
        allWatched.splice(existingIndex, 1);
        userWatched = false;
      } else {
        allWatched.push({
          _id: Math.random().toString(36).substring(2, 9),
          userId,
          movieId,
          createdAt: new Date().toISOString()
        });
        userWatched = true;
      }
      writeJSONWatched(allWatched);
    }

    res.json({ userWatched });
  } catch (err) {
    console.error('Error toggling watched status:', err.message);
    res.status(500).json({ error: 'Failed to toggle watched status' });
  }
});

module.exports = router;

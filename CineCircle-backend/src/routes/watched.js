const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Watched = require('../models/Watched');
const tmdbService = require('../service/tmdbService');

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

// GET /api/watched - Get all watched movies for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];
    if (isMongoActive()) {
      list = await Watched.find({ userId }).sort({ createdAt: -1 });
    } else {
      const allWatched = readJSONWatched();
      list = allWatched
        .filter(w => String(w.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    let needsWrite = false;
    const enrichedList = await Promise.all(list.map(async (item) => {
      const itemObj = item.toObject ? item.toObject() : { ...item };
      
      if (!itemObj.title || !itemObj.poster_path || !itemObj.genre_ids || itemObj.genre_ids.length === 0) {
        try {
          const details = await tmdbService.getMovieDetails(itemObj.movieId);
          if (details) {
            itemObj.title = details.title || details.name;
            itemObj.poster_path = details.poster_path;
            itemObj.vote_average = details.vote_average;
            itemObj.release_date = details.release_date;
            
            let finalGenreIds = [];
            if (details.genre_ids && Array.isArray(details.genre_ids)) {
              finalGenreIds = details.genre_ids;
            } else if (details.genres && Array.isArray(details.genres)) {
              finalGenreIds = details.genres.map(g => typeof g === 'object' ? g.id : g).filter(Boolean);
            }
            itemObj.genre_ids = finalGenreIds;
            
            if (isMongoActive()) {
              await Watched.findByIdAndUpdate(itemObj._id, {
                title: itemObj.title,
                poster_path: itemObj.poster_path,
                vote_average: itemObj.vote_average,
                release_date: itemObj.release_date,
                genre_ids: itemObj.genre_ids
              });
            } else {
              needsWrite = true;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch details for watched movie ${itemObj.movieId}:`, e.message);
        }
      }
      return itemObj;
    }));

    if (!isMongoActive() && needsWrite) {
      const allWatched = readJSONWatched();
      enrichedList.forEach(itemObj => {
        const idx = allWatched.findIndex(w => String(w._id) === String(itemObj._id));
        if (idx !== -1) {
          allWatched[idx] = { ...allWatched[idx], ...itemObj };
        }
      });
      writeJSONWatched(allWatched);
    }

    res.json(enrichedList);
  } catch (err) {
    console.error('Error fetching watched list:', err.message);
    res.status(500).json({ error: 'Failed to fetch watched list' });
  }
});

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
        const movieData = req.body.movie || {};
        let finalGenreIds = [];
        if (movieData.genre_ids && Array.isArray(movieData.genre_ids)) {
          finalGenreIds = movieData.genre_ids;
        } else if (movieData.genres && Array.isArray(movieData.genres)) {
          finalGenreIds = movieData.genres.map(g => typeof g === 'object' ? g.id : g).filter(Boolean);
        }

        const newWatched = new Watched({
          userId,
          movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          vote_average: movieData.vote_average,
          release_date: movieData.release_date,
          genre_ids: finalGenreIds
        });
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
        const movieData = req.body.movie || {};
        let finalGenreIds = [];
        if (movieData.genre_ids && Array.isArray(movieData.genre_ids)) {
          finalGenreIds = movieData.genre_ids;
        } else if (movieData.genres && Array.isArray(movieData.genres)) {
          finalGenreIds = movieData.genres.map(g => typeof g === 'object' ? g.id : g).filter(Boolean);
        }

        allWatched.push({
          _id: Math.random().toString(36).substring(2, 9),
          userId,
          movieId,
          title: movieData.title,
          poster_path: movieData.poster_path,
          vote_average: movieData.vote_average,
          release_date: movieData.release_date,
          genre_ids: finalGenreIds,
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

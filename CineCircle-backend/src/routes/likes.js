const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const Like = require('../models/Like');
const tmdbService = require('../service/tmdbService');

const LIKES_FILE = path.join(__dirname, '../../data/likes.json');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_cinecircle';

function initLikesDB() {
  const dir = path.dirname(LIKES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LIKES_FILE)) {
    fs.writeFileSync(LIKES_FILE, JSON.stringify([]), 'utf8');
  }
}

function readJSONLikes() {
  try {
    initLikesDB();
    const data = fs.readFileSync(LIKES_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading likes database:', err);
    return [];
  }
}

function writeJSONLikes(likes) {
  try {
    initLikesDB();
    fs.writeFileSync(LIKES_FILE, JSON.stringify(likes, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to likes database:', err);
  }
}

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

// GET /api/likes - Get all liked movies for the current user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];
    if (isMongoActive()) {
      list = await Like.find({ userId }).sort({ createdAt: -1 });
    } else {
      const allLikes = readJSONLikes();
      list = allLikes
        .filter(l => String(l.userId) === String(userId))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    let needsWrite = false;
    const enrichedList = await Promise.all(list.map(async (item) => {
      const itemObj = item.toObject ? item.toObject() : { ...item };
      
      if (!itemObj.title || !itemObj.poster_path) {
        try {
          const details = await tmdbService.getMovieDetails(itemObj.movieId);
          if (details) {
            itemObj.title = details.title || details.name;
            itemObj.poster_path = details.poster_path;
            itemObj.vote_average = details.vote_average;
            itemObj.release_date = details.release_date;
            
            if (isMongoActive()) {
              await Like.findByIdAndUpdate(itemObj._id, {
                title: itemObj.title,
                poster_path: itemObj.poster_path,
                vote_average: itemObj.vote_average,
                release_date: itemObj.release_date
              });
            } else {
              needsWrite = true;
            }
          }
        } catch (e) {
          console.error(`Failed to fetch details for liked movie ${itemObj.movieId}:`, e.message);
        }
      }
      return itemObj;
    }));

    if (!isMongoActive() && needsWrite) {
      const allLikes = readJSONLikes();
      enrichedList.forEach(itemObj => {
        const idx = allLikes.findIndex(l => String(l._id) === String(itemObj._id));
        if (idx !== -1) {
          allLikes[idx] = { ...allLikes[idx], ...itemObj };
        }
      });
      writeJSONLikes(allLikes);
    }

    res.json(enrichedList);
  } catch (err) {
    console.error('Error fetching likes list:', err.message);
    res.status(500).json({ error: 'Failed to fetch likes list' });
  }
});

// GET /api/likes/:movieId - Get total likes count and check if the current user has liked
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    if (isMongoActive()) {
      const likesCount = await Like.countDocuments({ movieId });
      
      let userLiked = false;
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          try {
            const decoded = jwt.verify(parts[1], JWT_SECRET);
            const userId = decoded.id;
            const userLike = await Like.findOne({ userId, movieId });
            userLiked = !!userLike;
          } catch (e) {
            // Fail silently
          }
        }
      }
      res.json({ likesCount, userLiked });
    } else {
      // JSON fallback
      const allLikes = readJSONLikes();
      const likesCount = allLikes.filter(l => String(l.movieId) === String(movieId)).length;
      
      let userLiked = false;
      const authHeader = req.headers['authorization'];
      if (authHeader) {
        const parts = authHeader.split(' ');
        if (parts.length === 2 && parts[0] === 'Bearer') {
          try {
            const decoded = jwt.verify(parts[1], JWT_SECRET);
            const userId = decoded.id;
            userLiked = allLikes.some(l => String(l.userId) === String(userId) && String(l.movieId) === String(movieId));
          } catch (e) {
            // Fail silently
          }
        }
      }
      res.json({ likesCount, userLiked });
    }
  } catch (err) {
    console.error('Error fetching likes:', err.message);
    res.status(500).json({ error: 'Failed to fetch likes' });
  }
});

// POST /api/likes/:movieId/toggle - Toggle like status for the user
router.post('/:movieId/toggle', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    if (isMongoActive()) {
      const existingLike = await Like.findOne({ userId, movieId });
      let liked = false;

      if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);
        liked = false;
      } else {
        const { title, poster_path, vote_average, release_date } = req.body.movie || {};
        const newLike = new Like({
          userId,
          movieId,
          title,
          poster_path,
          vote_average,
          release_date
        });
        await newLike.save();
        liked = true;
      }

      const likesCount = await Like.countDocuments({ movieId });
      res.json({ liked, likesCount });
    } else {
      // JSON fallback
      const allLikes = readJSONLikes();
      const existingIndex = allLikes.findIndex(l => String(l.userId) === String(userId) && String(l.movieId) === String(movieId));
      let liked = false;

      if (existingIndex !== -1) {
        allLikes.splice(existingIndex, 1);
        liked = false;
      } else {
        const { title, poster_path, vote_average, release_date } = req.body.movie || {};
        allLikes.push({
          _id: Math.random().toString(36).substring(2, 9),
          userId,
          movieId,
          title,
          poster_path,
          vote_average,
          release_date,
          createdAt: new Date().toISOString()
        });
        liked = true;
      }

      writeJSONLikes(allLikes);
      const likesCount = allLikes.filter(l => String(l.movieId) === String(movieId)).length;
      res.json({ liked, likesCount });
    }
  } catch (err) {
    console.error('Error toggling like:', err.message);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;

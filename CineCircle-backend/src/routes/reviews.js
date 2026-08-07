const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const Review = require('../models/Review');

const REVIEWS_FILE = path.join(__dirname, '../../data/reviews.json');
const USERS_FILE = path.join(__dirname, '../../data/users.json');

function initReviewsDB() {
  const dir = path.dirname(REVIEWS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(REVIEWS_FILE)) {
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify([]), 'utf8');
  }
}

function readJSONReviews() {
  try {
    initReviewsDB();
    const data = fs.readFileSync(REVIEWS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading reviews database:', err);
    return [];
  }
}

function writeJSONReviews(reviews) {
  try {
    initReviewsDB();
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to reviews database:', err);
  }
}

function readJSONUsers() {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data || '{}');
    }
  } catch (err) {
    console.error('Error reading users database:', err);
  }
  return {};
}

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

// GET /api/reviews/:movieId - Get all reviews and average rating for a movie
router.get('/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;

    if (isMongoActive()) {
      const reviews = await Review.find({ movieId }).sort({ createdAt: -1 });
      let averageRating = 0;
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        averageRating = parseFloat((sum / reviews.length).toFixed(1));
      }
      res.json({
        reviews,
        averageRating,
        totalReviews: reviews.length
      });
    } else {
      // JSON fallback
      const allReviews = readJSONReviews();
      const reviews = allReviews.filter(r => String(r.movieId) === String(movieId));
      reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      let averageRating = 0;
      if (reviews.length > 0) {
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        averageRating = parseFloat((sum / reviews.length).toFixed(1));
      }
      res.json({
        reviews,
        averageRating,
        totalReviews: reviews.length
      });
    }
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/reviews/:movieId - Add or update a review
router.post('/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { rating, reviewText } = req.body;
    const userId = req.user.id;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (isMongoActive()) {
      const User = require('../models/User');
      const userObj = await User.findById(userId);
      if (!userObj) {
        return res.status(404).json({ error: 'User not found' });
      }

      const review = await Review.findOneAndUpdate(
        { userId, movieId },
        { 
          username: userObj.username, 
          rating, 
          reviewText 
        },
        { new: true, upsert: true }
      );
      res.status(201).json(review);
    } else {
      // JSON fallback
      const users = readJSONUsers();
      const userObj = users[userId];
      if (!userObj) {
        return res.status(404).json({ error: 'User not found' });
      }

      const allReviews = readJSONReviews();
      const existingIndex = allReviews.findIndex(r => String(r.userId) === String(userId) && String(r.movieId) === String(movieId));
      
      const newReview = {
        _id: existingIndex !== -1 ? allReviews[existingIndex]._id : Math.random().toString(36).substring(2, 9),
        userId,
        username: userObj.username,
        movieId,
        rating: Number(rating),
        reviewText: reviewText || '',
        createdAt: existingIndex !== -1 ? allReviews[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingIndex !== -1) {
        allReviews[existingIndex] = newReview;
      } else {
        allReviews.push(newReview);
      }

      writeJSONReviews(allReviews);
      res.status(201).json(newReview);
    }
  } catch (err) {
    console.error('Error submitting review:', err.message);
    res.status(500).json({ error: 'Failed to submit review' });
  }
});

// DELETE /api/reviews/:movieId - Delete a user's review
router.delete('/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const userId = req.user.id;

    if (isMongoActive()) {
      const result = await Review.findOneAndDelete({ userId, movieId });
      if (!result) {
        return res.status(404).json({ error: 'Review not found' });
      }
      res.json({ message: 'Review deleted successfully' });
    } else {
      // JSON fallback
      const allReviews = readJSONReviews();
      const filtered = allReviews.filter(r => !(String(r.userId) === String(userId) && String(r.movieId) === String(movieId)));
      
      if (filtered.length === allReviews.length) {
        return res.status(404).json({ error: 'Review not found' });
      }

      writeJSONReviews(filtered);
      res.json({ message: 'Review deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting review:', err.message);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// GET /api/reviews/:movieId/stats - Get rating distribution statistics
router.get('/:movieId/stats', async (req, res) => {
  try {
    const { movieId } = req.params;
    let reviews = [];

    if (isMongoActive()) {
      reviews = await Review.find({ movieId });
    } else {
      const allReviews = readJSONReviews();
      reviews = allReviews.filter(r => String(r.movieId) === String(movieId));
    }

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => {
      const rating = Math.round(r.rating);
      if (distribution[rating] !== undefined) {
        distribution[rating]++;
      }
    });

    const total = reviews.length;
    const average = total > 0 
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)) 
      : 0;

    res.json({
      distribution,
      totalReviews: total,
      averageRating: average
    });
  } catch (err) {
    console.error('Error fetching review stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch review statistics' });
  }
});

module.exports = router;

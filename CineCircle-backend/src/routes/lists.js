const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/auth');
const CustomList = require('../models/CustomList');

const LISTS_FILE = path.join(__dirname, '../../data/lists.json');

function initListsDB() {
  const dir = path.dirname(LISTS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(LISTS_FILE)) {
    fs.writeFileSync(LISTS_FILE, JSON.stringify([]), 'utf8');
  }
}

function readJSONLists() {
  try {
    initListsDB();
    const data = fs.readFileSync(LISTS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading lists database:', err);
    return [];
  }
}

function writeJSONLists(lists) {
  try {
    initListsDB();
    fs.writeFileSync(LISTS_FILE, JSON.stringify(lists, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to lists database:', err);
  }
}

function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

// GET /api/lists - Fetch all custom lists for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    if (isMongoActive()) {
      const lists = await CustomList.find({ userId }).sort({ createdAt: -1 });
      res.json(lists);
    } else {
      // JSON fallback
      const allLists = readJSONLists();
      const userLists = allLists.filter(l => String(l.userId) === String(userId));
      userLists.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      res.json(userLists);
    }
  } catch (err) {
    console.error('Error fetching custom lists:', err.message);
    res.status(500).json({ error: 'Failed to fetch custom lists' });
  }
});

// POST /api/lists - Create a new custom list
router.post('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, description } = req.body;
    
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'List name is required' });
    }

    if (isMongoActive()) {
      const newList = new CustomList({
        userId,
        name: name.trim(),
        description: description ? description.trim() : '',
        movies: []
      });
      await newList.save();
      res.status(201).json(newList);
    } else {
      // JSON fallback
      const allLists = readJSONLists();
      const newList = {
        _id: Math.random().toString(36).substring(2, 9),
        userId,
        name: name.trim(),
        description: description ? description.trim() : '',
        movies: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      allLists.push(newList);
      writeJSONLists(allLists);
      res.status(201).json(newList);
    }
  } catch (err) {
    console.error('Error creating custom list:', err.message);
    res.status(500).json({ error: 'Failed to create custom list' });
  }
});

// DELETE /api/lists/:listId - Delete a custom list
router.delete('/:listId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;

    if (isMongoActive()) {
      const list = await CustomList.findOneAndDelete({ _id: listId, userId });
      if (!list) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }
      res.json({ message: 'List deleted successfully' });
    } else {
      // JSON fallback
      const allLists = readJSONLists();
      const index = allLists.findIndex(l => String(l._id) === String(listId) && String(l.userId) === String(userId));
      
      if (index === -1) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }

      allLists.splice(index, 1);
      writeJSONLists(allLists);
      res.json({ message: 'List deleted successfully' });
    }
  } catch (err) {
    console.error('Error deleting custom list:', err.message);
    res.status(500).json({ error: 'Failed to delete custom list' });
  }
});

// POST /api/lists/:listId/movies - Add a movie to a custom list
router.post('/:listId/movies', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId } = req.params;
    const { id, title, poster_path, backdrop_path, vote_average } = req.body;

    if (!id || !title) {
      return res.status(400).json({ error: 'Movie ID and Title are required' });
    }

    if (isMongoActive()) {
      const list = await CustomList.findOne({ _id: listId, userId });
      if (!list) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }

      const alreadyExists = list.movies.some(m => m.id === Number(id));
      if (alreadyExists) {
        return res.status(400).json({ error: 'Movie already in this list' });
      }

      list.movies.push({
        id: Number(id),
        title,
        poster_path,
        backdrop_path,
        vote_average: vote_average || 0
      });

      await list.save();
      res.json(list);
    } else {
      // JSON fallback
      const allLists = readJSONLists();
      const list = allLists.find(l => String(l._id) === String(listId) && String(l.userId) === String(userId));
      
      if (!list) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }

      const alreadyExists = list.movies.some(m => Number(m.id) === Number(id));
      if (alreadyExists) {
        return res.status(400).json({ error: 'Movie already in this list' });
      }

      list.movies.push({
        id: Number(id),
        title,
        poster_path,
        backdrop_path,
        vote_average: vote_average || 0
      });
      list.updatedAt = new Date().toISOString();

      writeJSONLists(allLists);
      res.json(list);
    }
  } catch (err) {
    console.error('Error adding movie to custom list:', err.message);
    res.status(500).json({ error: 'Failed to add movie to custom list' });
  }
});

// DELETE /api/lists/:listId/movies/:movieId - Remove a movie from a custom list
router.delete('/:listId/movies/:movieId', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { listId, movieId } = req.params;

    if (isMongoActive()) {
      const list = await CustomList.findOne({ _id: listId, userId });
      if (!list) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }

      list.movies = list.movies.filter(m => String(m.id) !== String(movieId));
      await list.save();
      res.json(list);
    } else {
      // JSON fallback
      const allLists = readJSONLists();
      const list = allLists.find(l => String(l._id) === String(listId) && String(l.userId) === String(userId));
      
      if (!list) {
        return res.status(404).json({ error: 'List not found or unauthorized' });
      }

      list.movies = list.movies.filter(m => String(m.id) !== String(movieId));
      list.updatedAt = new Date().toISOString();

      writeJSONLists(allLists);
      res.json(list);
    }
  } catch (err) {
    console.error('Error removing movie from custom list:', err.message);
    res.status(500).json({ error: 'Failed to remove movie from custom list' });
  }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_for_cinecircle';
const USERS_FILE = path.join(__dirname, '../../data/users.json');

function initUsersDB() {
  const dir = path.dirname(USERS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({}), 'utf8');
  }
}

function readJSONUsers() {
  try {
    initUsersDB();
    const data = fs.readFileSync(USERS_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading users database:', err);
    return {};
  }
}

function writeJSONUsers(users) {
  try {
    initUsersDB();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to users database:', err);
  }
}

// Helper to check if Mongoose is connected
function isMongoActive() {
  return mongoose.connection.readyState === 1;
}

// Sign Up
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Please enter all fields' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim();

    if (isMongoActive()) {
      const userExists = await User.findOne({ $or: [{ email: cleanEmail }, { username: cleanUsername }] });
      if (userExists) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ username: cleanUsername, email: cleanEmail, password: hashedPassword });
      await newUser.save();

      const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: newUser._id, username: cleanUsername, email: cleanEmail } });
    } else {
      // JSON fallback
      const users = readJSONUsers();
      const exists = Object.values(users).some(u => u.email === cleanEmail || u.username === cleanUsername);
      if (exists) {
        return res.status(400).json({ error: 'Username or email already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Math.random().toString(36).substring(2, 9);
      const newUser = { id, username: cleanUsername, email: cleanEmail, password: hashedPassword };
      
      users[id] = newUser;
      writeJSONUsers(users);

      const token = jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id, username: cleanUsername, email: cleanEmail } });
    }
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Log In
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Please enter all fields' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();

    if (isMongoActive()) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, username: user.username, email: cleanEmail } });
    } else {
      // JSON fallback
      const users = readJSONUsers();
      const user = Object.values(users).find(u => u.email === cleanEmail);
      if (!user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: user.id, username: user.username, email: cleanEmail } });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;

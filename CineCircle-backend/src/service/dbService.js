const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Group = require('../models/Group');

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'groups.json');

let isMongoConnected = false;

// Check Mongoose connection state
mongoose.connection.on('connected', () => {
  console.log('★ dbService: MongoDB connected. Switching to MongoDB storage mode.');
  isMongoConnected = true;
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠ dbService: MongoDB disconnected. Falling back to local file storage.');
  isMongoConnected = false;
});

mongoose.connection.on('error', (err) => {
  console.log('⚠ dbService: MongoDB connection error. Using local file storage.');
  isMongoConnected = false;
});

// Ensure database directory and file exist for JSON fallback
function initJSONDB() {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({}), 'utf8');
  }
}

function readJSONGroups() {
  try {
    initJSONDB();
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading groups database:', err);
    return {};
  }
}

function writeJSONGroups(groups) {
  try {
    initJSONDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(groups, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing to groups database:', err);
  }
}

module.exports = {
  getGroup: async (code) => {
    if (!code) return null;
    const cleanCode = code.toUpperCase();

    if (isMongoConnected) {
      try {
        const group = await Group.findOne({ code: cleanCode });
        return group ? group.toObject() : null;
      } catch (err) {
        console.error('MongoDB getGroup error, falling back to JSON:', err);
      }
    }

    const groups = readJSONGroups();
    return groups[cleanCode] || null;
  },

  saveGroup: async (code, groupData) => {
    if (!code) return null;
    const cleanCode = code.toUpperCase();

    // Clean data for MongoDB if saving Mongoose document
    const dataToSave = groupData.toObject ? groupData.toObject() : groupData;

    if (isMongoConnected) {
      try {
        const updated = await Group.findOneAndUpdate(
          { code: cleanCode },
          dataToSave,
          { new: true, upsert: true }
        );
        return updated.toObject();
      } catch (err) {
        console.error('MongoDB saveGroup error, falling back to JSON:', err);
      }
    }

    const groups = readJSONGroups();
    groups[cleanCode] = dataToSave;
    writeJSONGroups(groups);
    return dataToSave;
  },

  hasGroup: async (code) => {
    if (!code) return false;
    const cleanCode = code.toUpperCase();

    if (isMongoConnected) {
      try {
        const exists = await Group.exists({ code: cleanCode });
        return !!exists;
      } catch (err) {
        console.error('MongoDB hasGroup error, falling back to JSON:', err);
      }
    }

    const groups = readJSONGroups();
    return !!groups[cleanCode];
  },

  getAllCodes: async () => {
    if (isMongoConnected) {
      try {
        const groups = await Group.find({}, 'code');
        return groups.map(g => g.code);
      } catch (err) {
        console.error('MongoDB getAllCodes error, falling back to JSON:', err);
      }
    }

    const groups = readJSONGroups();
    return Object.keys(groups);
  }
};

const express = require("express");
const router = express.Router();

const groups = new Map();

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}


// Create group
router.post("/create", (req, res) => {
  const { groupName, creatorName } = req.body;

  if (!groupName || !creatorName) {
    return res.status(400).json({
      error: "Missing details"
    });
  }

  const code = generateCode();

  groups.set(code, {
    groupName,
    members: [creatorName],
    preferences: []
  });

  res.json({
    code,
    groupName,
    members: [creatorName]
  });
});


// Join group
router.post("/join", (req, res) => {
  const { code, username } = req.body;

  const group = groups.get(code);

  if (!group) {
    return res.status(404).json({
      error: "Group not found"
    });
  }

  group.members.push(username);

  res.json(group);
});

router.post("/preferences", (req, res) => {
  const { groupCode, preferences } = req.body;

  const group = groups.get(groupCode);

  if (!group) {
    return res.status(404).json({
      error: "Group not found",
    });
  }

  group.preferences.push(preferences);

  res.json({
    message: "Preferences saved successfully",
    group,
  });
});

router.post("/recommend", (req, res) => {
  console.log("RECOMMEND ROUTE HIT");

  const { groupCode } = req.body;

  console.log("Group code received:", groupCode);

  const group = groups.get(groupCode);

  if (!group) {
    return res.status(404).json({
      error: "Group not found"
    });
  }

  // temporary recommendation
  const movie = {
    title: "Interstellar",
    poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    genre: "Sci-Fi",
    language: "English",
    duration: "2h 49min",
    rating: 8.7,
    reason: "Recommended because your group likes Sci-Fi and emotional movies."
  };

  res.json({
    movie
  });
});

module.exports = router;
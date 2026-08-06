const express = require("express");
const router = express.Router();

const { getGroupRecommendations } = require("../service/recommendationService");
const db = require("../service/dbService");

async function generateCode() {
  let code;
  let exists = true;
  while (exists) {
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    exists = await db.hasGroup(code);
  }
  return code;
}

// Create Group
router.post("/create", async (req, res) => {
  const { groupName, creatorName } = req.body;

  if (!groupName || !creatorName) {
    return res.status(400).json({
      error: "Missing details"
    });
  }

  try {
    const code = await generateCode();

    const group = {
      code,
      groupName,
      members: [creatorName],
      preferences: [],
      votes: {},
      locked: false,
      recommendations: null,
      recommendationHistory: []
    };

    await db.saveGroup(code, group);

    res.json({
      code,
      groupName,
      members: [creatorName]
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ error: "Failed to create group" });
  }
});

// Join Group
router.post("/join", async (req, res) => {
  const { code, username } = req.body;

  if (!code || !username) {
    return res.status(400).json({
      message: "Missing details"
    });
  }

  try {
    const group = await db.getGroup(code);

    if (!group) {
      return res.status(404).json({
        success: false,
        message: "Group not found"
      });
    }

    if (group.locked) {
      return res.status(400).json({
        success: false,
        message: "This group has already started recommendations."
      });
    }

    if (!group.members.includes(username)) {
      group.members.push(username);
      await db.saveGroup(code, group);
    }

    res.json({
      success: true,
      group: {
        groupName: group.groupName,
        code: code.toUpperCase(),
        members: group.members
      }
    });
  } catch (error) {
    console.error("Join group error:", error);
    res.status(500).json({ error: "Failed to join group" });
  }
});

// Get current group state (members, status, preferences count)
router.get("/:code", async (req, res) => {
  try {
    const group = await db.getGroup(req.params.code);

    if (!group) {
      return res.status(404).json({ success: false, error: "Group not found" });
    }

    res.json({
      success: true,
      groupName: group.groupName,
      members: group.members,
      preferencesCount: group.preferences.length,
      votes: group.votes
    });
  } catch (error) {
    console.error("Get group state error:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

router.post("/preferences", async (req, res) => {
  const { groupCode, preferences } = req.body;

  try {
    const group = await db.getGroup(groupCode);

    if (!group) {
      return res.status(404).json({
        error: "Group not found"
      });
    }

    const index = group.preferences.findIndex(
      (p) => p.user === preferences.user
    );

    if (index !== -1) {
      group.preferences[index] = preferences;
    } else {
      group.preferences.push(preferences);
    }

    // Invalidate cached recommendations and unlock the group since preferences have changed
    group.recommendations = null;
    group.locked = false;

    await db.saveGroup(groupCode, group);

    console.log(
      "PREFERENCES AFTER SAVE:",
      JSON.stringify(group.preferences, null, 2)
    );

    res.json({
      message: "Preferences saved successfully",
      group
    });
  } catch (error) {
    console.error("Save preferences error:", error);
    res.status(500).json({ error: "Failed to save preferences" });
  }
});

router.get("/status/:groupCode", async (req, res) => {
  try {
    const group = await db.getGroup(req.params.groupCode);

    if (!group) {
      return res.status(404).json({
        error: "Group not found"
      });
    }

    res.json({
      totalMembers: group.members.length,
      submittedPreferences: group.preferences.length,
      everyoneReady: group.preferences.length === group.members.length,
      locked: group.locked,
      generating: !!group.generating,
      hasRecommendations: !!(group.recommendations && group.recommendations.recommendations && group.recommendations.recommendations.length > 0)
    });
  } catch (error) {
    console.error("Get status error:", error);
    res.status(500).json({ error: "Failed to fetch group status" });
  }
});

router.post("/recommend", async (req, res) => {
  console.log("RECOMMEND ROUTE HIT");
  const { groupCode, forceRegenerate } = req.body;

  if (!groupCode) {
    return res.status(400).json({ error: "Missing groupCode" });
  }

  try {
    const group = await db.getGroup(groupCode);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.recommendationHistory) {
      group.recommendationHistory = [];
    }

    console.log(
      "GROUP PREFERENCES:",
      JSON.stringify(group.preferences, null, 2)
    );

    // If recommendations already generated and we are not forcing a new one
    if (
      !forceRegenerate &&
      group.recommendations &&
      group.recommendations.recommendations &&
      group.recommendations.recommendations.length > 0
    ) {
      console.log("Returning saved recommendations");
      return res.json({
        ...group.recommendations,
        hasPrev: group.recommendationHistory.length > 0
      });
    }

    if (group.generating) {
      console.log("Already generating recommendations for group:", groupCode);
      return res.json({
        message: "Already generating",
        generating: true,
        recommendations: group.recommendations || null,
        hasPrev: group.recommendationHistory.length > 0
      });
    }

    // Handle force regeneration history push
    if (forceRegenerate && group.recommendations) {
      group.recommendationHistory.push(group.recommendations);
      group.votes = {}; // Reset votes on regeneration
    }

    // Lock group immediately to prevent duplicate triggers from lobby polling
    group.generating = true;
    group.locked = true;
    await db.saveGroup(groupCode, group);

    try {
      console.log("Generating new recommendations...");
      const excludeMovieIds = [];

      // Exclude currently active ones
      if (group.recommendations && group.recommendations.recommendations) {
        group.recommendations.recommendations.forEach(r => {
          const id = Number(r.movieId || r.id);
          if (id) excludeMovieIds.push(id);
        });
      }

      // Exclude all historical ones
      if (group.recommendationHistory) {
        group.recommendationHistory.forEach(hist => {
          const list = hist.recommendations || [];
          list.forEach(r => {
            const id = Number(r.movieId || r.id);
            if (id) excludeMovieIds.push(id);
          });
        });
      }

      // Clear active recommendation state before generating
      group.recommendations = null;

      const recommendations = await getGroupRecommendations(group.preferences, excludeMovieIds);

      console.log(
        "FINAL RECOMMENDATIONS BEFORE SAVE:",
        JSON.stringify(recommendations, null, 2)
      );

      // Save recommendations to group state
      group.recommendations = recommendations;
      group.generating = false;
      await db.saveGroup(groupCode, group);

      return res.json({
        ...recommendations,
        hasPrev: group.recommendationHistory.length > 0
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      group.generating = false;
      await db.saveGroup(groupCode, group);
      return res.status(500).json({
        error: "Failed to generate recommendation"
      });
    }
  } catch (error) {
    console.error("Recommend handler error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/recommend/back", async (req, res) => {
  const { groupCode } = req.body;

  if (!groupCode) {
    return res.status(400).json({ error: "Missing groupCode" });
  }

  try {
    const group = await db.getGroup(groupCode);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (!group.recommendationHistory || group.recommendationHistory.length === 0) {
      return res.status(400).json({ error: "No previous recommendations in history" });
    }

    const prevRecs = group.recommendationHistory.pop();
    group.recommendations = prevRecs;
    group.votes = {}; // Clear votes when reverting

    await db.saveGroup(groupCode, group);

    return res.json({
      ...prevRecs,
      hasPrev: group.recommendationHistory.length > 0
    });
  } catch (error) {
    console.error("Recommend back error:", error);
    res.status(500).json({ error: "Failed to step back recommendation" });
  }
});

router.get("/winner/:groupCode", async (req, res) => {
  try {
    const group = await db.getGroup(req.params.groupCode);

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    let winner = null;
    let maxVotes = -1;
    let isTie = false;

    const votesObject = group.votes || {};

    Object.keys(votesObject).forEach((movieId) => {
      const votes = votesObject[movieId].users.length;

      if (votes > maxVotes) {
        maxVotes = votes;
        winner = {
          movieId,
          title: votesObject[movieId].title
        };
        isTie = false;
      } else if (votes === maxVotes && maxVotes > 0) {
        isTie = true;
      }
    });

    res.json({
      movieId: winner?.movieId || null,
      title: winner?.title || "No winner",
      votes: maxVotes > -1 ? maxVotes : 0,
      isTie
    });
  } catch (error) {
    console.error("Get winner error:", error);
    res.status(500).json({ error: "Failed to determine winner" });
  }
});

// Vote for a movie
router.post("/vote", async (req, res) => {
  const {
    groupCode,
    movieId,
    movieTitle,
    username,
    action
  } = req.body;

  try {
    const group = await db.getGroup(groupCode);

    if (!group) {
      return res.status(404).json({
        error: "Group not found"
      });
    }

    if (!group.votes) {
      group.votes = {};
    }

    if (!group.votes[movieId]) {
      group.votes[movieId] = {
        title: movieTitle,
        users: []
      };
    }

    if (action === "unvote") {
      group.votes[movieId].users = group.votes[movieId].users.filter(
        user => user !== username
      );
    } else {
      if (!group.votes[movieId].users.includes(username)) {
        group.votes[movieId].users.push(username);
      }
    }

    await db.saveGroup(groupCode, group);

    res.json({
      message: "Vote added successfully",
      votes: group.votes[movieId].users.length
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Failed to submit vote" });
  }
});

router.get("/votes/:groupCode", async (req, res) => {
  try {
    const group = await db.getGroup(req.params.groupCode);

    if (!group) {
      return res.status(404).json({
        error: "Group not found"
      });
    }

    const votesObject = group.votes || {};
    res.json({
      votes: Object.fromEntries(
        Object.entries(votesObject).map(([id, data]) => [
          id,
          data?.users?.length || 0
        ])
      )
    });
  } catch (error) {
    console.error("Get votes error:", error);
    res.status(500).json({ error: "Failed to fetch votes" });
  }
});

router.get("/group/:groupCode", async (req, res) => {
  try {
    const group = await db.getGroup(req.params.groupCode);

    if (!group) {
      return res.status(404).json({
        error: "Group not found"
      });
    }

    res.json(group);
  } catch (error) {
    console.error("Get group error:", error);
    res.status(500).json({ error: "Failed to fetch group" });
  }
});

module.exports = router;
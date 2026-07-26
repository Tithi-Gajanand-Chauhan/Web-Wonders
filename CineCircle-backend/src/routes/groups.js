const express = require("express");
const router = express.Router();
const { getGroupRecommendations } = require("../service/recommendationService");

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
      success: false,
      message: "Group not found"
    });
  }

  group.members.push(username);

  res.json({
  success: true,
  group: {
    groupName: group.groupName,
    code: code,
    members: group.members
  }
});
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

router.post("/recommend", async (req,res)=>{

  console.log("RECOMMEND ROUTE HIT");

  const {groupCode}=req.body;


  const group=groups.get(groupCode);


  if(!group){
    return res.status(404).json({
      error:"Group not found"
    });
  }


  try{

    const recommendations =
      await getGroupRecommendations(
        group.preferences
      );


    res.json(recommendations);


  }catch(error){

    console.log(error);

    res.status(500).json({
      error:"Failed to generate recommendation"
    });

  }

});

module.exports = router;
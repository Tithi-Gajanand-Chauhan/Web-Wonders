const express = require("express");
const router = express.Router();

const { getGroupRecommendations } = require("../service/recommendationService");

const groups = new Map();


function generateCode() {
  let code;

  do {
    code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

  } while (groups.has(code));

  return code;
}


// Create Group
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
    preferences: [],
    votes: {},
    locked: false,
    recommendations: null
  });


  res.json({
    code,
    groupName,
    members: [creatorName]
  });

});



// Join Group
router.post("/join", (req,res)=>{

  const { code, username } = req.body;


  if(!code || !username){
    return res.status(400).json({
      message:"Missing details"
    });
  }


  const group = groups.get(code.toUpperCase());


  if(!group){
    return res.status(404).json({
      success:false,
      message:"Group not found"
    });
  }

  if(group.locked){
  return res.status(400).json({
    success:false,
    message:"This group has already started recommendations."
  });
}



  if(!group.members.includes(username)){
    group.members.push(username);
  }



  res.json({

    success:true,

    group:{
      groupName:group.groupName,
      code,
      members:group.members
    }

  });

});

// Get current group state (members, status, preferences count)
router.get("/:code", (req, res) => {
  const group = groups.get(req.params.code.toUpperCase());

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
});

router.post("/preferences",(req,res)=>{

  const {groupCode, preferences}=req.body;


  const group = groups.get(groupCode.toUpperCase());


  if(!group){
    return res.status(404).json({
      error:"Group not found"
    });
  }

  const index = group.preferences.findIndex(
  (p) => p.user === preferences.user
);

if (index !== -1) {
  group.preferences[index] = preferences; // Update existing user's preferences
} else {
  group.preferences.push(preferences); // Add new user
}

  console.log(
  "PREFERENCES AFTER SAVE:",
  JSON.stringify(group.preferences, null, 2)
);

  res.json({
    message:"Preferences saved successfully",
    group
  });

});



router.get("/status/:groupCode", (req, res) => {

  const group = groups.get(
    req.params.groupCode.toUpperCase()
  );

  if (!group) {
    return res.status(404).json({
      error: "Group not found"
    });
  }

  res.json({

    totalMembers: group.members.length,

    submittedPreferences:
      group.preferences.length,

    everyoneReady:
      group.preferences.length ===
      group.members.length,

    locked: group.locked  

  });

});



router.post("/recommend",async(req,res)=>{


  console.log("RECOMMEND ROUTE HIT");

  const {groupCode}=req.body;

  const group=groups.get(groupCode.toUpperCase());


  if(!group){
    return res.status(404).json({
      error:"Group not found"
    });
  }
  
  console.log(
  "GROUP PREFERENCES:",
  JSON.stringify(group.preferences, null, 2)
);



  try{


  // If recommendations already generated
  if (
  group.recommendations &&
  group.recommendations.recommendations &&
  group.recommendations.recommendations.length > 0
) {

    console.log("Returning saved recommendations");

    return res.json(group.recommendations);

}



  console.log("Generating new recommendations...");

  if(group.generating){
 return res.json({
   message:"Already generating"
 });
}

group.generating=true;

  const recommendations =
    await getGroupRecommendations(
      group.preferences
    );

    console.log(
  "FINAL RECOMMENDATIONS BEFORE SAVE:",
  recommendations
);

  if(
  !recommendations.recommendations ||
  recommendations.recommendations.length === 0
){
  console.log("Empty recommendations received, not saving");
  return res.json({
    recommendations
  });
}



  // Save recommendations
  group.recommendations = recommendations;


  // Lock group after AI starts
  group.locked = true;



  res.json (recommendations);


}

  catch(error){

    console.log(error);


    res.status(500).json({
      error:"Failed to generate recommendation"
    });

  }


});

router.get("/winner/:groupCode", (req, res) => {
  const group = groups.get(req.params.groupCode.toUpperCase());

  if (!group) {
    return res.status(404).json({ error: "Group not found" });
  }

  let winner = null;
  let maxVotes = -1;
  let isTie = false;

  Object.keys(group.votes).forEach((movieId) => {

  const votes = group.votes[movieId].users.length;


  if (votes > maxVotes) {

    maxVotes = votes;

    winner = {
      movieId,
      title: group.votes[movieId].title
    };

    isTie = false;

  } 
  else if (votes === maxVotes && maxVotes > 0) {

    isTie = true;

  }

});

  res.json({
    movieId: winner?.movieId || null,
    title: winner?.title || "No winner",
    votes: maxVotes > -1 ? maxVotes : 0,
    isTie
  });
});

// Vote for a movie
router.post("/vote", (req, res) => {

  const {
    groupCode,
    movieId,
    movieTitle,
    username
  } = req.body;


  const group = groups.get(
    groupCode.toUpperCase()
  );


  if (!group) {
    return res.status(404).json({
      error: "Group not found"
    });
  }


 if (!group.votes[movieId]) {

  group.votes[movieId] = {
    title: movieTitle,
    users: []
  };

}


// Avoid duplicate voting
if (!group.votes[movieId].users.includes(username)) {

  group.votes[movieId].users.push(username);

}


res.json({

  message: "Vote added successfully",

  votes: group.votes[movieId].users.length

});
});


router.get("/group/:groupCode", (req, res) => {

  const group = groups.get(
    req.params.groupCode.toUpperCase()
  );

  if (!group) {
    return res.status(404).json({
      error: "Group not found"
    });
  }

  res.json(group);

});



module.exports = router;
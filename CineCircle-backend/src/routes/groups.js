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
    preferences: []
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




// Save Preferences
router.post("/preferences",(req,res)=>{

  const {groupCode, preferences}=req.body;


  const group = groups.get(groupCode);


  if(!group){
    return res.status(404).json({
      error:"Group not found"
    });
  }


  group.preferences.push(preferences);


  res.json({
    message:"Preferences saved successfully",
    group
  });

});




// Generate Recommendation
router.post("/recommend",async(req,res)=>{


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


  }

  catch(error){

    console.log(error);


    res.status(500).json({
      error:"Failed to generate recommendation"
    });

  }


});



module.exports = router;
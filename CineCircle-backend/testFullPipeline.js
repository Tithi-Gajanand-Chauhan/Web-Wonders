require("dotenv").config();
const { getGroupRecommendations } = require("./src/service/recommendationService");

async function testPipeline() {
  console.log("=== TESTING FULL RECOMMENDATION PIPELINE ===");
  const testPrefs = [
    {
      user: "Tithi",
      genres: ["Action", "Sci-Fi"],
      mood: "Excited",
      language: "English",
      duration: "2–3 hours"
    }
  ];

  try {
    const result = await getGroupRecommendations(testPrefs);
    console.log("RESULT COMPATIBILITY:", result.groupCompatibilityScore);
    console.log("RESULT SUMMARY:", result.negotiationSummary);
    console.log("RESULT RECOMMENDATIONS COUNT:", result.recommendations.length);
    console.log("FIRST MOVIE:", result.recommendations[0]);
  } catch (err) {
    console.error("PIPELINE ERROR:", err);
  }
}

testPipeline();

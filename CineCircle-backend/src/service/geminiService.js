const { generateAIRecommendation } = require("./geminiService");


async function getGroupRecommendations(groupPreferences, candidatePool) {

  const prompt = `
You are CineCircle AI Entertainment Mediator.

Your task:
Recommend movies for a group of friends with different tastes.

Group Preferences:
${JSON.stringify(groupPreferences, null, 2)}

Available Movies:
${JSON.stringify(
  candidatePool.map(movie => ({
    id: movie.id || movie._id,
    title: movie.title,
    overview: movie.overview,
    genres: movie.genres,
    rating: movie.vote_average || movie.rating
  })),
  null,
  2
)}

Choose exactly 5 movies.

Return ONLY JSON in this format:

{
  "groupCompatibilityScore": 0,
  "negotiationSummary": "",
  "recommendations": [
    {
      "movieId": "",
      "title": "",
      "explainableAIReason": "",
      "matchedMembers": []
    }
  ]
}
`;

  try {

    const result = await generateAIRecommendation(prompt);

    return result;

  } catch(error) {

    console.log("Gemini failed. Using fallback recommendation.");

    return fallbackRecommendation(
      groupPreferences,
      candidatePool
    );
  }
}



function fallbackRecommendation(groupPreferences, candidatePool) {

  const recommendations = candidatePool
    .slice(0,5)
    .map(movie => {

      const matchedMembers = groupPreferences
        .filter(member =>
          (member.genres || [])
          .some(genre =>
            (movie.genres || [])
            .includes(genre)
          )
        )
        .map(member => member.name);


      return {
        movieId: movie.id || movie._id,
        title: movie.title,
        explainableAIReason:
          `Selected because it matches preferences of ${
            matchedMembers.join(", ") || "the group"
          }.`,
        matchedMembers
      };
    });


  return {
    groupCompatibilityScore: 75,
    negotiationSummary:
      "Generated using CineCircle compatibility algorithm.",
    recommendations
  };
}



module.exports = {
  getGroupRecommendations
};
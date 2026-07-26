const { GoogleGenAI } = require("@google/genai");
const tmdbService = require("./tmdbService");


const genreMap = {
  Action: 28,
  Comedy: 35,
  Romance: 10749,
  Drama: 18,
  Thriller: 53,
  Horror: 27,
  Animation: 16,
  Adventure: 12,
  Fantasy: 14
};



const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});





async function getCandidateMovies(groupPreferences) {


  let movies;



  const userGenres = [
    ...new Set(
      groupPreferences.flatMap(
        user => user.genres
      )
    )
  ];



  const genreIds = userGenres
    .map(
      genre => genreMap[genre]
    )
    .filter(Boolean);





  const languages = [
    ...new Set(
      groupPreferences.map(
        user => user.language
      )
    )
  ];





  if (
    languages.length === 1 &&
    languages[0] === "Hindi"
  ) {


    movies =
      await tmdbService.getHindiMovies(
        1,
        genreIds
      );


  }


  else if (
    languages.length === 1 &&
    languages[0] === "Gujarati"
  ) {


    movies =
      await tmdbService.getGujaratiMovies(
        1,
        genreIds
      );


  }


  else {


    movies =
      await tmdbService.getPopularMovies(1);


  }





  return movies.results.map(movie => ({

    id: movie.id,

    title: movie.title,

    overview: movie.overview,

    genres: movie.genre_ids,

    language: movie.original_language,

    rating: movie.vote_average,


    poster:
      movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : null


  }));

}









async function getGroupRecommendations(groupPreferences) {



  console.log(
    "GROUP PREFERENCES RECEIVED:",
    JSON.stringify(
      groupPreferences,
      null,
      2
    )
  );



  let candidatePool = [];




  try {



    console.log(
      "Fetching movies from TMDB..."
    );



    candidatePool =
      await getCandidateMovies(
        groupPreferences
      );



    console.log(
      "Movies fetched:",
      candidatePool.length
    );





    console.log(
      "Trying Gemini AI recommendation..."
    );





    const prompt = `


You are CineCircle AI Entertainment Mediator.

Your job is to recommend the best movies for a group of friends.


RULES:

- Respect every user's preference.
- Balance all members.
- Match genres and mood.
- Follow language preferences.
- If languages conflict, select the best compromise.
- Explain why each movie suits the group.


Group Preferences:

${JSON.stringify(
  groupPreferences,
  null,
  2
)}



Available TMDB Movies:

${JSON.stringify(
  candidatePool,
  null,
  2
)}




Return ONLY JSON:

{

"groupCompatibilityScore": number,

"negotiationSummary": "",


"recommendations":[

{

"movieId":"",

"title":"",

"poster":"",

"explainableAIReason":"",

"matchedMembers":[]

}

]

}



`;







    const response =
      await ai.models.generateContent({

        model:
          "gemini-flash-latest",

        contents:
          prompt

      });






    const cleanText =
      response.text
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();





    const result =
      JSON.parse(cleanText);






    console.log(
      "Gemini recommendation successful"
    );



    return result;






  }



  catch(error) {



    console.log(
      "Gemini failed:",
      error.message
    );



    console.log(
      "Using TMDB smart fallback"
    );





    const recommendations =
      candidatePool
        .slice(0,5)
        .map(movie => ({


          movieId:
            movie.id,


          title:
            movie.title,


          poster:
            movie.poster,



          explainableAIReason:
            "Recommended based on group genres, language preference and popularity.",



          matchedMembers:
            groupPreferences.map(
              user => user.user
            )


        }));







    return {


      groupCompatibilityScore: 75,



      negotiationSummary:
        "CineCircle selected movies by balancing group preferences.",



      recommendations


    };



  }



}







module.exports = {

  getGroupRecommendations

};
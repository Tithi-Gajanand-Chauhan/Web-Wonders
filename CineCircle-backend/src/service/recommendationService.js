const { GoogleGenAI } = require("@google/genai");
const tmdbService = require("./tmdbService");
console.log(
"TMDB SERVICE PATH:",
require.resolve("./tmdbService")
);
const genreMap = {
  Action: 28,
  Comedy: 35,
  Romance: 10749,
  Drama: 18,
  Thriller: 53,
  Horror: 27,
  Animation: 16,
  Adventure: 12,
  Fantasy: 14,
  "Science Fiction": 878,
  "Sci-Fi": 878,
};

const languageMap={
 English:"en",
 "English Movies":"en",

 Hindi:"hi",
 "Hindi Movies":"hi",

 Gujarati:"gu",
 "Gujarati Movies":"gu",

 Marathi:"mr",
 "Marathi Movies":"mr",

 Telugu:"te",
 "Telugu Movies":"te"
};

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


async function getCandidateMovies(groupPreferences) {

  let movies;

  const userGenres = [
    ...new Set(
      (groupPreferences || []).flatMap((user) => user.genres || [])
    ),
  ];

  const genreIds = userGenres
    .map((genre) => genreMap[genre])
    .filter(Boolean);

  console.log("USER GENRES:", userGenres);

console.log("GENRE IDS:", genreIds); 
console.log("SENDING GENRES TO TMDB:", genreIds); 


  const languages = [
  ...new Set(
    (groupPreferences || []).map((user) => user.language)
  ),
];

const selectedLanguage = languages[0];
const tmdbLanguage = languageMap[selectedLanguage];


  const randomPage = 1;


  try {



    if (tmdbLanguage) {

      movies = await tmdbService.getMoviesByLanguage(
        randomPage,
        tmdbLanguage,
        genreIds
      );

    } else {

      movies = await tmdbService.getPopularMovies(randomPage);

    }


  } catch(err){

    console.error(
      "TMDB Candidate fetch failed:",
      err.message
    );

  }



  // Only fallback if nothing found
  if (!movies || !movies.results || movies.results.length < 5) {

    try {

      console.log(
        "No language movies found, using popular fallback..."
      );

      movies = await tmdbService.getMoviesByLanguage(
1,
tmdbLanguage,
genreIds
);


    } catch(error){

      console.error(
        "Fallback failed:",
        error.message
      );

    }

  }

 if (!movies || !movies.results || movies.results.length === 0) {

  console.log(
    "No exact genre matches. Trying language only..."
  );


  movies = await tmdbService.getMoviesByLanguage(
    1,
    tmdbLanguage,
    []
  );


}



  console.log(
    "Movie count fetched:",
    movies?.results?.length
  );



  const uniqueMovies = Array.from(
    new Map(
      (movies?.results || [])
      .map(movie => [movie.id,movie])
    ).values()
  );



  return uniqueMovies.map(movie => ({

    id: movie.id,

    title: movie.title,

    overview: movie.overview,

    genres: movie.genre_ids,

    language: movie.original_language,

    rating: movie.vote_average,

    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,

    voteCount: movie.vote_count,  
  }));

}





async function getGroupRecommendations(groupPreferences) {


console.log(
"🔥 USING UPDATED RECOMMENDATION SERVICE 🔥"
);


let candidatePool=[];


try {


candidatePool = await getCandidateMovies(
groupPreferences
);


console.log(
"Movies fetched:",
candidatePool.length
);



const prompt = `

You are CineCircle AI Entertainment Mediator.

Your job is to recommend EXACTLY 5 distinct movies for a group.


STRICT RULES:

- Select ONLY from Available TMDB Movies.
- Return EXACTLY 5 movies.
- Select only movies whose language field matches the requested group language.
- Never select a movie with language "en" when Hindi, Gujarati, Marathi, Telugu etc. is requested.
- Explain why every movie fits the group.


Group Preferences:

${JSON.stringify(groupPreferences,null,2)}



Available TMDB Movies:

${JSON.stringify(candidatePool,null,2)}



Return ONLY JSON:

{
"groupCompatibilityScore":85,

"negotiationSummary":"Selected balanced options matching group preferences.",

"recommendations":[

{

"movieId":123,

"title":"Movie",

"explainableAIReason":"Reason",

"matchedMembers":["User1"]

}

]

}

`;




const response = await ai.models.generateContent({

model:"gemini-2.0-flash",

contents:prompt,


config:{

temperature:0.3,

responseMimeType:"application/json"

}


});



const cleanText = response.text
.replace(/```json/gi,"")
.replace(/```/g,"")
.trim();



const result = JSON.parse(cleanText);



let rawRecs =
result.recommendations || [];




// Keep your existing padding logic
if(rawRecs.length < 5 && candidatePool.length > 0){


const existingIds =
new Set(
rawRecs.map(r=>String(r.movieId))
);



for(const candidate of candidatePool){


if(rawRecs.length>=5)
break;


if(!existingIds.has(String(candidate.id))){

rawRecs.push({

movieId:candidate.id,

title:candidate.title,

explainableAIReason:
"Recommended based on group preferences.",

matchedMembers:
(groupPreferences||[])
.map(u=>u.user)

});


existingIds.add(
String(candidate.id)
);


}


}


}





const enrichedRecommendations =
rawRecs.map(rec=>{


const matchedCandidate =
candidatePool.find(
c =>
String(c.id)===String(rec.movieId)
);



return {


movieId:
matchedCandidate
? matchedCandidate.id
: rec.movieId,


title:
matchedCandidate
? matchedCandidate.title
: rec.title,


poster:
matchedCandidate
? matchedCandidate.poster
:null,


rating:
matchedCandidate
? matchedCandidate.rating
:7.5,

voteCount:
matchedCandidate
? matchedCandidate.voteCount
:0,


explainableAIReason:
rec.explainableAIReason ||
"Matched with group preferences.",


matchedMembers:
rec.matchedMembers ||
(groupPreferences||[])
.map(u=>u.user)



};


});




return {


groupCompatibilityScore:
calculateCompatibilityScore(
  groupPreferences,
  candidatePool.filter(movie =>
    enrichedRecommendations.some(
      r => r.movieId === movie.id
    )
  )
),


negotiationSummary:
result.negotiationSummary ||
"CineCircle balanced group preferences.",


recommendations:
enrichedRecommendations


};




}catch(error){


console.log(
"Gemini unavailable, using CineCircle algorithm fallback:",
error.message
);


return buildFallbackRecommendations(
groupPreferences,
candidatePool
);


}



}


function calculateCompatibilityScore(
  groupPreferences,
  recommendations
){

let score = 0;

const users = groupPreferences || [];


// Genre matching (40 points)
let totalGenres = 0;
let matchedGenres = 0;


users.forEach(user => {

  (user.genres || []).forEach(genre => {

    totalGenres++;

    const genreId = genreMap[genre];

    for (const movie of recommendations) {

  if (movie.genres.includes(genreId)) {
    matchedGenres++;
    break;
  }

}

  });

});


if(totalGenres > 0){

  score += Math.min(
    40,
    (matchedGenres / totalGenres) * 40
  );

}


// Language matching (30 points)

const preferredLanguage =
languageMap[users[0]?.language];


const languageMatches =
recommendations.filter(
movie => movie.language === preferredLanguage
).length;


if(recommendations.length){

score +=
(languageMatches / recommendations.length) * 30;

}


// Mood matching (20 points)

if(users[0]?.mood){

score += 20;

}


// Base points

score += 10;


return Math.round(
Math.min(score,100)
);

}


function buildFallbackRecommendations(
  groupPreferences,
  candidatePool
){

const users = groupPreferences || [];

const genreNames = users.flatMap(
  u => u.genres || []
);


const genreIds = genreNames
.map(g => genreMap[g])
.filter(Boolean);


let filteredMovies = candidatePool.map(movie => {

  const matchedGenres = movie.genres.filter(id =>
    genreIds.includes(id)
  );

  return {
    ...movie,
    matchScore: matchedGenres.length
  };

});


const matchingMovies = filteredMovies.filter(
 movie => movie.matchScore > 0
);


let negotiationSummary;


if(matchingMovies.length < 5){

 negotiationSummary =
`Only limited ${genreNames.join(", ")} movies were available.
CineCircle considered other preferences like language, rating and popularity
to provide suitable alternatives.`;

}
else{

 negotiationSummary =
"CineCircle created recommendations using group compatibility scoring.";

}


filteredMovies.sort((a,b)=>{

  const scoreA =
    (a.matchScore * 100) +
    (a.rating * 2) +
    Math.log(a.voteCount + 1);


  const scoreB =
    (b.matchScore * 100) +
    (b.rating * 2) +
    Math.log(b.voteCount + 1);


  return scoreB - scoreA;

});



let finalMovies;

if(matchingMovies.length >= 5){
  finalMovies = matchingMovies;
}
else{
  finalMovies = filteredMovies;
}


return {

groupCompatibilityScore:
calculateCompatibilityScore(
  groupPreferences,
  filteredMovies
),

negotiationSummary:
 negotiationSummary,



recommendations:
finalMovies
.slice(0,5).map(movie=>{



const matchedGenres =
Object.keys(genreMap)
.filter(
genre =>
genreIds.includes(genreMap[genre]) &&
movie.genres?.includes(genreMap[genre])
);



return {


movieId:movie.id,

title:movie.title,

poster:movie.poster,

rating:movie.rating,

explainableAIReason:
`${movie.title} was selected because it matches the group's preference for ${
matchedGenres.length
? matchedGenres.join(", ")
: "their selected genres"
}. It fits the requested ${
users[0]?.language || "language"
} language preference and ${
users[0]?.mood || "selected"
} mood.`,



matchedMembers:
users.map(
u=>u.user
)


};


})


};


}


module.exports={
getGroupRecommendations
};
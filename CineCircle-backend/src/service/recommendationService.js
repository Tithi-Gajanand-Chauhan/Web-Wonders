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

const genreIdToName = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
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
      (groupPreferences || []).map((user) => user.language).filter(Boolean)
    ),
  ];

  const tmdbLanguages = languages.map(lang => languageMap[lang]).filter(Boolean);
  console.log("LANGUAGES DETECTED:", languages, "TMDB CODES:", tmdbLanguages);

  let allMoviesList = [];
  const randomPage = Math.floor(Math.random() * 3) + 1; // randomize TMDB page offset

  if (tmdbLanguages.length > 0) {
    for (const lang of tmdbLanguages) {
      try {
        console.log(`Fetching movies for language: ${lang} (page ${randomPage})`);
        const res = await tmdbService.getMoviesByLanguage(randomPage, lang, genreIds);
        if (res && res.results) {
          allMoviesList.push(...res.results);
        }
      } catch (err) {
        console.error(`TMDB Candidate fetch failed for language ${lang}:`, err.message);
      }
    }
  } else {
    try {
      const res = await tmdbService.getPopularMovies(randomPage);
      if (res && res.results) {
        allMoviesList.push(...res.results);
      }
    } catch (err) {
      console.error("TMDB Popular fetch failed:", err.message);
    }
  }

  // Fallback: If not enough movies found, try without genres
  if (allMoviesList.length < 5 && tmdbLanguages.length > 0) {
    console.log("Not enough genre-specific movies. Trying language-only fallback...");
    for (const lang of tmdbLanguages) {
      try {
        const res = await tmdbService.getMoviesByLanguage(1, lang, []);
        if (res && res.results) {
          allMoviesList.push(...res.results);
        }
      } catch (err) {
        console.error(`Fallback fetch failed for language ${lang}:`, err.message);
      }
    }
  }

  // Ultimate popular fallback if completely empty
  if (allMoviesList.length === 0) {
    try {
      const res = await tmdbService.getPopularMovies(1);
      if (res && res.results) {
        allMoviesList.push(...res.results);
      }
    } catch (err) {
      console.error("Ultimate popular fallback failed:", err.message);
    }
  }

  console.log("Raw movie count fetched:", allMoviesList.length);

  // Unique-ify candidate list
  const uniqueMoviesMap = new Map();
  allMoviesList.forEach(movie => {
    if (movie && movie.id) {
      uniqueMoviesMap.set(movie.id, movie);
    }
  });
  const uniqueMovies = Array.from(uniqueMoviesMap.values());

  // Fisher-Yates shuffle to randomize candidate pool so recommendations change each time
  for (let i = uniqueMovies.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniqueMovies[i], uniqueMovies[j]] = [uniqueMovies[j], uniqueMovies[i]];
  }

  console.log("Unique randomized candidates pool size:", uniqueMovies.length);

  return uniqueMovies.map(movie => ({
    id: movie.id,
    title: movie.original_title || movie.title,
    overview: movie.overview,
    genres: movie.genre_ids,
    language: movie.original_language,
    rating: movie.vote_average,
    poster: movie.poster_path
      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
      : null,
    voteCount: movie.vote_count,
    releaseDate: movie.release_date,
    originCountry: movie.origin_country,
  }));
}





async function getGroupRecommendations(groupPreferences, excludeMovieIds = []) {
  console.log("🔥 USING UPDATED RECOMMENDATION SERVICE 🔥");
  console.log("EXCLUDING MOVIE IDS:", excludeMovieIds);

  let candidatePool = [];

  try {
    candidatePool = await getCandidateMovies(groupPreferences);

    if (excludeMovieIds && excludeMovieIds.length > 0) {
      const excludeSet = new Set(excludeMovieIds.map(Number));
      const filtered = candidatePool.filter(movie => !excludeSet.has(Number(movie.id)));
      if (filtered.length > 0) {
        candidatePool = filtered;
      } else {
        console.log("All candidate movies were excluded. Resetting exclusions to avoid empty results.");
      }
    }

    console.log("Movies fetched after exclusions:", candidatePool.length);



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
generateMockAIReason(matchedCandidate || rec, groupPreferences),


matchedMembers:
rec.matchedMembers ||
(groupPreferences||[])
.map(u=>u.user),

releaseDate: matchedCandidate ? matchedCandidate.releaseDate : null,
originCountry: matchedCandidate ? matchedCandidate.originCountry : null,
genres: matchedCandidate ? matchedCandidate.genres : [],
badge: (matchedCandidate && matchedCandidate.genres && matchedCandidate.genres.length > 0 && genreIdToName[matchedCandidate.genres[0]]) 
  ? `TOP ${genreIdToName[matchedCandidate.genres[0]].toUpperCase()}` 
  : "TOP MOVIE"

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

            explainableAIReason: generateMockAIReason(movie, groupPreferences),
            matchedMembers: users.map(u => u.user)
          };
        })
  };
}

function generateMockAIReason(movie, groupPreferences) {
  const users = groupPreferences || [];
  const genres = [...new Set(users.flatMap(u => u.genres || []))];
  const moods = [...new Set(users.map(u => u.mood).filter(Boolean))];
  const languages = [...new Set(users.map(u => u.language).filter(Boolean))];
  
  let baseReason = "";
  const title = movie.title ? movie.title.toLowerCase() : "";
  const id = Number(movie.id || movie.movieId);

  if (id === 101 || title.includes("interstellar")) {
    baseReason = "Interstellar is a cosmic masterpiece that blends deep space exploration with high emotional stakes.";
  } else if (id === 102 || title.includes("inception")) {
    baseReason = "Inception delivers a mind-bending dream heist with spectacular action sequences that keep everyone on edge.";
  } else if (id === 103 || title.includes("dark knight")) {
    baseReason = "The Dark Knight is the gold standard for thrillers, offering a gripping psychological duel between Batman and the Joker.";
  } else if (id === 104 || title.includes("spirited away")) {
    baseReason = "Spirited Away is a whimsical, hand-drawn fantasy adventure that transports viewers to a stunning spiritual realm.";
  } else if (id === 105 || title.includes("parasite")) {
    baseReason = "Parasite is a brilliant genre-fluid masterpiece that transitions from black comedy to tense thriller seamlessly.";
  } else if (id === 106 || title.includes("3 idiots")) {
    baseReason = "3 Idiots is a legendary comedy-drama that celebrates college friendship while delivering a heartfelt message about following your dreams.";
  } else if (id === 107 || title.includes("dangal")) {
    baseReason = "Dangal is a powerhouse biographical drama about determination, offering spectacular wrestling action and deep family bonds.";
  } else if (id === 108 || title.includes("lagaan")) {
    baseReason = "Lagaan is an epic historical drama that combines sports drama, patriotism, and romance in a beautifully told village tale.";
  } else if (id === 109 || title.includes("chello divas")) {
    baseReason = "Chello Divas is the definitive Gujarati buddy comedy, capturing college nostalgia and hilarious friend group dynamics.";
  } else if (id === 110 || title.includes("hellaro")) {
    baseReason = "Hellaro is a National Award-winning Gujarati drama that showcases self-expression, rhythm, and liberation against patriarchal norms.";
  } else if (id === 111 || title.includes("your name")) {
    baseReason = "Your Name is a breathtakingly animated romance about two teenagers who swap bodies, offering fantasy elements and high emotional resonance.";
  } else if (id === 112 || title.includes("super 30")) {
    baseReason = "Super 30 is an inspiring true story about education, triumph against odds, and the power of mentorship.";
  } else if (id === 113 || title.includes("krrish")) {
    baseReason = "Krrish is a pioneering superhero action movie, delivering high-flying stunts and special effects that are fun for the entire group.";
  } else if (id === 114 || title.includes("koi... mil gaya")) {
    baseReason = "Koi... Mil Gaya is a classic sci-fi drama about friendship with an alien, providing heartwarming nostalgia and fun for all ages.";
  } else if (id === 106 || title.includes("toy story")) {
    baseReason = "Toy Story 4 is a heartwarming animated journey that explores friendship, purpose, and moving on with stellar animation.";
  } else {
    baseReason = `${movie.title} is an engaging selection that balances group tastes in entertainment.`;
  }

  const moodText = moods.length > 0 ? `It perfectly complements your group's current ${moods.join("/")} mood.` : "";
  const langText = languages.length > 0 ? `It is served in your requested ${languages.join("/")} language.` : "";
  
  return `${baseReason} ${moodText} ${langText}`.trim();
}

module.exports = {
  getGroupRecommendations
};
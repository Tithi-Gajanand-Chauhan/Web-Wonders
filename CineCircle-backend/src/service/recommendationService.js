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
    title: movie.title || movie.original_title,
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





const enrichedRecommendations = await Promise.all(
  rawRecs.map(async (rec) => {
    let matchedCandidate = candidatePool.find(
      c => String(c.id) === String(rec.movieId)
    );

    // Fallback direct TMDB API lookup if unmatched in candidate pool
    if (!matchedCandidate && rec.movieId) {
      try {
        console.log(`Unmatched movie "${rec.title}" (${rec.movieId}). Fetching details directly from TMDB...`);
        const details = await tmdbService.getMovieDetails(rec.movieId);
        if (details) {
          matchedCandidate = {
            id: details.id,
            title: details.title || details.original_title,
            poster: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            rating: details.vote_average,
            voteCount: details.vote_count,
            releaseDate: details.release_date,
            originCountry: details.origin_country || (details.production_countries ? details.production_countries.map(c => c.iso_3166_1) : []),
            genres: details.genres ? details.genres.map(g => g.id) : []
          };
        }
      } catch (err) {
        console.error(`Direct TMDB detail lookup failed for movie ID ${rec.movieId}:`, err.message || err);
      }
    }

    let badge = null;
    if (matchedCandidate && matchedCandidate.genres && matchedCandidate.genres.length > 0) {
      const mainGenreName = genreIdToName[matchedCandidate.genres[0]];
      if (mainGenreName) {
        badge = `TOP ${mainGenreName.toUpperCase()}`;
      }
    }

    return {
      movieId: matchedCandidate ? matchedCandidate.id : rec.movieId,
      title: matchedCandidate ? matchedCandidate.title : rec.title,
      poster: matchedCandidate ? matchedCandidate.poster : null,
      rating: matchedCandidate ? matchedCandidate.rating : 7.5,
      voteCount: matchedCandidate ? matchedCandidate.voteCount : 0,
      explainableAIReason: rec.explainableAIReason || generateMockAIReason(matchedCandidate || rec, groupPreferences),
      matchedMembers: rec.matchedMembers || (groupPreferences||[]).map(u=>u.user),
      releaseDate: matchedCandidate ? matchedCandidate.releaseDate : null,
      originCountry: matchedCandidate ? matchedCandidate.originCountry : null,
      genres: matchedCandidate ? matchedCandidate.genres : [],
      badge: badge || "TOP MOVIE"
    };
  })
);





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

compatibilityAnalysis:
generateCompatibilityAnalysis(groupPreferences),


negotiationSummary:
result.negotiationSummary ||
"CineCircle balanced group preferences.",


recommendations:
enrichedRecommendations.sort((a, b) => {
  const dateA = a.releaseDate || "";
  const dateB = b.releaseDate || "";
  return dateB.localeCompare(dateA);
})


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


function generateCompatibilityAnalysis(groupPreferences) {
  const users = groupPreferences || [];
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

  if (users.length <= 1) {
    return {
      pairwise: [],
      agreements: ["Add more members to analyze group dynamics!"],
      conflicts: ["No conflicts to negotiate yet."]
    };
  }

  const pairwise = [];
  const genresCount = {};
  const moodsCount = {};
  const languagesCount = {};

  users.forEach(u => {
    (u.genres || []).forEach(g => {
      genresCount[g] = (genresCount[g] || 0) + 1;
    });
    if (u.mood) moodsCount[u.mood] = (moodsCount[u.mood] || 0) + 1;
    if (u.language) languagesCount[u.language] = (languagesCount[u.language] || 0) + 1;
  });

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const u1 = users[i];
      const u2 = users[j];

      const g1 = new Set(u1.genres || []);
      const g2 = new Set(u2.genres || []);
      const intersection = new Set([...g1].filter(x => g2.has(x)));
      const union = new Set([...g1, ...g2]);
      const genreSim = union.size > 0 ? (intersection.size / union.size) * 100 : 100;

      const moodSim = u1.mood === u2.mood ? 100 : 0;
      const langSim = u1.language === u2.language ? 100 : 0;

      const pairScore = Math.round((genreSim * 0.4) + (langSim * 0.3) + (moodSim * 0.3));

      pairwise.push({
        user1: u1.user,
        user2: u2.user,
        score: pairScore,
        sharedGenres: Array.from(intersection)
      });
    }
  }

  const agreements = [];
  const threshold = users.length / 2;
  Object.keys(genresCount).forEach(g => {
    if (genresCount[g] > threshold) {
      agreements.push(`Genre: ${g} (${Math.round((genresCount[g] / users.length) * 100)}% agree)`);
    }
  });

  const conflicts = [];
  if (Object.keys(genresCount).length > 2 && agreements.length === 0) {
    conflicts.push("Multiple genres selected with no dominant preference.");
  }
  const uniqueMoods = Object.keys(moodsCount);
  if (uniqueMoods.length > 1) {
    conflicts.push(`Mood split: Some want ${uniqueMoods.slice(0, 2).join(", ")}`);
  }

  return {
    pairwise,
    agreements: agreements.length > 0 ? agreements : ["No dominant shared genre; recommendations balanced automatically."],
    conflicts: conflicts.length > 0 ? conflicts : ["Minor conflicts resolved automatically."]
  };
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

compatibilityAnalysis:
generateCompatibilityAnalysis(groupPreferences),

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
          movieId: movie.id,
          title: movie.title,
          poster: movie.poster,
          rating: movie.rating,
          explainableAIReason: generateMockAIReason(movie, groupPreferences),
          matchedMembers: users.map(u => u.user),
          releaseDate: movie.releaseDate,
          originCountry: movie.originCountry,
          genres: movie.genres,
          badge: (movie.genres && movie.genres.length > 0 && genreIdToName[movie.genres[0]]) 
            ? `TOP ${genreIdToName[movie.genres[0]].toUpperCase()}` 
            : "TOP MOVIE"
        };
      })
      .sort((a, b) => {
        const dateA = a.releaseDate || "";
        const dateB = b.releaseDate || "";
        return dateB.localeCompare(dateA);
      })
  };
}

function generateMockAIReason(movie, groupPreferences) {
  const users = groupPreferences || [];
  const title = movie.title || "This movie";
  const id = Number(movie.id || movie.movieId || 0);
  const titleLower = movie.title ? movie.title.toLowerCase() : "";

  // Hardcoded special reasons for top classic mock titles to keep them extremely premium
  if (id === 101 || titleLower.includes("interstellar")) {
    return "Interstellar is a cosmic masterpiece that blends deep space exploration with high emotional stakes, matching your interest in Sci-Fi.";
  }
  if (id === 102 || titleLower.includes("inception")) {
    return "Inception delivers a mind-bending dream heist with spectacular action sequences that keep everyone on edge, perfect for thrill-seekers.";
  }
  if (id === 103 || titleLower.includes("dark knight")) {
    return "The Dark Knight is the gold standard for thrillers, offering a gripping psychological duel between Batman and the Joker.";
  }
  if (id === 105 || titleLower.includes("parasite")) {
    return "Parasite is a brilliant genre-fluid masterpiece that transitions from black comedy to tense thriller seamlessly, loved worldwide.";
  }
  if (id === 106 || titleLower.includes("3 idiots")) {
    return "3 Idiots is a legendary comedy-drama that celebrates college friendship while delivering a heartfelt message about following your dreams.";
  }

  // Dynamic Generator for all other real TMDB movies
  const matchedNames = [];
  const movieGenres = movie.genres || [];
  
  users.forEach(u => {
    const userGenreIds = (u.genres || []).map(g => genreMap[g]).filter(Boolean);
    const hasOverlap = userGenreIds.some(id => movieGenres.includes(id));
    if (hasOverlap) {
      matchedNames.push(u.user);
    }
  });

  const genreNames = movieGenres
    .map(id => genreIdToName[id])
    .filter(Boolean)
    .slice(0, 2);

  const genreSegment = genreNames.length > 0 ? genreNames.join(" & ") : "popular catalog genres";

  // Select deterministic phrasing indices based on the movie ID
  const tempIdx = id % 3;

  let introduction = "";
  if (tempIdx === 0) {
    introduction = `CineCircle selected ${title} to balance your group's tastes.`;
  } else if (tempIdx === 1) {
    introduction = `${title} stands out as a top contender for tonight's watchlist.`;
  } else {
    introduction = `If you are looking for an engaging watch, ${title} is a great fit.`;
  }

  let explanation = "";
  if (matchedNames.length === users.length && users.length > 1) {
    const choices = [
      `It represents a strong middle-ground option, aligning with everyone's interest in ${genreSegment}.`,
      `Since everyone in the group enjoys ${genreSegment}, this is a safe bet for a fun night.`,
      `It perfectly satisfies the group's collective preference for ${genreSegment}.`
    ];
    explanation = choices[id % choices.length];
  } else if (matchedNames.length > 0) {
    const choices = [
      `It directly matches what ${matchedNames.join(" and ")} wanted to watch (${genreSegment}).`,
      `It caters specifically to the ${genreSegment} genre requested by ${matchedNames.join(" & ")}.`,
      `This pick highlights the shared interest of ${matchedNames.join(" and ")} in high-quality ${genreSegment}.`
    ];
    explanation = choices[id % choices.length];
  } else {
    explanation = `It introduces an exciting ${genreSegment} experience to diversify the group's options.`;
  }

  const rating = movie.rating || movie.vote_average || 7.0;
  let ratingText = "";
  const ratingChoices = [
    `It currently holds a certified ${Number(rating).toFixed(1)}/10 user score on TMDB.`,
    `Audiences highly rate this title at ${Number(rating).toFixed(1)}/10.`,
    `It offers a proven entertainment experience (rated ${Number(rating).toFixed(1)}/10 by viewers).`
  ];
  ratingText = ratingChoices[id % ratingChoices.length];

  return `${introduction} ${explanation} ${ratingText}`.trim();
}

module.exports = {
  getGroupRecommendations
};
const axios = require("axios");

const TOKEN = process.env.TMDB_TOKEN;

console.log("TMDB TOKEN loaded:", TOKEN ? "YES" : "NO");

const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

function getCacheKey(endpoint, params) {
  return `${endpoint}?${JSON.stringify(params)}`;
}

function getFromCache(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key, data) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

// Main TMDB fetch function
async function fetchFromTMDB(endpoint, params = {}) {
  // Clean up undefined parameters so Axios doesn't send empty query strings
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([_, v]) => v !== undefined && v !== null)
  );

  const cacheKey = getCacheKey(endpoint, cleanParams);
  const cached = getFromCache(cacheKey);

  if (cached) {
    console.log("[CACHE HIT]", cacheKey);
    return cached;
  }

  try {
    console.log("TMDB REQUEST:", endpoint, cleanParams);

    const query = new URLSearchParams(cleanParams).toString();



let response;

for (let attempt = 1; attempt <= 3; attempt++) {

  try {

    const controller = new AbortController();

const timeout = setTimeout(
  () => controller.abort(),
  10000
);


response = await fetch(
  `https://api.themoviedb.org/3${endpoint}?${query}`,
  {
    method:"GET",
    headers:{
      Authorization:`Bearer ${TOKEN}`,
      Accept:"application/json",
    },
    signal: controller.signal,
  }
);


clearTimeout(timeout);

    break; // request successful, exit loop

  } catch (err) {

    console.log(`TMDB attempt ${attempt} failed:`, err.message);

    if (attempt === 3) {
      throw err; // after 3 failures stop
    }

    // wait 1 second before retry
    await new Promise(resolve =>
      setTimeout(resolve, 2000)
    );

  }

}


if (!response.ok) {
  throw new Error(
    `TMDB failed: ${response.status}`
  );
}



const data = await response.json();

setCache(cacheKey, data);

return data;
  } catch (error) {
  console.log("TMDB ERROR:", error);

  if (error.cause) {
    console.log("CAUSE:", error.cause);
    console.log("CAUSE CODE:", error.cause.code);
  }

  throw error;
}
}

// Popular movies
async function getPopularMovies(page = 1) {
  return fetchFromTMDB("/movie/popular", { page });
}

// Search movies
async function searchMovies(query, page = 1) {
  return fetchFromTMDB("/search/movie", { query, page });
}

// Movie details
async function getMovieDetails(movieId) {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: "credits",
  });
}

// Recent releases
async function getRecentMovies(page = 1) {
  return fetchFromTMDB("/discover/movie", {
    page,
    sort_by: "release_date.desc",
    "release_date.lte": new Date().toISOString().split("T")[0],
    "vote_count.gte": 10,
  });
}

// 🇮🇳 Hindi movies (Strict filter)
async function getHindiMovies(page = 1, genres = []) {
  const genreIds = Array.isArray(genres) ? genres.filter(Boolean) : [];

  return fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "hi",
    with_genres: genreIds.length ? genreIds.join(",") : undefined,
    sort_by: "popularity.desc",
    "vote_count.gte": 5, // Lowered slightly to capture more regional titles
    include_adult: false,
  });
}

// 🇮🇳 Gujarati movies (Strict filter)
async function getGujaratiMovies(page = 1, genres = []) {
  const genreIds = Array.isArray(genres) ? genres.filter(Boolean) : [];

  return fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "gu",
    with_genres: genreIds.length ? genreIds.join(",") : undefined,
    sort_by: "popularity.desc",
    "vote_count.gte": 1, // Gujarati titles have fewer votes on TMDB
    include_adult: false,
  });
}

async function getMarathiMovies(page = 1) {

  return fetchFromTMDB("/discover/movie", {

    page,

    with_original_language: "mr",

    sort_by: "popularity.desc",

    "vote_count.gte": 1,

    include_adult: false,

  });

}

// Korean movies
async function getKoreanMovies(page = 1) {
  return fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "ko",
    sort_by: "popularity.desc",
  });
}

// Chinese movies
async function getChineseMovies(page = 1) {
  return fetchFromTMDB("/discover/movie", {
    page,
    with_original_language: "zh",
    sort_by: "popularity.desc",
  });
}

// Genres
async function getGenres() {
  return fetchFromTMDB("/genre/movie/list");
}

// Trending movies
async function getTrendingMovies(timeWindow = "day", page = 1) {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`, { page });
}


async function getMoviesByLanguage(page = 1, language, genres = []) {

  console.log("TMDB RECEIVED GENRES:", genres);
  const genreIds = Array.isArray(genres)
    ? genres.filter(Boolean)
    : [];
  console.log("TMDB FINAL GENRE IDS:", genreIds);  


  // First try: language + genre
  let movies = await fetchFromTMDB("/discover/movie", {

    page,

    with_original_language: language,

    with_genres: genreIds.length
      ? genreIds.join(",")
      : undefined,

    sort_by: "popularity.desc",

    "vote_count.gte": 1,

    include_adult: false,

  });


  // If no movies, try language only
  if (!movies.results || movies.results.length === 0) {

    console.log(
      "No language+genre movies found. Trying language only..."
    );


    movies = await fetchFromTMDB("/discover/movie", {

      page,

      with_original_language: language,

      sort_by: "popularity.desc",

      "vote_count.gte": 50,

      include_adult: false,

    });

  }


  return movies;

}

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getRecentMovies,
  getHindiMovies,
  getGujaratiMovies,
  getMoviesByLanguage,
  getKoreanMovies,
  getChineseMovies,
  getGenres,
  getTrendingMovies,
  getMarathiMovies
};
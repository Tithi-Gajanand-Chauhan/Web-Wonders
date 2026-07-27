const axios = require("axios");
const dns = require("dns");

dns.setDefaultResultOrder("ipv4first");

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


  const cacheKey = getCacheKey(endpoint, params);


  const cached = getFromCache(cacheKey);


  if (cached) {

    console.log("[CACHE HIT]", cacheKey);

    return cached;
  }



  try {


    console.log(
      "TMDB REQUEST:",
      endpoint,
      params
    );


   const response = await axios.get(
  `https://api.themoviedb.org/3${endpoint}`,
  {
    params,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: "application/json",
    },
    timeout: 30000,
  }
);


    setCache(cacheKey, response.data);



    return response.data;



  } catch (error) {


    console.log(
      "TMDB ERROR:",
      error.message
    );


    if (error.response) {

      console.log(
        "STATUS:",
        error.response.status
      );

      console.log(
        "DATA:",
        error.response.data
      );
    }


    throw error;
  }

}





// Popular movies
async function getPopularMovies(page = 1) {

  return fetchFromTMDB(
    "/movie/popular",
    {
      page,
    }
  );

}





// Search movies
async function searchMovies(query, page = 1) {

  return fetchFromTMDB(
    "/search/movie",
    {
      query,
      page,
    }
  );

}





// Movie details
async function getMovieDetails(movieId) {


  return fetchFromTMDB(
    `/movie/${movieId}`,
    {
      append_to_response: "credits",
    }
  );

}







// Recent releases
async function getRecentMovies(page = 1) {


  return fetchFromTMDB(
    "/discover/movie",
    {

      page,

      sort_by:
        "release_date.desc",

      "release_date.lte":
        new Date()
          .toISOString()
          .split("T")[0],

      "vote_count.gte": 10,
    }
  );

}







// Hindi movies
async function getHindiMovies(
  page = 1,
  genres = []
) {


  return fetchFromTMDB(
    "/discover/movie",
    {

      page,

      with_original_language:
        "hi",

      with_genres:
        genres.length
          ? genres.join(",")
          : undefined,


      sort_by:
        "popularity.desc",


      "vote_count.gte":
        20,


      include_adult:
        false,
    }
  );

}








// Gujarati movies
async function getGujaratiMovies(
  page = 1,
  genres = []
) {


  return fetchFromTMDB(
    "/discover/movie",
    {

      page,

      with_original_language:
        "gu",


      with_genres:
        genres.length
          ? genres.join(",")
          : undefined,


      sort_by:
        "popularity.desc",


      "vote_count.gte":
        10,
    }
  );

}







// Korean movies
async function getKoreanMovies(page = 1) {


  return fetchFromTMDB(
    "/discover/movie",
    {

      page,

      with_original_language:
        "ko",


      sort_by:
        "popularity.desc",

    }
  );

}







// Chinese movies
async function getChineseMovies(page = 1) {


  return fetchFromTMDB(
    "/discover/movie",
    {

      page,

      with_original_language:
        "zh",


      sort_by:
        "popularity.desc",

    }
  );

}








// Genres
async function getGenres() {


  return fetchFromTMDB(
    "/genre/movie/list"
  );

}







// Trending movies
async function getTrendingMovies(
  timeWindow = "day",
  page = 1
) {


  return fetchFromTMDB(
    `/trending/movie/${timeWindow}`,
    {
      page,
    }
  );

}







module.exports = {

  getPopularMovies,

  searchMovies,

  getMovieDetails,

  getRecentMovies,

  getHindiMovies,

  getGujaratiMovies,

  getKoreanMovies,

  getChineseMovies,

  getGenres,

  getTrendingMovies,

};
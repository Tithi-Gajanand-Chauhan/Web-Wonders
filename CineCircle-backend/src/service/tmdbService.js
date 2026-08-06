const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = process.env.TMDB_API_TOKEN || process.env.TMDB_TOKEN;

const MOCK_MOVIES = [
  {
    id: 101,
    title: "Interstellar",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    genre_ids: [878, 12, 18], // Sci-Fi, Adventure, Drama
    original_language: "en",
    vote_average: 8.4,
    vote_count: 32000,
    poster_path: "/gEU2QniE6E7vNIvN27xtC1h2xsB.jpg"
  },
  {
    id: 102,
    title: "Inception",
    overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    genre_ids: [878, 28, 53], // Sci-Fi, Action, Thriller
    original_language: "en",
    vote_average: 8.3,
    vote_count: 34000,
    poster_path: "/o0OkiMK70w44148Ur95Jok62VXt.jpg"
  },
  {
    id: 103,
    title: "The Dark Knight",
    overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    genre_ids: [28, 18, 53], // Action, Drama, Thriller
    original_language: "en",
    vote_average: 8.5,
    vote_count: 30000,
    poster_path: "/qJ2tWwR7BjiGo5krSDnkgurXN7o.jpg"
  },
  {
    id: 104,
    title: "Spirited Away",
    overview: "A young girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
    genre_ids: [16, 14, 12], // Animation, Fantasy, Adventure
    original_language: "ja",
    vote_average: 8.5,
    vote_count: 15000,
    poster_path: "/39wmItIWsg5sclJeqLijPv0GtqC.jpg"
  },
  {
    id: 105,
    title: "Parasite",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    genre_ids: [53, 18, 35], // Thriller, Drama, Comedy
    original_language: "ko",
    vote_average: 8.5,
    vote_count: 17000,
    poster_path: "/7IiTT0khLoV2z2UaSAkx2ABn6ic.jpg"
  },
  {
    id: 106,
    title: "3 Idiots",
    overview: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently, even as the rest of the world called them idiots.",
    genre_ids: [35, 18], // Comedy, Drama
    original_language: "hi",
    vote_average: 8.0,
    vote_count: 5000,
    poster_path: "/7E89tTa45nC162OH5n57c0w0xnr.jpg"
  },
  {
    id: 107,
    title: "Dangal",
    overview: "Mahavir Singh Phogat, a former wrestler, decides to fulfill his dream of winning a gold medal for his country by training his daughters for the Commonwealth Games despite societal inhibition.",
    genre_ids: [18, 28], // Drama, Action
    original_language: "hi",
    vote_average: 8.2,
    vote_count: 4500,
    poster_path: "/5h2902XU5V1U5a9aL9uH6w3oU3K.jpg"
  },
  {
    id: 108,
    title: "Lagaan: Once Upon a Time in India",
    overview: "In 1893 India, an arrogant British commander challenges the oppressed villagers of Champaner to a high-stakes game of cricket to avoid paying high taxes.",
    genre_ids: [18, 12, 10749], // Drama, Adventure, Romance
    original_language: "hi",
    vote_average: 7.9,
    vote_count: 3800,
    poster_path: "/f345rD1g0V5a9aL9uH6w3oU3K.jpg"
  },
  {
    id: 109,
    title: "Chello Divas",
    overview: "A Gujarati comedy film revolving around the lives of 8 friends and their college life adventures, struggles, and romances.",
    genre_ids: [35, 18], // Comedy, Drama
    original_language: "gu",
    vote_average: 7.8,
    vote_count: 1500,
    poster_path: null
  },
  {
    id: 110,
    title: "Hellaro",
    overview: "In a patriarchal village in Kutch, a group of women break societal barriers and express themselves through the rhythmic art form of Garba.",
    genre_ids: [18], // Drama
    original_language: "gu",
    vote_average: 8.3,
    vote_count: 800,
    poster_path: null
  },
  {
    id: 115,
    title: "Sairat",
    overview: "A heart-wrenching Marathi romance drama about a young boy and girl who fall in love across deep-seated caste divisions in rural India.",
    genre_ids: [18, 10749], // Drama, Romance
    original_language: "mr",
    vote_average: 8.1,
    vote_count: 2200,
    poster_path: null
  },
  {
    id: 116,
    title: "Natsamrat",
    overview: "An esteemed theater actor goes through tragic family dynamics and struggles in his post-retirement life with his wife.",
    genre_ids: [18], // Drama
    original_language: "mr",
    vote_average: 8.4,
    vote_count: 1200,
    poster_path: null
  },
  {
    id: 117,
    title: "Baahubali: The Beginning",
    overview: "A young, spirited man raises a giant kingdom out of the ashes and uncovers his legendary heritage in ancient India.",
    genre_ids: [28, 12, 14], // Action, Adventure, Fantasy
    original_language: "te",
    vote_average: 8.0,
    vote_count: 4000,
    poster_path: "/9R3k6E0V2z2UaSAkx2ABn6ic.jpg"
  },
  {
    id: 118,
    title: "RRR",
    overview: "A fictional tale of two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
    genre_ids: [28, 12, 18], // Action, Adventure, Drama
    original_language: "te",
    vote_average: 7.9,
    vote_count: 3500,
    poster_path: "/u2902XU5V1U5a9aL9uH6w3oU3K.jpg"
  }
];

function mockFetchFromTMDB(endpoint, params) {
  console.log("[MOCK MODE] Serving Mock TMDB endpoint:", endpoint, params);
  
  if (endpoint === "/genre/movie/list") {
    return {
      genres: [
        { id: 28, name: "Action" },
        { id: 12, name: "Adventure" },
        { id: 16, name: "Animation" },
        { id: 35, name: "Comedy" },
        { id: 18, name: "Drama" },
        { id: 14, name: "Fantasy" },
        { id: 27, name: "Horror" },
        { id: 10749, name: "Romance" },
        { id: 878, name: "Sci-Fi" },
        { id: 53, name: "Thriller" }
      ]
    };
  }

  if (endpoint.startsWith("/movie/")) {
    const parts = endpoint.split("/");
    if (parts[2] && parts[2] !== "popular") {
      const movieId = parseInt(parts[2]);
      const mockMovie = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0];
      return {
        ...mockMovie,
        credits: {
          cast: [
            { name: "Actor A", character: "Hero" },
            { name: "Actor B", character: "Sidekick" }
          ]
        }
      };
    }
  }

  let results = [...MOCK_MOVIES];
  console.log("[MOCK] Initial movies pool size:", results.length);

  if (params.with_original_language) {
    results = results.filter(m => m.original_language === params.with_original_language);
    console.log("[MOCK] Pool size after language filter for", params.with_original_language, ":", results.length);
  }

  if (params.with_genres) {
    const genreIds = String(params.with_genres).split(",").map(Number);
    results = results.filter(m => m.genre_ids && m.genre_ids.some(gid => genreIds.includes(gid)));
    console.log("[MOCK] Pool size after genre filter for", params.with_genres, ":", results.length);
  }

  if (params.query) {
    const q = params.query.toLowerCase();
    results = results.filter(m => m.title.toLowerCase().includes(q) || m.overview.toLowerCase().includes(q));
  }

  if (results.length === 0) {
    console.log("[MOCK] No results matched. Falling back to first 5 mock movies.");
    results = MOCK_MOVIES.slice(0, 5);
  }

  return {
    page: params.page || 1,
    results: results,
    total_pages: 1,
    total_results: results.length
  };
}


// Simple in-memory cache: key -> { data, expiresAt }
const cache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

const tmdbClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    accept: 'application/json',
  },
});

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
  cache.set(key, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

async function fetchFromTMDB(endpoint, params = {}) {
  const cacheKey = getCacheKey(endpoint, params);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`[cache hit] ${cacheKey}`);
    return cached;
  }

  if (!TOKEN) {
    const mockData = mockFetchFromTMDB(endpoint, params);
    setCache(cacheKey, mockData);
    return mockData;
  }

  try {
    const response = await tmdbClient.get(endpoint, { params });
    let data = response.data;
    if (data) {
      if (Array.isArray(data.results)) {
        data.results = data.results.map(movie => {
          if (movie && movie.original_title) {
            movie.title = movie.original_title;
          }
          return movie;
        });
      } else if (data.original_title) {
        data.title = data.original_title;
      }
    }
    setCache(cacheKey, data);
    return data;
  } catch (err) {
    console.error(`[TMDB API Error] ${err.message || err}. Falling back to mock data.`);
    const mockData = mockFetchFromTMDB(endpoint, params);
    setCache(cacheKey, mockData);
    return mockData;
  }
}


async function getPopularMovies(page = 1) {
  return fetchFromTMDB('/movie/popular', { page });
}

async function searchMovies(query, page = 1) {
  return fetchFromTMDB('/search/movie', { query, page });
}

async function getMovieDetails(movieId) {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits',
  });
}
async function getRecentMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    sort_by: 'release_date.desc',
    'release_date.lte': new Date().toISOString().split('T')[0],
    'vote_count.gte': 10,
  });
}

async function getKoreanMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'ko',
    sort_by: 'popularity.desc',
  });
}

async function getChineseMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'zh',
    sort_by: 'popularity.desc',
  });
}
async function getSciFiMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '878',
    sort_by: 'popularity.desc',
  });
}

async function getAnimationMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '16',
    sort_by: 'popularity.desc',
  });
}

async function getGenres() {
  return fetchFromTMDB('/genre/movie/list', {});
}

async function getTrendingMovies(timeWindow = 'day', page = 1) {
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
  getKoreanMovies,
  getChineseMovies,
  getSciFiMovies,
  getAnimationMovies,
  getGenres,
  getTrendingMovies,
  getMoviesByLanguage,

};
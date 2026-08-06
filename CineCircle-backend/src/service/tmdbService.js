const axios = require('axios');
const https = require('https');

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = process.env.TMDB_API_TOKEN;

// In-memory cache: key -> { data, expiresAt }
const cache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes — reduces TMDB round-trips

// NOTE: keepAlive intentionally disabled.
// On Windows, a shared keep-alive socket can be forcibly closed by the OS
// (WSAECONNABORTED / ECONNRESET) when the remote server resets it, causing
// all in-flight requests on that socket to fail. Using a fresh socket per
// request is slightly slower but eliminates the entire class of error.
const tmdbClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    accept: 'application/json',
  },
  httpsAgent: new https.Agent({ keepAlive: false }),
  timeout: 12000,
});

// Error codes that indicate a transient network issue — safe to retry
const RETRYABLE_CODES = new Set([
  'ECONNRESET',
  'ECONNABORTED',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'ERR_NETWORK',
  'WSAECONNABORTED',   // Windows-specific
  'WSAECONNRESET',     // Windows-specific
]);

function isRetryable(err) {
  if (RETRYABLE_CODES.has(err.code)) return true;
  if (err.response && err.response.status >= 500) return true; // 5xx from TMDB
  if (err.response && err.response.status === 429) return true; // rate-limit
  return false;
}

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

const MAX_RETRIES = 4;
const RETRY_BASE_MS = 600; // exponential: 600ms, 1.2s, 2.4s

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchFromTMDB(endpoint, params = {}) {
  const cacheKey = getCacheKey(endpoint, params);

  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`[cache hit] ${endpoint}`);
    return cached;
  }

  let lastError;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await tmdbClient.get(endpoint, { params });
      setCache(cacheKey, response.data);
      return response.data;
    } catch (err) {
      lastError = err;
      const code = err.code || err.message || 'UNKNOWN';

      if (!isRetryable(err)) {
        // Non-retryable (e.g. 401 Unauthorized, 404) — throw immediately
        console.error(`[TMDB] Non-retryable error on ${endpoint}: ${code}`);
        throw err;
      }

      console.warn(
        `[TMDB retry ${attempt}/${MAX_RETRIES}] ${endpoint} — ${code}. Retrying in ${RETRY_BASE_MS * attempt}ms...`
      );

      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_BASE_MS * attempt);
      }
    }
  }

  throw lastError;
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

async function getMovieVideos(movieId) {
  try {
    const data = await fetchFromTMDB(`/movie/${movieId}/videos`);

    if (!data || !Array.isArray(data.results)) {
      return { trailerKey: null };
    }

    const youtubeTrailers = data.results.filter(
      (video) => video.site === 'YouTube' && video.type === 'Trailer'
    );

    if (youtubeTrailers.length === 0) {
      return { trailerKey: null };
    }

    const officialTrailer = youtubeTrailers.find(
      (video) => video.official === true
    );

    const selectedTrailer = officialTrailer || youtubeTrailers[0];

    return {
      trailerKey: selectedTrailer.key || null,
    };
  } catch (err) {
    console.error(`Error in getMovieVideos for ID ${movieId}:`, err.message);
    return { trailerKey: null };
  }
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

async function getIndianMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_origin_country: 'IN',
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

async function getHollywoodMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'en',
    with_origin_country: 'US',
    sort_by: 'popularity.desc',
    'vote_count.gte': 100,
  });
}

async function getJapaneseMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'ja',
    sort_by: 'popularity.desc',
  });
}

async function getSpanishMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'es',
    sort_by: 'popularity.desc',
  });
}

async function getHorrorMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '27',
    sort_by: 'popularity.desc',
  });
}

async function getThrillerMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '53',
    sort_by: 'popularity.desc',
  });
}

async function getRomanceMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '10749',
    sort_by: 'popularity.desc',
  });
}

async function getActionMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_genres: '28',
    sort_by: 'popularity.desc',
  });
}

async function getAwardMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    sort_by: 'vote_count.desc',
    'vote_average.gte': 8,
    'vote_count.gte': 1000,
  });
}

async function getGenres() {
  return fetchFromTMDB('/genre/movie/list');
}

async function getTrendingMovies(timeWindow = 'day', page = 1) {
  const windowParam = timeWindow === 'week' ? 'week' : 'day';
  return fetchFromTMDB(`/trending/movie/${windowParam}`, { page });
}

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getMovieVideos,
  getRecentMovies,
  getKoreanMovies,
  getChineseMovies,
  getIndianMovies,
  getSciFiMovies,
  getAnimationMovies,
  getHollywoodMovies,
  getJapaneseMovies,
  getSpanishMovies,
  getHorrorMovies,
  getThrillerMovies,
  getRomanceMovies,
  getActionMovies,
  getAwardMovies,
  getGenres,
  getTrendingMovies,
};
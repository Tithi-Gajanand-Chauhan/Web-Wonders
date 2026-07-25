const axios = require('axios');

const BASE_URL = 'https://api.themoviedb.org/3';
const TOKEN = process.env.TMDB_API_TOKEN;

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

  const response = await tmdbClient.get(endpoint, { params });
  setCache(cacheKey, response.data);
  return response.data;
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
async function getGenres() {
  return fetchFromTMDB('/genre/movie/list', {});
}
async function getTrendingMovies(timeWindow = 'day', page = 1) {
  return fetchFromTMDB(`/trending/movie/${timeWindow}`, { page });
}

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getRecentMovies,
  getKoreanMovies,
  getChineseMovies,
  getGenres,
  getTrendingMovies,
};
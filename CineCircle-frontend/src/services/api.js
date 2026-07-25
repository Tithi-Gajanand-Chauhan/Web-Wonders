import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getPopularMovies = async (page = 1) => {
  const response = await api.get('/movies/popular', { params: { page } });
  return response.data;
};

export const searchMovies = async (query, page = 1) => {
  const response = await api.get('/movies/search', { params: { query, page } });
  return response.data;
};

export const getMovieDetails = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const getRecentMovies = async (page = 1) => {
  const response = await api.get('/movies/recent', { params: { page } });
  return response.data;
};

export const getKoreanMovies = async (page = 1) => {
  const response = await api.get('/movies/korean', { params: { page } });
  return response.data;
};

export const getChineseMovies = async (page = 1) => {
  const response = await api.get('/movies/chinese', { params: { page } });
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get('/movies/genres');
  return response.data;
};
export const getTrendingMovies = async (timeWindow = 'day', page = 1) => {
  const response = await api.get('/movies/trending', { params: { window: timeWindow, page } });
  return response.data;
};
export default api;
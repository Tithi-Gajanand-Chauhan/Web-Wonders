import api from "./api";

export const getPopularMovies = async () => {
  const response = await api.get("/movies/popular");
  return response.data;
};

export const getGenres = async () => {
  const response = await api.get("/movies/genres");
  return response.data;
};

export const getTrendingMovies = async (window = "day") => {
  const response = await api.get(
    `/movies/trending?window=${window}`
  );
  return response.data;
};

export const searchMovies = async (query) => {
  const response = await api.get(
    `/movies/search?query=${encodeURIComponent(query)}`
  );

  return response.data;
};

export const getMovieDetails = async (id) => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const getHindiMovies = async () => {
  const response = await api.get("/movies/hindi");
  return response.data;
};


export const getGujaratiMovies = async () => {
  const response = await api.get("/movies/gujarati");
  return response.data;
};


export const getMarathiMovies = async (page = 1) => {
  const response = await api.get('/movies/marathi', {
    params: { page }
  });

  return response.data;
};
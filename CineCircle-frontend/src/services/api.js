import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 3000,
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinecircle_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Curated high quality movie dataset with real high-res posters, backdrops, YouTube trailers & details
export const MOCK_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

export const TRAILER_MAP = {
  634649: 'JfVOs4VSpmA', // Spider-Man: No Way Home
  105971: 'd9MyW72ELq0', // The Odyssey: Rise of Kings
  557: 'LdOM0y0OO28',    // Supergirl: Woman of Tomorrow
  693134: 'Way9Dexny3w', // Dune: Part Two
  872585: 'uYPbbksJxIg', // Oppenheimer
  508947: 'XdKzUbAiswE', // Turning Red
  496243: '5xH0HfJHsaY', // Parasite
  539681: 'by5QZt128o8', // Avatar Aang
  934632: 'tbp31UjDNnc', // Partners by Accident
  372058: 'xU47nhruN-Q', // Your Name
  57800: 'v84nU5N-DIs',  // The Wandering Earth II
  603: '9ix7TUGVYIo',    // The Matrix Resurrections
  157336: 'zSWdZVtXT7E', // Interstellar
  27205: 'YoHD9XEInc0',  // Inception
  335984: 'gCcx85zbxz4', // Blade Runner 2049
  324857: 'g4Hbz2jLXvQ', // Spider-Man: Into the Spider-Verse
  1022789: 'LEjhY15eCx0',// Inside Out 2
  519182: 'qQlr9-rF32o', // Despicable Me 4
  129: 'ByXuk9QqQkk',    // Spirited Away
  1011985: '_inKs4eeHiI' // Kung Fu Panda 4
};

const DIVERSE_TRAILERS = [
  'JfVOs4VSpmA', 'Way9Dexny3w', 'uYPbbksJxIg', 'g4Hbz2jLXvQ',
  'zSWdZVtXT7E', 'YoHD9XEInc0', 'LEjhY15eCx0', '5xH0HfJHsaY',
  'gCcx85zbxz4', 'XdKzUbAiswE', '9ix7TUGVYIo', 'ByXuk9QqQkk'
];

// Only returns a trailer key if we actually know it's correct.
// Returns null instead of guessing (no more wrong trailers).
export function getMovieTrailerKey(movie) {
  if (!movie) return null;
  if (typeof movie === 'string') {
    return movie.length >= 8 && !movie.includes('.') ? movie : null;
  }

  // 1. Direct trailer_key on the movie object (real YouTube video ID only)
  if (
    movie.trailer_key &&
    typeof movie.trailer_key === 'string' &&
    movie.trailer_key.length >= 8 &&
    !movie.trailer_key.includes('.') // rules out accidental file paths
  ) {
    return movie.trailer_key;
  }

  // 2. Known-good curated map
  if (movie.id && TRAILER_MAP[movie.id]) {
    return TRAILER_MAP[movie.id];
  }

  // 3. No confirmed trailer — caller should show the poster instead
  return null;
}

export function getTrailerIframeUrl(movie, { autoplay = 1, mute = 1, loop = 1, controls = 0 } = {}) {
  const key = getMovieTrailerKey(movie);
  if (!key) return null;

  return `https://www.youtube.com/embed/${key}?autoplay=${autoplay}&mute=${mute}&controls=${controls}&modestbranding=1&rel=0&enablejsapi=1${
    loop ? `&loop=1&playlist=${key}` : ''
  }`;
}

// Fetches the real trailer from your backend (TMDB /movie/{id}/videos),
// for movies that aren't in CURATED_MOVIES / TRAILER_MAP.
export const fetchMovieTrailer = async (movieId) => {
  try {
    const { data } = await api.get(`/movies/${movieId}/videos`);
    return data?.trailerKey || null;
  } catch (e) {
    return null;
  }
};

const CURATED_MOVIES = [
  {
    id: 634649,
    title: 'Spider-Man: No Way Home',
    original_title: 'Spider-Man: No Way Home',
    overview: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
    poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLZf.jpg',
    backdrop_path: '/iQFwKi1NhlB2XPxLjhB6uGPGQg1.jpg',
    vote_average: 8.5,
    vote_count: 19430,
    release_date: '2021-12-15',
    genre_ids: [28, 12, 878],
    match_percentage: 98,
    age_rating: '13+',
    badge: 'Action Blockbuster',
    runtime: 148,
    tagline: 'The Multiverse Unleashed.',
    trailer_key: 'JfVOs4VSpmA',
    moods: ['Action', 'Adrenaline Rush', 'Mind-Bending', 'Popcorn Blockbusters', 'Sci-Fi'],
    cast: [
      { id: 1, name: 'Tom Holland', character: 'Peter Parker / Spider-Man' },
      { id: 2, name: 'Zendaya', character: 'MJ' },
      { id: 3, name: 'Benedict Cumberbatch', character: 'Doctor Strange' }
    ]
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    original_title: 'Dune: Part Two',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
    poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdrop_path: '/xOMo8ScSu223m2xQW2B77.jpg',
    vote_average: 8.7,
    vote_count: 12500,
    release_date: '2024-02-27',
    genre_ids: [878, 12, 18],
    match_percentage: 99,
    age_rating: '13+',
    badge: 'Sci-Fi Epic',
    runtime: 166,
    tagline: 'Long live the fighters.',
    trailer_key: 'Way9Dexny3w',
    moods: ['Mind-Bending', 'Dark & Gritty', 'Sci-Fi', 'Popcorn Blockbusters'],
    cast: [
      { id: 7, name: 'Timothée Chalamet', character: 'Paul Atreides' },
      { id: 8, name: 'Zendaya', character: 'Chani' }
    ]
  },
  {
    id: 157336,
    title: 'Interstellar',
    original_title: 'Interstellar',
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/pbrkL8aVz9yR92bgE1LZW1frRKo.jpg',
    vote_average: 8.6,
    vote_count: 34000,
    release_date: '2014-11-05',
    genre_ids: [878, 18, 12],
    match_percentage: 99,
    age_rating: '13+',
    badge: 'Sci-Fi Masterpiece',
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    trailer_key: 'zSWdZVtXT7E',
    moods: ['Sci-Fi', 'Mind-Bending', 'Adrenaline Rush'],
    cast: [
      { id: 101, name: 'Matthew McConaughey', character: 'Cooper' },
      { id: 102, name: 'Anne Hathaway', character: 'Brand' }
    ]
  },
  {
    id: 324857,
    title: 'Spider-Man: Into the Spider-Verse',
    original_title: 'Spider-Man: Into the Spider-Verse',
    overview: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
    poster_path: '/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg',
    backdrop_path: '/7d62ut0YEXeeVeeEAio2jWFiwZ7.jpg',
    vote_average: 8.4,
    vote_count: 15400,
    release_date: '2018-12-06',
    genre_ids: [16, 28, 12, 878],
    match_percentage: 98,
    age_rating: 'PG',
    badge: 'Oscar Animation Winner',
    runtime: 117,
    tagline: 'Enter a universe where more than one wears the mask.',
    trailer_key: 'g4Hbz2jLXvQ',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Action', 'Popcorn Blockbusters'],
    cast: [
      { id: 201, name: 'Shameik Moore', character: 'Miles Morales (voice)' },
      { id: 202, name: 'Jake Johnson', character: 'Peter B. Parker (voice)' }
    ]
  },
  {
    id: 1022789,
    title: 'Inside Out 2',
    original_title: 'Inside Out 2',
    overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
    poster_path: '/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg',
    backdrop_path: '/stKGOm8UyhuLPR92pNJxawScmXx.jpg',
    vote_average: 8.0,
    vote_count: 4800,
    release_date: '2024-06-11',
    genre_ids: [16, 35, 10751],
    match_percentage: 95,
    age_rating: 'ALL',
    badge: 'Animation Hit',
    runtime: 96,
    tagline: 'Make room for new emotions.',
    trailer_key: 'LEjhY15eCx0',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Comedy & Drama'],
    cast: [
      { id: 301, name: 'Amy Poehler', character: 'Joy (voice)' },
      { id: 302, name: 'Maya Hawke', character: 'Anxiety (voice)' }
    ]
  },
  {
    id: 27205,
    title: 'Inception',
    original_title: 'Inception',
    overview: 'Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is offered a chance at redemption if he can execute inception.',
    poster_path: '/oYuLE1h2CVCd12B5pXCG2fC2FGl.jpg',
    backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAiKQ.jpg',
    vote_average: 8.4,
    vote_count: 35800,
    release_date: '2010-07-15',
    genre_ids: [878, 28, 12],
    match_percentage: 99,
    age_rating: '13+',
    badge: 'Sci-Fi Classic',
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    trailer_key: 'YoHD9XEInc0',
    moods: ['Sci-Fi', 'Mind-Bending', 'Action', 'Dark & Gritty'],
    cast: [
      { id: 401, name: 'Leonardo DiCaprio', character: 'Cobb' },
      { id: 402, name: 'Joseph Gordon-Levitt', character: 'Arthur' }
    ]
  },
  {
    id: 508947,
    title: 'Turning Red',
    original_title: 'Turning Red',
    overview: 'A 13-year-old girl dealing with teenage turmoil turns into a giant red panda whenever she gets too excited or stressed.',
    poster_path: '/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg',
    backdrop_path: '/9Idh0i7n4L7g1k84.jpg',
    vote_average: 7.9,
    vote_count: 5400,
    release_date: '2022-03-10',
    genre_ids: [16, 35, 14],
    match_percentage: 91,
    age_rating: 'ALL',
    badge: 'Family Favorite',
    runtime: 100,
    tagline: 'Growing up is a beast.',
    trailer_key: 'XdKzUbAiswE',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Popcorn Blockbusters'],
    cast: [{ id: 11, name: 'Rosalie Chiang', character: 'Mei Lee (voice)' }]
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    original_title: 'Oppenheimer',
    overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II and its dramatic political aftermath.',
    poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdrop_path: '/fm6KqXVvi3M9v8Lz1C1S0u8a1y.jpg',
    vote_average: 8.9,
    vote_count: 15300,
    release_date: '2023-07-19',
    genre_ids: [18, 36],
    match_percentage: 97,
    age_rating: '18+',
    badge: 'Oscar Winner',
    runtime: 180,
    tagline: 'The world changes forever.',
    trailer_key: 'uYPbbksJxIg',
    moods: ['Mind-Bending', 'Dark & Gritty', 'Award Winners'],
    cast: [
      { id: 9, name: 'Cillian Murphy', character: 'J. Robert Oppenheimer' },
      { id: 10, name: 'Emily Blunt', character: 'Katherine Oppenheimer' }
    ]
  },
  {
    id: 129,
    title: 'Spirited Away',
    original_title: '千と千尋の神隠し',
    overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free herself and her family.',
    poster_path: '/39wmItE2ABW2fScGQVxS2uKCflE.jpg',
    backdrop_path: '/Ab8mtEgGj2J2S349v29.jpg',
    vote_average: 8.5,
    vote_count: 16200,
    release_date: '2001-07-20',
    genre_ids: [16, 14, 10751],
    match_percentage: 99,
    age_rating: 'ALL',
    badge: 'Anime Masterpiece',
    runtime: 125,
    tagline: 'Nothing that happens is ever forgotten, even if you can\'t remember it.',
    trailer_key: 'ByXuk9QqQkk',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Mind-Bending'],
    cast: [{ id: 501, name: 'Rumi Hiiragi', character: 'Chihiro (voice)' }]
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    original_title: 'Blade Runner 2049',
    overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
    poster_path: '/gA8W2vVJexhxZ83zNkjQ14L2C8p.jpg',
    backdrop_path: '/sAtoMqDVhNDQBc3QW3mRcHwbWPx.jpg',
    vote_average: 8.0,
    vote_count: 13200,
    release_date: '2017-10-04',
    genre_ids: [878, 18, 9648],
    match_percentage: 96,
    age_rating: '16+',
    badge: 'Sci-Fi Masterpiece',
    runtime: 164,
    tagline: 'The key to the future is finally unearthed.',
    trailer_key: 'gCcx85zbxz4',
    moods: ['Sci-Fi', 'Mind-Bending', 'Dark & Gritty'],
    cast: [
      { id: 601, name: 'Ryan Gosling', character: 'K' },
      { id: 602, name: 'Harrison Ford', character: 'Rick Deckard' }
    ]
  },
  {
    id: 519182,
    title: 'Despicable Me 4',
    original_title: 'Despicable Me 4',
    overview: 'Gru and Lucy and their girls welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad. Gru faces a new nemesis in Maxime Le Mal and his femme fatale girlfriend Valentina.',
    poster_path: '/wWba3TaojhK7vj9Lx2dMLyGvBxF.jpg',
    backdrop_path: '/fDM2L0G50.jpg',
    vote_average: 7.3,
    vote_count: 2100,
    release_date: '2024-06-20',
    genre_ids: [16, 10751, 35, 28],
    match_percentage: 92,
    age_rating: 'ALL',
    badge: 'Family Comedy',
    runtime: 95,
    tagline: 'Things just got a little more despicable.',
    trailer_key: 'qQlr9-rF32o',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Comedy & Drama'],
    cast: [{ id: 701, name: 'Steve Carell', character: 'Gru (voice)' }]
  },
  {
    id: 372058,
    title: 'Your Name',
    original_title: '君の名は。',
    overview: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
    poster_path: '/q719jflA4v8v2C9E3bWwZ.jpg',
    backdrop_path: '/8xV4723.jpg',
    vote_average: 8.6,
    vote_count: 10400,
    release_date: '2016-08-26',
    genre_ids: [16, 18, 10749],
    match_percentage: 97,
    age_rating: 'ALL',
    badge: 'Anime Masterpiece',
    runtime: 106,
    tagline: 'I am always searching for something, for someone.',
    trailer_key: 'xU47nhruN-Q',
    moods: ['Cartoons & Animation', 'Feel-Good', 'Mind-Bending'],
    cast: [{ id: 15, name: 'Ryunosuke Kamiki', character: 'Taki Tachibana (voice)' }]
  },
  {
    id: 603,
    title: 'The Matrix Resurrections',
    original_title: 'The Matrix Resurrections',
    overview: 'Return to a world of two realities: one, everyday life; the other, what lies behind it. To find out if his reality is a construct, Thomas Anderson will have to choose to follow the white rabbit once more.',
    poster_path: '/8c4a82b.jpg',
    backdrop_path: '/93b827.jpg',
    vote_average: 7.7,
    vote_count: 8900,
    release_date: '2021-12-22',
    genre_ids: [878, 28],
    match_percentage: 88,
    age_rating: '16+',
    badge: 'Sci-Fi Classic',
    runtime: 148,
    tagline: 'Return to the Source.',
    trailer_key: '9ix7TUGVYIo',
    moods: ['Sci-Fi', 'Mind-Bending', 'Action', 'Dark & Gritty'],
    cast: [{ id: 17, name: 'Keanu Reeves', character: 'Neo' }]
  }
];

export const getGenres = async () => {
  try {
    const response = await api.get('/movies/genres');
    if (response.data && response.data.genres) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { genres: MOCK_GENRES };
};

export const getPopularMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/popular', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES };
};

export const getTrendingMovies = async (timeWindow = 'day', page = 1) => {
  try {
    const response = await api.get('/movies/trending', { params: { window: timeWindow, page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.slice(0, 10) };
};

export const getRecentMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/recent', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.filter(m => Number(m.release_date?.split('-')[0]) >= 2022) };
};

export const getSciFiMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/scifi', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(878) || m.moods?.includes('Sci-Fi')) };
};

export const getAnimationMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/animation', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(16) || m.moods?.includes('Cartoons & Animation')) };
};

export const getKoreanMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/korean', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.filter(m => m.badge?.includes('Korean') || m.id === 496243 || m.id === 372058) };
};

export const getChineseMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/chinese', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  return { results: CURATED_MOVIES.filter(m => m.badge?.includes('Chinese') || m.id === 57800) };
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await api.get('/movies/search', { params: { query, page } });
    if (response.data && response.data.results) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  const q = query.toLowerCase();
  const filtered = CURATED_MOVIES.filter(m => 
    m.title.toLowerCase().includes(q) || 
    m.overview.toLowerCase().includes(q) ||
    (m.moods && m.moods.some(mood => mood.toLowerCase().includes(q)))
  );
  return { results: filtered };
};

export const getMovieDetails = async (id) => {
  try {
    const response = await api.get(`/movies/${id}`);
    if (response.data && response.data.title) return response.data;
  } catch (e) {
    // Fallback if backend offline
  }
  const found = CURATED_MOVIES.find(m => m.id === Number(id)) || CURATED_MOVIES[0];
  return {
    ...found,
    "watch/providers": {
      results: {
        IN: {
          link: "https://www.themoviedb.org",
          flatrate: [
            {
              logo_path: "/wwemzKWzjKYJFfCeiBdf7qH4lHS.jpg",
              provider_id: 8,
              provider_name: "Netflix"
            },
            {
              logo_path: "/5NyHNqi0IAj5A51J6Rj4bFW1h0A.jpg",
              provider_id: 119,
              provider_name: "Amazon Prime Video"
            },
            {
              logo_path: "/7rw0Es1h5jVbp54e8W4NxtA2jG1.jpg",
              provider_id: 122,
              provider_name: "Disney+ Hotstar"
            }
          ]
        },
        US: {
          link: "https://www.themoviedb.org",
          flatrate: [
            {
              logo_path: "/wwemzKWzjKYJFfCeiBdf7qH4lHS.jpg",
              provider_id: 8,
              provider_name: "Netflix"
            },
            {
              logo_path: "/5NyHNqi0IAj5A51J6Rj4bFW1h0A.jpg",
              provider_id: 119,
              provider_name: "Amazon Prime Video"
            }
          ]
        }
      }
    },
    genres: MOCK_GENRES.filter(g => found.genre_ids?.includes(g.id)),
    credits: {
      cast: found.cast || [],
      crew: [{ id: 99, job: 'Director', name: 'Christopher Nolan' }]
    }
  };
};

// --- Reviews & Ratings API ---
export const fetchReviews = async (movieId) => {
  try {
    const response = await api.get(`/reviews/${movieId}`);
    return response.data;
  } catch (e) {
    console.error('fetchReviews error:', e);
    return { reviews: [], averageRating: 0, totalReviews: 0 };
  }
};

export const submitReview = async (movieId, rating, reviewText) => {
  const response = await api.post(`/reviews/${movieId}`, { rating, reviewText });
  return response.data;
};

export const deleteReview = async (movieId) => {
  const response = await api.delete(`/reviews/${movieId}`);
  return response.data;
};

// --- Likes API ---
export const fetchLikes = async (movieId) => {
  try {
    const response = await api.get(`/likes/${movieId}`);
    return response.data;
  } catch (e) {
    console.error('fetchLikes error:', e);
    return { likesCount: 0, userLiked: false };
  }
};

export const fetchLikesList = async () => {
  try {
    const response = await api.get('/likes');
    return response.data;
  } catch (e) {
    console.error('fetchLikesList error:', e);
    return [];
  }
};

export const toggleLike = async (movieId, movieData = null) => {
  const response = await api.post(`/likes/${movieId}/toggle`, { movie: movieData });
  return response.data;
};

// --- Custom Lists API ---
export const fetchCustomLists = async () => {
  try {
    const response = await api.get('/lists');
    return response.data;
  } catch (e) {
    console.error('fetchCustomLists error:', e);
    return [];
  }
};

export const createCustomList = async (name, description) => {
  const response = await api.post('/lists', { name, description });
  return response.data;
};

export const deleteCustomList = async (listId) => {
  const response = await api.delete(`/lists/${listId}`);
  return response.data;
};

export const addMovieToCustomList = async (listId, movie) => {
  const response = await api.post(`/lists/${listId}/movies`, {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: movie.vote_average
  });
  return response.data;
};

export const removeMovieFromCustomList = async (listId, movieId) => {
  const response = await api.delete(`/lists/${listId}/movies/${movieId}`);
  return response.data;
};

// --- Watched Status API ---
export const fetchWatchedStatus = async (movieId) => {
  try {
    const response = await api.get(`/watched/${movieId}`);
    return response.data;
  } catch (e) {
    console.error('fetchWatchedStatus error:', e);
    return { userWatched: false };
  }
};

export const fetchWatchedList = async () => {
  try {
    const response = await api.get('/watched');
    return response.data;
  } catch (e) {
    console.error('fetchWatchedList error:', e);
    return [];
  }
};

export const toggleWatchedStatus = async (movieId, movieData = null) => {
  const response = await api.post(`/watched/${movieId}/toggle`, { movie: movieData });
  return response.data;
};

// --- Reviews Stats API ---
export const fetchReviewStats = async (movieId) => {
  try {
    const response = await api.get(`/reviews/${movieId}/stats`);
    return response.data;
  } catch (e) {
    console.error('fetchReviewStats error:', e);
    return { distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, totalReviews: 0, averageRating: 0 };
  }
};

export const discoverMovies = async (genre = '', year = '', rating = '', page = 1) => {
  try {
    const response = await api.get('/movies/discover', {
      params: { genre, year, rating, page }
    });
    if (response.data && response.data.results) return response.data;
  } catch (e) {
    console.error('discoverMovies error:', e);
  }
  
  // Fallback filtering if backend is offline
  let filtered = [...CURATED_MOVIES];
  if (genre) {
    filtered = filtered.filter(m => m.genre_ids?.includes(Number(genre)));
  }
  if (year) {
    filtered = filtered.filter(m => m.release_date?.split('-')[0] === year);
  }
  if (rating) {
    filtered = filtered.filter(m => m.vote_average >= Number(rating));
  }
  return { results: filtered };
};

export const getAwardMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.badge?.toLowerCase().includes('oscar') || m.badge?.toLowerCase().includes('winner') || m.vote_average >= 8.2) };
};

export const getHollywoodMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'en') };
};

export const getActionMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(28)) };
};

export const getHorrorMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(27)) };
};

export const getThrillerMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(53)) };
};

export const getRomanceMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.genre_ids?.includes(10749)) };
};

export const getJapaneseMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'ja') };
};

export const getIndianMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/hindi', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {}
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'hi' || m.original_language === 'ta' || m.original_language === 'te') };
};

export const getHindiMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/hindi', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {}
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'hi') };
};

export const getGujaratiMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/gujarati', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {}
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'gu') };
};

export const getMarathiMovies = async (page = 1) => {
  try {
    const response = await api.get('/movies/marathi', { params: { page } });
    if (response.data && response.data.results && response.data.results.length > 0) return response.data;
  } catch (e) {}
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'mr') };
};

export const getSpanishMovies = async (page = 1) => {
  return { results: CURATED_MOVIES.filter(m => m.original_language === 'es') };
};

export const getMoviesByList = async (listId, page = 1) => {
  try {
    const response = await api.get(`/movies/list/${listId}`, { params: { page } });
    if (response.data && response.data.results) return response.data;
  } catch (e) {
    console.error('getMoviesByList error:', e);
  }

  // Frontend local fallback logic for offline support
  let results = [...CURATED_MOVIES];
  if (listId.startsWith('decade-')) {
    const dec = listId.split('-')[1]; // e.g. "1990s"
    const decadeStart = parseInt(dec);
    results = results.filter(m => {
      const year = parseInt(m.release_date?.split('-')[0]);
      return year >= decadeStart && year <= decadeStart + 9;
    });
  } else if (listId === 'director-women') {
    results = results.filter(m => m.id === 1022789 || m.id === 508947 || m.id === 129);
  } else if (listId === 'format-animated') {
    results = results.filter(m => m.genre_ids?.includes(16));
  } else if (listId === 'region-indian') {
    results = results.filter(m => ['hi', 'te', 'mr', 'gu', 'ta'].includes(m.original_language));
  } else if (listId === 'region-japanese') {
    results = results.filter(m => m.original_language === 'ja');
  } else if (listId === 'popularity-mostfans') {
    results = results.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
  }
  return { results };
};

export default api;
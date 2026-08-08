const axios = require('axios');

const BASE_URL = 'https://api.tmdb.org/3';
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

function enrichMockMovie(movie) {
  if (!movie) return movie;
  
  const mockMetadata = {
    101: { release_date: "2014-11-07", origin_country: ["US"] }, // Interstellar
    102: { release_date: "2010-07-16", origin_country: ["US"] }, // Inception
    103: { release_date: "2008-07-18", origin_country: ["US"] }, // The Dark Knight
    104: { release_date: "2001-07-20", origin_country: ["JP"] }, // Spirited Away
    105: { release_date: "2019-05-30", origin_country: ["KR"] }, // Parasite
    106: { release_date: "2009-12-25", origin_country: ["IN"] }, // 3 Idiots
    107: { release_date: "2016-12-23", origin_country: ["IN"] }, // Dangal
    108: { release_date: "2001-06-15", origin_country: ["IN"] }, // Lagaan
    109: { release_date: "2015-11-20", origin_country: ["IN"] }, // Chello Divas
    110: { release_date: "2019-11-08", origin_country: ["IN"] }, // Hellaro
    115: { release_date: "2016-04-29", origin_country: ["IN"] }, // Sairat
    116: { release_date: "2016-01-06", origin_country: ["IN"] }, // Natsamrat
    117: { release_date: "2015-07-10", origin_country: ["IN"] }, // Baahubali
    118: { release_date: "2022-03-25", origin_country: ["IN"] }  // RRR
  };

  const meta = mockMetadata[movie.id] || { 
    release_date: "2020-01-01", 
    origin_country: [movie.original_language === "en" ? "US" : "IN"] 
  };
  
  return {
    ...movie,
    release_date: meta.release_date,
    origin_country: meta.origin_country
  };
}

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
      if (parts[3] === "videos") {
        return {
          results: [
            {
              site: "YouTube",
              type: "Trailer",
              official: true,
              key: "dQw4w9WgXcQ"
            }
          ]
        };
      }
      const movieId = parseInt(parts[2]);
      const mockMovie = MOCK_MOVIES.find(m => m.id === movieId) || MOCK_MOVIES[0];
      return {
        ...enrichMockMovie(mockMovie),
        credits: {
          cast: [
            { name: "Actor A", character: "Hero" },
            { name: "Actor B", character: "Sidekick" }
          ]
        }
      };
    }
  }

  let results = [...MOCK_MOVIES].map(enrichMockMovie);
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
    results = [...MOCK_MOVIES].slice(0, 5).map(enrichMockMovie);
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

async function resolveBestTitle(movie) {
  if (!movie) return '';
  
  const originalTitle = movie.original_title || movie.title;
  
  // If the original title is already in Latin script (allowing diacritics like ā, é), it's fine as is
  const latinRegex = /^[\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]+$/u;
  if (originalTitle && latinRegex.test(originalTitle)) {
    return originalTitle;
  }
  
  // Otherwise, try to find a Latin script alternative title from target regions (IN, US, GB)
  try {
    const altResponse = await fetchFromTMDB(`/movie/${movie.id}/alternative_titles`, {});
    if (altResponse && altResponse.titles) {
      const targetCountries = ['IN', 'US', 'GB'];
      const latinTitles = altResponse.titles.filter(t => 
        t.title && 
        latinRegex.test(t.title) && 
        targetCountries.includes(t.iso_3166_1.toUpperCase())
      );
      
      if (latinTitles.length > 0) {
        const score = (t) => {
          let s = 0;
          const type = (t.type || '').toLowerCase();
          if (type === '') s += 100;
          else if (!type.includes('working')) s += 50;

          if (t.iso_3166_1.toUpperCase() === 'IN') s += 10;
          else if (['US', 'GB'].includes(t.iso_3166_1.toUpperCase())) s += 5;

          return s;
        };

        latinTitles.sort((a, b) => score(b) - score(a));
        return latinTitles[0].title;
      }
    }
  } catch (err) {
    console.error(`Error resolving alternative title for movie ${movie.id}:`, err.message);
  }
  
  // Fallback to TMDB English title (which is always in Latin script)
  return movie.title || originalTitle;
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

  const response = await tmdbClient.get(endpoint, { params });
  let data = response.data;
  
  if (data && !endpoint.includes('alternative_titles')) {
    if (Array.isArray(data.results)) {
      data.results = await Promise.all(
        data.results.map(async (movie) => {
          if (movie) {
            movie.title = await resolveBestTitle(movie);
          }
          return movie;
        })
      );
    } else if (data.original_title) {
      data.title = await resolveBestTitle(data);
    }
  }
  
  setCache(cacheKey, data);
  return data;
}



async function getPopularMovies(page = 1) {
  return fetchFromTMDB('/movie/popular', { page });
}

async function searchMovies(query, page = 1) {
  return fetchFromTMDB('/search/movie', { query, page });
}

async function getMovieDetails(movieId) {
  return fetchFromTMDB(`/movie/${movieId}`, {
    append_to_response: 'credits,watch/providers',
  });
}

async function getMovieVideos(movieId) {
  try {
    const data = await fetchFromTMDB(`/movie/${movieId}/videos`, {
      include_video_language: 'en,hi,ta,te,mr,gu,ko,zh,ja,es,fr,de,it,null'
    });
    if (!data || !Array.isArray(data.results) || data.results.length === 0) {
      return { trailerKey: null };
    }

    // 1. Try finding official YouTube trailers first
    let selected = data.results.find(
      (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official === true
    );

    // 2. Try any YouTube trailer
    if (!selected) {
      selected = data.results.find(
        (v) => v.site === 'YouTube' && v.type === 'Trailer'
      );
    }

    // 3. Try any official YouTube teaser or clip
    if (!selected) {
      selected = data.results.find(
        (v) => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip') && v.official === true
      );
    }

    // 4. Try any YouTube teaser, clip, or video
    if (!selected) {
      selected = data.results.find(
        (v) => v.site === 'YouTube' && (v.type === 'Teaser' || v.type === 'Clip' || v.type === 'Featurette')
      );
    }

    // 5. Fallback to absolutely any YouTube video listed
    if (!selected) {
      selected = data.results.find((v) => v.site === 'YouTube');
    }

    return { trailerKey: selected ? selected.key : null };
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

async function getHindiMovies(page = 1, genres = []) {
  const genreIds = Array.isArray(genres) ? genres.filter(Boolean) : [];
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'hi',
    with_genres: genreIds.length ? genreIds.join(",") : undefined,
    sort_by: 'popularity.desc',
    'vote_count.gte': 5,
    include_adult: false,
  });
}

async function getGujaratiMovies(page = 1, genres = []) {
  const genreIds = Array.isArray(genres) ? genres.filter(Boolean) : [];
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'gu',
    with_genres: genreIds.length ? genreIds.join(",") : undefined,
    sort_by: 'popularity.desc',
    'vote_count.gte': 1,
    include_adult: false,
  });
}

async function getMarathiMovies(page = 1) {
  return fetchFromTMDB('/discover/movie', {
    page,
    with_original_language: 'mr',
    sort_by: 'popularity.desc',
    'vote_count.gte': 1,
    include_adult: false,
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

async function discoverMovies(params = {}) {
  return fetchFromTMDB('/discover/movie', params);
}

function mockFetchByListId(listId, page = 1) {
  let results = [];
  
  switch (listId) {
    case 'decade-1970s':
      results = [
        {
          id: 701,
          title: "The Godfather",
          overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family under patriach Vito Corleone and the rise of his son Michael.",
          genre_ids: [18, 80],
          original_language: "en",
          vote_average: 8.7,
          vote_count: 18000,
          poster_path: "/3bhkrj6PMMnJ0VFGB4EBGRBQCGS.jpg",
          release_date: "1972-03-14",
          origin_country: ["US"]
        },
        {
          id: 702,
          title: "Star Wars: A New Hope",
          overview: "Princess Leia is held hostage by the evil Imperial forces in their effort to take over the galactic Empire. Luke Skywalker and Han Solo work together to rescue her.",
          genre_ids: [12, 28, 878],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 19000,
          poster_path: "/6FfDc8HiVw0BB2kEN2rHYA75Y1y.jpg",
          release_date: "1977-05-25",
          origin_country: ["US"]
        },
        {
          id: 703,
          title: "Taxi Driver",
          overview: "A mentally unstable Vietnam War veteran works as a night-time taxi driver in New York City, where the perceived decadence and sleaze feeds his urge for violent action.",
          genre_ids: [18, 80, 53],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 11000,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "1976-02-08",
          origin_country: ["US"]
        },
        {
          id: 704,
          title: "Chinatown",
          overview: "A private detective hired to expose an adulterer finds himself caught in a web of deceit, corruption, and murder in 1930s Los Angeles.",
          genre_ids: [18, 80, 9648, 53],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 3500,
          poster_path: "/KyYJk8HiVw0BB2kEN2rHYA75Y2b.jpg",
          release_date: "1974-06-20",
          origin_country: ["US"]
        },
        {
          id: 705,
          title: "Apocalypse Now",
          overview: "During the Vietnam War, Captain Willard is sent on a dangerous mission into Cambodia to assassinate a renegade colonel who has set himself up as a god among a local tribe.",
          genre_ids: [18, 36, 10752],
          original_language: "en",
          vote_average: 8.3,
          vote_count: 7800,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "1979-08-15",
          origin_country: ["US"]
        },
        {
          id: 706,
          title: "Alien",
          overview: "After a space merchant vessel receives an unknown transmission as a distress call, one of the crew is attacked by a mysterious lifeform and its life cycle to devour the ship begins.",
          genre_ids: [27, 878],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 13000,
          poster_path: "/v84nU5N-DIs.jpg",
          release_date: "1979-05-25",
          origin_country: ["US"]
        },
        {
          id: 707,
          title: "Jaws",
          overview: "When a killer shark unleashes chaos on a beach community off Long Island, it's up to a local sheriff, a marine biologist, and an old seafarer to hunt the beast down.",
          genre_ids: [12, 53, 27],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 9500,
          poster_path: "/LEjhY15eCx0.jpg",
          release_date: "1975-06-20",
          origin_country: ["US"]
        }
      ];
      break;
    case 'decade-1980s':
      results = [
        {
          id: 801,
          title: "Back to the Future",
          overview: "Marty McFly, a 17-year-old high school student, is accidentally sent thirty years into the past in a time-traveling DeLorean invented by his close friend, Doc Brown.",
          genre_ids: [12, 35, 878],
          original_language: "en",
          vote_average: 8.3,
          vote_count: 18500,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "1985-07-03",
          origin_country: ["US"]
        },
        {
          id: 802,
          title: "The Shining",
          overview: "Jack Torrance accepts a caretaker job at the historic, isolated Overlook Hotel, which has a dark history. As winter sets in, supernatural forces affect his sanity.",
          genre_ids: [18, 27, 53],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 16000,
          poster_path: "/9j945nC162OH5n57c0w0xnr.jpg",
          release_date: "1980-05-23",
          origin_country: ["US"]
        },
        {
          id: 803,
          title: "Star Wars: The Empire Strikes Back",
          overview: "After the rebels are brutally overpowered by the Empire on the ice planet Hoth, Luke Skywalker begins Jedi training with Yoda, while Han Solo and Princess Leia are pursued by Darth Vader.",
          genre_ids: [12, 28, 878],
          original_language: "en",
          vote_average: 8.4,
          vote_count: 15800,
          poster_path: "/ByXuk9QqQkk.jpg",
          release_date: "1980-05-20",
          origin_country: ["US"]
        },
        {
          id: 804,
          title: "Raiders of the Lost Ark",
          overview: "Archaeologist and adventurer Indiana Jones is hired by the US government to find the Ark of the Covenant before Adolf Hitler's Nazi forces can obtain its awesome powers.",
          genre_ids: [12, 28],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 11200,
          poster_path: "/XdKzUbAiswE.jpg",
          release_date: "1981-06-12",
          origin_country: ["US"]
        },
        {
          id: 805,
          title: "Blade Runner",
          overview: "A blade runner must pursue and terminate four replicants who stole a ship in space and have returned to Earth to find their creator.",
          genre_ids: [878, 18, 53],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 12400,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "1982-06-25",
          origin_country: ["US"]
        },
        {
          id: 806,
          title: "E.T. the Extra-Terrestrial",
          overview: "An alien is stranded on Earth and befriended by a young boy named Elliott, who helps the creature return to his home planet while keeping him hidden from government scientists.",
          genre_ids: [12, 10751, 878],
          original_language: "en",
          vote_average: 7.5,
          vote_count: 10200,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "1982-06-11",
          origin_country: ["US"]
        },
        {
          id: 807,
          title: "Scarface",
          overview: "In Miami in 1980, a determined Cuban immigrant takes over a drug cartel and succumbs to greed, paranoia, and absolute power.",
          genre_ids: [28, 80, 18],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 10800,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "1983-12-09",
          origin_country: ["US"]
        }
      ];
      break;
    case 'decade-1990s':
      results = [
        {
          id: 901,
          title: "The Shawshank Redemption",
          overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison, making friends with Red.",
          genre_ids: [18, 80],
          original_language: "en",
          vote_average: 8.7,
          vote_count: 24000,
          poster_path: "/9cqN025LLyt7ES2b2q8BFg46ubV.jpg",
          release_date: "1994-09-23",
          origin_country: ["US"]
        },
        {
          id: 902,
          title: "Pulp Fiction",
          overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, non-linear comedic crime caper.",
          genre_ids: [53, 80],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 26000,
          poster_path: "/d5iIlvfjmXe9P4hTES3i4SJPFQQ.jpg",
          release_date: "1994-09-10",
          origin_country: ["US"]
        },
        {
          id: 903,
          title: "Schindler's List",
          overview: "In German-occupied Poland during World War II, industrialist Oskar Schindler gradually becomes concerned for his Jewish workforce after witnessing their persecution.",
          genre_ids: [18, 36, 10752],
          original_language: "en",
          vote_average: 8.6,
          vote_count: 14500,
          poster_path: "/u2902XU5V1U5a9aL9uH6w3oU3K.jpg",
          release_date: "1993-11-30",
          origin_country: ["US"]
        },
        {
          id: 904,
          title: "The Matrix",
          overview: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
          genre_ids: [28, 878],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 24000,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "1999-03-30",
          origin_country: ["US"]
        },
        {
          id: 905,
          title: "Fight Club",
          overview: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
          genre_ids: [18, 53],
          original_language: "en",
          vote_average: 8.4,
          vote_count: 27000,
          poster_path: "/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg",
          release_date: "1999-10-15",
          origin_country: ["US"]
        },
        {
          id: 906,
          title: "Forrest Gump",
          overview: "A man with a low IQ has accomplished great things in his life and been present during significant historical events—yet his true love Jenny eludes him.",
          genre_ids: [35, 18, 10749],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 25000,
          poster_path: "/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg",
          release_date: "1994-07-06",
          origin_country: ["US"]
        },
        {
          id: 907,
          title: "Jurassic Park",
          overview: "A pragmatic paleontologist visiting an almost-complete theme park on an island is tasked with protecting a couple of kids after a power failure releases cloned dinosaurs.",
          genre_ids: [12, 28, 878, 53],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 15000,
          poster_path: "/LEjhY15eCx0.jpg",
          release_date: "1993-06-11",
          origin_country: ["US"]
        }
      ];
      break;
    case 'decade-2000s':
      // Return a set of 2000s movies
      results = [
        {
          id: 129,
          title: 'Spirited Away',
          overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free herself and her family.',
          poster_path: '/39wmItE2ABW2fScGQVxS2uKCflE.jpg',
          vote_average: 8.5,
          vote_count: 16200,
          release_date: '2001-07-20',
          genre_ids: [16, 14, 10751],
          origin_country: ["JP"]
        },
        {
          id: 103,
          title: "The Dark Knight",
          overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          genre_ids: [28, 18, 53],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 30000,
          poster_path: "/qJ2tWwR7BjiGo5krSDnkgurXN7o.jpg",
          release_date: "2008-07-18",
          origin_country: ["US"]
        },
        {
          id: 108,
          title: "Lagaan: Once Upon a Time in India",
          overview: "In 1893 India, an arrogant British commander challenges the oppressed villagers of Champaner to a high-stakes game of cricket to avoid paying high taxes.",
          genre_ids: [18, 12, 10749],
          original_language: "hi",
          vote_average: 7.9,
          vote_count: 3800,
          poster_path: "/f345rD1g0V5a9aL9uH6w3oU3K.jpg",
          release_date: "2001-06-15",
          origin_country: ["IN"]
        },
        {
          id: 1801,
          title: "City of God",
          overview: "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
          genre_ids: [18, 80],
          original_language: "pt",
          vote_average: 8.4,
          vote_count: 6700,
          poster_path: "/gEU2QniE6E77NIvN27xtC1h2xsB.jpg",
          release_date: "2002-08-30",
          origin_country: ["BR"]
        },
        {
          id: 1001,
          title: "Gladiator",
          overview: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
          genre_ids: [28, 12, 18],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 17500,
          poster_path: "/iuFNMSJ4j5BMAv7y4uwwQAo95rw.jpg",
          release_date: "2000-05-01",
          origin_country: ["US"]
        },
        {
          id: 1002,
          title: "Eternal Sunshine of the Spotless Mind",
          overview: "When their relationship turns sour, a couple undergoes a medical procedure to have each other erased from their memories.",
          genre_ids: [878, 18, 10749],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 13500,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2004-03-19",
          origin_country: ["US"]
        }
      ];
      break;
    case 'decade-2010s':
      results = [
        {
          id: 101,
          title: "Interstellar",
          overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
          genre_ids: [878, 12, 18],
          original_language: "en",
          vote_average: 8.4,
          vote_count: 32000,
          poster_path: "/gEU2QniE6E77NIvN27xtC1h2xsB.jpg",
          release_date: "2014-11-07",
          origin_country: ["US"]
        },
        {
          id: 102,
          title: "Inception",
          overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          genre_ids: [878, 28, 53],
          original_language: "en",
          vote_average: 8.3,
          vote_count: 34000,
          poster_path: "/o0OkiMK70w44148Ur95Jok62VXt.jpg",
          release_date: "2010-07-16",
          origin_country: ["US"]
        },
        {
          id: 105,
          title: "Parasite",
          overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
          genre_ids: [53, 18, 35],
          original_language: "ko",
          vote_average: 8.5,
          vote_count: 17000,
          poster_path: "/7IiTT0khLoV2z2UaSAkx2ABn6ic.jpg",
          release_date: "2019-05-30",
          origin_country: ["KR"]
        },
        {
          id: 324857,
          title: 'Spider-Man: Into the Spider-Verse',
          overview: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
          poster_path: '/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg',
          vote_average: 8.4,
          vote_count: 15400,
          release_date: '2018-12-06',
          genre_ids: [16, 28, 12, 878],
          origin_country: ["US"]
        },
        {
          id: 335984,
          title: 'Blade Runner 2049',
          overview: 'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos.',
          poster_path: '/gA8W2vVJexhxZ83zNkjQ14L2C8p.jpg',
          vote_average: 8.0,
          vote_count: 13200,
          release_date: '2017-10-04',
          genre_ids: [878, 18, 9648],
          origin_country: ["US"]
        },
        {
          id: 372058,
          title: 'Your Name',
          overview: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
          poster_path: '/q719jflA4v8v2C9E3bWwZ.jpg',
          vote_average: 8.6,
          vote_count: 10400,
          release_date: '2016-08-26',
          genre_ids: [16, 18, 10749],
          origin_country: ["JP"]
        }
      ];
      break;
    case 'decade-2020s':
      results = [
        {
          id: 634649,
          title: 'Spider-Man: No Way Home',
          overview: 'With Spider-Man\'s identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.',
          poster_path: '/1g0dhYtq4irTY1GPXvft6k4YLZf.jpg',
          vote_average: 8.5,
          vote_count: 19430,
          release_date: '2021-12-15',
          genre_ids: [28, 12, 878],
          origin_country: ["US"]
        },
        {
          id: 693134,
          title: 'Dune: Part Two',
          overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe.',
          poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
          vote_average: 8.7,
          vote_count: 12500,
          release_date: '2024-02-27',
          genre_ids: [878, 12, 18],
          origin_country: ["US"]
        },
        {
          id: 1022789,
          title: 'Inside Out 2',
          overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
          poster_path: '/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg',
          vote_average: 8.0,
          vote_count: 4800,
          release_date: '2024-06-11',
          genre_ids: [16, 35, 10751],
          origin_country: ["US"]
        },
        {
          id: 872585,
          title: 'Oppenheimer',
          overview: 'The story of J. Robert Oppenheimer\'s role in the development of the atomic bomb during World War II and its dramatic political aftermath.',
          poster_path: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
          vote_average: 8.9,
          vote_count: 15300,
          release_date: '2023-07-19',
          genre_ids: [18, 36],
          origin_country: ["US"]
        },
        {
          id: 519182,
          title: 'Despicable Me 4',
          overview: 'Gru and Lucy and their girls welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad. Gru faces a new nemesis in Maxime Le Mal and his femme fatale girlfriend Valentina.',
          poster_path: '/wWba3TaojhK7vj9Lx2dMLyGvBxF.jpg',
          vote_average: 7.3,
          vote_count: 2100,
          release_date: '2024-06-20',
          genre_ids: [16, 10751, 35, 28],
          origin_country: ["US"]
        },
        {
          id: 2001,
          title: "Everything Everywhere All at Once",
          overview: "A middle-aged Chinese immigrant is swept up into an insane adventure in which she alone can save existence by exploring other universes and connecting with the lives she could have led.",
          genre_ids: [28, 12, 35, 878],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 6500,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2022-03-24",
          origin_country: ["US"]
        }
      ];
      break;
    case 'director-women':
      results = [
        {
          id: 1101,
          title: "Barbie",
          overview: "Barbie and Ken are having the time of their lives in the colorful and seemingly perfect world of Barbie Land.",
          genre_ids: [35, 12, 14],
          original_language: "en",
          vote_average: 7.2,
          vote_count: 8500,
          poster_path: "/iuFNMSJ4j5BMAv7y4uwwQAo95rw.jpg",
          release_date: "2023-07-19",
          origin_country: ["US"]
        },
        {
          id: 1102,
          title: "Portrait of a Lady on Fire",
          overview: "On an isolated island in Brittany at the end of the eighteenth century, a female painter is obliged to paint a wedding portrait of a young woman.",
          genre_ids: [18, 10749],
          original_language: "fr",
          vote_average: 8.3,
          vote_count: 3200,
          poster_path: "/3NhD5ptm57y5QZt128o8.jpg",
          release_date: "2019-09-18",
          origin_country: ["FR"]
        },
        {
          id: 1103,
          title: "Lady Bird",
          overview: "An artistically inclined seventeen-year-old girl comes of age in Sacramento, California under the guidance of her strong-willed mother.",
          genre_ids: [18, 35],
          original_language: "en",
          vote_average: 7.8,
          vote_count: 7500,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "2017-09-08",
          origin_country: ["US"]
        },
        {
          id: 1104,
          title: "Nomadland",
          overview: "A woman in her sixties embarks on a journey through the Western United States after losing everything in the Great Recession, living as a modern-day nomad.",
          genre_ids: [18],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 3200,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2020-12-26",
          origin_country: ["US"]
        },
        {
          id: 1105,
          title: "The Hurt Locker",
          overview: "During the Iraq War, a sergeant recently assigned to an army bomb squad puts his crew at risk by going about his duties in a seemingly reckless manner.",
          genre_ids: [18, 53, 28, 36],
          original_language: "en",
          vote_average: 7.3,
          vote_count: 4800,
          poster_path: "/ByXuk9QqQkk.jpg",
          release_date: "2008-09-04",
          origin_country: ["US"]
        },
        {
          id: 1106,
          title: "Lost in Translation",
          overview: "A lonely, aging movie star and a conflicted newlywed girl form an unlikely bond after meeting in a Tokyo hotel.",
          genre_ids: [18, 10749],
          original_language: "en",
          vote_average: 7.8,
          vote_count: 6700,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2003-08-29",
          origin_country: ["US"]
        }
      ];
      break;
    case 'director-black':
      results = [
        {
          id: 1201,
          title: "Get Out",
          overview: "Chris and his girlfriend Rose go upstate to visit her parents for the weekend, but the family's overly accommodating behavior conceals a sinister secret.",
          genre_ids: [9648, 53, 27],
          original_language: "en",
          vote_average: 7.6,
          vote_count: 16000,
          poster_path: "/jgo8uLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
          release_date: "2017-02-24",
          origin_country: ["US"]
        },
        {
          id: 1202,
          title: "Black Panther",
          overview: "King T'Challa returns home to the reclusive, technologically advanced African nation of Wakanda to serve as his country's new leader.",
          genre_ids: [28, 12, 878],
          original_language: "en",
          vote_average: 7.4,
          vote_count: 21000,
          poster_path: "/uxzzdoQBEYBv6id8su7m4yUtRNY.jpg",
          release_date: "2018-02-13",
          origin_country: ["US"]
        },
        {
          id: 1203,
          title: "Moonlight",
          overview: "A young African-American man struggles to find his place in the world while growing up in a rough neighborhood of Miami.",
          genre_ids: [18, 10749],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 6800,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2016-10-21",
          origin_country: ["US"]
        },
        {
          id: 1204,
          title: "Do the Right Thing",
          overview: "On the hottest day of the year on a street in Brooklyn, everyone's hate, prejudice, and bigotry escalates until it explodes in violence.",
          genre_ids: [18],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 1600,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "1989-06-14",
          origin_country: ["US"]
        },
        {
          id: 1205,
          title: "BlacKkKlansman",
          overview: "Ron Stallworth, an African-American police officer from Colorado, successfully manages to infiltrate the local Ku Klux Klan branch with the help of his partner Flip.",
          genre_ids: [18, 35, 80, 36],
          original_language: "en",
          vote_average: 7.7,
          vote_count: 7300,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "2018-07-30",
          origin_country: ["US"]
        },
        {
          id: 1206,
          title: "Us",
          overview: "A family's serene beach vacation turns to chaos when their clones begin to terrorize them.",
          genre_ids: [53, 27, 9648],
          original_language: "en",
          vote_average: 7.0,
          vote_count: 6100,
          poster_path: "/iuFNMSJ4j5BMAv7y4uwwQAo95rw.jpg",
          release_date: "2019-03-14",
          origin_country: ["US"]
        }
      ];
      break;
    case 'director-queer':
      results = [
        {
          id: 1301,
          title: "The Matrix",
          overview: "Set in the 22nd century, a computer hacker learns from mysterious rebels about the true nature of his reality and the machines that power it.",
          genre_ids: [28, 878],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 24000,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "1999-03-30",
          origin_country: ["US"]
        },
        {
          id: 1302,
          title: "Pain and Glory",
          overview: "A film director reflects on the choices he's made in life as past and present come crashing down around him in this beautiful Spanish film.",
          genre_ids: [18],
          original_language: "es",
          vote_average: 7.7,
          vote_count: 2800,
          poster_path: "/Ab8mtEgGj2J2S349v29.jpg",
          release_date: "2019-03-22",
          origin_country: ["ES"]
        },
        {
          id: 1102,
          title: "Portrait of a Lady on Fire",
          overview: "On an isolated island in Brittany at the end of the eighteenth century, a female painter is obliged to paint a wedding portrait of a young woman.",
          genre_ids: [18, 10749],
          original_language: "fr",
          vote_average: 8.3,
          vote_count: 3200,
          poster_path: "/3NhD5ptm57y5QZt128o8.jpg",
          release_date: "2019-09-18",
          origin_country: ["FR"]
        },
        {
          id: 1303,
          title: "Carol",
          overview: "In 1950s New York, a department store clerk dreams of a better life and falls in love with an older, married woman.",
          genre_ids: [18, 10749],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 3500,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2015-11-20",
          origin_country: ["US"]
        },
        {
          id: 1304,
          title: "Mommy",
          overview: "A widowed mother, overwhelmed by her violent son, receives help from a mysterious new neighbor.",
          genre_ids: [18],
          original_language: "fr",
          vote_average: 8.3,
          vote_count: 2900,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2014-09-19",
          origin_country: ["CA"]
        },
        {
          id: 1305,
          title: "Good Will Hunting",
          overview: "Will Hunting, a janitor at M.I.T., has a gift for mathematics, but needs help from a psychologist to find direction in his life.",
          genre_ids: [18],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 10500,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "1997-12-05",
          origin_country: ["US"]
        }
      ];
      break;
    case 'format-documentaries':
      results = [
        {
          id: 1401,
          title: "Free Solo",
          overview: "Alex Honnold attempts to conquer the first ever free solo climb of El Capitan's 3,000-foot vertical rock face without safety ropes.",
          genre_ids: [99],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 1500,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2018-09-28",
          origin_country: ["US"]
        },
        {
          id: 1402,
          title: "My Octopus Teacher",
          overview: "A filmmaker forges an unusual friendship with an octopus living in a South African kelp forest, learning about life and nature.",
          genre_ids: [99],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 1200,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2020-09-04",
          origin_country: ["ZA"]
        },
        {
          id: 1403,
          title: "13th",
          overview: "An in-depth look at the prison system in the United States and how it reveals the nation's history of racial inequality.",
          genre_ids: [99],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 900,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "2016-09-30",
          origin_country: ["US"]
        },
        {
          id: 1404,
          title: "March of the Penguins",
          overview: "In the Antarctic, every autumn brings the emperor penguins together as they journey to their traditional breeding grounds.",
          genre_ids: [99, 10751],
          original_language: "fr",
          vote_average: 7.4,
          vote_count: 850,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "2005-01-26",
          origin_country: ["FR"]
        },
        {
          id: 1405,
          title: "Senna",
          overview: "A documentary on Brazilian Formula One racing driver Ayrton Senna, who won the F1 world championship three times before his death.",
          genre_ids: [99, 36],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 1100,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2010-10-07",
          origin_country: ["GB"]
        },
        {
          id: 1406,
          title: "Apollo 11",
          overview: "A look at the Apollo 11 mission to land on the moon led by astronauts Neil Armstrong and Buzz Aldrin.",
          genre_ids: [99, 36],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 560,
          poster_path: "/iuFNMSJ4j5BMAv7y4uwwQAo95rw.jpg",
          release_date: "2019-03-01",
          origin_country: ["US"]
        }
      ];
      break;
    case 'format-animated':
      results = [
        {
          id: 129,
          title: 'Spirited Away',
          overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free herself and her family.',
          poster_path: '/39wmItE2ABW2fScGQVxS2uKCflE.jpg',
          vote_average: 8.5,
          vote_count: 16200,
          release_date: '2001-07-20',
          genre_ids: [16, 14, 10751],
          origin_country: ["JP"]
        },
        {
          id: 324857,
          title: 'Spider-Man: Into the Spider-Verse',
          overview: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
          poster_path: '/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg',
          vote_average: 8.4,
          vote_count: 15400,
          release_date: '2018-12-06',
          genre_ids: [16, 28, 12, 878],
          origin_country: ["US"]
        },
        {
          id: 1022789,
          title: 'Inside Out 2',
          overview: 'Teenager Riley\'s mind headquarters is undergoing a sudden demolition to make room for something entirely unexpected: new Emotions! Joy, Sadness, Anger, Fear and Disgust aren\'t sure how to feel when Anxiety shows up.',
          poster_path: '/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg',
          vote_average: 8.0,
          vote_count: 4800,
          release_date: '2024-06-11',
          genre_ids: [16, 35, 10751],
          origin_country: ["US"]
        },
        {
          id: 372058,
          title: 'Your Name',
          overview: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
          poster_path: '/q719jflA4v8v2C9E3bWwZ.jpg',
          vote_average: 8.6,
          vote_count: 10400,
          release_date: '2016-08-26',
          genre_ids: [16, 18, 10749],
          origin_country: ["JP"]
        },
        {
          id: 508947,
          title: 'Turning Red',
          overview: 'A 13-year-old girl dealing with teenage turmoil turns into a giant red panda whenever she gets too excited or stressed.',
          poster_path: '/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg',
          vote_average: 7.9,
          vote_count: 5400,
          release_date: '2022-03-10',
          genre_ids: [16, 35, 14],
          origin_country: ["US"]
        },
        {
          id: 519182,
          title: 'Despicable Me 4',
          overview: 'Gru and Lucy and their girls welcome a new member to the Gru family, Gru Jr., who is intent on tormenting his dad. Gru faces a new nemesis in Maxime Le Mal and his femme fatale girlfriend Valentina.',
          poster_path: '/wWba3TaojhK7vj9Lx2dMLyGvBxF.jpg',
          vote_average: 7.3,
          vote_count: 2100,
          release_date: '2024-06-20',
          genre_ids: [16, 10751, 35, 28],
          origin_country: ["US"]
        }
      ];
      break;
    case 'format-shorts':
      results = [
        {
          id: 1501,
          title: "La Jetée",
          overview: "A survivor of a post-apocalyptic third World War is chosen to travel back and forward in time to salvage the present.",
          genre_ids: [878, 10749],
          original_language: "fr",
          vote_average: 8.0,
          vote_count: 800,
          poster_path: "/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg",
          release_date: "1962-02-16",
          origin_country: ["FR"]
        },
        {
          id: 1502,
          title: "Bao",
          overview: "An aging Chinese-Canadian mother suffering from empty nest syndrome gets another chance at motherhood when one of her dumplings springs to life.",
          genre_ids: [16, 10751, 35],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 1200,
          poster_path: "/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg",
          release_date: "2018-06-15",
          origin_country: ["CA"]
        },
        {
          id: 1503,
          title: "Piper",
          overview: "A hungry sandpiper hatchling ventures from her nest for the first time to dig for food at the shore.",
          genre_ids: [16, 10751, 12],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 1500,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2016-06-16",
          origin_country: ["US"]
        },
        {
          id: 1504,
          title: "Hair Love",
          overview: "A father tries to do his daughter's hair for the first time, learning how to overcome his styling challenges.",
          genre_ids: [16, 10751],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 670,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2019-08-14",
          origin_country: ["US"]
        },
        {
          id: 1505,
          title: "Paperman",
          overview: "An urban office worker uses paper airplanes to capture the attention of a beautiful woman he saw on his commute.",
          genre_ids: [16, 10749, 35],
          original_language: "en",
          vote_average: 8.1,
          vote_count: 2400,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2012-11-02",
          origin_country: ["US"]
        },
        {
          id: 1506,
          title: "Feast",
          overview: "The love life of a young man is revealed through the eyes of his best friend, a hungry Boston Terrier named Winston.",
          genre_ids: [16, 10751, 35],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 1100,
          poster_path: "/ByXuk9QqQkk.jpg",
          release_date: "2014-11-07",
          origin_country: ["US"]
        }
      ];
      break;
    case 'format-miniseries':
      results = [
        {
          id: 1601,
          title: "Chernobyl",
          overview: "The dramatization of the true story of one of the worst man-made catastrophes in history, depicting the brave men and women who saved Europe.",
          genre_ids: [18],
          original_language: "en",
          vote_average: 8.6,
          vote_count: 5000,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2019-05-06",
          origin_country: ["US"]
        },
        {
          id: 1602,
          title: "Band of Brothers",
          overview: "The story of Easy Company, 506th Regiment of the 101st Airborne Division from US Army training to D-Day and the end of World War II.",
          genre_ids: [18, 36, 10752],
          original_language: "en",
          vote_average: 8.8,
          vote_count: 4200,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "2001-09-09",
          origin_country: ["US"]
        },
        {
          id: 1603,
          title: "The Queen's Gambit",
          overview: "Orphaned at the tender age of nine, prodigious introvert Beth Harmon discovers and masters the game of chess in 1960s USA.",
          genre_ids: [18],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 3600,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2020-10-23",
          origin_country: ["US"]
        },
        {
          id: 1604,
          title: "Watchmen",
          overview: "Set in an alternate history where masked vigilantes are treated as outlaws, Watchmen embraces the nostalgia of the original graphic novel.",
          genre_ids: [18, 878],
          original_language: "en",
          vote_average: 7.6,
          vote_count: 1500,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2019-10-20",
          origin_country: ["US"]
        },
        {
          id: 1605,
          title: "Fleabag",
          overview: "A dry-witted woman, known only as Fleabag, navigates life and love in London while trying to cope with a recent tragedy.",
          genre_ids: [35, 18],
          original_language: "en",
          vote_average: 8.3,
          vote_count: 1200,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "2016-07-21",
          origin_country: ["GB"]
        },
        {
          id: 1606,
          title: "Normal People",
          overview: "Marianne and Connell weave in and out of each other's romantic lives in a small Irish town and later at Trinity College.",
          genre_ids: [18, 10749],
          original_language: "en",
          vote_average: 8.2,
          vote_count: 850,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "2020-04-26",
          origin_country: ["IE"]
        }
      ];
      break;
    case 'subgenre-romcom':
      results = [
        {
          id: 1701,
          title: "La La Land",
          overview: "Mia, an aspiring actress, and Sebastian, a dedicated jazz musician, struggle to make ends meet in a city known for crushing hopes and making dreams come true.",
          genre_ids: [35, 18, 10749],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 15900,
          poster_path: "/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
          release_date: "2016-11-29",
          origin_country: ["US"]
        },
        {
          id: 1705,
          title: "Amélie",
          overview: "Amélie is an innocent and naive girl in Paris with her own sense of justice. She decides to help those around her and, along the way, discovers love.",
          genre_ids: [35, 10749, 14],
          original_language: "fr",
          vote_average: 8.0,
          vote_count: 10400,
          poster_path: "/39wmItE2ABW2fScGQVxS2uKCflE.jpg",
          release_date: "2001-04-25",
          origin_country: ["FR"]
        },
        {
          id: 1706,
          title: "500 Days of Summer",
          overview: "An offbeat romantic comedy about a woman who doesn't believe true love exists, and the young man who falls for her.",
          genre_ids: [35, 18, 10749],
          original_language: "en",
          vote_average: 7.3,
          vote_count: 9200,
          poster_path: "/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg",
          release_date: "2009-07-17",
          origin_country: ["US"]
        },
        {
          id: 1707,
          title: "Crazy Rich Asians",
          overview: "This contemporary romantic comedy, based on the global bestseller, follows native New Yorker Rachel Chu to Singapore to meet her boyfriend's family.",
          genre_ids: [35, 10749, 18],
          original_language: "en",
          vote_average: 7.1,
          vote_count: 3400,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2018-08-15",
          origin_country: ["US"]
        },
        {
          id: 1708,
          title: "About Time",
          overview: "At the age of 21, Tim discovers he can travel in time and change what happens and has happened in his own life. His decision to make his world a better place by getting a girlfriend turns out to be tricky.",
          genre_ids: [10749, 18, 35, 878],
          original_language: "en",
          vote_average: 7.9,
          vote_count: 6700,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2013-09-04",
          origin_country: ["GB"]
        },
        {
          id: 1709,
          title: "Notting Hill",
          overview: "The life of a simple bookshop owner changes when he meets the most famous film star in the world.",
          genre_ids: [10749, 35, 18],
          original_language: "en",
          vote_average: 7.1,
          vote_count: 5800,
          poster_path: "/fNlb2n2cl1xgEZh3CxwwHGw6t8j.jpg",
          release_date: "1999-05-21",
          origin_country: ["GB"]
        }
      ];
      break;
    case 'subgenre-samurai':
      results = [
        {
          id: 1702,
          title: "Seven Samurai",
          overview: "A samurai answers a village's request for protection after he falls on hard times, recruiting others to help him defend the village.",
          genre_ids: [28, 18],
          original_language: "ja",
          vote_average: 8.5,
          vote_count: 3200,
          poster_path: "/39wmItEWsg5sclJeqLijPv0GtqC.jpg",
          release_date: "1954-04-26",
          origin_country: ["JP"]
        },
        {
          id: 1710,
          title: "Yojimbo",
          overview: "A crafty ronin comes to a town divided by two criminal gangs and decides to play them against each other.",
          genre_ids: [28, 18, 53],
          original_language: "ja",
          vote_average: 8.2,
          vote_count: 1400,
          poster_path: "/Ab8mtEgGj2J2S349v29.jpg",
          release_date: "1961-04-25",
          origin_country: ["JP"]
        },
        {
          id: 1711,
          title: "Ran",
          overview: "An aging warlord abdicates power to his three sons, setting off a tragic power struggle in this epic adaptation of King Lear.",
          genre_ids: [28, 18, 36],
          original_language: "ja",
          vote_average: 8.4,
          vote_count: 1300,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "1985-06-01",
          origin_country: ["JP"]
        },
        {
          id: 1712,
          title: "Harakiri",
          overview: "An elder ronin arrives at a feudal lord's home requesting a place to commit suicide, but tells a tale that exposes the clan's hypocrisy.",
          genre_ids: [18, 36, 28],
          original_language: "ja",
          vote_average: 8.4,
          vote_count: 980,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "1962-09-15",
          origin_country: ["JP"]
        },
        {
          id: 1713,
          title: "Kill Bill: Vol. 1",
          overview: "An assassin is shot by her ruthless employer, Bill, and other members of their group. She wakes up from a coma four years later and seeks bloody revenge.",
          genre_ids: [28, 53],
          original_language: "en",
          vote_average: 8.0,
          vote_count: 16500,
          poster_path: "/iuFNMSJ4j5BMAv7y4uwwQAo95rw.jpg",
          release_date: "2003-10-10",
          origin_country: ["US"]
        },
        {
          id: 1714,
          title: "The Last Samurai",
          overview: "An American military advisor embraces the Samurai culture he was hired to destroy after being captured in battle.",
          genre_ids: [28, 18, 36, 12],
          original_language: "en",
          vote_average: 7.5,
          vote_count: 6200,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2003-12-05",
          origin_country: ["US"]
        }
      ];
      break;
    case 'subgenre-spy':
      results = [
        {
          id: 1703,
          title: "Skyfall",
          overview: "When James Bond's latest assignment goes gravely wrong, it leads to a turn of events that threatens MI6. Bond must track down and destroy the threat.",
          genre_ids: [28, 53, 12],
          original_language: "en",
          vote_average: 7.2,
          vote_count: 14000,
          poster_path: "/JfVOs4VSpmA.jpg",
          release_date: "2012-10-24",
          origin_country: ["GB"]
        },
        {
          id: 1715,
          title: "Casino Royale",
          overview: "In his first mission, James Bond must defeat a private banker to terrorists in a high-stakes game of poker at Casino Royale.",
          genre_ids: [28, 53, 12],
          original_language: "en",
          vote_average: 7.5,
          vote_count: 10400,
          poster_path: "/Way9Dexny3w.jpg",
          release_date: "2006-11-14",
          origin_country: ["GB"]
        },
        {
          id: 1716,
          title: "Mission: Impossible - Fallout",
          overview: "Ethan Hunt and his IMF team, along with some familiar allies, race against time after a mission goes wrong.",
          genre_ids: [28, 53, 12],
          original_language: "en",
          vote_average: 7.7,
          vote_count: 7500,
          poster_path: "/uYPbbksJxIg.jpg",
          release_date: "2018-07-25",
          origin_country: ["US"]
        },
        {
          id: 1717,
          title: "The Bourne Identity",
          overview: "Wounded and suffering from amnesia, a man is rescued at sea by fishermen. He attempts to reconstruct his life while dodging assassins.",
          genre_ids: [28, 53, 9648],
          original_language: "en",
          vote_average: 7.4,
          vote_count: 8500,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2002-06-14",
          origin_country: ["US"]
        },
        {
          id: 1718,
          title: "Kingsman: The Secret Service",
          overview: "A spy organization recruits an unrefined street kid into the agency's competitive training program just as a global threat emerges from a tech genius.",
          genre_ids: [28, 35, 12, 53],
          original_language: "en",
          vote_average: 7.6,
          vote_count: 15400,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2014-12-11",
          origin_country: ["GB"]
        },
        {
          id: 603,
          title: "The Matrix Resurrections",
          overview: "Return to a world of two realities: one, everyday life; the other, what lies behind it. Thomas Anderson must choose to follow the white rabbit once more.",
          genre_ids: [878, 28],
          original_language: "en",
          vote_average: 7.7,
          vote_count: 8900,
          poster_path: "/8c4a82b.jpg",
          release_date: "2021-12-22",
          origin_country: ["US"]
        }
      ];
      break;
    case 'subgenre-wuxia':
      results = [
        {
          id: 1704,
          title: "Crouching Tiger, Hidden Dragon",
          overview: "Two warriors in pursuit of a stolen sword and a notorious outlaw are led to a young nobleman's daughter, who has secretly mastered martial arts.",
          genre_ids: [12, 18, 28],
          original_language: "zh",
          vote_average: 7.4,
          vote_count: 3100,
          poster_path: "/5h2902XU5V1U5a9aL9uH6w3oU3K.jpg",
          release_date: "2000-10-01",
          origin_country: ["CN"]
        },
        {
          id: 1719,
          title: "Hero",
          overview: "A defense officer claims to have defeated three legendary assassins who sought to murder the King of Qin in this visual masterpiece.",
          genre_ids: [28, 12, 18],
          original_language: "zh",
          vote_average: 7.6,
          vote_count: 2400,
          poster_path: "/39wmItEWsg5sclJeqLijPv0GtqC.jpg",
          release_date: "2002-10-24",
          origin_country: ["CN"]
        },
        {
          id: 1720,
          title: "House of Flying Daggers",
          overview: "During the reign of the Tang dynasty in China, two police officers are ordered to capture the new leader of the Flying Daggers rebel group.",
          genre_ids: [28, 12, 18, 10749],
          original_language: "zh",
          vote_average: 7.3,
          vote_count: 1800,
          poster_path: "/Ab8mtEgGj2J2S349v29.jpg",
          release_date: "2004-05-19",
          origin_country: ["CN"]
        },
        {
          id: 1721,
          title: "Kung Fu Hustle",
          overview: "In Canton, China in the 1940s, a petty thief aspires to join the notorious Axe Gang, but gets entangled with kung fu masters in a tenement house.",
          genre_ids: [28, 35, 14],
          original_language: "zh",
          vote_average: 7.4,
          vote_count: 3600,
          poster_path: "/qsdjk9oKuZQSAbWvWvabWh2lT0E.jpg",
          release_date: "2004-12-23",
          origin_country: ["HK"]
        },
        {
          id: 1722,
          title: "Shadow",
          overview: "In a kingdom ruled by a wild and ambitious king, the military commander has a secret weapon: a shadow lookalike who can fool their enemies.",
          genre_ids: [28, 18, 36],
          original_language: "zh",
          vote_average: 7.3,
          vote_count: 650,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "2018-09-30",
          origin_country: ["CN"]
        },
        {
          id: 1723,
          title: "The Grandmaster",
          overview: "The story of martial arts master Ip Man, the man who trained Bruce Lee, depicting his life amidst war and rivalry.",
          genre_ids: [28, 18, 36, 10749],
          original_language: "zh",
          vote_average: 6.5,
          vote_count: 920,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2013-01-08",
          origin_country: ["HK"]
        }
      ];
      break;
    case 'region-indian':
      results = [
        {
          id: 106,
          title: "3 Idiots",
          overview: "Two friends are searching for their long lost companion. They revisit their college days and recall the memories of their friend who inspired them to think differently.",
          genre_ids: [35, 18],
          original_language: "hi",
          vote_average: 8.0,
          vote_count: 5000,
          poster_path: "/7E89tTa45nC162OH5n57c0w0xnr.jpg",
          release_date: "2009-12-25",
          origin_country: ["IN"]
        },
        {
          id: 107,
          title: "Dangal",
          overview: "Mahavir Singh Phogat, a former wrestler, decides to fulfill his dream of winning a gold medal for his country by training his daughters for the Commonwealth Games.",
          genre_ids: [18, 28],
          original_language: "hi",
          vote_average: 8.2,
          vote_count: 4500,
          poster_path: "/5h2902XU5V1U5a9aL9uH6w3oU3K.jpg",
          release_date: "2016-12-23",
          origin_country: ["IN"]
        },
        {
          id: 108,
          title: "Lagaan: Once Upon a Time in India",
          overview: "In 1893 India, an arrogant British commander challenges the oppressed villagers of Champaner to a high-stakes game of cricket to avoid paying high taxes.",
          genre_ids: [18, 12, 10749],
          original_language: "hi",
          vote_average: 7.9,
          vote_count: 3800,
          poster_path: "/f345rD1g0V5a9aL9uH6w3oU3K.jpg",
          release_date: "2001-06-15",
          origin_country: ["IN"]
        },
        {
          id: 109,
          title: "Chello Divas",
          overview: "A Gujarati comedy film revolving around the lives of 8 friends and their college life adventures, struggles, and romances.",
          genre_ids: [35, 18],
          original_language: "gu",
          vote_average: 7.8,
          vote_count: 1500,
          poster_path: null,
          release_date: "2015-11-20",
          origin_country: ["IN"]
        },
        {
          id: 110,
          title: "Hellaro",
          overview: "In a patriarchal village in Kutch, a group of women break societal barriers and express themselves through the rhythmic art form of Garba.",
          genre_ids: [18],
          original_language: "gu",
          vote_average: 8.3,
          vote_count: 800,
          poster_path: null,
          release_date: "2019-11-08",
          origin_country: ["IN"]
        },
        {
          id: 115,
          title: "Sairat",
          overview: "A heart-wrenching Marathi romance drama about a young boy and girl who fall in love across deep-seated caste divisions in rural India.",
          genre_ids: [18, 10749],
          original_language: "mr",
          vote_average: 8.1,
          vote_count: 2200,
          poster_path: null,
          release_date: "2016-04-29",
          origin_country: ["IN"]
        },
        {
          id: 116,
          title: "Natsamrat",
          overview: "An esteemed theater actor goes through tragic family dynamics and struggles in his post-retirement life with his wife.",
          genre_ids: [18],
          original_language: "mr",
          vote_average: 8.4,
          vote_count: 1200,
          poster_path: null,
          release_date: "2016-01-06",
          origin_country: ["IN"]
        },
        {
          id: 117,
          title: "Baahubali: The Beginning",
          overview: "A young, spirited man raises a giant kingdom out of the ashes and uncovers his legendary heritage in ancient India.",
          genre_ids: [28, 12, 14],
          original_language: "te",
          vote_average: 8.0,
          vote_count: 4000,
          poster_path: "/9R3k6E0V2z2UaSAkx2ABn6ic.jpg",
          release_date: "2015-07-10",
          origin_country: ["IN"]
        },
        {
          id: 118,
          title: "RRR",
          overview: "A fictional tale of two legendary revolutionaries and their journey away from home before they started fighting for their country in the 1920s.",
          genre_ids: [28, 12, 18],
          original_language: "te",
          vote_average: 7.9,
          vote_count: 3500,
          poster_path: "/u2902XU5V1U5a9aL9uH6w3oU3K.jpg",
          release_date: "2022-03-25",
          origin_country: ["IN"]
        }
      ];
      break;
    case 'region-japanese':
      results = [
        {
          id: 129,
          title: 'Spirited Away',
          overview: 'A young girl, Chihiro, becomes trapped in a strange world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free herself and her family.',
          poster_path: '/39wmItE2ABW2fScGQVxS2uKCflE.jpg',
          vote_average: 8.5,
          vote_count: 16200,
          release_date: '2001-07-20',
          genre_ids: [16, 14, 10751],
          origin_country: ["JP"]
        },
        {
          id: 372058,
          title: 'Your Name',
          overview: 'Two strangers find themselves linked in a bizarre way. When a connection forms, will distance be the only thing to keep them apart?',
          poster_path: '/q719jflA4v8v2C9E3bWwZ.jpg',
          vote_average: 8.6,
          vote_count: 10400,
          release_date: '2016-08-26',
          genre_ids: [16, 18, 10749],
          origin_country: ["JP"]
        },
        {
          id: 1702,
          title: "Seven Samurai",
          overview: "A samurai answers a village's request for protection after he falls on hard times, recruiting others to help him defend the village.",
          genre_ids: [28, 18],
          original_language: "ja",
          vote_average: 8.5,
          vote_count: 3200,
          poster_path: "/39wmItEWsg5sclJeqLijPv0GtqC.jpg",
          release_date: "1954-04-26",
          origin_country: ["JP"]
        },
        {
          id: 1710,
          title: "Yojimbo",
          overview: "A crafty ronin comes to a town divided by two criminal gangs and decides to play them against each other.",
          genre_ids: [28, 18, 53],
          original_language: "ja",
          vote_average: 8.2,
          vote_count: 1400,
          poster_path: "/Ab8mtEgGj2J2S349v29.jpg",
          release_date: "1961-04-25",
          origin_country: ["JP"]
        },
        {
          id: 1711,
          title: "Ran",
          overview: "An aging warlord abdicates power to his three sons, setting off a tragic power struggle in this epic adaptation of King Lear.",
          genre_ids: [28, 18, 36],
          original_language: "ja",
          vote_average: 8.4,
          vote_count: 1300,
          poster_path: "/gCcx85zbxz4.jpg",
          release_date: "1985-06-01",
          origin_country: ["JP"]
        },
        {
          id: 1712,
          title: "Harakiri",
          overview: "An elder ronin arrives at a feudal lord's home requesting a place to commit suicide, but tells a tale that exposes the clan's hypocrisy.",
          genre_ids: [18, 36, 28],
          original_language: "ja",
          vote_average: 8.4,
          vote_count: 980,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "1962-09-15",
          origin_country: ["JP"]
        }
      ];
      break;
    case 'region-latin':
      results = [
        {
          id: 1801,
          title: "City of God",
          overview: "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
          genre_ids: [18, 80],
          original_language: "pt",
          vote_average: 8.4,
          vote_count: 6700,
          poster_path: "/gEU2QniE6E77NIvN27xtC1h2xsB.jpg",
          release_date: "2002-08-30",
          origin_country: ["BR"]
        },
        {
          id: 1802,
          title: "Roma",
          overview: "A year in the life of a middle-class family's housekeeper in Mexico City in the early 1970s.",
          genre_ids: [18],
          original_language: "es",
          vote_average: 7.7,
          vote_count: 3600,
          poster_path: "/vpnVM9B6NMmQp9KAZBYYACC5HNx.jpg",
          release_date: "2018-12-14",
          origin_country: ["MX"]
        },
        {
          id: 1803,
          title: "Amores Perros",
          overview: "A horrific car accident connects three stories, each involving characters dealing with loss, love, and regret, all in Mexico City.",
          genre_ids: [18, 53],
          original_language: "es",
          vote_average: 7.8,
          vote_count: 2200,
          poster_path: "/dXbUgo23m2xQW2B77.jpg",
          release_date: "2000-06-16",
          origin_country: ["MX"]
        },
        {
          id: 1804,
          title: "Pan's Labyrinth",
          overview: "In the Falangist Spain of 1944, the young stepdaughter of a sadistic army officer escapes into a eerie but captivating fantasy world.",
          genre_ids: [14, 18, 10752],
          original_language: "es",
          vote_average: 8.3,
          vote_count: 9800,
          poster_path: "/ekstpH616aLOCk50FU372o55Z1y.jpg",
          release_date: "2006-10-11",
          origin_country: ["ES"]
        },
        {
          id: 1805,
          title: "The Secret in Their Eyes",
          overview: "A retired legal counselor writes a novel hoping to find closure for one of his past unresolved homicide cases and for his unreciprocated love.",
          genre_ids: [18, 9648, 53],
          original_language: "es",
          vote_average: 8.0,
          vote_count: 3100,
          poster_path: "/stKGOm8UyhuLPR92pNJxawScmXx.jpg",
          release_date: "2009-08-13",
          origin_country: ["AR"]
        },
        {
          id: 1806,
          title: "Wild Tales",
          overview: "Six short stories that explore the extremities of human behavior involving people in distress.",
          genre_ids: [18, 35, 53],
          original_language: "es",
          vote_average: 7.8,
          vote_count: 2500,
          poster_path: "/ByXuk9QqQkk.jpg",
          release_date: "2014-08-21",
          origin_country: ["AR"]
        }
      ];
      break;
    case 'popularity-mostfans':
      results = [
        {
          id: 102,
          title: "Inception",
          overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
          genre_ids: [878, 28, 53],
          original_language: "en",
          vote_average: 8.3,
          vote_count: 34000,
          poster_path: "/o0OkiMK70w44148Ur95Jok62VXt.jpg",
          release_date: "2010-07-16",
          origin_country: ["US"]
        },
        {
          id: 101,
          title: "Interstellar",
          overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
          genre_ids: [878, 12, 18],
          original_language: "en",
          vote_average: 8.4,
          vote_count: 32000,
          poster_path: "/gEU2QniE6E77NIvN27xtC1h2xsB.jpg",
          release_date: "2014-11-07",
          origin_country: ["US"]
        },
        {
          id: 103,
          title: "The Dark Knight",
          overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
          genre_ids: [28, 18, 53],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 30000,
          poster_path: "/qJ2tWwR7BjiGo5krSDnkgurXN7o.jpg",
          release_date: "2008-07-18",
          origin_country: ["US"]
        },
        {
          id: 902,
          title: "Pulp Fiction",
          overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, non-linear comedic crime caper.",
          genre_ids: [53, 80],
          original_language: "en",
          vote_average: 8.5,
          vote_count: 26000,
          poster_path: "/d5iIlvfjmXe9P4hTES3i4SJPFQQ.jpg",
          release_date: "1994-09-10",
          origin_country: ["US"]
        },
        {
          id: 324857,
          title: 'Spider-Man: Into the Spider-Verse',
          overview: 'Teen Miles Morales becomes the Spider-Man of his universe and must join with five spider-powered individuals from other dimensions to stop a threat for all realities.',
          poster_path: '/iiZZdoQBEYBv6id8su7m4yUtRNY.jpg',
          vote_average: 8.4,
          vote_count: 15400,
          release_date: '2018-12-06',
          genre_ids: [16, 28, 12, 878],
          origin_country: ["US"]
        },
        {
          id: 105,
          title: "Parasite",
          overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
          genre_ids: [53, 18, 35],
          original_language: "ko",
          vote_average: 8.5,
          vote_count: 17000,
          poster_path: "/7IiTT0khLoV2z2UaSAkx2ABn6ic.jpg",
          release_date: "2019-05-30",
          origin_country: ["KR"]
        }
      ];
      break;
    default:
      break;
  }

  return {
    page,
    results: results,
    total_pages: 1,
    total_results: results.length
  };
}

async function getMoviesByListId(listId, page = 1) {
  if (!TOKEN) {
    return mockFetchByListId(listId, page);
  }

  let endpoint = '/discover/movie';
  let params = {
    page,
    include_adult: false,
  };

  switch (listId) {
    case 'decade-1970s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '1970-01-01';
      params['primary_release_date.lte'] = '1979-12-31';
      params['vote_count.gte'] = 100;
      break;
    case 'decade-1980s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '1980-01-01';
      params['primary_release_date.lte'] = '1989-12-31';
      params['vote_count.gte'] = 200;
      break;
    case 'decade-1990s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '1990-01-01';
      params['primary_release_date.lte'] = '1999-12-31';
      params['vote_count.gte'] = 200;
      break;
    case 'decade-2000s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '2000-01-01';
      params['primary_release_date.lte'] = '2009-12-31';
      params['vote_count.gte'] = 300;
      break;
    case 'decade-2010s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '2010-01-01';
      params['primary_release_date.lte'] = '2019-12-31';
      params['vote_count.gte'] = 300;
      break;
    case 'decade-2020s':
      params.sort_by = 'vote_average.desc';
      params['primary_release_date.gte'] = '2020-01-01';
      params['primary_release_date.lte'] = '2029-12-31';
      params['vote_count.gte'] = 100;
      break;

    case 'director-women':
      params.with_crew = '95368|96390|14392|1718|8887|23419|1364230|1121545';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 20;
      break;
    case 'director-black':
      params.with_crew = '1215399|5281|1198422|1198270|117769|1092790';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 20;
      break;
    case 'director-queer':
      params.with_crew = '24|96390|57077|4927|9339|9340|1007';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 20;
      break;

    case 'format-documentaries':
      params.with_genres = '99';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 100;
      break;
    case 'format-animated':
      params.with_genres = '16';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 200;
      break;
    case 'format-shorts':
      params['with_runtime.lte'] = 40;
      params.sort_by = 'popularity.desc';
      params['vote_count.gte'] = 5;
      break;
    case 'format-miniseries':
      endpoint = '/discover/tv';
      params.with_keywords = '10332';
      params.sort_by = 'popularity.desc';
      break;

    case 'subgenre-romcom':
      params.with_genres = '10749,35';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 100;
      break;
    case 'subgenre-samurai':
      params.with_keywords = '10391';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 10;
      break;
    case 'subgenre-spy':
      params.with_keywords = '470';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 50;
      break;
    case 'subgenre-wuxia':
      params.with_keywords = '10738';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 5;
      break;

    case 'region-indian':
      params.with_origin_country = 'IN';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 20;
      break;
    case 'region-japanese':
      params.with_origin_country = 'JP';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 50;
      break;
    case 'region-latin':
      params.with_origin_country = 'MX|AR|BR|CO|CL|PE';
      params.sort_by = 'vote_average.desc';
      params['vote_count.gte'] = 10;
      break;

    case 'popularity-mostfans':
      params.sort_by = 'vote_count.desc';
      params['vote_count.gte'] = 1000;
      break;

    default:
      break;
  }

  const data = await fetchFromTMDB(endpoint, params);

  if (data && Array.isArray(data.results)) {
    data.results = data.results.map(item => {
      if (item && !item.title && item.name) {
        return {
          ...item,
          title: item.name,
          release_date: item.first_air_date || item.release_date,
        };
      }
      return item;
    });
  }

  return data;
}

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails,
  getMovieVideos,
  getRecentMovies,
  getKoreanMovies,
  getChineseMovies,
  getHindiMovies,
  getGujaratiMovies,
  getMarathiMovies,
  getSciFiMovies,
  getAnimationMovies,
  getGenres,
  getTrendingMovies,
  getMoviesByLanguage,
  discoverMovies,
  getMoviesByListId,
};
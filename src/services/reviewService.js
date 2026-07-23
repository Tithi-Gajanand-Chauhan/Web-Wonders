// Mock database service simulating a backend API with LocalStorage
const STORAGE_PREFIX = "cine_circle_";
const DELAY_MS = 300; // Simulated network delay

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Sample seed data to ensure the platform looks rich and functional on first load
const SEED_MOVIES = [
  {
    id: "m-1",
    title: "Dune: Part Two",
    type: "movie",
    year: "2024",
    poster: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80",
    genre: "Sci-Fi, Adventure",
    duration: "2h 46m",
    director: "Denis Villeneuve",
    overview: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    ottPlatforms: ["Netflix", "Max"]
  },
  {
    id: "m-2",
    title: "Interstellar",
    type: "movie",
    year: "2014",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80",
    genre: "Sci-Fi, Drama",
    duration: "2h 49m",
    director: "Christopher Nolan",
    overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    ottPlatforms: ["Prime Video", "Paramount+"]
  },
  {
    id: "m-3",
    title: "Spider-Man: Across the Spider-Verse",
    type: "movie",
    year: "2023",
    poster: "https://images.unsplash.com/photo-1635805737707-575885ab0820?w=500&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&auto=format&fit=crop&q=80",
    genre: "Animation, Action, Sci-Fi",
    duration: "2h 20m",
    director: "Joaquim Dos Santos",
    overview: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    ottPlatforms: ["Netflix", "Disney+"]
  },
  {
    id: "s-1",
    title: "Stranger Things",
    type: "show",
    year: "2016",
    poster: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    backdrop: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80",
    genre: "Sci-Fi, Drama, Mystery",
    duration: "4 Seasons",
    director: "The Duffer Brothers",
    overview: "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces and one strange little girl.",
    ottPlatforms: ["Netflix"]
  }
];

const SEED_REVIEWS = {
  "m-1": [
    {
      id: "r-101",
      user: "CinemaEnthusiast",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80",
      rating: 10,
      content: "An absolute visual and auditory masterpiece! Denis Villeneuve has managed to adapt the unadaptable. The acting, sound design, and pacing are perfect.",
      date: "2026-07-15",
      likes: 42,
      isSpoiler: false,
      likedBy: []
    },
    {
      id: "r-102",
      user: "SciFiFanatic",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      rating: 8,
      content: "Insanely ambitious. The scale of the battles is breathtaking. However, they cut a few character-building scenes from the book that I wish were kept.",
      date: "2026-07-18",
      likes: 15,
      isSpoiler: true,
      likedBy: []
    }
  ],
  "m-2": [
    {
      id: "r-201",
      user: "NolanStan",
      avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80",
      rating: 9,
      content: "Hans Zimmer's score paired with Christopher Nolan's vision makes this movie a spectacular journey. The emotional core between Cooper and Murphy is what makes it work.",
      date: "2026-06-20",
      likes: 128,
      isSpoiler: false,
      likedBy: []
    }
  ]
};

const SEED_WATCHLIST = [
  {
    id: "m-2",
    title: "Interstellar",
    type: "movie",
    year: "2014",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    status: "completed",
    progress: "100%",
    userRating: 9,
    addedAt: "2026-07-01"
  },
  {
    id: "s-1",
    title: "Stranger Things",
    type: "show",
    year: "2016",
    poster: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80",
    status: "watching",
    progress: "Season 2, Episode 4",
    userRating: null,
    addedAt: "2026-07-10"
  }
];

const SEED_FAVORITES = [
  {
    id: "m-2",
    title: "Interstellar",
    type: "movie",
    year: "2014",
    poster: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=500&auto=format&fit=crop&q=80",
    userNote: "My absolute favorite Sci-Fi movie of all time. The wormhole graphics are scientifically accurate and stunning.",
    addedAt: "2026-07-02"
  }
];

// Helper to initialize local storage
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_PREFIX + "movies")) {
    localStorage.setItem(STORAGE_PREFIX + "movies", JSON.stringify(SEED_MOVIES));
  }
  if (!localStorage.getItem(STORAGE_PREFIX + "reviews")) {
    localStorage.setItem(STORAGE_PREFIX + "reviews", JSON.stringify(SEED_REVIEWS));
  }
  if (!localStorage.getItem(STORAGE_PREFIX + "watchlist")) {
    localStorage.setItem(STORAGE_PREFIX + "watchlist", JSON.stringify(SEED_WATCHLIST));
  }
  if (!localStorage.getItem(STORAGE_PREFIX + "favorites")) {
    localStorage.setItem(STORAGE_PREFIX + "favorites", JSON.stringify(SEED_FAVORITES));
  }
};

// Immediately execute initialization
initializeStorage();

// Storage Getter/Setters
const getData = (key) => JSON.parse(localStorage.getItem(STORAGE_PREFIX + key));
const setData = (key, data) => localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));

export const reviewService = {
  // --- Movies & Content API ---
  async getMovies() {
    await sleep(DELAY_MS);
    return getData("movies");
  },

  async getMovieById(id) {
    await sleep(DELAY_MS);
    const movies = getData("movies");
    return movies.find(m => m.id === id) || null;
  },

  // --- Ratings & Reviews API ---
  async getReviews(mediaId) {
    await sleep(DELAY_MS);
    const reviews = getData("reviews");
    return reviews[mediaId] || [];
  },

  async addReview(mediaId, review) {
    await sleep(DELAY_MS);
    const reviews = getData("reviews");
    if (!reviews[mediaId]) {
      reviews[mediaId] = [];
    }

    const newReview = {
      id: "r-" + Date.now(),
      user: review.user || "AnonymousUser",
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${review.user || 'anonymous'}`,
      rating: parseInt(review.rating),
      content: review.content,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      isSpoiler: !!review.isSpoiler,
      likedBy: []
    };

    reviews[mediaId].unshift(newReview);
    setData("reviews", reviews);

    // If rated, also update this in watchlist if it exists there
    const watchlist = getData("watchlist");
    const itemIdx = watchlist.findIndex(w => w.id === mediaId);
    if (itemIdx !== -1) {
      watchlist[itemIdx].userRating = parseInt(review.rating);
      setData("watchlist", watchlist);
    }

    return newReview;
  },

  async likeReview(mediaId, reviewId, userId = "currentUser") {
    await sleep(100);
    const reviews = getData("reviews");
    const mediaReviews = reviews[mediaId] || [];
    const review = mediaReviews.find(r => r.id === reviewId);

    if (review) {
      if (!review.likedBy) review.likedBy = [];
      
      const userIndex = review.likedBy.indexOf(userId);
      if (userIndex === -1) {
        // Like
        review.likedBy.push(userId);
        review.likes += 1;
      } else {
        // Unlike
        review.likedBy.splice(userIndex, 1);
        review.likes -= 1;
      }
      setData("reviews", reviews);
      return review;
    }
    throw new Error("Review not found");
  },

  // --- Watchlist API ---
  async getWatchlist() {
    await sleep(DELAY_MS);
    return getData("watchlist");
  },

  async addToWatchlist(mediaItem, initialStatus = "wishlist") {
    await sleep(DELAY_MS);
    const watchlist = getData("watchlist");
    const exists = watchlist.some(w => w.id === mediaItem.id);
    
    if (exists) {
      return watchlist;
    }

    const newWatchItem = {
      id: mediaItem.id,
      title: mediaItem.title,
      type: mediaItem.type,
      year: mediaItem.year,
      poster: mediaItem.poster,
      ottPlatforms: mediaItem.ottPlatforms || [],
      status: initialStatus, // 'wishlist' (Want to Watch), 'watching', 'completed'
      progress: initialStatus === "watching" ? "Starting..." : (initialStatus === "completed" ? "100%" : "Not started"),
      userRating: null,
      addedAt: new Date().toISOString().split('T')[0]
    };

    watchlist.push(newWatchItem);
    setData("watchlist", watchlist);
    return watchlist;
  },

  async updateWatchlistStatus(mediaId, status, progressVal) {
    await sleep(150);
    const watchlist = getData("watchlist");
    const item = watchlist.find(w => w.id === mediaId);
    if (item) {
      item.status = status;
      if (progressVal !== undefined) {
        item.progress = progressVal;
      } else if (status === "completed") {
        item.progress = "100%";
      } else if (status === "wishlist") {
        item.progress = "Not started";
      }
      setData("watchlist", watchlist);
    }
    return watchlist;
  },

  async removeFromWatchlist(mediaId) {
    await sleep(DELAY_MS);
    let watchlist = getData("watchlist");
    watchlist = watchlist.filter(w => w.id !== mediaId);
    setData("watchlist", watchlist);
    return watchlist;
  },

  // --- Favorites API ---
  async getFavorites() {
    await sleep(DELAY_MS);
    return getData("favorites");
  },

  async toggleFavorite(mediaItem, userNote = "") {
    await sleep(DELAY_MS);
    const favorites = getData("favorites");
    const index = favorites.findIndex(f => f.id === mediaItem.id);

    if (index !== -1) {
      // Remove from favorites
      favorites.splice(index, 1);
    } else {
      // Add to favorites
      favorites.push({
        id: mediaItem.id,
        title: mediaItem.title,
        type: mediaItem.type,
        year: mediaItem.year,
        poster: mediaItem.poster,
        userNote: userNote || "Added to favorites",
        addedAt: new Date().toISOString().split('T')[0]
      });
    }
    setData("favorites", favorites);
    return favorites;
  }
};

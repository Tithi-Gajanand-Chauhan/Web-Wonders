const express = require('express');
const router = express.Router();
const tmdbService = require('../service/tmdbService');

// GET /api/movies/popular
router.get('/popular', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getPopularMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching popular movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch popular movies' });
  }
});

// GET /api/movies/search?query=...
router.get('/search', async (req, res) => {
  try {
    const { query, page } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const data = await tmdbService.searchMovies(query, parseInt(page) || 1);
    res.json(data);
  } catch (err) {
    console.error('Error searching movies:', err.message);
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// GET /api/movies/recent
router.get('/recent', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getRecentMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching recent movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch recent movies' });
  }
});

// GET /api/movies/korean
router.get('/korean', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getKoreanMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Korean movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Korean movies' });
  }
});

// GET /api/movies/chinese
router.get('/chinese', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getChineseMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Chinese movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Chinese movies' });
  }
});

// GET /api/movies/indian
router.get('/indian', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getIndianMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Indian movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Indian movies' });
  }
});


// GET /api/movies/scifi
router.get('/scifi', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getSciFiMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Sci-Fi movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Sci-Fi movies' });
  }
});

// GET /api/movies/animation
router.get('/animation', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getAnimationMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching animation movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch animation movies' });
  }
});

// GET /api/movies/genres
router.get('/genres', async (req, res) => {
  try {
    const data = await tmdbService.getGenres();
    res.json(data);
  } catch (err) {
    console.error('Error fetching genres:', err.message);
    res.status(500).json({ error: 'Failed to fetch genres' });
  }
});

// GET /api/movies/hollywood
router.get('/hollywood', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getHollywoodMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Hollywood movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Hollywood movies' });
  }
});

// GET /api/movies/japanese
router.get('/japanese', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getJapaneseMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Japanese movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Japanese movies' });
  }
});

// GET /api/movies/spanish
router.get('/spanish', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getSpanishMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Spanish movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Spanish movies' });
  }
});

// GET /api/movies/horror
router.get('/horror', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getHorrorMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Horror movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Horror movies' });
  }
});

// GET /api/movies/thriller
router.get('/thriller', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getThrillerMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Thriller movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Thriller movies' });
  }
});

// GET /api/movies/romance
router.get('/romance', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getRomanceMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Romance movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Romance movies' });
  }
});

// GET /api/movies/action
router.get('/action', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getActionMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Action movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Action movies' });
  }
});

// GET /api/movies/awards
router.get('/awards', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getAwardMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Award movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Award movies' });
  }
});

// GET /api/movies/trending?window=day|week
router.get('/trending', async (req, res) => {
  try {
    const timeWindow = req.query.window === 'week' ? 'week' : 'day';
    const page = parseInt(req.query.page) || 1;

    const data = await tmdbService.getTrendingMovies(timeWindow, page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching trending movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// GET /api/movies/:id/videos
router.get('/:id/videos', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbService.getMovieVideos(id);
    res.json(data);
  } catch (err) {
    console.error(
      `Error fetching videos for movie ${req.params.id}:`,
      err.message
    );
    res
      .status(500)
      .json({ trailerKey: null, error: 'Failed to fetch movie videos' });
  }
});

// GET /api/movies/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await tmdbService.getMovieDetails(id);
    res.json(data);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    console.error('Error fetching movie details:', err.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

module.exports = router;
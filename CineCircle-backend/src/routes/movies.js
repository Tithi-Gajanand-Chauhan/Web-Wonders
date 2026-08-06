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
    console.error("FULL ERROR:", err);
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

// GET /api/movies/hindi
router.get('/hindi', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getHindiMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Hindi movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Hindi movies' });
  }
});


// GET /api/movies/gujarati
router.get('/gujarati', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getGujaratiMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Gujarati movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Gujarati movies' });
  }
});


// GET /api/movies/marathi
router.get('/marathi', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const data = await tmdbService.getMarathiMovies(page);
    res.json(data);
  } catch (err) {
    console.error('Error fetching Marathi movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch Marathi movies' });
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

// GET /api/movies/telugu
router.get('/telugu', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;

    const data = await tmdbService.getMoviesByLanguage(
      page,
      "te"


    );

    res.json(data);

  } catch (err) {
    console.error('Error fetching Telugu movies:', err.message);
    res.status(500).json({
      error: 'Failed to fetch Telugu movies'
    });
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
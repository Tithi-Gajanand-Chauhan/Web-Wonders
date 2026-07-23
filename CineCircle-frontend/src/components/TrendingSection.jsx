import { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { getTrendingMovies } from '../services/api';

function TrendingSection() {
  const [timeWindow, setTimeWindow] = useState('day');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        const data = await getTrendingMovies(timeWindow);
        setMovies(data.results || []);
      } catch (err) {
        console.error('Failed to fetch trending movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, [timeWindow]);

  return (
    <section className="movie-row trending-section">
      <div className="trending-header">
        <h2 className="row-title">Trending</h2>
        <div className="trending-toggle">
          <button
            className={timeWindow === 'day' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setTimeWindow('day')}
          >
            Today
          </button>
          <button
            className={timeWindow === 'week' ? 'toggle-btn active' : 'toggle-btn'}
            onClick={() => setTimeWindow('week')}
          >
            This Week
          </button>
        </div>
      </div>

      {loading ? (
        <div className="status-message">Loading trending movies...</div>
      ) : (
        <div className="row-scroll">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}

export default TrendingSection;
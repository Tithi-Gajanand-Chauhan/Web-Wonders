import { useState, useEffect, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';
import { getPopularMovies, getGenres } from '../services/api';

function Browse() {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [movieData, genreData] = await Promise.all([
          getPopularMovies(),
          getGenres(),
        ]);
        setMovies(movieData.results || []);
        setGenres(genreData.genres || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load browse data:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
      if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;
      return true;
    });
  }, [movies, genreFilter, yearFilter, ratingFilter]);

  if (loading) return <div className="status-message">Loading movies...</div>;
  if (error) return <div className="status-message error">{error}</div>;

  return (
    <div className="search-page">
      <h1 className="search-heading">Browse Movies</h1>
      <FilterBar
        genres={genres}
        genreFilter={genreFilter}
        setGenreFilter={setGenreFilter}
        yearFilter={yearFilter}
        setYearFilter={setYearFilter}
        ratingFilter={ratingFilter}
        setRatingFilter={setRatingFilter}
      />
      {filteredMovies.length === 0 ? (
        <div className="status-message">No movies match your filters.</div>
      ) : (
        <div className="search-grid">
          {filteredMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
}

export default Browse;
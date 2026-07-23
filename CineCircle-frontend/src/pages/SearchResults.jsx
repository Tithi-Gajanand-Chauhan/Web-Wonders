import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies, getGenres } from '../services/api';

function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    async function fetchGenres() {
      try {
        const data = await getGenres();
        setGenres(data.genres || []);
      } catch (err) {
        console.error('Failed to fetch genres:', err);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      try {
        setLoading(true);
        const data = await searchMovies(query);
        setMovies(data.results || []);
        setError(null);
      } catch (err) {
        console.error('Search failed:', err);
        setError('Failed to search movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) {
        return false;
      }
      if (yearFilter) {
        const year = movie.release_date?.split('-')[0];
        if (year !== yearFilter) return false;
      }
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) {
        return false;
      }
      return true;
    });
  }, [movies, genreFilter, yearFilter, ratingFilter]);

  if (!query) {
    return <div className="status-message">Type something to search.</div>;
  }

  if (loading) {
    return <div className="status-message">Searching...</div>;
  }

  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  return (
    <div className="search-page">
      <h1 className="search-heading">Results for "{query}"</h1>

      <div className="filters-bar">
        <select value={genreFilter} onChange={(e) => setGenreFilter(e.target.value)}>
          <option value="">All Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
          <option value="">All Years</option>
          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
          <option value="">Any Rating</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
          <option value="5">5+</option>
        </select>
      </div>

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

export default SearchResults;
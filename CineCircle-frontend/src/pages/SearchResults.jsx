import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import FilterBar from '../components/FilterBar';
import { searchMovies, getGenres } from '../services/api';

function SearchResults({ onPlayTrailer, onToggleWatchlist, isInWatchlist, safeSearch = true }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [query]);

  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Safe Search filter
      if (safeSearch) {
        if (movie.adult === true) return false;
        if (movie.age_rating === '18+' || movie.age_rating === 'NC-17') return false;
      }
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
      if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;
      return true;
    });
  }, [movies, safeSearch, genreFilter, yearFilter, ratingFilter]);

  if (!query) {
    return <div className="status-message">Type something in the search bar to find movies.</div>;
  }

  if (loading) {
    return <div className="status-message">Searching for "{query}"...</div>;
  }

  return (
    <div className="home-content-container" style={{ paddingTop: '30px' }}>
      <h1 className="row-title" style={{ fontSize: '1.8rem' }}>
        Results for "{query}" ({filteredMovies.length})
      </h1>

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
        <div className="status-message">No movies found for "{query}".</div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {filteredMovies.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isSaved={isInWatchlist ? isInWatchlist(movie.id) : false}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchResults;
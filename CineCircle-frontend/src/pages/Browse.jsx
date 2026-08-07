import { useState, useEffect, useMemo } from 'react';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';
import { getPopularMovies, getGenres } from '../services/api';

function Browse({ onPlayTrailer, onToggleWatchlist, isInWatchlist, safeSearch = true }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } catch (err) {
        console.error('Failed to load browse data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

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

  if (loading) return <div className="status-message">Loading movie library...</div>;

  return (
    <div className="home-content-container" style={{ paddingTop: '30px' }}>
      <h1 className="row-title" style={{ fontSize: '1.8rem' }}>Browse Complete Catalog</h1>
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
        <div className="status-message">No movies match your selected filters.</div>
      ) : (
        <div className="search-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
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

export default Browse;
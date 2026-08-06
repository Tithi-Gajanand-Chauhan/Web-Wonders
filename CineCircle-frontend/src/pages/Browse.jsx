import { useState, useEffect, useMemo } from 'react';
import MovieCard from '../components/MovieCard';
import { getPopularMovies } from '../services/api';

function Browse({
  onPlayTrailer,
  onToggleWatchlist,
  isInWatchlist,
  genreFilter,
  yearFilter,
  ratingFilter,
  industryFilter,
  categoryFilter,
}) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const movieData = await getPopularMovies();
        setMovies(movieData.results || []);
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
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
      if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;
      
      // Industry/Origin filter
      if (industryFilter) {
        const lang = movie.original_language;
        const originCountries = movie.origin_country || [];
        
        switch (industryFilter) {
          case 'hollywood':
            if (lang !== 'en') return false;
            if (originCountries.length > 0 && !originCountries.includes('US') && !originCountries.includes('GB')) return false;
            break;
          case 'bollywood':
            if (lang !== 'hi') return false;
            break;
          case 'tollywood':
            if (lang !== 'te') return false;
            break;
          case 'kollywood':
            if (lang !== 'ta') return false;
            break;
          case 'malayalam':
            if (lang !== 'ml') return false;
            break;
          case 'kannada':
            if (lang !== 'kn') return false;
            break;
          case 'bengali':
            if (lang !== 'bn') return false;
            break;
          default:
            break;
        }
      }

      // Category/Type filter
      if (categoryFilter) {
        if (categoryFilter === 'movies') {
          // Keep all movies
        } else if (categoryFilter === 'tv') {
          // TV Shows are not loaded yet, return empty
          return false;
        } else if (categoryFilter === 'animation') {
          if (!movie.genre_ids?.includes(16) && !movie.moods?.includes('Cartoons & Animation')) return false;
        }
      }

      return true;
    });
  }, [movies, genreFilter, yearFilter, ratingFilter, industryFilter, categoryFilter]);

  if (loading) return <div className="status-message">Loading movie library...</div>;

  return (
    <div className="home-content-container" style={{ paddingTop: '30px' }}>
      <h1 className="row-title" style={{ fontSize: '1.8rem' }}>Browse Complete Catalog</h1>
      
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
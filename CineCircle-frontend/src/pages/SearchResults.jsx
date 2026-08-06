import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import { searchMovies } from '../services/api';

function SearchResults({
  onPlayTrailer,
  onToggleWatchlist,
  isInWatchlist,
  genreFilter,
  yearFilter,
  ratingFilter,
  industryFilter,
  categoryFilter,
}) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

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
          return false;
        } else if (categoryFilter === 'animation') {
          if (!movie.genre_ids?.includes(16) && !movie.moods?.includes('Cartoons & Animation')) return false;
        }
      }

      return true;
    });
  }, [movies, genreFilter, yearFilter, ratingFilter, industryFilter, categoryFilter]);

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
import { useState, useEffect } from 'react';
import FilterBar from '../components/FilterBar';
import MovieCard from '../components/MovieCard';
import { 
  getPopularMovies, 
  getRecentMovies, 
  getSciFiMovies, 
  getAnimationMovies, 
  getGenres,
  discoverMovies
} from '../services/api';

function Browse({ onPlayTrailer, onToggleWatchlist, isInWatchlist, safeSearch = true }) {
  const [defaultMovies, setDefaultMovies] = useState([]);
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtering, setFiltering] = useState(false);

  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // 1. Initial Load of Rich Default Catalog and Genres
  useEffect(() => {
    async function fetchInitialData() {
      try {
        setLoading(true);
        const [pop1, pop2, pop3, recent, scifi, anim, genreData] = await Promise.all([
          getPopularMovies(1),
          getPopularMovies(2),
          getPopularMovies(3),
          getRecentMovies(1),
          getSciFiMovies(1),
          getAnimationMovies(1),
          getGenres(),
        ]);

        const allMovies = [
          ...(pop1?.results || []),
          ...(pop2?.results || []),
          ...(pop3?.results || []),
          ...(recent?.results || []),
          ...(scifi?.results || []),
          ...(anim?.results || [])
        ];

        // Deduplicate movies by ID
        const uniqueMoviesMap = {};
        allMovies.forEach(m => {
          if (m && m.id) {
            uniqueMoviesMap[m.id] = m;
          }
        });
        const uniqueMovies = Object.values(uniqueMoviesMap);

        setDefaultMovies(uniqueMovies);
        setMovies(uniqueMovies);
        setGenres(genreData.genres || []);
      } catch (err) {
        console.error('Failed to load initial catalog:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialData();
  }, []);

  // 2. Fetch from Backend Discovery API when filters change
  useEffect(() => {
    async function filterCatalog() {
      // If no filters are active, revert to default catalog
      if (!genreFilter && !yearFilter && !ratingFilter) {
        setMovies(defaultMovies);
        return;
      }

      try {
        setFiltering(true);
        const data = await discoverMovies(genreFilter, yearFilter, ratingFilter);
        setMovies(data.results || []);
      } catch (err) {
        console.error('Failed to discover filtered movies:', err);
      } finally {
        setFiltering(false);
      }
    }

    if (defaultMovies.length > 0 || genreFilter || yearFilter || ratingFilter) {
      filterCatalog();
    }
  }, [genreFilter, yearFilter, ratingFilter, defaultMovies]);

  // Keep client-side Safe Search filter for the active list
  const filteredMovies = movies.filter((movie) => {
    if (safeSearch) {
      if (movie.adult === true) return false;
      if (movie.age_rating === '18+' || movie.age_rating === 'NC-17') return false;
    }
    return true;
  });

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

      {filtering ? (
        <div className="status-message">Filtering movies...</div>
      ) : filteredMovies.length === 0 ? (
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
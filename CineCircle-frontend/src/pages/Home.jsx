import { useState, useEffect, useMemo } from 'react';
import MovieRow from '../components/MovieRow';
import FilterBar from '../components/FilterBar';
import TrendingSection from '../components/TrendingSection';

import {
  getPopularMovies,
  getRecentMovies,
  getKoreanMovies,
  getChineseMovies,
  getGenres,
} from '../services/api';

function Home() {
  const [rows, setRows] = useState({
    popular: [],
    recent: [],
    korean: [],
    chinese: [],
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [popular, recent, korean, chinese, genreData] = await Promise.all([
          getPopularMovies(),
          getRecentMovies(),
          getKoreanMovies(),
          getChineseMovies(),
          getGenres(),
        ]);

        setRows({
          popular: popular.results || [],
          recent: recent.results || [],
          korean: korean.results || [],
          chinese: chinese.results || [],
        });
        setGenres(genreData.genres || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
        setError('Failed to load movies. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const applyFilters = (movies) => {
    return movies.filter((movie) => {
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
      if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;
      return true;
    });
  };

  const filteredRows = useMemo(
    () => ({
      popular: applyFilters(rows.popular),
      recent: applyFilters(rows.recent),
      korean: applyFilters(rows.korean),
      chinese: applyFilters(rows.chinese),
    }),
    [rows, genreFilter, yearFilter, ratingFilter]
  );

  if (loading) {
    return <div className="status-message">Loading movies...</div>;
  }

  if (error) {
    return <div className="status-message error">{error}</div>;
  }

  return (
    <div className="home-page">
      <h1 className="app-title">CineCircle</h1>

      <div className="home-filters">
        <FilterBar
          genres={genres}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
        />
      </div>

      <TrendingSection />
      <MovieRow title="Popular Movies" movies={filteredRows.popular} />
      <MovieRow title="Recently Released" movies={filteredRows.recent} />
      <MovieRow title="Korean Movies" movies={filteredRows.korean} />
      <MovieRow title="Chinese Movies" movies={filteredRows.chinese} />
    </div>
  );
}

export default Home;
import { useState, useEffect, useMemo } from 'react';
import HeroSpotlight from '../components/HeroSpotlight';
import FilterBar from '../components/FilterBar';
import TrendingSection from '../components/TrendingSection';
import MovieRow from '../components/MovieRow';

import {
  getPopularMovies,
  getRecentMovies,
  getSciFiMovies,
  getAnimationMovies,
  getKoreanMovies,
  getChineseMovies,
  getGenres,
} from '../services/api';

function Home({ onPlayTrailer, onToggleWatchlist, isInWatchlist, onOpenWatchParty, safeSearch = true }) {
  const [rows, setRows] = useState({
    popular: [],
    recent: [],
    scifi: [],
    animation: [],
    korean: [],
    chinese: [],
  });
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);

  const [genreFilter, setGenreFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [popular, recent, scifi, animation, korean, chinese, genreData] = await Promise.all([
          getPopularMovies(),
          getRecentMovies(),
          getSciFiMovies(),
          getAnimationMovies(),
          getKoreanMovies(),
          getChineseMovies(),
          getGenres(),
        ]);

        setRows({
          popular: popular.results || [],
          recent: recent.results || [],
          scifi: scifi.results || [],
          animation: animation.results || [],
          korean: korean.results || [],
          chinese: chinese.results || [],
        });
        setGenres(genreData.genres || []);
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const applyFilters = (movies) => {
    return movies.filter((movie) => {
      // Safe Search filter
      if (safeSearch) {
        if (movie.adult === true) return false;
        if (movie.age_rating === '18+' || movie.age_rating === 'NC-17') return false;
      }
      // Genre filter
      if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
      // Year filter
      if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
      // Rating filter
      if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;

      return true;
    });
  };

  const filteredRows = useMemo(
    () => ({
      popular: applyFilters(rows.popular),
      recent: applyFilters(rows.recent),
      scifi: applyFilters(rows.scifi),
      animation: applyFilters(rows.animation),
      korean: applyFilters(rows.korean),
      chinese: applyFilters(rows.chinese),
    }),
    [rows, safeSearch, genreFilter, yearFilter, ratingFilter]
  );

  return (
    <main className="home-page-layout">
      {/* Hero Spotlight Featured Banner */}
      {!loading && filteredRows.popular.length > 0 && (
        <HeroSpotlight
          movies={filteredRows.popular}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />
      )}

      <div className="home-content-container">
        {/* Consolidated Dropdown Filters */}
        <FilterBar
          genres={genres}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          yearFilter={yearFilter}
          setYearFilter={setYearFilter}
          ratingFilter={ratingFilter}
          setRatingFilter={setRatingFilter}
        />

        {/* Dynamic Trending Tabs: Today Trending, Weekly Trending, Monthly Trending, New Releases */}
        <TrendingSection
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />

        {/* Categorized Movie Rows */}
        {loading ? (
          <div className="status-message">Loading titles...</div>
        ) : (
          <>
            <MovieRow
              title="New Releases & Recent Hits"
              movies={filteredRows.recent}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            <MovieRow
              title="Top Rated Masterpieces"
              movies={filteredRows.popular}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            <MovieRow
              title="Sci-Fi Universe"
              movies={filteredRows.scifi}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            <MovieRow
              title="Cartoons & Animated Hits"
              movies={filteredRows.animation}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            <MovieRow
              title="Korean Masterpieces & Cinema"
              movies={filteredRows.korean}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />

            <MovieRow
              title="Chinese Cinema & Blockbusters"
              movies={filteredRows.chinese}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
          </>
        )}
      </div>
    </main>
  );
}

export default Home;
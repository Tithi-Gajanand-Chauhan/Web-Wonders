import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MovieCard from '../components/MovieCard';
import {
  getPopularMovies,
  getRecentMovies,
  getSciFiMovies,
  getAnimationMovies,
  getKoreanMovies,
  getChineseMovies,
  getIndianMovies,
  getHollywoodMovies,
  getJapaneseMovies,
  getSpanishMovies,
  getHorrorMovies,
  getThrillerMovies,
  getRomanceMovies,
  getActionMovies,
  getAwardMovies,
  getGujaratiMovies,
  getMarathiMovies,
} from '../services/api';

/** Maps section key → { title, fetcher } */
const SECTION_CONFIG = {
  popular:   { title: '🔥 Trending & Popular',               fetcher: getPopularMovies },
  recent:    { title: '🎬 New Releases & Recent Hits',        fetcher: getRecentMovies },
  awards:    { title: '🏅 Award Winners & All-Time Greats',   fetcher: getAwardMovies },
  hollywood: { title: '🎭 Hollywood Blockbusters',            fetcher: getHollywoodMovies },
  action:    { title: '💥 Action & Adventure',                fetcher: getActionMovies },
  scifi:     { title: '🔬 Sci-Fi Universe',                   fetcher: getSciFiMovies },
  horror:    { title: '😱 Horror & Suspense',                 fetcher: getHorrorMovies },
  thriller:  { title: '🔍 Thriller & Mystery',                fetcher: getThrillerMovies },
  romance:   { title: '💕 Romance & Drama',                   fetcher: getRomanceMovies },
  korean:    { title: '🎌 Korean Masterpieces & Cinema',      fetcher: getKoreanMovies },
  chinese:   { title: '🏮 Chinese Cinema & Blockbusters',     fetcher: getChineseMovies },
  japanese:  { title: '🌸 Japanese & Anime Films',            fetcher: getJapaneseMovies },
  indian:    { title: '🎊 Indian Cinema & Blockbusters',      fetcher: getIndianMovies },
  gujarati:  { title: '🏮 Gujarati Cinema & Hits',            fetcher: getGujaratiMovies },
  marathi:   { title: '🎭 Marathi Cinema & Hits',             fetcher: getMarathiMovies },
  spanish:   { title: '🌮 Spanish & Latino Cinema',           fetcher: getSpanishMovies },
  animation: { title: '🎨 Cartoons & Animated Hits',          fetcher: getAnimationMovies },
  filtered:  { title: '🔎 Filtered Results',                  fetcher: null },
};

const MAX_PAGES = 10; // TMDB caps useful pages at ~500 but we'll limit to 10

function ExploreAll({
  onPlayTrailer,
  onToggleWatchlist,
  isInWatchlist,
  safeSearch = true,
  genreFilter,
  yearFilter,
  ratingFilter,
  industryFilter,
  categoryFilter,
}) {
  const { section } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const config = SECTION_CONFIG[section];
  const isFilteredMode = section === 'filtered';

  // For filtered mode, we'll fetch from ALL section fetchers
  const FILTERED_FETCHERS = useMemo(() => {
    return Object.entries(SECTION_CONFIG)
      .filter(([key, cfg]) => key !== 'filtered' && cfg.fetcher)
      .map(([key, cfg]) => ({ key, fetcher: cfg.fetcher }));
  }, []);

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'rating' | 'year' | 'title'

  /** Client-side filter (same logic as Home.jsx) */
  const applyFilters = useCallback(
    (movieList) => {
      if (!isFilteredMode) return movieList;

      return movieList.filter((movie) => {
        // Safe Search
        if (safeSearch) {
          if (movie.adult === true) return false;
          if (movie.age_rating === '18+' || movie.age_rating === 'NC-17') return false;
        }
        // Genre
        if (genreFilter && !movie.genre_ids?.includes(Number(genreFilter))) return false;
        // Year
        if (yearFilter && movie.release_date?.split('-')[0] !== yearFilter) return false;
        // Rating
        if (ratingFilter && movie.vote_average < Number(ratingFilter)) return false;

        // Industry / Origin
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

        // Category / Type
        if (categoryFilter) {
          if (categoryFilter === 'tv') return false;
          if (categoryFilter === 'animation') {
            if (!movie.genre_ids?.includes(16)) return false;
          }
        }

        return true;
      });
    },
    [safeSearch, genreFilter, yearFilter, ratingFilter, industryFilter, categoryFilter, isFilteredMode]
  );

  // Fetch page 1 (or all-section filtered data)
  useEffect(() => {
    if (!config) return;

    let cancelled = false;

    async function fetchInitial() {
      setLoading(true);
      setMovies([]);
      setCurrentPage(1);

      try {
        if (isFilteredMode) {
          // Fetch page 1 from ALL sections and merge, then filter
          const results = await Promise.allSettled(
            FILTERED_FETCHERS.map(({ fetcher }) => fetcher(1))
          );

          if (cancelled) return;

          const allMovies = [];
          const seen = new Set();

          for (const r of results) {
            if (r.status === 'fulfilled') {
              for (const m of (r.value?.results ?? [])) {
                if (!seen.has(m.id)) {
                  seen.add(m.id);
                  allMovies.push(m);
                }
              }
            }
          }

          setMovies(allMovies);
          setTotalPages(MAX_PAGES);
        } else {
          // Single section: fetch page 1
          const data = await config.fetcher(1);
          if (cancelled) return;
          setMovies(data?.results ?? []);
          setTotalPages(Math.min(data?.total_pages ?? 1, MAX_PAGES));
        }
      } catch (err) {
        console.error('[ExploreAll] Initial fetch error:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchInitial();
    return () => { cancelled = true; };
  }, [section, config, isFilteredMode, FILTERED_FETCHERS]);

  // Load more
  const loadMore = useCallback(async () => {
    if (loadingMore || currentPage >= totalPages) return;

    setLoadingMore(true);
    const nextPage = currentPage + 1;

    try {
      if (isFilteredMode) {
        // Load next page from ALL sections
        const results = await Promise.allSettled(
          FILTERED_FETCHERS.map(({ fetcher }) => fetcher(nextPage))
        );

        const newMovies = [];
        const existingIds = new Set(movies.map((m) => m.id));

        for (const r of results) {
          if (r.status === 'fulfilled') {
            for (const m of (r.value?.results ?? [])) {
              if (!existingIds.has(m.id)) {
                existingIds.add(m.id);
                newMovies.push(m);
              }
            }
          }
        }

        setMovies((prev) => [...prev, ...newMovies]);
      } else {
        const data = await config.fetcher(nextPage);
        const existingIds = new Set(movies.map((m) => m.id));
        const newMovies = (data?.results ?? []).filter((m) => !existingIds.has(m.id));
        setMovies((prev) => [...prev, ...newMovies]);
      }

      setCurrentPage(nextPage);
    } catch (err) {
      console.error('[ExploreAll] Load more error:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, currentPage, totalPages, isFilteredMode, config, movies, FILTERED_FETCHERS]);

  // Apply client-side filter (for filtered mode) and sorting
  const displayMovies = useMemo(() => {
    let list = isFilteredMode ? applyFilters(movies) : [...movies];

    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
        break;
      case 'year':
        list.sort((a, b) => {
          const ya = a.release_date ? parseInt(a.release_date.split('-')[0]) : 0;
          const yb = b.release_date ? parseInt(b.release_date.split('-')[0]) : 0;
          return yb - ya;
        });
        break;
      case 'title':
        list.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
        break;
      default:
        break;
    }

    return list;
  }, [movies, sortBy, isFilteredMode, applyFilters]);

  // Build active filter description
  const filterDescription = useMemo(() => {
    if (!isFilteredMode) return null;
    const parts = [];
    if (genreFilter) parts.push(`Genre`);
    if (industryFilter) parts.push(`Country`);
    if (yearFilter) parts.push(`Year: ${yearFilter}`);
    if (ratingFilter) parts.push(`Rating: ${ratingFilter}+`);
    if (categoryFilter) parts.push(`Category`);
    return parts.length > 0 ? parts.join(' • ') : 'All Filters';
  }, [isFilteredMode, genreFilter, industryFilter, yearFilter, ratingFilter, categoryFilter]);

  if (!config) {
    return (
      <div className="explore-all-page">
        <div className="status-message">
          Unknown section. <button className="explore-back-btn" onClick={() => navigate('/home')}>← Back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-all-page">
      {/* Header */}
      <div className="explore-all-header">
        <div className="explore-header-left">
          <button className="explore-back-btn" onClick={() => navigate('/home')} aria-label="Back to home">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>Back</span>
          </button>
          <div className="explore-title-group">
            <h1 className="explore-all-title">{isFilteredMode ? `${config.title}` : config.title}</h1>
            {isFilteredMode && filterDescription && (
              <p className="explore-filter-desc">Active filters: {filterDescription}</p>
            )}
            <p className="explore-movie-count">{displayMovies.length} title{displayMovies.length !== 1 ? 's' : ''} found</p>
          </div>
        </div>

        <div className="explore-header-right">
          <div className="explore-sort-group">
            <label className="explore-sort-label">Sort by</label>
            <select
              className="explore-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Popularity</option>
              <option value="rating">Rating</option>
              <option value="year">Release Year</option>
              <option value="title">Title A–Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="explore-loading">
          <div className="explore-spinner" />
          <p>Loading movies...</p>
        </div>
      ) : displayMovies.length === 0 ? (
        <div className="status-message">
          No titles found. Try adjusting your filters or go back to browse.
        </div>
      ) : (
        <>
          <div className="explore-all-grid">
            {displayMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onPlayTrailer={onPlayTrailer}
                onToggleWatchlist={onToggleWatchlist}
                isSaved={isInWatchlist ? isInWatchlist(movie.id) : false}
              />
            ))}
          </div>

          {/* Load More */}
          {currentPage < totalPages && (
            <div className="explore-load-more-wrapper">
              <button
                className="explore-load-more-btn"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <span className="explore-btn-spinner" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More Movies
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </>
                )}
              </button>
              <p className="explore-page-info">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ExploreAll;

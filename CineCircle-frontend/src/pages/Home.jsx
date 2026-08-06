import { useState, useEffect, useMemo, useCallback } from 'react';
import HeroSpotlight from '../components/HeroSpotlight';
import TrendingSection from '../components/TrendingSection';
import MovieRow from '../components/MovieRow';

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
} from '../services/api';

// SECTION ORDER: defines display priority for deduplication.
// A movie appearing in multiple TMDB responses will only show in the
// FIRST section listed here; all later sections will have it stripped.
const SECTION_KEYS = [
  'popular',
  'recent',
  'awards',
  'hollywood',
  'action',
  'scifi',
  'horror',
  'thriller',
  'romance',
  'korean',
  'chinese',
  'japanese',
  'indian',
  'spanish',
  'animation',
];

const SECTION_FETCHERS = {
  popular:   () => getPopularMovies(),
  recent:    () => getRecentMovies(),
  scifi:     () => getSciFiMovies(),
  animation: () => getAnimationMovies(),
  korean:    () => getKoreanMovies(),
  chinese:   () => getChineseMovies(),
  indian:    () => getIndianMovies(),
  hollywood: () => getHollywoodMovies(),
  japanese:  () => getJapaneseMovies(),
  spanish:   () => getSpanishMovies(),
  horror:    () => getHorrorMovies(),
  thriller:  () => getThrillerMovies(),
  romance:   () => getRomanceMovies(),
  action:    () => getActionMovies(),
  awards:    () => getAwardMovies(),
};

const SECTION_TITLES = {
  popular:   '🔥 Trending & Popular',
  recent:    '🎬 New Releases & Recent Hits',
  awards:    '🏅 Award Winners & All-Time Greats',
  hollywood: '🎭 Hollywood Blockbusters',
  action:    '💥 Action & Adventure',
  scifi:     '🔬 Sci-Fi Universe',
  horror:    '😱 Horror & Suspense',
  thriller:  '🔍 Thriller & Mystery',
  romance:   '💕 Romance & Drama',
  korean:    '🎌 Korean Masterpieces & Cinema',
  chinese:   '🏮 Chinese Cinema & Blockbusters',
  japanese:  '🌸 Japanese & Anime Films',
  indian:    '🎊 Indian Cinema & Blockbusters',
  spanish:   '🌮 Spanish & Latino Cinema',
  animation: '🎨 Cartoons & Animated Hits',
};

/** Deduplicate movies across sections: each movie ID only appears once
 *  in the FIRST section (by SECTION_KEYS order) that contains it. */
function deduplicateAcrossSections(rawRows) {
  const seen = new Set();
  const deduped = {};

  for (const key of SECTION_KEYS) {
    const movies = rawRows[key] || [];
    deduped[key] = movies.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }

  return deduped;
}

function Home({
  onPlayTrailer,
  onToggleWatchlist,
  isInWatchlist,
  onOpenWatchParty,
  safeSearch = true,
  genreFilter,
  yearFilter,
  ratingFilter,
  industryFilter,
  categoryFilter,
}) {
  const emptyRows = () =>
    Object.fromEntries(SECTION_KEYS.map((k) => [k, []]));

  const [rows, setRows] = useState(emptyRows);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all sections simultaneously; individual failures don't crash the page
      const results = await Promise.allSettled(
        SECTION_KEYS.map((key) => SECTION_FETCHERS[key]())
      );

      const rawRows = {};
      SECTION_KEYS.forEach((key, idx) => {
        const r = results[idx];
        if (r.status === 'fulfilled') {
          rawRows[key] = r.value?.results ?? [];
        } else {
          console.warn(`[Home] Section "${key}" failed:`, r.reason?.message);
          rawRows[key] = [];
        }
      });

      // Deduplicate so the same movie never appears in two rows
      setRows(deduplicateAcrossSections(rawRows));
    } catch (err) {
      console.error('[Home] fetchAll unexpected error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load on mount — no re-fetch on filter change (filters are client-side).
  // The data pool is 15 × 20 = 300 unique real TMDB movies after dedup.
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  /** Client-side filter applied to a movie list from real TMDB data */
  const applyFilters = useCallback(
    (movies) => {
      return movies.filter((movie) => {
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
    [safeSearch, genreFilter, yearFilter, ratingFilter, industryFilter, categoryFilter]
  );

  // Recomputes whenever real data OR any filter state changes
  const filteredRows = useMemo(() => {
    const result = {};
    for (const key of SECTION_KEYS) {
      result[key] = applyFilters(rows[key]);
    }
    return result;
  }, [rows, applyFilters]);

  // Check if any filter is active
  const hasActiveFilter = genreFilter || yearFilter || ratingFilter || industryFilter || categoryFilter;

  // When filters are active, merge all sections into one flat result to avoid
  // many near-empty rows (20-movie pools per section get very sparse after filtering)
  const flatFilteredMovies = useMemo(() => {
    if (!hasActiveFilter) return null;
    const all = [];
    const seen = new Set();
    for (const key of SECTION_KEYS) {
      for (const m of filteredRows[key]) {
        if (!seen.has(m.id)) {
          seen.add(m.id);
          all.push(m);
        }
      }
    }
    return all;
  }, [filteredRows, hasActiveFilter]);

  return (
    <main className="home-page-layout">
      {/* Hero Spotlight */}
      {!loading && filteredRows.popular.length > 0 && !hasActiveFilter && (
        <HeroSpotlight
          movies={filteredRows.popular}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />
      )}

      {/* Show single hero from filtered results when filter is active */}
      {!loading && hasActiveFilter && flatFilteredMovies && flatFilteredMovies.length > 0 && (
        <HeroSpotlight
          movies={flatFilteredMovies.slice(0, 5)}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />
      )}

      <div className="home-content-container">
        {/* Trending tabs — always real-time from its own fetcher */}
        {!hasActiveFilter && (
          <TrendingSection
            onPlayTrailer={onPlayTrailer}
            onToggleWatchlist={onToggleWatchlist}
            isInWatchlist={isInWatchlist}
          />
        )}

        {loading ? (
          <div className="status-message">Loading titles from TMDB...</div>
        ) : hasActiveFilter ? (
          /* ── FILTERED VIEW: single merged row ── */
          <>
            {flatFilteredMovies.length === 0 ? (
              <div className="status-message">
                No titles match your filters. Try broadening your selection.
              </div>
            ) : (
              <MovieRow
                title={`🔎 Filtered Results (${flatFilteredMovies.length} titles)`}
                movies={flatFilteredMovies}
                onPlayTrailer={onPlayTrailer}
                onToggleWatchlist={onToggleWatchlist}
                isInWatchlist={isInWatchlist}
              />
            )}
          </>
        ) : (
          /* ── DEFAULT VIEW: all 15 sections, deduplicated ── */
          <>
            {SECTION_KEYS.map((key) =>
              filteredRows[key].length > 0 ? (
                <MovieRow
                  key={key}
                  title={SECTION_TITLES[key]}
                  movies={filteredRows[key]}
                  onPlayTrailer={onPlayTrailer}
                  onToggleWatchlist={onToggleWatchlist}
                  isInWatchlist={isInWatchlist}
                />
              ) : null
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default Home;
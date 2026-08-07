import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrendingMovies, getAnimationMovies, getKoreanMovies, getPopularMovies } from '../services/api';
import './IntroPage.css';

const TMDB_IMG = 'https://image.tmdb.org/t/p/w342';

export default function IntroPage() {
  const navigate = useNavigate();
  const [posters, setPosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [entered, setEntered] = useState(false);
  const containerRef = useRef(null);

  // Fetch a diverse set of posters
  useEffect(() => {
    let cancelled = false;
    async function fetchPosters() {
      try {
        const [trending, animation, korean, popular] = await Promise.allSettled([
          getTrendingMovies('week', 1),
          getAnimationMovies(1),
          getKoreanMovies(1),
          getPopularMovies(1),
        ]);

        const extract = (result) =>
          result.status === 'fulfilled' ? (result.value?.results || []) : [];

        const all = [
          ...extract(trending),
          ...extract(animation),
          ...extract(korean),
          ...extract(popular),
        ];

        // Deduplicate by id and filter for valid posters
        const seen = new Set();
        const unique = all.filter((m) => {
          if (!m.poster_path || seen.has(m.id)) return false;
          seen.add(m.id);
          return true;
        });

        // Shuffle
        for (let i = unique.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [unique[i], unique[j]] = [unique[j], unique[i]];
        }

        if (!cancelled) {
          setPosters(unique.slice(0, 16)); // Use 16 posters for the 3D circle ring
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch posters for intro:', err);
        if (!cancelled) setLoading(false);
      }
    }
    fetchPosters();
    return () => { cancelled = true; };
  }, []);

  const handleEnter = useCallback(() => {
    setEntered(true);
    setTimeout(() => navigate('/home'), 900);
  }, [navigate]);

  return (
    <div
      ref={containerRef}
      className={`intro-page ${entered ? 'intro-exit' : ''}`}
      id="intro-page"
    >
      {/* 3D Film Strip Ring Background */}
      {!loading && posters.length > 0 && (
        <div className="film-ring-container" aria-hidden="true">
          <div className="film-ring" style={{ '--total': posters.length }}>
            {posters.map((movie, index) => (
              <div
                className="film-ring-card"
                key={`${movie.id}-${index}`}
                style={{ '--index': index }}
              >
                <img
                  src={`${TMDB_IMG}${movie.poster_path}`}
                  alt={movie.title || movie.name || ''}
                  loading="lazy"
                  draggable="false"
                />
                <div className="film-ring-shine" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dark overlay + vignette */}
      <div className="intro-overlay" />
      <div className="intro-vignette" />

      {/* Center Content */}
      <div className="intro-center-content">
        <div className="intro-logo-wrapper">
          <span className="intro-logo-icon">▶</span>
          <h1 className="intro-logo-text">
            CINE<span className="intro-logo-accent">CIRCLE</span>
          </h1>
        </div>

        <p className="intro-tagline">
          Welcome to <strong>CINECIRCLE</strong> — your gateway to the world of cinema.
          <br />
          <span className="intro-tagline-sub">
            Discover trending movies, anime, cartoons & dramas — all in one place.
          </span>
        </p>

        <div className="intro-stats-row">
          <div className="intro-stat">
            <span className="intro-stat-number">10K+</span>
            <span className="intro-stat-label">Movies</span>
          </div>
          <div className="intro-stat-divider" />
          <div className="intro-stat">
            <span className="intro-stat-number">50+</span>
            <span className="intro-stat-label">Genres</span>
          </div>
          <div className="intro-stat-divider" />
          <div className="intro-stat">
            <span className="intro-stat-number">∞</span>
            <span className="intro-stat-label">Entertainment</span>
          </div>
        </div>

        <button
          className="intro-enter-btn"
          onClick={handleEnter}
          id="intro-enter-btn"
        >
          <span className="intro-enter-text">Explore Now</span>
          <span className="intro-enter-arrow">→</span>
        </button>

        <p className="intro-footnote">
          Stream • Discover • Repeat
        </p>
      </div>

      {/* Loading Spinner fallback */}
      {loading && (
        <div className="intro-loading">
          <div className="intro-spinner" />
        </div>
      )}
    </div>
  );
}

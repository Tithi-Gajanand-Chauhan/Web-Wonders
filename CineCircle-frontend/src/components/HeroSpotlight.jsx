import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

function HeroSpotlight({ movies = [], onPlayTrailer, onToggleWatchlist, isInWatchlist }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  const featured = movies.slice(0, 5);
  const currentMovie = featured[currentIndex] || movies[0];

  useEffect(() => {
    if (featured.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featured.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [featured.length]);

  if (!currentMovie) return null;

  const year = currentMovie.release_date ? currentMovie.release_date.split('-')[0] : '2026';
  const isSaved = isInWatchlist ? isInWatchlist(currentMovie.id) : false;
  const mainGenre = currentMovie.moods ? currentMovie.moods[0] : 'Action';

  return (
    <div className="hero-spotlight-container">
      {/* Background Image Layer */}
      <div
        className="hero-backdrop-image"
        style={{
          backgroundImage: `url(${
            currentMovie.backdrop_path?.startsWith('/')
              ? `${BACKDROP_BASE_URL}${currentMovie.backdrop_path}`
              : currentMovie.backdrop_path || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600'
          })`,
        }}
      >
        <div className="hero-gradient-overlay" />
      </div>

      {/* Hero Content Panel matching reference layout */}
      <div className="hero-main-content">
        <h1 className="hero-movie-title">{currentMovie.title}</h1>

        {/* Subtitle Dot-Separated Metadata matching screenshot: Movie • Action • 2026 • 13+ */}
        <div className="hero-subtitle-meta">
          <span>Movie</span>
          <span className="dot">•</span>
          <span>{mainGenre}</span>
          <span className="dot">•</span>
          <span>{year}</span>
          <span className="dot">•</span>
          <span className="age-badge">{currentMovie.age_rating || 'PG-13'}</span>
        </div>

        <p className="hero-synopsis-text">
          {currentMovie.overview
            ? currentMovie.overview.length > 220
              ? currentMovie.overview.slice(0, 220) + '...'
              : currentMovie.overview
            : 'Experience this cinematic release on CineCircle.'}
        </p>

        {/* Clean Action Buttons matching screenshot: Solid White Play, Dark Grey More Info */}
        <div className="hero-button-group">
          <button
            className="hero-btn btn-play-white"
            onClick={() => onPlayTrailer(currentMovie)}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>Play</span>
          </button>

          <button
            className="hero-btn btn-info-dark"
            onClick={() => navigate(`/movie/${currentMovie.id}`)}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>More Info</span>
          </button>

          <button
            className={`hero-btn btn-list-dark ${isSaved ? 'in-list' : ''}`}
            onClick={() => onToggleWatchlist(currentMovie)}
          >
            <svg className="btn-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2">
              {isSaved ? (
                <path d="M20 6L9 17l-5-5" />
              ) : (
                <path d="M12 5v14m-7-7h14" />
              )}
            </svg>
            <span>{isSaved ? 'In My List' : 'My List'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Right Top 10 Rank Badge matching screenshot */}
      <div className="hero-bottom-right-badge">
        <div className="top10-red-box">
          <span className="top10-small">TOP</span>
          <span className="top10-number">10</span>
        </div>
        <span className="top10-rank-text">#{currentIndex + 1} in Movies Today</span>
        <span className="age-box">{currentMovie.age_rating || 'PG-13'}</span>
      </div>

      {/* Carousel Dots Switcher */}
      <div className="hero-carousel-dots">
        {featured.map((_, idx) => (
          <button
            key={idx}
            className={`carousel-dot ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSpotlight;

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMovieTrailerKey, getTrailerIframeUrl, fetchMovieTrailer } from '../services/api';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const HOVER_DELAY_MS = 350;

function MovieCard({ movie, rank, isTop10, onPlayTrailer, onToggleWatchlist, isSaved }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useRef(null);
  const isMouseInsideRef = useRef(false);

  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path)
    : 'https://via.placeholder.com/342x513?text=No+Poster';

  const year = movie.release_date ? movie.release_date.split('-')[0] : '2026';

  const handleMouseEnter = () => {
    isMouseInsideRef.current = true;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);

    hoverTimer.current = setTimeout(() => {
      if (isMouseInsideRef.current) {
        setIsHovered(true);
      }
    }, HOVER_DELAY_MS);
  };

  const handleMouseLeave = () => {
    isMouseInsideRef.current = false;
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
    setIsHovered(false);
  };

  return (
    <div
      className={`movie-card-container ${isTop10 ? 'top10-container' : ''} ${isHovered ? 'hover-active' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isTop10 && rank && (
        <div className="top10-rank-number">
          {rank}
        </div>
      )}

      <div className="movie-card">
        <div className="poster-wrapper" onClick={() => onPlayTrailer(movie)}>
          <img
            src={posterUrl}
            alt={movie.title}
            className="movie-poster-img"
          />

          {movie.badge && <span className="poster-badge-tag">{movie.badge}</span>}

          <div className="poster-play-overlay">
            <div className="poster-play-btn-circle">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>

        {isHovered && (
          <div className="hover-details-panel">
            <div className="hover-action-bar">
              <div className="left-actions">
                <button
                  className="action-circle btn-play-white"
                  title="Play Trailer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrailer(movie);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>

                <button
                  className={`action-circle btn-add-circle ${isSaved ? 'saved' : ''}`}
                  title={isSaved ? 'Remove from My List' : 'Add to My List'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWatchlist(movie);
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                    {isSaved ? (
                      <path d="M20 6L9 17l-5-5" />
                    ) : (
                      <path d="M12 5v14m-7-7h14" />
                    )}
                  </svg>
                </button>

                <button className="action-circle btn-like-circle" title="Like">
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                  </svg>
                </button>
              </div>

              <button
                className="action-circle btn-info-circle"
                title="View Full Details"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/movie/${movie.id}`);
                }}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            <h4 className="hover-title">{movie.title}</h4>

            <div className="hover-meta-tags">
              <span className="meta-match">{movie.match_percentage || 98}% Match</span>
              <span className="meta-age">{movie.age_rating || 'PG-13'}</span>
              <span className="meta-year">{year}</span>
              <span className="meta-quality">HD</span>
            </div>

            <p className="hover-overview">
              {movie.overview
                ? movie.overview.length > 110
                  ? movie.overview.slice(0, 110) + '...'
                  : movie.overview
                : 'No overview available.'}
            </p>

            {movie.moods && movie.moods.length > 0 && (
              <div className="hover-genres-line">
                {movie.moods.slice(0, 3).join(' • ')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
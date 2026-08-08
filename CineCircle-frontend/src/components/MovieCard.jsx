import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchWatchedStatus,
  toggleWatchedStatus,
  fetchLikes,
  toggleLike,
  fetchReviews,
  submitReview,
  fetchCustomLists,
  addMovieToCustomList,
  removeMovieFromCustomList
} from '../services/api';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
const HOVER_DELAY_MS = 350;

function MovieCard({ movie, rank, isTop10, onPlayTrailer, onToggleWatchlist, isSaved }) {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimer = useRef(null);
  const isMouseInsideRef = useRef(false);

  // States for letterboxd features
  const [isWatched, setIsWatched] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [customLists, setCustomLists] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const user = (() => {
    try {
      const savedUser = localStorage.getItem('cinecircle_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    if (user && movie.id) {
      fetchWatchedStatus(movie.id).then(data => setIsWatched(data.userWatched)).catch(console.error);
      fetchLikes(movie.id).then(data => setIsLiked(data.userLiked)).catch(console.error);
    } else {
      setIsWatched(false);
      setIsLiked(false);
    }
  }, [movie.id, user]);

  useEffect(() => {
    if (user && (isHovered || isMenuOpen)) {
      fetchCustomLists().then(data => setCustomLists(data)).catch(console.error);
      fetchReviews(movie.id).then(data => {
        const myRev = data.reviews.find(r => String(r.userId) === String(user.id) || String(r.userId) === String(user._id));
        if (myRev) setRating(myRev.rating);
      }).catch(console.error);
    }
  }, [movie.id, isHovered, isMenuOpen, user]);

  const posterUrl = movie.poster_path
    ? (movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path)
    : 'https://via.placeholder.com/342x513?text=No+Poster';

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
    if (!isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  const handlePosterClick = () => {
    navigate(`/movie/${movie.id}`);
  };

  const handleToggleWatched = async (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert('Please sign in to track watched movies.');
      return;
    }
    try {
      const data = await toggleWatchedStatus(movie.id, movie);
      setIsWatched(data.userWatched);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!user) {
      alert('Please sign in to like movies.');
      return;
    }
    try {
      const data = await toggleLike(movie.id, movie);
      setIsLiked(data.liked);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateMovie = async (newRating) => {
    if (!user) {
      alert('Please sign in to rate movies.');
      return;
    }
    try {
      const currentReviews = await fetchReviews(movie.id);
      const myRev = currentReviews.reviews.find(r => String(r.userId) === String(user.id) || String(r.userId) === String(user._id));
      const text = myRev ? myRev.reviewText : '';
      
      const res = await submitReview(movie.id, newRating, text);
      setRating(res.rating);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleListMovie = async (list) => {
    try {
      const inList = list.movies.some(m => String(m.id) === String(movie.id));
      let updated;
      if (inList) {
        updated = await removeMovieFromCustomList(list._id, movie.id);
      } else {
        updated = await addMovieToCustomList(list._id, movie);
      }
      setCustomLists(prev => prev.map(l => l._id === list._id ? updated : l));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleWatchlistAction = () => {
    onToggleWatchlist(movie);
  };

  const handleReviewLogClick = () => {
    setIsMenuOpen(false);
    navigate(`/movie/${movie.id}`, { state: { focusReview: true } });
  };

  const renderGoldStars = (ratingValue, onClick) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={() => onClick(i)}
          style={{
            color: i <= ratingValue ? 'var(--accent-gold, #FFD700)' : '#4b5563',
            cursor: 'pointer',
            fontSize: '1.45rem',
            marginRight: '2px',
            transition: 'color 0.2s ease'
          }}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div
      className={`movie-card-container ${isTop10 ? 'top10-container' : ''} ${isHovered || isMenuOpen ? 'hover-active' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isTop10 && rank && (
        <div className="top10-rank-number">
          {rank}
        </div>
      )}

      <div className="movie-card">
        <div className="poster-wrapper" onClick={handlePosterClick} style={{ cursor: 'pointer' }}>
          <img
            src={posterUrl}
            alt={movie.title}
            className="movie-poster-img"
          />

          {movie.badge && <span className="poster-badge-tag">{movie.badge}</span>}

          {/* Top Corner Status Badges (Watched/Liked) */}
          {user && (isWatched || isLiked) && (
            <div className="card-status-badges" onClick={(e) => e.stopPropagation()}>
              {isWatched && (
                <span className="status-badge watched" title="Watched">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                </span>
              )}
              {isLiked && (
                <span className="status-badge liked" title="Liked">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
              )}
            </div>
          )}

          <div className="poster-play-overlay">
            <div 
              className="poster-play-btn-circle" 
              onClick={(e) => { 
                e.stopPropagation(); 
                onPlayTrailer(movie); 
              }}
            >
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>

          {/* letterboxd style action pill overlay */}
          {(isHovered || isMenuOpen) && (
            <div 
              className="card-action-overlay-pill"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Watch Toggle (Eye) */}
              <button 
                className={`pill-icon-btn ${isWatched ? 'watched' : ''}`}
                title={isWatched ? "Watched" : "Mark as Watched"}
                onClick={handleToggleWatched}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill={isWatched ? "var(--accent-gold, #FFD700)" : "none"} stroke="currentColor" strokeWidth="2.2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" fill={isWatched ? "var(--accent-gold, #FFD700)" : "none"} />
                </svg>
              </button>

              {/* Like Toggle (Heart) */}
              <button 
                className={`pill-icon-btn ${isLiked ? 'liked' : ''}`}
                title={isLiked ? "Liked" : "Like"}
                onClick={handleToggleLike}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill={isLiked ? "var(--primary-red, #e50914)" : "none"} stroke="currentColor" strokeWidth="2.2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* 3-Dots Options */}
              <button 
                className={`pill-icon-btn ${isMenuOpen ? 'active' : ''}`}
                title="Options"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <circle cx="5" cy="12" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="19" cy="12" r="2" />
                </svg>
              </button>
            </div>
          )}

          {/* Options Dropdown */}
          {isMenuOpen && (
            <div 
              className="card-menu-dropdown"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="menu-rating-row">
                {renderGoldStars(rating, (newRating) => handleRateMovie(newRating))}
              </div>

              <div className="menu-divider" />

              <button className="menu-item-btn" onClick={handleReviewLogClick}>
                <span>Review or log film...</span>
              </button>

              <button className="menu-item-btn" onClick={handleToggleWatchlistAction}>
                <span>{isSaved ? "Remove from watchlist" : "Add to watchlist"}</span>
              </button>

              <div className="menu-submenu-section">
                <span className="submenu-title">Add to custom lists:</span>
                {user ? (
                  customLists.length === 0 ? (
                    <span className="submenu-empty-text">No custom lists yet</span>
                  ) : (
                    <div className="submenu-lists-container">
                      {customLists.map(list => {
                        const inList = list.movies.some(m => String(m.id) === String(movie.id));
                        return (
                           <label key={list._id} className="submenu-list-label">
                            <input 
                              type="checkbox" 
                              checked={inList}
                              onChange={() => handleToggleListMovie(list)}
                            />
                            <span>{list.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  )
                ) : (
                  <span className="submenu-empty-text">Sign in to add to lists</span>
                )}
              </div>

              <div className="menu-divider" />

              <button className="menu-item-btn" onClick={handlePosterClick}>
                <span>Where to watch</span>
              </button>
            </div>
          )}
        </div>

        <h4 className="card-title-bottom" onClick={handlePosterClick}>{movie.title}</h4>
      </div>
    </div>
  );
}

export default MovieCard;
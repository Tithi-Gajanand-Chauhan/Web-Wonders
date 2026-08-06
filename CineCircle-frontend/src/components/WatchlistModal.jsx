import { useNavigate } from 'react-router-dom';

function WatchlistModal({ isOpen, onClose, watchlist, onRemoveFromWatchlist, onPlayTrailer }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="watchlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>My List ({watchlist.length})</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {watchlist.length === 0 ? (
          <div className="empty-watchlist">
            <p>Your list is currently empty.</p>
            <p className="subtext">Hover over any title and click + to add titles to your list.</p>
          </div>
        ) : (
          <div className="watchlist-grid">
            {watchlist.map((movie) => (
              <div key={movie.id} className="watchlist-item">
                <img
                  src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150'}
                  alt={movie.title}
                  className="watchlist-poster"
                  onClick={() => {
                    onClose();
                    navigate(`/movie/${movie.id}`);
                  }}
                />
                <div className="watchlist-item-info">
                  <h4>{movie.title}</h4>
                  <div className="watchlist-item-meta">
                    <span>Rating {movie.vote_average?.toFixed(1)}</span>
                    <span>•</span>
                    <span>{movie.release_date?.split('-')[0]}</span>
                  </div>
                  <div className="watchlist-item-actions">
                    <button
                      className="btn-mini btn-play"
                      onClick={() => {
                        onClose();
                        onPlayTrailer(movie);
                      }}
                    >
                      Play
                    </button>
                    <button
                      className="btn-mini btn-remove"
                      onClick={() => onRemoveFromWatchlist(movie.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistModal;

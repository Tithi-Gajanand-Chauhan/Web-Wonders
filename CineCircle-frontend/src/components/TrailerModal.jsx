import { useEffect } from 'react';
import { getTrailerIframeUrl } from '../services/api';

function TrailerModal({ movie, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!movie) return null;

  const iframeSrc = getTrailerIframeUrl(movie, { autoplay: 1, mute: 0 });

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="trailer-iframe-wrapper">
          <iframe
            src={iframeSrc}
            title={`${movie.title} Trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="trailer-modal-info">
          <h2>{movie.title}</h2>
          <div className="modal-meta-row">
            <span className="badge-match">{movie.match_percentage || 98}% Match</span>
            <span className="badge-age">{movie.age_rating || 'PG-13'}</span>
            <span>Rating {movie.vote_average?.toFixed(1)}</span>
            <span>{movie.release_date?.split('-')[0]}</span>
          </div>
          <p>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;

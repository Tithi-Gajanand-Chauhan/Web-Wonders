import { useEffect, useState } from 'react';
import { getTrailerIframeUrl, getMovieTrailerKey, fetchMovieTrailer } from '../services/api';

function TrailerModal({ movie, onClose }) {
  const [iframeSrc, setIframeSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!movie) return;

    let cancelled = false;

    async function loadTrailer() {
      setLoading(true);
      setError(false);
      setIframeSrc(null);

      // 1. Check if we already have it in the curated list or on the object
      const knownKey = getMovieTrailerKey(movie);
      if (knownKey) {
        if (!cancelled) {
          setIframeSrc(getTrailerIframeUrl(movie, { autoplay: 1, mute: 0, controls: 1, loop: 0 }));
          setLoading(false);
        }
        return;
      }

      // 2. Otherwise query TMDB via our backend
      try {
        const fetchedKey = await fetchMovieTrailer(movie.id);
        if (cancelled) return;

        if (fetchedKey) {
          const tempMovie = { ...movie, trailer_key: fetchedKey };
          setIframeSrc(getTrailerIframeUrl(tempMovie, { autoplay: 1, mute: 0, controls: 1, loop: 0 }));
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to load modal trailer:', err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadTrailer();
    return () => { cancelled = true; };
  }, [movie]);

  if (!movie) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <div className="trailer-iframe-wrapper">
          {loading && (
            <div className="modal-loading-placeholder">
              <div className="modal-spinner" />
              <span>Loading Trailer...</span>
            </div>
          )}

          {error && !loading && (
            <div className="modal-error-placeholder">
              <span>🎬 Trailer not available for this movie</span>
            </div>
          )}

          {!loading && iframeSrc && (
            <iframe
              src={iframeSrc}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
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

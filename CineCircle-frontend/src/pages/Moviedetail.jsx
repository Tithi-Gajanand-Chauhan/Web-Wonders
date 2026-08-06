import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMovieDetails } from '../services/movieApi';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {

  async function fetchMovie() {

    try {

      setLoading(true);
      setNotFound(false);
      setError(false);
      setMovie(null);

      const data = await getMovieDetails(id);

      setMovie(data);

    } catch (err) {

      console.error("Failed to fetch movie details:", err);

      if (err.response?.status === 404) {
        setNotFound(true);
      } else {
        setError(true);
      }

    } finally {

      setLoading(false);

    }
  }

  fetchMovie();
  window.scrollTo(0,0);

}, [id]);

  if (loading) {
    return <div className="status-message">Loading movie...</div>;
  }

  if (error) {
  return (
    <div className="status-message">
      Unable to load movie details.
      <br />
      Please try again.
      <br />

      <button 
        className="back-btn"
        onClick={() => window.location.reload()}
      >
        Retry
      </button>
    </div>
  );
}


if (notFound || !movie) {
  return (
    <div className="status-message">
      Movie not found.
      <br />

      <button 
        className="back-btn" 
        onClick={() => navigate('/')}
      >
        Go back home
      </button>

    </div>
  );
}

  const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
  const hours = Math.floor((movie.runtime || 0) / 60);
  const minutes = (movie.runtime || 0) % 60;
  const cast = movie.credits?.cast?.slice(0, 10) || [];
  const director = movie.credits?.crew?.find((p) => p.job === 'Director');

  return (
    <div className="detail-page">
      {movie.backdrop_path && (
        <div
          className="detail-backdrop"
          style={{ backgroundImage: `url(${BACKDROP_BASE_URL}${movie.backdrop_path})` }}
        >
          <div className="detail-backdrop-fade" />
        </div>
      )}

      
      <button
  onClick={() =>
    navigate("/recommendation", {
      state: location.state
    })
  }
  style={{
    position: "fixed",
    top: "20px",
    left: "20px",
    zIndex: 99999,
    backgroundColor: "#2563eb",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
  }}
>
  ← Back to Recommendations
</button>

      <div className="detail-content">
        <div className="detail-main">
          <img
            src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : ''}
            alt={movie.title}
            className="detail-poster"
          />

          <div className="detail-info">
            <h1 className="detail-title">
              {movie.title} <span className="detail-year">({year})</span>
            </h1>

            {movie.tagline && <p className="detail-tagline">"{movie.tagline}"</p>}

            <div className="detail-meta-row">
              <span>⭐ {movie.vote_average?.toFixed(1)} ({movie.vote_count} votes)</span>
              {movie.runtime > 0 && <span>{hours}h {minutes}m</span>}
              {director && <span>Dir. {director.name}</span>}
            </div>

            <div className="detail-genres">
              {movie.genres?.map((g) => (
                <span key={g.id} className="genre-pill">{g.name}</span>
              ))}
            </div>

            <h3 className="detail-section-heading">Overview</h3>
            <p className="detail-overview">{movie.overview || 'No overview available.'}</p>

            {/* Reserved space for future features: watchlist button, group voting */}
            <div className="detail-actions-placeholder">
              {/* Watchlist button, group voting controls will go here */}
            </div>
          </div>
        </div>

        {cast.length > 0 && (
          <div className="detail-cast">
            <h3 className="detail-section-heading">Cast</h3>
            <div className="cast-scroll">
              {cast.map((actor) => (
                <div key={actor.id} className="cast-card">
                  {actor.profile_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`}
                      alt={actor.name}
                      className="cast-photo"
                    />
                  ) : (
                    <div className="cast-photo cast-photo-placeholder">No Photo</div>
                  )}
                  <p className="cast-name">{actor.name}</p>
                  <p className="cast-character">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reserved space for future features: reviews section */}
        <div className="detail-reviews-placeholder">
          {/* Reviews module will go here */}
        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
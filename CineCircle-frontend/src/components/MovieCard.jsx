import { useNavigate } from 'react-router-dom';

function MovieCard({ movie }) {
  const navigate = useNavigate();
  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342';
  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : null;

  const year = movie.release_date
    ? movie.release_date.split('-')[0]
    : 'N/A';

  return (
    <div className="movie-card" onClick={() => navigate(`/movie/${movie.id}`)}>
      <div className="movie-poster-wrapper">
        {posterUrl ? (
          <img src={posterUrl} alt={movie.title} className="movie-poster" />
        ) : (
          <div className="movie-poster movie-poster-placeholder">No Image</div>
        )}

        <div className="movie-overlay">
          <h4 className="overlay-title">{movie.title}</h4>
          <div className="overlay-meta">
            <span>⭐ {movie.vote_average?.toFixed(1)}</span>
            <span>{year}</span>
          </div>
          <p className="overlay-overview">
            {movie.overview
              ? movie.overview.length > 140
                ? movie.overview.slice(0, 140) + '...'
                : movie.overview
              : 'No description available.'}
          </p>
        </div>
      </div>

      <div className="movie-info">
        <h3 className="movie-title">{movie.title}</h3>
        <div className="movie-meta">
          <span className="movie-rating">⭐ {movie.vote_average?.toFixed(1)}</span>
          <span className="movie-year">{year}</span>
        </div>
      </div>
    </div>
  );
}

export default MovieCard;
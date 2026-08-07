import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getMovieDetails } from '../services/api';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

function MovieDetail({ onPlayTrailer, onToggleWatchlist, isInWatchlist }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await getMovieDetails(id);
        setMovie(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error('Failed to fetch movie details:', err);
        }
      } finally {
        setLoading(false);
      }
    }
    fetchMovie();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return <div className="status-message">Loading movie details...</div>;
  }

  if (notFound || !movie) {
    return (
      <div className="status-message">
        Movie not found.
        <br />
        <button className="btn-hero btn-play-hero" style={{ margin: '20px auto' }} onClick={() => navigate('/')}>
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
  const isSaved = isInWatchlist ? isInWatchlist(movie.id) : false;

  // Look up custom match percentage if navigated from group watch recommendations
  const groupRecs = location.state?.recommendations || [];
  const matchedRecMovie = groupRecs.find(m => String(m.movieId) === String(id) || String(m.movieId) === String(movie.id));
  const groupMatchPercentage = matchedRecMovie?.match_percentage;

  // Fallback to dynamic TMDB rating-based match score calculation for home/browse details
  const calculatedMatch = Math.round(Math.min(99, 70 + (movie.vote_average || 7.0) * 2.5 + (movie.id % 5)));
  
  const matchPercentage = groupMatchPercentage || calculatedMatch;

  return (
    <div className="detail-page" style={{ position: 'relative', minHeight: '100vh' }}>
      {movie.backdrop_path && (
        <div
          className="detail-backdrop"
          style={{
            height: '480px',
            backgroundImage: `url(${movie.backdrop_path.startsWith('/') ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` : movie.backdrop_path})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            position: 'relative'
          }}
        >
          <div className="hero-gradient-overlay" />
        </div>
      )}

      <div className="detail-content" style={{ maxWidth: '1100px', margin: '-200px auto 60px', padding: '0 32px', position: 'relative', zIndex: 10 }}>
        <div className="detail-main" style={{ display: 'flex', gap: '36px' }}>
          <img
            src={movie.poster_path ? (movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path) : 'https://via.placeholder.com/300'}
            alt={movie.title}
            style={{ width: '260px', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.8)', flexShrink: 0 }}
          />

          <div className="detail-info" style={{ paddingTop: '100px', flex: 1 }}>
            <h1 className="detail-title" style={{ fontSize: '2.5rem', fontWeight: 800 }}>
              {movie.title} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({year})</span>
            </h1>

            {movie.tagline && <p style={{ color: 'var(--accent-gold)', fontStyle: 'italic', margin: '8px 0 16px' }}>"{movie.tagline}"</p>}

            <div className="detail-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#cbd5e1', fontSize: '0.95rem', margin: '16px 0' }}>
              <span style={{ color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                {movie.vote_average?.toFixed(1)} ({movie.vote_count} votes)
              </span>
              {movie.runtime > 0 && <span>{hours}h {minutes}m</span>}
              {director && <span>Dir. {director.name}</span>}
              <span className="badge-match">{matchPercentage}% Match</span>
            </div>

            <div className="detail-genres" style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {movie.genres?.map((g) => (
                <span key={g.id} className="mood-pill" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>{g.name}</span>
              ))}
            </div>

            <div className="hero-actions" style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
              <button className="btn-hero btn-play-hero" onClick={() => onPlayTrailer(movie)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Play Full Trailer</span>
              </button>
              <button
                className={`btn-hero btn-secondary-hero ${isSaved ? 'saved' : ''}`}
                onClick={() => onToggleWatchlist(movie)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                  {isSaved ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <path d="M12 5v14m-7-7h14" />
                  )}
                </svg>
                <span>{isSaved ? 'In Watchlist' : 'Add to Circle'}</span>
              </button>
            </div>

            <h3 className="detail-section-heading" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Overview</h3>
            <p className="detail-overview" style={{ color: '#94a3b8', lineHeight: 1.7, maxWidth: '700px', marginBottom: '24px' }}>
              {movie.overview || 'No overview available.'}
            </p>

            {/* OTT Watch Providers Section */}
            {(() => {
              const watchProviders = movie["watch/providers"]?.results?.IN || movie["watch/providers"]?.results?.US;
              const flatrate = watchProviders?.flatrate || [];
              const rent = watchProviders?.rent || [];
              
              const getProviderLink = (provider) => {
                const name = provider.provider_name || "";
                const normName = name.toLowerCase().trim();
                if (normName.includes("netflix")) return "https://www.netflix.com";
                if (normName.includes("prime video") || normName.includes("amazon video")) return "https://www.primevideo.com";
                if (normName.includes("hotstar")) return "https://www.hotstar.com";
                if (normName.includes("jiocinema")) return "https://www.jiocinema.com";
                if (normName.includes("zee5")) return "https://www.zee5.com";
                if (normName.includes("sonyliv")) return "https://www.sonyliv.com";
                if (normName.includes("apple tv")) return "https://tv.apple.com";
                
                // Fallback to a google search for streaming options of this movie on this provider
                return `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+on+${encodeURIComponent(name)}`;
              };

              return (flatrate.length > 0 || rent.length > 0) ? (
                <div style={{ marginTop: '24px', backgroundColor: '#1E1E1E', padding: '16px 20px', borderRadius: '12px', border: '1px solid #2B2B2B', maxWidth: '700px' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '800', color: '#FFF', margin: '0 0 12px 0', letterSpacing: '0.3px', textTransform: 'uppercase' }}>
                    📺 Stream Availability (Click to Watch)
                  </h4>
                  
                  {flatrate.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: rent.length > 0 ? '12px' : '0' }}>
                      <span style={{ fontSize: '0.85rem', color: '#888', width: '90px', fontWeight: '600' }}>Subscription:</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {flatrate.map((provider) => (
                          <a
                            key={provider.provider_id}
                            href={getProviderLink(provider)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Watch on ${provider.provider_name}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#2b2b2b',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid #3b3b3b',
                              gap: '6px',
                              fontSize: '0.82rem',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#383838';
                              e.currentTarget.style.borderColor = '#FFD700';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2b2b2b';
                              e.currentTarget.style.borderColor = '#3b3b3b';
                            }}
                          >
                            {provider.logo_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                alt={provider.provider_name}
                                style={{ width: '20px', height: '20px', borderRadius: '4px' }}
                              />
                            )}
                            <span style={{ fontWeight: '500', color: '#FFF' }}>{provider.provider_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {rent.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.85rem', color: '#888', width: '90px', fontWeight: '600' }}>Rent / Buy:</span>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {rent.slice(0, 4).map((provider) => (
                          <a
                            key={provider.provider_id}
                            href={getProviderLink(provider)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Rent on ${provider.provider_name}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#2b2b2b',
                              padding: '4px 10px',
                              borderRadius: '8px',
                              border: '1px solid #3b3b3b',
                              gap: '6px',
                              fontSize: '0.82rem',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#383838';
                              e.currentTarget.style.borderColor = '#FFD700';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2b2b2b';
                              e.currentTarget.style.borderColor = '#3b3b3b';
                            }}
                          >
                            {provider.logo_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                alt={provider.provider_name}
                                style={{ width: '18px', height: '18px', borderRadius: '4px' }}
                              />
                            )}
                            <span style={{ fontWeight: '500', color: '#FFF' }}>{provider.provider_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginTop: '24px', backgroundColor: '#1E1E1E', padding: '16px 20px', borderRadius: '12px', border: '1px solid #2B2B2B', maxWidth: '700px', fontSize: '0.82rem', color: '#888' }}>
                  📺 Stream availability data is currently unavailable for this title.
                </div>
              );
            })()}
          </div>
        </div>

        {cast.length > 0 && (
          <div className="detail-cast" style={{ marginTop: '50px' }}>
            <h3 className="detail-section-heading" style={{ fontSize: '1.3rem', marginBottom: '16px' }}>Top Cast</h3>
            <div className="cast-scroll" style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '10px' }}>
              {cast.map((actor) => (
                <div key={actor.id} style={{ width: '120px', flex: '0 0 auto', textAlign: 'center' }}>
                  <img
                    src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/120x160'}
                    alt={actor.name}
                    style={{ width: '120px', height: '150px', objectFit: 'cover', borderRadius: '8px', background: '#1a1e2c' }}
                  />
                  <p style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 600, marginTop: '6px' }}>{actor.name}</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieDetail;
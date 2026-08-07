import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  getMovieDetails,
  fetchReviews,
  submitReview,
  deleteReview,
  fetchLikes,
  toggleLike,
  fetchCustomLists,
  createCustomList,
  addMovieToCustomList,
  removeMovieFromCustomList,
  fetchWatchedStatus,
  toggleWatchedStatus,
  fetchReviewStats
} from '../services/api';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/original';

function MovieDetail({ onPlayTrailer, onToggleWatchlist, isInWatchlist, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const reviewFormRef = useRef(null);

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Reviews, Likes, and Custom Lists states
  const [reviewsData, setReviewsData] = useState({ reviews: [], averageRating: 0, totalReviews: 0 });
  const [likesData, setLikesData] = useState({ likesCount: 0, userLiked: false });
  const [customLists, setCustomLists] = useState([]);
  const [isWatched, setIsWatched] = useState(false);

  // Stats/Histogram State
  const [statsData, setStatsData] = useState({
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalReviews: 0,
    averageRating: 0
  });

  // Review Form state
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewInput, setReviewInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Custom List Add Modal/Dropdown state
  const [isAddListOpen, setIsAddListOpen] = useState(false);
  const [newListInput, setNewListInput] = useState('');

  const scrollToReview = () => {
    if (reviewFormRef.current) {
      reviewFormRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textarea = reviewFormRef.current.querySelector('textarea');
      if (textarea) textarea.focus();
    }
  };

  useEffect(() => {
    async function fetchMovieData() {
      try {
        setLoading(true);
        setNotFound(false);
        
        // Fetch movie details
        const data = await getMovieDetails(id);
        setMovie(data);
        
        // Fetch reviews
        const revs = await fetchReviews(id);
        setReviewsData(revs);
        
        // Fetch likes
        const lks = await fetchLikes(id);
        setLikesData(lks);

        // Fetch watched status
        if (user) {
          const wStatus = await fetchWatchedStatus(id);
          setIsWatched(wStatus.userWatched);
        }

        // Fetch review stats
        const stats = await fetchReviewStats(id);
        setStatsData(stats);

        // Fetch custom lists if logged in
        if (user) {
          const lists = await fetchCustomLists();
          setCustomLists(lists);
        }
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
    fetchMovieData();
    window.scrollTo(0, 0);
  }, [id, user]);

  // Handle focus review navigation state
  useEffect(() => {
    if (!loading && location.state?.focusReview) {
      setTimeout(scrollToReview, 300);
    }
  }, [location.state, loading]);

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
  const calculatedMatch = Math.round(Math.min(99, 70 + (movie.vote_average || 7.0) * 2.5 + (movie.id % 5)));
  const matchPercentage = groupMatchPercentage || calculatedMatch;
  
  const handleLikeToggle = async () => {
    if (!user) {
      alert('Please sign in to like movies');
      return;
    }
    try {
      const res = await toggleLike(movie.id);
      setLikesData({
        likesCount: res.likesCount,
        userLiked: res.liked
      });
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleWatchedToggle = async () => {
    if (!user) {
      alert('Please sign in to track watched movies.');
      return;
    }
    try {
      const data = await toggleWatchedStatus(movie.id);
      setIsWatched(data.userWatched);
    } catch (err) {
      console.error('Failed to toggle watched status:', err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    try {
      setSubmittingReview(true);
      await submitReview(movie.id, ratingInput, reviewInput);
      setReviewInput('');
      
      const revs = await fetchReviews(movie.id);
      setReviewsData(revs);

      const stats = await fetchReviewStats(movie.id);
      setStatsData(stats);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await deleteReview(movie.id);
      const revs = await fetchReviews(movie.id);
      setReviewsData(revs);

      const stats = await fetchReviewStats(movie.id);
      setStatsData(stats);
    } catch (err) {
      console.error('Failed to delete review:', err);
    }
  };

  const handleRateMovie = async (val) => {
    if (!user) return;
    try {
      const existingUserReview = reviewsData.reviews.find(r => String(r.userId) === String(user.id) || String(r.userId) === String(user._id));
      const text = existingUserReview ? existingUserReview.reviewText : '';
      await submitReview(movie.id, val, text);
      
      const revs = await fetchReviews(movie.id);
      setReviewsData(revs);

      const stats = await fetchReviewStats(movie.id);
      setStatsData(stats);
    } catch (err) {
      console.error('Failed to rate movie:', err);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListInput.trim()) return;
    try {
      const newList = await createCustomList(newListInput.trim(), '');
      setCustomLists((prev) => [newList, ...prev]);
      setNewListInput('');
    } catch (err) {
      console.error('Failed to create list:', err);
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
      setCustomLists((prev) => prev.map((l) => (l._id === list._id ? updated : l)));
    } catch (err) {
      console.error('Failed to update list movie:', err);
    }
  };

  const renderStars = (ratingValue, interactive = false, onClick = null) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          onClick={interactive && onClick ? () => onClick(i) : null}
          style={{
            color: i <= ratingValue ? 'var(--accent-gold, #FFD700)' : '#4b5563',
            cursor: interactive ? 'pointer' : 'default',
            fontSize: interactive ? '1.5rem' : '1.1rem',
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
        
        {/* Main 3-Column Layout */}
        <div style={{ display: 'flex', gap: '36px', alignItems: 'flex-start' }}>
          
          {/* Left Column: Poster & Stream Providers */}
          <div style={{ width: '260px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <img
              src={movie.poster_path ? (movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path) : 'https://via.placeholder.com/300'}
              alt={movie.title}
              style={{ width: '100%', borderRadius: '12px', boxShadow: '0 12px 30px rgba(0,0,0,0.8)' }}
            />

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
                
                return `https://www.google.com/search?q=watch+${encodeURIComponent(movie.title)}+on+${encodeURIComponent(name)}`;
              };

              return (flatrate.length > 0 || rent.length > 0) ? (
                <div style={{ backgroundColor: '#161920', padding: '14px 18px', borderRadius: '12px', border: '1px solid #2b303c' }}>
                  <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: '#FFF', margin: '0 0 10px 0', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                    📺 Where to Watch
                  </h4>
                  
                  {flatrate.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: rent.length > 0 ? '12px' : '0' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Stream</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
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
                              backgroundColor: '#1f232d',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #2d3442',
                              gap: '6px',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#262c39';
                              e.currentTarget.style.borderColor = 'var(--accent-gold, #FFD700)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1f232d';
                              e.currentTarget.style.borderColor = '#2d3442';
                            }}
                          >
                            {provider.logo_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                alt={provider.provider_name}
                                style={{ width: '14px', height: '14px', borderRadius: '3px' }}
                              />
                            )}
                            <span style={{ fontWeight: '600', color: '#FFF' }}>{provider.provider_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {rent.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase' }}>Rent / Buy</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {rent.slice(0, 3).map((provider) => (
                          <a
                            key={provider.provider_id}
                            href={getProviderLink(provider)}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Rent on ${provider.provider_name}`}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              backgroundColor: '#1f232d',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              border: '1px solid #2d3442',
                              gap: '6px',
                              fontSize: '0.75rem',
                              textDecoration: 'none',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#262c39';
                              e.currentTarget.style.borderColor = 'var(--accent-gold, #FFD700)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#1f232d';
                              e.currentTarget.style.borderColor = '#2d3442';
                            }}
                          >
                            {provider.logo_path && (
                              <img
                                src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                alt={provider.provider_name}
                                style={{ width: '14px', height: '14px', borderRadius: '3px' }}
                              />
                            )}
                            <span style={{ fontWeight: '600', color: '#FFF' }}>{provider.provider_name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ backgroundColor: '#161920', padding: '12px 14px', borderRadius: '12px', border: '1px solid #2b303c', fontSize: '0.75rem', color: '#94a3b8' }}>
                  📺 Streaming info currently unavailable.
                </div>
              );
            })()}
          </div>

          {/* Middle Column: Details, Cast & Reviews */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '30px' }}>
            <div>
              <h1 className="detail-title" style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0 0 4px 0' }}>
                {movie.title} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({year})</span>
              </h1>

              {movie.tagline && <p style={{ color: 'var(--accent-gold)', fontStyle: 'italic', margin: '4px 0 12px' }}>"{movie.tagline}"</p>}

              <div className="detail-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', color: '#cbd5e1', fontSize: '0.9rem', margin: '12px 0' }}>
                {movie.runtime > 0 && <span>{hours}h {minutes}m</span>}
                {director && <span>Directed by <strong style={{ color: '#fff' }}>{director.name}</strong></span>}
                <span className="badge-match">{matchPercentage}% Match</span>
              </div>

              <div className="detail-genres" style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                {movie.genres?.map((g) => (
                  <span key={g.id} className="mood-pill" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>{g.name}</span>
                ))}
              </div>

              {/* Play Trailer Button */}
              <div style={{ marginBottom: '24px' }}>
                <button className="btn-hero btn-play-hero" onClick={() => onPlayTrailer(movie)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Play Full Trailer</span>
                </button>
              </div>

              <p className="detail-overview" style={{ color: '#cbd5e1', lineHeight: 1.7, fontSize: '0.95rem', margin: '0 0 24px 0' }}>
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Cast Section */}
            <div>
              <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', borderBottom: '1px solid #2b303c', paddingBottom: '8px', marginBottom: '14px' }}>
                Cast
              </h3>
              {cast.length > 0 ? (
                <div className="detail-cast">
                  <div className="cast-scroll" style={{ display: 'flex', gap: '14px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {cast.map((actor) => (
                      <div key={actor.id} style={{ width: '100px', flex: '0 0 auto', textAlign: 'center' }}>
                        <img
                          src={actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : 'https://via.placeholder.com/120x160'}
                          alt={actor.name}
                          style={{ width: '100px', height: '120px', objectFit: 'cover', borderRadius: '6px', background: '#1a1e2c' }}
                        />
                        <p style={{ color: '#fff', fontSize: '0.78rem', fontWeight: 600, marginTop: '6px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actor.name}</p>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Cast information is not available.</p>
              )}
            </div>

            {/* Reviews Section */}
            <div ref={reviewFormRef}>
              <h3 style={{ fontSize: '0.9rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', borderBottom: '1px solid #2b303c', paddingBottom: '8px', marginBottom: '16px' }}>
                Reviews
              </h3>

              {user ? (
                <div style={{
                  backgroundColor: '#161920',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #2b303c',
                  marginBottom: '24px'
                }}>
                  {(() => {
                    const existingUserReview = reviewsData.reviews.find(r => String(r.userId) === String(user.id) || String(r.userId) === String(user._id));
                    
                    return existingUserReview ? (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <h4 style={{ margin: 0, fontSize: '0.88rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Your Review</h4>
                          <button
                            onClick={handleReviewDelete}
                            style={{
                              backgroundColor: 'transparent',
                              color: '#f87171',
                              border: 'none',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              fontWeight: 700,
                              textTransform: 'uppercase'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                          {renderStars(existingUserReview.rating)}
                          <span style={{ marginLeft: '10px', fontSize: '0.78rem', color: '#64748b' }}>
                            Reviewed on {new Date(existingUserReview.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.88rem', margin: '6px 0 0 0', fontStyle: 'italic' }}>
                          "{existingUserReview.reviewText || 'No review text provided.'}"
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit}>
                        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.88rem', color: '#fff', fontWeight: 700, textTransform: 'uppercase' }}>Write a Review</h4>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                          <span style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600 }}>Your Rating:</span>
                          <div style={{ display: 'flex', gap: '2px' }}>
                            {renderStars(ratingInput, true, (val) => setRatingInput(val))}
                          </div>
                        </div>

                        <textarea
                          placeholder="Share your thoughts on the movie..."
                          value={reviewInput}
                          onChange={(e) => setReviewInput(e.target.value)}
                          rows={3}
                          style={{
                            width: '100%',
                            backgroundColor: '#0d0f13',
                            border: '1px solid #2b303c',
                            borderRadius: '8px',
                            padding: '10px',
                            color: '#fff',
                            fontSize: '0.85rem',
                            marginBottom: '12px',
                            resize: 'vertical',
                            outline: 'none',
                            boxSizing: 'border-box'
                          }}
                        />

                        <button
                          type="submit"
                          disabled={submittingReview}
                          style={{
                            backgroundColor: 'var(--accent-gold, #FFD700)',
                            color: '#111',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 16px',
                            fontSize: '0.82rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            opacity: submittingReview ? 0.7 : 1
                          }}
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    );
                  })()}
                </div>
              ) : (
                <div style={{
                  backgroundColor: '#161920',
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #2b303c',
                  textAlign: 'center',
                  marginBottom: '24px',
                  color: '#94a3b8',
                  fontSize: '0.85rem'
                }}>
                  Please sign in to rate or review this movie.
                </div>
              )}

              {/* Reviews Feed */}
              <div>
                {reviewsData.reviews.length === 0 ? (
                  <p style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>Be the first to review this movie!</p>
                ) : (
                  reviewsData.reviews.map((rev) => (
                    <div
                      key={rev._id}
                      style={{
                        borderBottom: '1px solid #1f232d',
                        padding: '14px 0',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.85rem' }}>{rev.username}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        {renderStars(rev.rating)}
                      </div>
                      {rev.reviewText && (
                        <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>
                          {rev.reviewText}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Sleek CineCircle Action Sidebar */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              backgroundColor: '#161920',
              border: '1px solid #2b303c',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              
              {/* Watch, Like, Watchlist buttons row */}
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
                {/* Watch (Eye) */}
                <button
                  onClick={handleWatchedToggle}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: isWatched ? 'var(--accent-gold, #FFD700)' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isWatched ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isWatched ? '1px solid var(--accent-gold, #FFD700)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg viewBox="0 0 24 24" width="20" height="20" fill={isWatched ? "var(--accent-gold, #FFD700)" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" fill={isWatched ? "var(--accent-gold, #FFD700)" : "none"} />
                    </svg>
                  </div>
                  WATCH
                </button>

                {/* Like (Heart) */}
                <button
                  onClick={handleLikeToggle}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: likesData.userLiked ? 'var(--primary-red, #e50914)' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: likesData.userLiked ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: likesData.userLiked ? '1px solid var(--primary-red, #e50914)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={likesData.userLiked ? "var(--primary-red, #e50914)" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  LIKE ({likesData.likesCount})
                </button>

                {/* Watchlist (Circle) */}
                <button
                  onClick={() => onToggleWatchlist(movie)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    color: isSaved ? 'var(--accent-gold, #FFD700)' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '0.68rem',
                    fontWeight: 700
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isSaved ? 'rgba(255, 215, 0, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isSaved ? '1px solid var(--accent-gold, #FFD700)' : '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease'
                  }}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill={isSaved ? "var(--accent-gold, #FFD700)" : "none"} stroke="currentColor" strokeWidth="2">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </div>
                  WATCHLIST
                </button>
              </div>

              {/* Star Rating picker */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderTop: '1px solid #2b303c',
                paddingTop: '16px',
                marginBottom: '16px'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Rate
                </span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {renderStars(ratingInput, true, (val) => {
                    setRatingInput(val);
                    handleRateMovie(val);
                  })}
                </div>
              </div>

              {/* Action Links */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                borderTop: '1px solid #2b303c',
                paddingTop: '12px',
                gap: '10px'
              }}>
                <button
                  onClick={scrollToReview}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '6px 0',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                >
                  📝 Review or log...
                </button>

                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => setIsAddListOpen(!isAddListOpen)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      padding: '6px 0',
                      width: '100%',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#fff'}
                    onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                  >
                    📂 Add to lists...
                  </button>

                  {isAddListOpen && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      backgroundColor: '#161920',
                      border: '1px solid #2b303c',
                      borderRadius: '8px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                      padding: '12px',
                      zIndex: 100,
                      width: '240px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>My Custom Lists</span>
                        <span onClick={() => setIsAddListOpen(false)} style={{ cursor: 'pointer', fontSize: '0.8rem', color: '#94a3b8' }}>✕</span>
                      </div>
                      {!user ? (
                        <p style={{ fontSize: '0.75rem', color: '#64748b' }}>Please sign in to manage lists.</p>
                      ) : (
                        <>
                          <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '8px' }}>
                            {customLists.length === 0 ? (
                              <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>No custom lists yet.</p>
                            ) : (
                              customLists.map(list => {
                                const inList = list.movies.some(m => String(m.id) === String(movie.id));
                                return (
                                  <label key={list._id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0', fontSize: '0.78rem', color: '#cbd5e1', cursor: 'pointer' }}>
                                    <input
                                      type="checkbox"
                                      checked={inList}
                                      onChange={() => handleToggleListMovie(list)}
                                      style={{ accentColor: 'var(--accent-gold, #FFD700)' }}
                                    />
                                    <span>{list.name}</span>
                                  </label>
                                );
                              })
                            )}
                          </div>
                          <form onSubmit={handleCreateList} style={{ display: 'flex', gap: '6px', borderTop: '1px solid #2b303c', paddingTop: '8px' }}>
                            <input
                              type="text"
                              placeholder="Create list..."
                              value={newListInput}
                              onChange={(e) => setNewListInput(e.target.value)}
                              style={{ flex: 1, backgroundColor: '#0d0f13', border: '1px solid #2b303c', borderRadius: '4px', padding: '4px 6px', fontSize: '0.75rem', color: '#fff', outline: 'none' }}
                            />
                            <button type="submit" style={{ backgroundColor: 'var(--accent-gold, #FFD700)', color: '#111', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Add</button>
                          </form>
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => alert(`Share link: ${window.location.href}`)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#cbd5e1',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    textAlign: 'left',
                    padding: '6px 0',
                    cursor: 'pointer',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
                >
                  🔗 Share
                </button>
              </div>
            </div>

            {/* Ratings Histogram */}
            <div style={{
              backgroundColor: '#161920',
              border: '1px solid #2b303c',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
            }}>
              <h4 style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px', marginBottom: '12px' }}>
                Ratings Distribution
              </h4>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{statsData.averageRating || '0.0'}</span>
                <span style={{ fontSize: '1rem', color: 'var(--accent-gold, #FFD700)' }}>★</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({statsData.totalReviews} reviews)</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = statsData.distribution[stars] || 0;
                  const maxCount = Math.max(...Object.values(statsData.distribution), 1);
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', width: '30px', textAlign: 'right' }}>
                        {stars} ★
                      </span>
                      <div style={{ flex: 1, height: '8px', backgroundColor: '#1f232d', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--accent-gold, #FFD700)', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.78rem', color: '#64748b', width: '25px', textAlign: 'left' }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MovieDetail;
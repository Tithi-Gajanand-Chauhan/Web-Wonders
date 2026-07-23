import { useState, useEffect } from 'react';
import { reviewService } from './services/reviewService';
import RatingSystem from './components/RatingSystem';
import ReviewList from './components/ReviewList';
import Watchlist from './components/Watchlist';
import Favorites from './components/Favorites';

export default function App() {
  const [activeTab, setActiveTab] = useState('discover'); // 'discover', 'library'
  const [movies, setMovies] = useState([]);
  const [selectedMovieId, setSelectedMovieId] = useState('m-1');
  const [currentMovie, setCurrentMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarSearch, setSidebarSearch] = useState('');

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        const allMovies = await reviewService.getMovies();
        setMovies(allMovies);
        
        const initialMovie = allMovies.find(m => m.id === selectedMovieId) || allMovies[0];
        if (initialMovie) {
          setCurrentMovie(initialMovie);
          const movieReviews = await reviewService.getReviews(initialMovie.id);
          setReviews(movieReviews);
        }

        const initialWatchlist = await reviewService.getWatchlist();
        setWatchlist(initialWatchlist);

        const initialFavs = await reviewService.getFavorites();
        setFavorites(initialFavs);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle movie selection change
  const handleSelectMovie = async (movieId) => {
    setSelectedMovieId(movieId);
    const movie = movies.find(m => m.id === movieId);
    setCurrentMovie(movie);
    
    setLoading(true);
    const movieReviews = await reviewService.getReviews(movieId);
    setReviews(movieReviews);
    setLoading(false);
  };

  // Callback when a user selects a movie from within the watchlist or favorites
  const handleSelectFromLibrary = (movieId) => {
    handleSelectMovie(movieId);
    setActiveTab('discover');
  };

  // Submit rating from star rating component
  const handleRatingSubmit = async (ratingVal) => {
    if (!currentMovie) return;
    try {
      // Check if user has already added this movie to watchlist; if not, add it
      const inWatchlist = watchlist.find(w => w.id === currentMovie.id);
      if (!inWatchlist) {
        await reviewService.addToWatchlist(currentMovie, 'wishlist');
      }

      // Add a quick review rating record
      await reviewService.addReview(currentMovie.id, {
        user: "CurrentUser",
        rating: ratingVal,
        content: `Quick Rating: I rate this ${currentMovie.type === 'show' ? 'show' : 'movie'} ${ratingVal}/10!`,
        isSpoiler: false
      });

      // Reload state
      const updatedReviews = await reviewService.getReviews(currentMovie.id);
      setReviews(updatedReviews);
      const updatedWatchlist = await reviewService.getWatchlist();
      setWatchlist(updatedWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  // Submit standard text review
  const handleReviewSubmit = async (reviewData) => {
    if (!currentMovie) return;
    try {
      // If user reviews, mark the movie as completed in the watchlist if not already
      const inWatchlist = watchlist.find(w => w.id === currentMovie.id);
      if (!inWatchlist) {
        await reviewService.addToWatchlist(currentMovie, 'completed');
      } else if (inWatchlist.status !== 'completed') {
        await reviewService.updateWatchlistStatus(currentMovie.id, 'completed');
      }

      await reviewService.addReview(currentMovie.id, reviewData);
      
      // Reload
      const updatedReviews = await reviewService.getReviews(currentMovie.id);
      setReviews(updatedReviews);
      const updatedWatchlist = await reviewService.getWatchlist();
      setWatchlist(updatedWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  // Like / helpful click on review
  const handleLikeReview = async (reviewId) => {
    if (!currentMovie) return;
    try {
      await reviewService.likeReview(currentMovie.id, reviewId, 'currentUser');
      const updatedReviews = await reviewService.getReviews(currentMovie.id);
      setReviews(updatedReviews);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle watchlist button on Discover Tab
  const handleToggleWatchlistButton = async () => {
    if (!currentMovie) return;
    const inWatchlist = watchlist.some(w => w.id === currentMovie.id);
    try {
      if (inWatchlist) {
        await reviewService.removeFromWatchlist(currentMovie.id);
      } else {
        await reviewService.addToWatchlist(currentMovie, 'wishlist');
      }
      const updatedWatchlist = await reviewService.getWatchlist();
      setWatchlist(updatedWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle favorite shelf button
  const handleToggleFavoriteButton = async (customNote = "") => {
    if (!currentMovie) return;
    try {
      await reviewService.toggleFavorite(currentMovie, customNote);
      const updatedFavs = await reviewService.getFavorites();
      setFavorites(updatedFavs);
    } catch (err) {
      console.error(err);
    }
  };

  // Watchlist Column Drag/Update
  const handleUpdateWatchlistStatus = async (itemId, status, progress) => {
    try {
      await reviewService.updateWatchlistStatus(itemId, status, progress);
      const updatedWatchlist = await reviewService.getWatchlist();
      setWatchlist(updatedWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  // Remove item from Watchlist Column
  const handleRemoveFromWatchlist = async (itemId) => {
    try {
      await reviewService.removeFromWatchlist(itemId);
      const updatedWatchlist = await reviewService.getWatchlist();
      setWatchlist(updatedWatchlist);
    } catch (err) {
      console.error(err);
    }
  };

  const isCurrentMovieInWatchlist = currentMovie && watchlist.some(w => w.id === currentMovie.id);
  const isCurrentMovieInFavorites = currentMovie && favorites.some(f => f.id === currentMovie.id);
  
  // Find current user's rating for current movie (if any)
  const currentUserRating = currentMovie && (
    watchlist.find(w => w.id === currentMovie.id)?.userRating || 
    reviews.find(r => r.user === "CurrentUser")?.rating || 
    0
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Header */}
      <header className="glass-panel" style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        borderRadius: 0, 
        borderTop: 'none', 
        borderLeft: 'none', 
        borderRight: 'none', 
        padding: '16px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(11, 8, 22, 0.85)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.8rem' }}>🍿</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.5px' }} className="gradient-text">
            CineCircle
          </h1>
        </div>

        <nav style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setActiveTab('discover')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'discover' ? 'var(--accent-neon)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              borderBottom: activeTab === 'discover' ? '2px solid var(--accent-neon)' : '2px solid transparent'
            }}
          >
            🎬 Discover
          </button>
          <button
            onClick={() => setActiveTab('library')}
            style={{
              background: 'none',
              border: 'none',
              color: activeTab === 'library' ? 'var(--accent-secondary)' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: '0.95rem',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 'var(--radius-sm)',
              transition: 'all var(--transition-fast)',
              borderBottom: activeTab === 'library' ? '2px solid var(--accent-secondary)' : '2px solid transparent'
            }}
          >
            📂 My Library
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '32px 40px', maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '64px', fontSize: '1.2rem', color: 'var(--accent-neon)' }}>
            Loading your cinema space...
          </div>
        )}

        {!loading && activeTab === 'discover' && currentMovie && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '32px' }} className="animate-fade-in">
            
            {/* Discover Left Sidebar - Sandbox Selector */}
            <div className="glass-panel" style={{ padding: '20px', height: 'fit-content' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Browse Catalog
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: '1.4' }}>
                Select a title below to manage ratings, reviews, and library status.
              </p>
              
              {/* Local Search Input */}
              <input 
                type="text"
                placeholder="Search titles..."
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  marginBottom: '16px',
                  transition: 'all var(--transition-fast)'
                }}
              />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {movies
                  .filter(movie => movie.title.toLowerCase().includes(sidebarSearch.toLowerCase()))
                  .map(movie => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: selectedMovieId === movie.id ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.02)',
                      border: selectedMovieId === movie.id ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid var(--border-glass)',
                      textAlign: 'left',
                      color: selectedMovieId === movie.id ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: selectedMovieId === movie.id ? '600' : '400',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{movie.type === 'show' ? '📺' : '🎬'}</span>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {movie.title}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Discover Right Main Detail Section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Media Detail Backdrop Banner */}
              <div 
                className="glass-panel" 
                style={{ 
                  position: 'relative',
                  backgroundImage: `linear-gradient(rgba(11, 8, 22, 0.75), rgba(11, 8, 22, 0.95)), url(${currentMovie.backdrop})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  minHeight: '260px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '32px',
                  overflow: 'hidden'
                }}
              >
                <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-end', zIndex: 2, flexWrap: 'wrap' }}>
                  {/* Poster Image */}
                  <img 
                    src={currentMovie.poster} 
                    alt={currentMovie.title} 
                    style={{ 
                      width: '130px', 
                      height: '190px', 
                      borderRadius: 'var(--radius-sm)', 
                      objectFit: 'cover',
                      boxShadow: '0 12px 24px rgba(0,0,0,0.5)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />

                  {/* Info Column */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '2rem', lineHeight: '1.2' }}>
                        {currentMovie.title}
                      </h2>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: '700', 
                        textTransform: 'uppercase', 
                        background: 'rgba(6, 182, 212, 0.2)', 
                        color: 'var(--accent-neon)', 
                        padding: '3px 8px', 
                        borderRadius: 'var(--radius-sm)',
                        height: 'fit-content'
                      }}>
                        {currentMovie.type}
                      </span>
                    </div>

                    {/* OTT streaming platforms availability */}
                    {currentMovie.ottPlatforms && currentMovie.ottPlatforms.length > 0 && (
                      <div style={{ display: 'flex', gap: '6px', margin: '4px 0 10px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stream on:</span>
                        {currentMovie.ottPlatforms.map(platform => (
                          <span 
                            key={platform} 
                            style={{ 
                              fontSize: '0.65rem', 
                              background: 'rgba(6, 182, 212, 0.12)', 
                              border: '1px solid rgba(6, 182, 212, 0.25)', 
                              color: 'var(--accent-neon)', 
                              padding: '1px 6px', 
                              borderRadius: '4px',
                              fontWeight: '600'
                            }}
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '8px 0 16px' }}>
                      <span>🗓️ {currentMovie.year}</span>
                      <span>⏱️ {currentMovie.duration}</span>
                      <span>🎬 {currentMovie.director}</span>
                      <span>📂 {currentMovie.genre}</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '700px', lineHeight: '1.5', marginBottom: '20px' }}>
                      {currentMovie.overview}
                    </p>

                    {/* Quick Add To Buttons */}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {/* Watchlist Toggle */}
                      <button
                        onClick={handleToggleWatchlistButton}
                        className={!isCurrentMovieInWatchlist ? 'gradient-btn' : ''}
                        style={{
                          padding: '8px 20px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          ...(isCurrentMovieInWatchlist ? {
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--border-glass)',
                            color: 'var(--text-primary)'
                          } : {})
                        }}
                      >
                        {isCurrentMovieInWatchlist ? '✓ In Watchlist' : '➕ Add Watchlist'}
                      </button>

                      {/* Favorite Toggle */}
                      <button
                        onClick={() => handleToggleFavoriteButton()}
                        style={{
                          padding: '8px 16px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          background: isCurrentMovieInFavorites ? 'rgba(236, 72, 153, 0.15)' : 'rgba(255,255,255,0.05)',
                          border: isCurrentMovieInFavorites ? '1px solid rgba(236, 72, 153, 0.4)' : '1px solid var(--border-glass)',
                          color: isCurrentMovieInFavorites ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          transition: 'all var(--transition-fast)'
                        }}
                      >
                        <span>{isCurrentMovieInFavorites ? '❤️ Favorites' : '♡ Add Favorites'}</span>
                      </button>
                    </div>

                  </div>
                </div>
              </div>

              {/* Review & Stats Split Container */}
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px', alignItems: 'start' }}>
                <RatingSystem 
                  mediaId={currentMovie.id} 
                  reviews={reviews} 
                  onRatingSubmit={handleRatingSubmit}
                  userRating={currentUserRating}
                />
                
                <ReviewList 
                  mediaId={currentMovie.id} 
                  reviews={reviews} 
                  onReviewSubmit={handleReviewSubmit}
                  onLikeReview={handleLikeReview}
                />
              </div>

            </div>
          </div>
        )}

        {/* Tab 2: My Library Dashboard */}
        {!loading && activeTab === 'library' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
            
            {/* Favorites Shelf */}
            <Favorites 
              items={favorites}
              onToggleFavorite={handleToggleFavoriteButton}
              onSelectItem={handleSelectFromLibrary}
            />

            {/* Watchlist Kanban columns */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px', fontWeight: '700' }}>
                📋 My Watchlist Board
              </h3>
              <Watchlist 
                items={watchlist}
                onUpdateStatus={handleUpdateWatchlistStatus}
                onRemove={handleRemoveFromWatchlist}
                onSelectItem={handleSelectFromLibrary}
              />
            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="glass-panel" style={{ 
        marginTop: 'auto', 
        borderRadius: 0, 
        borderBottom: 'none', 
        borderLeft: 'none', 
        borderRight: 'none',
        padding: '24px 40px',
        textAlign: 'center',
        fontSize: '0.8rem',
        color: 'var(--text-muted)'
      }}>
        <div>CineCircle Discovery Platform • Web Wonders 2026 Theme: Media & Entertainment</div>
        <div style={{ marginTop: '4px' }}>Created with ❤️ for Reviews & Watchlist Module</div>
      </footer>

    </div>
  );
}
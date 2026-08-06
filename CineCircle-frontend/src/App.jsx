import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Browse from './pages/Browse';
import MovieDetail from './pages/MovieDetail';
import TrailerModal from './components/TrailerModal';
import WatchlistModal from './components/WatchlistModal';
import WatchPartyModal from './components/WatchPartyModal';
import './App.css';

function App() {
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);

  // Safe Search state (ON by default)
  const [safeSearch, setSafeSearch] = useState(() => {
    try {
      const saved = localStorage.getItem('1flex_safe_search');
      return saved !== null ? JSON.parse(saved) : true;
    } catch (e) {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('1flex_safe_search', JSON.stringify(safeSearch));
    } catch (e) {
      console.error('Failed to save safe search preference:', e);
    }
  }, [safeSearch]);

  // Watchlist persisted in localStorage
  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('cinecircle_watchlist');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cinecircle_watchlist', JSON.stringify(watchlist));
    } catch (e) {
      console.error('Failed to save watchlist:', e);
    }
  }, [watchlist]);

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  const removeFromWatchlist = (id) => {
    setWatchlist((prev) => prev.filter((m) => m.id !== id));
  };

  const isInWatchlist = (id) => {
    return watchlist.some((m) => m.id === id);
  };

  return (
    <div className="app-container">
      <Navbar
        watchlistCount={watchlist.length}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        onOpenWatchParty={() => setIsWatchPartyOpen(true)}
        safeSearch={safeSearch}
        onToggleSafeSearch={() => setSafeSearch((prev) => !prev)}
      />

      <Routes>
        <Route
          path="/"
          element={
            <Home
              onPlayTrailer={(movie) => setActiveTrailer(movie)}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              onOpenWatchParty={() => setIsWatchPartyOpen(true)}
              safeSearch={safeSearch}
            />
          }
        />
        <Route
          path="/search"
          element={
            <SearchResults
              onPlayTrailer={(movie) => setActiveTrailer(movie)}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
          }
        />
        <Route
          path="/browse"
          element={
            <Browse
              onPlayTrailer={(movie) => setActiveTrailer(movie)}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
          }
        />
        <Route
          path="/movie/:id"
          element={
            <MovieDetail
              onPlayTrailer={(movie) => setActiveTrailer(movie)}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
            />
          }
        />
      </Routes>

      {/* Video Trailer Playback Modal */}
      {activeTrailer && (
        <TrailerModal
          movie={activeTrailer}
          onClose={() => setActiveTrailer(null)}
        />
      )}

      {/* Watchlist Drawer Modal */}
      <WatchlistModal
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        onRemoveFromWatchlist={removeFromWatchlist}
        onPlayTrailer={(movie) => setActiveTrailer(movie)}
      />

      {/* Watch Party Room Creation Modal */}
      <WatchPartyModal
        isOpen={isWatchPartyOpen}
        onClose={() => setIsWatchPartyOpen(false)}
      />

      <footer className="cinecircle-footer">
        <div className="footer-content">
          <p>© 2026 CINECIRCLE • Premium Movie Discovery & Streaming Platform</p>
          <div className="footer-links">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Help Center</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
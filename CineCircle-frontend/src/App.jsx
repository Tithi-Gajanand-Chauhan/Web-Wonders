import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Browse from './pages/Browse';
import MovieDetail from './pages/Moviedetail';
import TrailerModal from './components/TrailerModal';
import WatchlistModal from './components/WatchlistModal';
import WatchPartyModal from './components/WatchPartyModal';
import CreateGroup from './pages/CreateGroup';
import JoinGroup from './pages/JoinGroup';
import GroupLobby from './pages/GroupLobby';
import Preferences from './pages/Preferences';
import Recommendation from './pages/Recommendation';
import AuthModal from './components/AuthModal';
import IntroPage from './pages/IntroPage';
import ExploreAll from './pages/ExploreAll';
import OfficialLists from './pages/OfficialLists';
import ProfileDashboard from './pages/ProfileDashboard';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [activeTrailer, setActiveTrailer] = useState(null);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState(false);
  const [isWatchPartyOpen, setIsWatchPartyOpen] = useState(false);
  
  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cinecircle_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('cinecircle_token') || null;
  });

  const handleAuthSuccess = (newToken, newUser) => {
    try {
      localStorage.setItem('cinecircle_token', newToken);
      localStorage.setItem('cinecircle_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
    } catch (e) {
      console.error('Failed to save auth session:', e);
    }
  };

  const handleLogout = async () => {
    try {
      const savedUser = localStorage.getItem('cinecircle_user');
      const parsedUser = savedUser ? JSON.parse(savedUser) : null;
      if (parsedUser) {
        await fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: parsedUser.id || parsedUser._id })
        }).catch(err => console.error("Logout request failed:", err));
      }
      localStorage.removeItem('cinecircle_token');
      localStorage.removeItem('cinecircle_user');
      setToken(null);
      setUser(null);
      navigate('/');
    } catch (e) {
      console.error('Failed to clear auth session:', e);
    }
  };

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

  const getWatchlistKey = (currUser) => {
    return currUser ? `cinecircle_watchlist_${currUser.id || currUser._id}` : 'cinecircle_watchlist_guest';
  };

  // Watchlist persisted in localStorage, scoped to the active user
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    try {
      const key = getWatchlistKey(user);
      const saved = localStorage.getItem(key);
      setWatchlist(saved ? JSON.parse(saved) : []);
    } catch (e) {
      setWatchlist([]);
    }
  }, [user]);

  const toggleWatchlist = (movie) => {
    if (!user) {
      alert('Please log in or sign up to save movies to your watchlist.');
      setIsAuthOpen(true);
      return;
    }
    setWatchlist((prev) => {
      const exists = prev.some((m) => m.id === movie.id);
      const nextList = exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
      try {
        localStorage.setItem(getWatchlistKey(user), JSON.stringify(nextList));
      } catch (e) {
        console.error('Failed to save watchlist:', e);
      }
      return nextList;
    });
  };

  const removeFromWatchlist = (id) => {
    setWatchlist((prev) => {
      const nextList = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(getWatchlistKey(user), JSON.stringify(nextList));
      } catch (e) {
        console.error('Failed to save watchlist:', e);
      }
      return nextList;
    });
  };

  const isInWatchlist = (id) => {
    return watchlist.some((m) => m.id === id);
  };

  const location = useLocation();
  const isIntroPage = location.pathname === '/';

  return (
    <div className="app-container">
      {!isIntroPage && (
        <Navbar
          watchlistCount={watchlist.length}
          onOpenWatchlist={() => setIsWatchlistOpen(true)}
          onOpenWatchParty={() => setIsWatchPartyOpen(true)}
          safeSearch={safeSearch}
          onToggleSafeSearch={() => setSafeSearch((prev) => !prev)}
          user={user}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLogout={handleLogout}
        />
      )}

      <Routes>
        <Route path="/" element={<IntroPage onOpenAuth={() => setIsAuthOpen(true)} user={user} />} />
        <Route
          path="/home"
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
              safeSearch={safeSearch}
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
              safeSearch={safeSearch}
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
              user={user}
            />
          }
        />
        <Route path="/create-group" element={<CreateGroup />} />
        <Route path="/join-group" element={<JoinGroup />} />
        <Route path="/lobby" element={<GroupLobby />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/recommendation" element={<Recommendation />} />
        <Route path="/lists" element={<OfficialLists />} />
        <Route path="/profile" element={<ProfileDashboard user={user} />} />
        <Route
          path="/explore/:section"
          element={
            <ExploreAll
              onPlayTrailer={(movie) => setActiveTrailer(movie)}
              onToggleWatchlist={toggleWatchlist}
              isInWatchlist={isInWatchlist}
              safeSearch={safeSearch}
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
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Watch Party Room Creation Modal */}
      <WatchPartyModal
        isOpen={isWatchPartyOpen}
        onClose={() => setIsWatchPartyOpen(false)}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Authentication Login/Signup Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {!isIntroPage && (
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
      )}
    </div>
  );
}

export default App;
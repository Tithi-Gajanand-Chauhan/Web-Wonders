import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchMovies } from '../services/api';

function Navbar({ watchlistCount = 0, onOpenWatchlist, onOpenWatchParty, safeSearch = true, onToggleSafeSearch }) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await searchMovies(query);
        setSearchResults((res.results || []).slice(0, 5));
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92';

  return (
    <header className="navbar-container">
      <div className="navbar-left">
        <div className="navbar-brand" onClick={() => navigate('/')}>
          <span className="brand-logo-text">
            <span style={{ color: 'var(--primary-red)' }}>CINE</span>CIRCLE
            <span className="brand-badge">CINEMA</span>
          </span>
        </div>

        <nav className="navbar-links">
          <button
            className={`nav-link-pill ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Home
          </button>
          <button
            className={`nav-link-pill ${location.pathname === '/browse' ? 'active' : ''}`}
            onClick={() => navigate('/browse')}
          >
            Movies
          </button>
          <button className="nav-link-pill" onClick={onOpenWatchlist}>
            My List {watchlistCount > 0 && `(${watchlistCount})`}
          </button>
          <button className="nav-link-pill" onClick={onOpenWatchParty}>
            Watch Party
          </button>
        </nav>
      </div>

      <div className="navbar-right">
        {/* Safe Search Toggle Button */}
        <button
          className={`safe-search-toggle-btn ${safeSearch ? 'on' : 'off'}`}
          onClick={onToggleSafeSearch}
          title={safeSearch ? 'Safe Search is ON (Adult content filtered)' : 'Safe Search is OFF'}
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span>Safe Search</span>
          <span className="safe-status-badge">{safeSearch ? 'ON' : 'OFF'}</span>
        </button>

        {/* Search Input with Clean SVG Icon */}
        <form className="search-form" onSubmit={handleSearchSubmit} ref={searchRef}>
          <div className="search-input-wrapper">
            <svg className="search-svg-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search titles, actors..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setShowDropdown(true)}
              className="navbar-search-input"
            />
            {query && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Clean Autocomplete Popover */}
          {showDropdown && (
            <div className="search-dropdown">
              {isSearching ? (
                <div className="dropdown-status">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="dropdown-section-title">Results</div>
                  {searchResults.map((m) => (
                    <div
                      key={m.id}
                      className="dropdown-item"
                      onClick={() => {
                        setShowDropdown(false);
                        setQuery('');
                        navigate(`/movie/${m.id}`);
                      }}
                    >
                      <img
                        src={
                          m.poster_path
                            ? `${IMAGE_BASE_URL}${m.poster_path}`
                            : 'https://via.placeholder.com/45'
                        }
                        alt={m.title}
                        className="dropdown-thumb"
                      />
                      <div className="dropdown-item-info">
                        <span className="dropdown-item-title">{m.title}</span>
                        <div className="dropdown-item-meta">
                          <span>Rating {m.vote_average?.toFixed(1)}</span>
                          <span>•</span>
                          <span>{m.release_date?.split('-')[0]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="dropdown-status">No matching titles found</div>
              )}
            </div>
          )}
        </form>

        {/* Clean Icon Buttons: Watchlist & Profile */}
        <button className="nav-icon-btn" onClick={onOpenWatchlist} title="My List">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>

        <div className="nav-user-avatar" title="Account Settings">
          <span>JS</span>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
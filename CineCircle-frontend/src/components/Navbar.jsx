import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchMovies } from '../services/api';

function Navbar({
  watchlistCount = 0,
  onOpenWatchlist,
  onOpenWatchParty,
  safeSearch = true,
  onToggleSafeSearch,
  genres = [],
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  ratingFilter,
  setRatingFilter,
  industryFilter,
  setIndustryFilter,
  categoryFilter,
  setCategoryFilter,
}) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  // Overlay state
  const [activeOverlay, setActiveOverlay] = useState(null); // 'genre' | 'country' | 'category' | 'year' | 'rating' | null
  const [draftValue, setDraftValue] = useState('');
  const [panelSearch, setPanelSearch] = useState('');

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

  // Keyboard Escape key handler to close overlay
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeOverlay();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowDropdown(false);
      setActiveOverlay(null);
      setQuery('');
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  // Helper names
  const getGenreName = (id) => {
    const found = genres.find((g) => String(g.id) === id);
    return found ? found.name : '';
  };

  const getCountryName = (id) => {
    const countries = {
      hollywood: 'Hollywood',
      bollywood: 'Bollywood',
      tollywood: 'Tollywood',
      kollywood: 'Kollywood',
      malayalam: 'Malayalam',
      kannada: 'Kannada',
      bengali: 'Bengali',
    };
    return countries[id] || '';
  };

  const getCategoryName = (id) => {
    const cats = {
      movies: 'Movies',
      tv: 'TV Shows',
      animation: 'Cartoons',
    };
    return cats[id] || '';
  };

  // Filters source
  const getGenreOptions = () => genres.map((g) => ({ id: String(g.id), name: g.name }));
  const getCountryOptions = () => [
    { id: 'hollywood', name: 'Hollywood (English)' },
    { id: 'bollywood', name: 'Bollywood (Hindi)' },
    { id: 'tollywood', name: 'Tollywood (Telugu)' },
    { id: 'kollywood', name: 'Kollywood (Tamil)' },
    { id: 'malayalam', name: 'Malayalam' },
    { id: 'kannada', name: 'Kannada' },
    { id: 'bengali', name: 'Bengali' },
  ];
  const getCategoryOptions = () => [
    { id: 'movies', name: 'Movies' },
    { id: 'tv', name: 'TV Shows' },
    { id: 'animation', name: 'Cartoons & Animation' },
  ];
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 20 }, (_, i) => ({
      id: String(currentYear - i),
      name: String(currentYear - i),
    }));
  };
  const getRatingOptions = () => [
    { id: '9', name: 'Rating 9.0+' },
    { id: '8', name: 'Rating 8.0+' },
    { id: '7', name: 'Rating 7.0+' },
  ];

  const getOptionsForPanel = () => {
    switch (activeOverlay) {
      case 'genre': return getGenreOptions();
      case 'country': return getCountryOptions();
      case 'category': return getCategoryOptions();
      case 'year': return getYearOptions();
      case 'rating': return getRatingOptions();
      default: return [];
    }
  };

  const closeOverlay = () => {
    setActiveOverlay(null);
    setPanelSearch('');
  };

  const handleNavFilterClick = (type) => {
    if (activeOverlay === type) {
      closeOverlay();
    } else {
      setActiveOverlay(type);
      setPanelSearch('');
      // Initialize draft value with current active global value
      if (type === 'genre') setDraftValue(genreFilter);
      else if (type === 'country') setDraftValue(industryFilter);
      else if (type === 'category') setDraftValue(categoryFilter);
      else if (type === 'year') setDraftValue(yearFilter);
      else if (type === 'rating') setDraftValue(ratingFilter);
    }
  };

  const handleApply = () => {
    if (activeOverlay === 'genre') setGenreFilter(draftValue);
    else if (activeOverlay === 'country') setIndustryFilter(draftValue);
    else if (activeOverlay === 'category') setCategoryFilter(draftValue);
    else if (activeOverlay === 'year') setYearFilter(draftValue);
    else if (activeOverlay === 'rating') setRatingFilter(draftValue);
    closeOverlay();
  };

  const handleClear = () => {
    setDraftValue('');
    if (activeOverlay === 'genre') setGenreFilter('');
    else if (activeOverlay === 'country') setIndustryFilter('');
    else if (activeOverlay === 'category') setCategoryFilter('');
    else if (activeOverlay === 'year') setYearFilter('');
    else if (activeOverlay === 'rating') setRatingFilter('');
    closeOverlay();
  };

  const options = getOptionsForPanel();
  const filteredOptions = options.filter((opt) =>
    opt.name.toLowerCase().includes(panelSearch.toLowerCase())
  );

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w92';
  const showFilters = ['/', '/browse', '/search'].includes(location.pathname);

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        <div className="navbar-left">
          <div className="navbar-brand" onClick={() => { navigate('/'); closeOverlay(); }}>
            <span className="brand-logo-text">
              <span style={{ color: 'var(--primary-red)' }}>CINE</span>CIRCLE
              <span className="brand-badge">CINEMA</span>
            </span>
          </div>

          <nav className="navbar-links">
            <button
              className={`nav-link-item ${location.pathname === '/' && !activeOverlay ? 'active' : ''}`}
              onClick={() => { navigate('/'); closeOverlay(); }}
            >
              Home
            </button>

            {showFilters && (
              <>
                <button
                  className={`nav-link-item ${activeOverlay === 'genre' ? 'active' : ''} ${genreFilter ? 'has-filter' : ''}`}
                  onClick={() => handleNavFilterClick('genre')}
                >
                  Genre {genreFilter ? `(${getGenreName(genreFilter)})` : ''}
                </button>
                <button
                  className={`nav-link-item ${activeOverlay === 'country' ? 'active' : ''} ${industryFilter ? 'has-filter' : ''}`}
                  onClick={() => handleNavFilterClick('country')}
                >
                  Country {industryFilter ? `(${getCountryName(industryFilter)})` : ''}
                </button>
                <button
                  className={`nav-link-item ${activeOverlay === 'category' ? 'active' : ''} ${categoryFilter ? 'has-filter' : ''}`}
                  onClick={() => handleNavFilterClick('category')}
                >
                  Category {categoryFilter ? `(${getCategoryName(categoryFilter)})` : ''}
                </button>
                <button
                  className={`nav-link-item ${activeOverlay === 'year' ? 'active' : ''} ${yearFilter ? 'has-filter' : ''}`}
                  onClick={() => handleNavFilterClick('year')}
                >
                  Year {yearFilter ? `(${yearFilter})` : ''}
                </button>
                <button
                  className={`nav-link-item ${activeOverlay === 'rating' ? 'active' : ''} ${ratingFilter ? 'has-filter' : ''}`}
                  onClick={() => handleNavFilterClick('rating')}
                >
                  Rating {ratingFilter ? `(${ratingFilter}+)` : ''}
                </button>
              </>
            )}

            <button
              className={`nav-link-item ${location.pathname === '/browse' ? 'active' : ''}`}
              onClick={() => { navigate('/browse'); closeOverlay(); }}
            >
              All Library
            </button>
            <button className="nav-link-item" onClick={() => { onOpenWatchlist(); closeOverlay(); }}>
              My List {watchlistCount > 0 && `(${watchlistCount})`}
            </button>
            <button className="nav-link-item" onClick={() => { onOpenWatchParty(); closeOverlay(); }}>
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
                          closeOverlay();
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
          <button className="nav-icon-btn" onClick={() => { onOpenWatchlist(); closeOverlay(); }} title="My List">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          <div className="nav-user-avatar" title="Account Settings">
            <span>JS</span>
          </div>
        </div>
      </div>

      {activeOverlay && (
        <>
          {/* Blur & Dim backdrop below navbar */}
          <div className="filter-overlay-backdrop" onClick={closeOverlay}></div>

          {/* Overlay Panel content */}
          <div className="filter-overlay-panel">
            <div className="overlay-header">
              <h3 className="overlay-title">Select {activeOverlay.charAt(0).toUpperCase() + activeOverlay.slice(1)}</h3>
              <div className="overlay-search-wrapper">
                <svg className="overlay-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder={`Search ${activeOverlay} options...`}
                  value={panelSearch}
                  onChange={(e) => setPanelSearch(e.target.value)}
                  className="overlay-search-input"
                  autoFocus
                />
                {panelSearch && (
                  <button className="overlay-search-clear" onClick={() => setPanelSearch('')}>✕</button>
                )}
              </div>
            </div>

            <div className="overlay-options-grid">
              {filteredOptions.length === 0 ? (
                <div className="overlay-no-results">No options match "{panelSearch}"</div>
              ) : (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.id}
                    className={`overlay-option-pill ${draftValue === opt.id ? 'selected' : ''}`}
                    onClick={() => setDraftValue(draftValue === opt.id ? '' : opt.id)}
                  >
                    <span className="pill-checkbox">
                      {draftValue === opt.id && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="10" height="10">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className="pill-label">{opt.name}</span>
                  </button>
                ))
              )}
            </div>

            <div className="overlay-footer">
              <button className="overlay-btn-clear" onClick={handleClear}>
                Clear Filter
              </button>
              <div className="overlay-footer-right">
                <button className="overlay-btn-cancel" onClick={closeOverlay}>
                  Cancel
                </button>
                <button className="overlay-btn-apply" onClick={handleApply}>
                  Apply Filter
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export default Navbar;
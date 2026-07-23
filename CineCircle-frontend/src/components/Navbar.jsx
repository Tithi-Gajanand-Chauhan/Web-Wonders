import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim() === '') return;

    const timer = setTimeout(() => {
      navigate(`/search?query=${encodeURIComponent(query.trim())}`);
    }, 500);

    return () => clearTimeout(timer);
  }, [query, navigate]);

  return (
    <nav className="navbar">
      <span className="navbar-logo" onClick={() => navigate('/')}>
        CineCircle
      </span>
      <input
        type="text"
        placeholder="Search movies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="navbar-search"
      />
    </nav>
  );
}

export default Navbar;
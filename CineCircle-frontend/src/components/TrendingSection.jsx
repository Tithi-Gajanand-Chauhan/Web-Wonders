import { useState, useEffect } from 'react';
import MovieRow from './MovieRow';
import { getTrendingMovies, getRecentMovies } from '../services/api';

function TrendingSection({ onPlayTrailer, onToggleWatchlist, isInWatchlist }) {
  const [activeTab, setActiveTab] = useState('day'); // 'day', 'week', 'month', 'recent'
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrending() {
      try {
        setLoading(true);
        if (activeTab === 'recent') {
          const data = await getRecentMovies();
          setMovies(data.results || []);
        } else if (activeTab === 'month') {
          // For monthly trending, get week trending sorted by high rating/popularity
          const data = await getTrendingMovies('week');
          const sorted = [...(data.results || [])].sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
          setMovies(sorted);
        } else {
          const data = await getTrendingMovies(activeTab);
          setMovies(data.results || []);
        }
      } catch (err) {
        console.error('Failed to fetch trending movies:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, [activeTab]);

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'day': return 'Today Trending';
      case 'week': return 'Weekly Trending';
      case 'month': return 'Monthly Trending';
      case 'recent': return 'New Releases';
      default: return 'Top 10 Today';
    }
  };

  return (
    <div className="trending-section-container">
      <div className="trending-toggle-bar">
        <button
          className={`toggle-tab ${activeTab === 'day' ? 'active' : ''}`}
          onClick={() => setActiveTab('day')}
        >
          Today Trending
        </button>
        <button
          className={`toggle-tab ${activeTab === 'week' ? 'active' : ''}`}
          onClick={() => setActiveTab('week')}
        >
          Weekly Trending
        </button>
        <button
          className={`toggle-tab ${activeTab === 'month' ? 'active' : ''}`}
          onClick={() => setActiveTab('month')}
        >
          Monthly Trending
        </button>
        <button
          className={`toggle-tab ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          New Releases
        </button>
      </div>

      {loading ? (
        <div className="status-message">Loading titles...</div>
      ) : (
        <MovieRow
          title={`Top 10 ${getSectionTitle()}`}
          movies={movies.slice(0, 10)}
          isTop10={true}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />
      )}
    </div>
  );
}

export default TrendingSection;
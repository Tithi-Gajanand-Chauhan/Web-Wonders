import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchWatchedList, fetchLikesList } from '../services/api';
import './ProfileDashboard.css';

function ProfileDashboard({ user }) {
  const navigate = useNavigate();
  const [watchedList, setWatchedList] = useState([]);
  const [likedList, setLikedList] = useState([]);
  const [recentRooms, setRecentRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [watchedData, likedData] = await Promise.all([
          fetchWatchedList(),
          fetchLikesList()
        ]);
        setWatchedList(watchedData || []);
        setLikedList(likedData || []);
      } catch (e) {
        console.error("Failed to load dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }

    loadData();

    // Load recent rooms
    try {
      const userId = user.id || user._id;
      const key = `cinecircle_recent_rooms_${userId}`;
      const saved = localStorage.getItem(key);
      setRecentRooms(saved ? JSON.parse(saved) : []);
    } catch (e) {
      console.error(e);
    }
  }, [user, navigate]);

  const handleReenterRoom = async (code, name, username) => {
    const rejoinName = user ? user.username : (username || 'Guest');
    const oldUsername = (user && username && username !== user.username) ? username : undefined;
    try {
      const response = await fetch("https://cinecircle-backend-gjfd.onrender.com/api/groups/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, username: rejoinName, oldUsername })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        navigate("/lobby", {
          state: {
            groupName: data.group.groupName || name,
            groupCode: data.group.code,
            currentUser: rejoinName,
            members: data.group.members || [],
          }
        });
      } else {
        alert(data.message || "Failed to rejoin room.");
      }
    } catch (e) {
      console.error("Rejoin error:", e);
      alert("Server connection error.");
    }
  };

  // Calculations
  const totalWatched = watchedList.length;
  const totalLiked = likedList.length;
  const avgRuntime = 115; // mock average movie runtime in minutes
  const totalMinutes = totalWatched * avgRuntime;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  // Genre breakdown
  const genresCount = {};
  const allMovies = [...watchedList, ...likedList];
  
  allMovies.forEach(m => {
    if (m.genres && Array.isArray(m.genres)) {
      m.genres.forEach(g => {
        const name = typeof g === 'object' ? g.name : g;
        if (name) {
          genresCount[name] = (genresCount[name] || 0) + 1;
        }
      });
    } else if (m.genre_ids && Array.isArray(m.genre_ids)) {
      const genreMap = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
        99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
        27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
        10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western'
      };
      m.genre_ids.forEach(id => {
        const name = genreMap[id];
        if (name) {
          genresCount[name] = (genresCount[name] || 0) + 1;
        }
      });
    }
  });

  const totalGenresCount = Object.values(genresCount).reduce((a, b) => a + b, 0);
  
  const sortedGenres = Object.entries(genresCount)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalGenresCount > 0 ? Math.round((count / totalGenresCount) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // top 5 genres

  if (!user) return null;

  return (
    <div className="profile-dashboard-page">
      {/* Hero Welcome Banner */}
      <div className="profile-hero-card">
        <div className="profile-hero-glow" />
        <div className="profile-hero-avatar">
          {user.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="profile-hero-details">
          <h1>{user.username}</h1>
          <p>{user.email || "No email linked"}</p>
          <p>🎬 CineCircle Film Enthusiast</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="profile-stats-grid">
        <div className="profile-stat-card">
          <span className="profile-stat-label">Watched Films</span>
          <span className="profile-stat-value">{totalWatched}</span>
          <span className="profile-stat-subtext">Marked in history</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-label">Liked Films</span>
          <span className="profile-stat-value">{totalLiked}</span>
          <span className="profile-stat-subtext">Saved in favorites</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-label">Screen Time</span>
          <span className="profile-stat-value">
            {totalHours}h {remainingMinutes}m
          </span>
          <span className="profile-stat-subtext">Estimated duration</span>
        </div>
        <div className="profile-stat-card">
          <span className="profile-stat-label">Member Since</span>
          <span className="profile-stat-value">2026</span>
          <span className="profile-stat-subtext">Active CineCircle user</span>
        </div>
      </div>

      {/* Main layout: Genre stats & Room history */}
      <div className="profile-main-layout">
        {/* Genre Distribution */}
        <div className="profile-section-card">
          <h2>📊 Favorite Genres</h2>
          {sortedGenres.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>
              <p>No genre data available yet.</p>
              <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Mark movies as watched or like them to unlock genre analytics!</p>
            </div>
          ) : (
            <div className="genre-distribution-list">
              {sortedGenres.map((g, idx) => (
                <div key={idx} className="genre-bar-item">
                  <div className="genre-bar-header">
                    <span>{g.name}</span>
                    <span>{g.percentage}% ({g.count} titles)</span>
                  </div>
                  <div className="genre-bar-track">
                    <div className="genre-bar-fill" style={{ width: `${g.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Watch Parties */}
        <div className="profile-section-card">
          <h2>🍿 Recent Rooms</h2>
          {recentRooms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#6b7280', fontSize: '0.85rem' }}>
              No recent Watch Parties found.
            </div>
          ) : (
            <div className="recent-parties-list">
              {recentRooms.map((room) => (
                <div key={room.code} className="recent-party-row">
                  <div className="recent-party-info">
                    <span className="recent-party-name">{room.name}</span>
                    <span className="recent-party-code">{room.code}</span>
                  </div>
                  <button
                    className="btn-rejoin-party"
                    onClick={() => handleReenterRoom(room.code, room.name, room.username)}
                  >
                    Rejoin
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfileDashboard;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  fetchCustomLists, 
  createCustomList, 
  deleteCustomList, 
  removeMovieFromCustomList,
  fetchWatchedList,
  toggleWatchedStatus,
  fetchLikesList,
  toggleLike
} from '../services/api';

function WatchlistModal({ isOpen, onClose, watchlist, onRemoveFromWatchlist, onPlayTrailer, user, onOpenAuth }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist', 'watched', 'likes', 'custom'
  const [customLists, setCustomLists] = useState([]);
  const [watchedList, setWatchedList] = useState([]);
  const [likedList, setLikedList] = useState([]);
  const [selectedList, setSelectedList] = useState(null); // to drill down into a list
  const [newListName, setNewListName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      loadWatchedList();
      loadLikedList();
      if (activeTab === 'custom') {
        loadCustomLists();
      }
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && user && activeTab === 'custom') {
      loadCustomLists();
    }
  }, [activeTab]);

  const loadWatchedList = async () => {
    try {
      setLoading(true);
      const data = await fetchWatchedList();
      const movies = data.map(item => ({
        id: item.movieId,
        title: item.title || 'Untitled Movie',
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date
      }));
      setWatchedList(movies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadLikedList = async () => {
    try {
      setLoading(true);
      const data = await fetchLikesList();
      const movies = data.map(item => ({
        id: item.movieId,
        title: item.title || 'Untitled Movie',
        poster_path: item.poster_path,
        vote_average: item.vote_average,
        release_date: item.release_date
      }));
      setLikedList(movies);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveWatched = async (movieId) => {
    try {
      const movieObj = watchedList.find(m => m.id === movieId);
      await toggleWatchedStatus(movieId, movieObj);
      setWatchedList(prev => prev.filter(m => m.id !== movieId));
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemoveLiked = async (movieId) => {
    try {
      const movieObj = likedList.find(m => m.id === movieId);
      await toggleLike(movieId, movieObj);
      setLikedList(prev => prev.filter(m => m.id !== movieId));
    } catch (e) {
      console.error(e);
    }
  };

  const loadCustomLists = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomLists();
      setCustomLists(data);
      // If we already have a selected list, refresh it from new data
      if (selectedList) {
        const updated = data.find(l => l._id === selectedList._id);
        setSelectedList(updated || null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const newList = await createCustomList(newListName.trim(), '');
      setCustomLists(prev => [newList, ...prev]);
      setNewListName('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!window.confirm('Are you sure you want to delete this custom list?')) return;
    try {
      await deleteCustomList(listId);
      setCustomLists(prev => prev.filter(l => l._id !== listId));
      if (selectedList && selectedList._id === listId) {
        setSelectedList(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMovieFromList = async (listId, movieId) => {
    try {
      const updatedList = await removeMovieFromCustomList(listId, movieId);
      setCustomLists(prev => prev.map(l => l._id === listId ? updatedList : l));
      setSelectedList(updatedList);
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="watchlist-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <h2>My Lists</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #2e3440',
          marginBottom: '16px',
          padding: '0 10px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          <button
            onClick={() => { setActiveTab('watchlist'); setSelectedList(null); }}
            style={{
              flex: '1 0 auto',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'watchlist' ? '2px solid var(--accent-gold, #FFD700)' : '2px solid transparent',
              color: activeTab === 'watchlist' ? '#fff' : '#9ca3af',
              padding: '10px 12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Watchlist ({watchlist.length})
          </button>
          <button
            onClick={() => { setActiveTab('watched'); setSelectedList(null); }}
            style={{
              flex: '1 0 auto',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'watched' ? '2px solid var(--accent-gold, #FFD700)' : '2px solid transparent',
              color: activeTab === 'watched' ? '#fff' : '#9ca3af',
              padding: '10px 12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Watched ({watchedList.length})
          </button>
          <button
            onClick={() => { setActiveTab('likes'); setSelectedList(null); }}
            style={{
              flex: '1 0 auto',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'likes' ? '2px solid var(--accent-gold, #FFD700)' : '2px solid transparent',
              color: activeTab === 'likes' ? '#fff' : '#9ca3af',
              padding: '10px 12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Liked ({likedList.length})
          </button>
          <button
            onClick={() => { setActiveTab('custom'); setSelectedList(null); }}
            style={{
              flex: '1 0 auto',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'custom' ? '2px solid var(--accent-gold, #FFD700)' : '2px solid transparent',
              color: activeTab === 'custom' ? '#fff' : '#9ca3af',
              padding: '10px 12px',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Custom Lists
          </button>
        </div>

        {activeTab === 'watchlist' && (
          watchlist.length === 0 ? (
            <div className="empty-watchlist">
              <p>Your list is currently empty.</p>
              <p className="subtext">Hover over any title and click + to add titles to your list.</p>
            </div>
          ) : (
            <div className="watchlist-grid">
              {watchlist.map((movie) => (
                <div key={movie.id} className="watchlist-item">
                  <img
                    src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150'}
                    alt={movie.title}
                    className="watchlist-poster"
                    onClick={() => {
                      onClose();
                      navigate(`/movie/${movie.id}`);
                    }}
                  />
                  <div className="watchlist-item-info">
                    <h4>{movie.title}</h4>
                    <div className="watchlist-item-meta">
                      <span>Rating {movie.vote_average?.toFixed(1)}</span>
                      <span>•</span>
                      <span>{movie.release_date?.split('-')[0]}</span>
                    </div>
                    <div className="watchlist-item-actions">
                      <button
                        className="btn-mini btn-play"
                        onClick={() => {
                          onClose();
                          onPlayTrailer(movie);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="btn-mini btn-remove"
                        onClick={() => onRemoveFromWatchlist(movie.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'watched' && (
          !user ? (
            <div className="empty-watchlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#9ca3af' }}>Please sign in to view and track your watched movies.</p>
              <button 
                onClick={() => { onClose(); onOpenAuth(); }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#E50914',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b80710'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#E50914'}
              >
                Sign In 🚪
              </button>
            </div>
          ) : watchedList.length === 0 ? (
            <div className="empty-watchlist">
              <p>You haven't marked any movies as watched yet.</p>
              <p className="subtext">Hover over any card and click the eye symbol to mark it as watched.</p>
            </div>
          ) : (
            <div className="watchlist-grid">
              {watchedList.map((movie) => (
                <div key={movie.id} className="watchlist-item">
                  <img
                    src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150'}
                    alt={movie.title}
                    className="watchlist-poster"
                    onClick={() => {
                      onClose();
                      navigate(`/movie/${movie.id}`);
                    }}
                  />
                  <div className="watchlist-item-info">
                    <h4>{movie.title}</h4>
                    <div className="watchlist-item-meta">
                      {movie.vote_average > 0 && <span>Rating {movie.vote_average?.toFixed(1)}</span>}
                      {movie.release_date && (
                        <>
                          <span>•</span>
                          <span>{movie.release_date?.split('-')[0]}</span>
                        </>
                      )}
                    </div>
                    <div className="watchlist-item-actions">
                      <button
                        className="btn-mini btn-play"
                        onClick={() => {
                          onClose();
                          onPlayTrailer(movie);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="btn-mini btn-remove"
                        onClick={() => handleRemoveWatched(movie.id)}
                      >
                        Unwatch
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'likes' && (
          !user ? (
            <div className="empty-watchlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ margin: 0, color: '#9ca3af' }}>Please sign in to view and like movies.</p>
              <button 
                onClick={() => { onClose(); onOpenAuth(); }}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#E50914',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#b80710'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#E50914'}
              >
                Sign In 🚪
              </button>
            </div>
          ) : likedList.length === 0 ? (
            <div className="empty-watchlist">
              <p>You haven't liked any movies yet.</p>
              <p className="subtext">Hover over any card and click the heart symbol to like it.</p>
            </div>
          ) : (
            <div className="watchlist-grid">
              {likedList.map((movie) => (
                <div key={movie.id} className="watchlist-item">
                  <img
                    src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150'}
                    alt={movie.title}
                    className="watchlist-poster"
                    onClick={() => {
                      onClose();
                      navigate(`/movie/${movie.id}`);
                    }}
                  />
                  <div className="watchlist-item-info">
                    <h4>{movie.title}</h4>
                    <div className="watchlist-item-meta">
                      {movie.vote_average > 0 && <span>Rating {movie.vote_average?.toFixed(1)}</span>}
                      {movie.release_date && (
                        <>
                          <span>•</span>
                          <span>{movie.release_date?.split('-')[0]}</span>
                        </>
                      )}
                    </div>
                    <div className="watchlist-item-actions">
                      <button
                        className="btn-mini btn-play"
                        onClick={() => {
                          onClose();
                          onPlayTrailer(movie);
                        }}
                      >
                        Play
                      </button>
                      <button
                        className="btn-mini btn-remove"
                        onClick={() => handleRemoveLiked(movie.id)}
                      >
                        Unlike
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {activeTab === 'custom' && (
          /* Custom Lists View */
          <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!user ? (
              <div className="empty-watchlist" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '40px 20px', textAlign: 'center' }}>
                <p style={{ margin: 0, color: '#9ca3af' }}>Please sign in to manage customized lists.</p>
                <button 
                  onClick={() => { onClose(); onOpenAuth(); }}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#E50914',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#b80710'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#E50914'}
                >
                  Sign In 🚪
                </button>
              </div>
            ) : selectedList ? (
              /* Inside a specific Custom List */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <button
                    onClick={() => setSelectedList(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-gold, #FFD700)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: 0
                    }}
                  >
                    ← Back to lists
                  </button>
                  <button
                    onClick={() => handleDeleteList(selectedList._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '0.82rem',
                      fontWeight: 600,
                      padding: 0
                    }}
                  >
                    Delete List
                  </button>
                </div>
                
                <h3 style={{ margin: '0 0 4px 0', fontSize: '1.2rem', color: '#fff' }}>{selectedList.name}</h3>
                <p style={{ margin: '0 0 16px 0', fontSize: '0.8rem', color: '#9ca3af' }}>{selectedList.movies.length} movies</p>

                {selectedList.movies.length === 0 ? (
                  <p style={{ color: '#6b7280', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', marginTop: '20px' }}>
                    This list is empty. Go to movie details and click "Add to List".
                  </p>
                ) : (
                  <div className="watchlist-grid" style={{ overflowY: 'auto', flex: 1 }}>
                    {selectedList.movies.map((movie) => (
                      <div key={movie.id} className="watchlist-item">
                        <img
                          src={movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : 'https://via.placeholder.com/150'}
                          alt={movie.title}
                          className="watchlist-poster"
                          onClick={() => {
                            onClose();
                            navigate(`/movie/${movie.id}`);
                          }}
                        />
                        <div className="watchlist-item-info">
                          <h4>{movie.title}</h4>
                          <div className="watchlist-item-meta">
                            {movie.vote_average > 0 && <span>Rating {movie.vote_average?.toFixed(1)}</span>}
                          </div>
                          <div className="watchlist-item-actions">
                            <button
                              className="btn-mini btn-play"
                              onClick={() => {
                                onClose();
                                onPlayTrailer(movie);
                              }}
                            >
                              Play
                            </button>
                            <button
                              className="btn-mini btn-remove"
                              onClick={() => handleRemoveMovieFromList(selectedList._id, movie.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Lists Overview */
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%', flex: 1 }}>
                <form onSubmit={handleCreateList} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                  <input
                    type="text"
                    placeholder="New list name..."
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    style={{
                      flex: 1,
                      backgroundColor: '#111318',
                      border: '1px solid #2e3440',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontSize: '0.85rem',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                  <button type="submit" style={{
                    backgroundColor: 'var(--accent-gold, #FFD700)',
                    color: '#111',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}>
                    Create
                  </button>
                </form>

                {loading ? (
                  <p style={{ color: '#cbd5e1', fontSize: '0.85rem', textAlign: 'center' }}>Loading lists...</p>
                ) : customLists.length === 0 ? (
                  <div className="empty-watchlist" style={{ marginTop: '20px' }}>
                    <p>No customized lists yet.</p>
                    <p className="subtext">Enter a name above to create a new list, then add movies from their details pages.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', flex: 1 }}>
                    {customLists.map((list) => (
                      <div
                        key={list._id}
                        onClick={() => setSelectedList(list)}
                        style={{
                          backgroundColor: '#1a1d24',
                          border: '1px solid #2e3440',
                          borderRadius: '8px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = 'var(--accent-gold, #FFD700)';
                          e.currentTarget.style.backgroundColor = '#20242e';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = '#2e3440';
                          e.currentTarget.style.backgroundColor = '#1a1d24';
                        }}
                      >
                        <div>
                          <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '0.95rem' }}>{list.name}</h4>
                          <span style={{ fontSize: '0.78rem', color: '#9ca3af' }}>{list.movies.length} movies</span>
                        </div>
                        <span style={{ color: 'var(--accent-gold, #FFD700)', fontSize: '1rem' }}>➔</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default WatchlistModal;

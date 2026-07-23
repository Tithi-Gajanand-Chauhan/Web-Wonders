import { useState } from 'react';

export default function Watchlist({ items, onUpdateStatus, onRemove, onSelectItem }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'movie', 'show'
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [tempProgress, setTempProgress] = useState('');

  // Handle local progress edits
  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setTempProgress(item.progress || '');
  };

  const handleSaveProgress = (itemId) => {
    onUpdateStatus(itemId, 'watching', tempProgress);
    setEditingId(null);
  };

  // Filtered and Searched items
  const processedItems = items.filter(item => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Categorized columns
  const wishlistItems = processedItems.filter(item => item.status === 'wishlist');
  const watchingItems = processedItems.filter(item => item.status === 'watching');
  const completedItems = processedItems.filter(item => item.status === 'completed');

  // Render a single watchlist card
  const renderCard = (item) => {
    return (
      <div 
        key={item.id} 
        className="glass-panel" 
        style={{ 
          padding: '12px', 
          display: 'flex', 
          flexDirection: 'column',
          gap: '12px',
          borderRadius: 'var(--radius-sm)',
          borderLeft: `4px solid ${
            item.status === 'wishlist' ? 'var(--accent-primary)' : 
            item.status === 'watching' ? 'var(--accent-neon)' : 'var(--accent-secondary)'
          }`
        }}
      >
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* Card Poster */}
          <img 
            src={item.poster} 
            alt={item.title} 
            onClick={() => onSelectItem && onSelectItem(item.id)}
            style={{ 
              width: '60px', 
              height: '80px', 
              borderRadius: 'var(--radius-sm)', 
              objectFit: 'cover',
              cursor: 'pointer',
              transition: 'transform var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          />

          <div style={{ flex: 1 }}>
            <h5 
              onClick={() => onSelectItem && onSelectItem(item.id)}
              style={{ 
                color: 'var(--text-primary)', 
                fontSize: '0.95rem', 
                fontWeight: '600', 
                marginBottom: '4px',
                cursor: 'pointer'
              }}
            >
              {item.title}
            </h5>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', marginBottom: '6px' }}>
              <span>{item.year}</span>
              <span>•</span>
              <span style={{ textTransform: 'uppercase', color: 'var(--accent-neon)' }}>{item.type}</span>
            </div>

            {/* OTT Platform Availability Badges */}
            {item.ottPlatforms && item.ottPlatforms.length > 0 && (
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginBottom: '8px' }}>
                {item.ottPlatforms.map(platform => (
                  <span 
                    key={platform} 
                    style={{ 
                      fontSize: '0.62rem', 
                      background: 'rgba(255, 255, 255, 0.06)', 
                      border: '1px solid rgba(255, 255, 255, 0.1)', 
                      borderRadius: '4px', 
                      padding: '1px 4px', 
                      color: 'var(--text-secondary)',
                      fontWeight: '550'
                    }}
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}

            {/* Render Progress or Ratings */}
            {item.status === 'watching' ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {editingId === item.id ? (
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <input 
                      type="text" 
                      value={tempProgress}
                      onChange={(e) => setTempProgress(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: '4px',
                        color: 'white',
                        padding: '2px 6px',
                        fontSize: '0.75rem',
                        width: '90px'
                      }}
                      autoFocus
                    />
                    <button 
                      onClick={() => handleSaveProgress(item.id)}
                      style={{
                        background: 'var(--accent-neon)',
                        border: 'none',
                        color: '#000',
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏳ {item.progress}</span>
                    <button 
                      onClick={() => handleStartEdit(item)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'underline'
                      }}
                    >
                      edit
                    </button>
                  </div>
                )}
              </div>
            ) : item.status === 'completed' ? (
              <div style={{ fontSize: '0.8rem', color: 'var(--star-color)', fontWeight: '600' }}>
                {item.userRating ? `★ ${item.userRating}/10` : "No rating given"}
              </div>
            ) : null}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '8px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            {item.status !== 'wishlist' && (
              <button 
                onClick={() => onUpdateStatus(item.id, 'wishlist')}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: '4px',
                  color: 'var(--text-secondary)',
                  fontSize: '0.7rem',
                  padding: '3px 6px',
                  cursor: 'pointer'
                }}
              >
                Wish
              </button>
            )}
            
            {item.status !== 'watching' && (
              <button 
                onClick={() => onUpdateStatus(item.id, 'watching', item.status === 'completed' ? 'Rewatching' : 'Started')}
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.2)',
                  borderRadius: '4px',
                  color: 'var(--accent-neon)',
                  fontSize: '0.7rem',
                  padding: '3px 6px',
                  cursor: 'pointer'
                }}
              >
                Watch
              </button>
            )}

            {item.status !== 'completed' && (
              <button 
                onClick={() => onUpdateStatus(item.id, 'completed')}
                style={{
                  background: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid rgba(236, 72, 153, 0.2)',
                  borderRadius: '4px',
                  color: 'var(--accent-secondary)',
                  fontSize: '0.7rem',
                  padding: '3px 6px',
                  cursor: 'pointer'
                }}
              >
                Complete
              </button>
            )}
          </div>

          {/* Delete Button */}
          <button
            onClick={() => onRemove(item.id)}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(239, 68, 68, 0.6)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
            onMouseEnter={(e) => e.target.style.color = 'rgb(239, 68, 68)'}
            onMouseLeave={(e) => e.target.style.color = 'rgba(239, 68, 68, 0.6)'}
          >
            Remove
          </button>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Filtering Bar */}
      <div 
        className="glass-panel" 
        style={{ 
          padding: '16px', 
          marginBottom: '20px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'movie', 'show'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              style={{
                background: filterType === type ? 'var(--accent-primary)' : 'rgba(255,255,255,0.03)',
                color: filterType === type ? '#fff' : 'var(--text-secondary)',
                border: filterType === type ? 'none' : '1px solid var(--border-glass)',
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {type === 'show' ? 'TV Shows' : type === 'movie' ? 'Movies' : 'All'}
            </button>
          ))}
        </div>

        {/* Search */}
        <input 
          type="text" 
          placeholder="Search Watchlist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-glass)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            color: 'var(--text-primary)',
            fontSize: '0.85rem',
            width: '200px',
            outline: 'none'
          }}
        />
      </div>

      {/* Board Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        
        {/* Wishlist Column */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(18, 14, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)', boxShadow: 'var(--shadow-neon)' }}></span>
              Want to Watch
            </h4>
            <span style={{ fontSize: '0.8rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {wishlistItems.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100px' }}>
            {wishlistItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px' }}>
                Empty
              </div>
            ) : (
              wishlistItems.map(renderCard)
            )}
          </div>
        </div>

        {/* Watching Column */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(18, 14, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)', boxShadow: 'var(--shadow-neon-teal)' }}></span>
              Currently Watching
            </h4>
            <span style={{ fontSize: '0.8rem', background: 'rgba(6, 182, 212, 0.1)', color: 'var(--accent-neon)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {watchingItems.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100px' }}>
            {watchingItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px' }}>
                Empty
              </div>
            ) : (
              watchingItems.map(renderCard)
            )}
          </div>
        </div>

        {/* Completed Column */}
        <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'rgba(18, 14, 36, 0.4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '10px' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-secondary)', boxShadow: 'var(--shadow-neon-pink)' }}></span>
              Completed
            </h4>
            <span style={{ fontSize: '0.8rem', background: 'rgba(236, 72, 153, 0.1)', color: 'var(--accent-secondary)', padding: '2px 8px', borderRadius: 'var(--radius-full)' }}>
              {completedItems.length}
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '100px' }}>
            {completedItems.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '24px' }}>
                Empty
              </div>
            ) : (
              completedItems.map(renderCard)
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

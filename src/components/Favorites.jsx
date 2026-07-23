import { useState } from 'react';

export default function Favorites({ items, onToggleFavorite, onSelectItem }) {
  const [editingId, setEditingId] = useState(null);
  const [tempNote, setTempNote] = useState('');

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setTempNote(item.userNote || '');
  };

  const handleSaveNote = (item) => {
    onToggleFavorite(item, tempNote);
    setEditingId(null);
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--accent-secondary)' }}>❤️</span> Favorite Shelf
      </h3>

      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Your favorite shelf is empty. Click the heart icon on any movie to add it here!
        </div>
      ) : (
        <div 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', 
            gap: '16px'
          }}
        >
          {items.map(item => (
            <div 
              key={item.id}
              className="glass-panel"
              style={{ 
                padding: '12px', 
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                position: 'relative'
              }}
            >
              {/* Heart Badge (Clicking removes) */}
              <button
                onClick={() => onToggleFavorite(item)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  background: 'rgba(11, 8, 22, 0.7)',
                  border: '1px solid var(--border-glass)',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--accent-secondary)',
                  fontSize: '0.85rem',
                  zIndex: 2,
                  transition: 'transform var(--transition-fast)'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.15)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                title="Remove from favorites"
              >
                ❤️
              </button>

              {/* Poster and Basic info */}
              <div 
                style={{ display: 'flex', gap: '12px', cursor: 'pointer' }}
                onClick={() => onSelectItem && onSelectItem(item.id)}
              >
                <img 
                  src={item.poster} 
                  alt={item.title} 
                  style={{ 
                    width: '60px', 
                    height: '80px', 
                    borderRadius: '4px', 
                    objectFit: 'cover'
                  }}
                />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {item.title}
                  </h4>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {item.year}
                  </span>
                </div>
              </div>

              {/* Note Section */}
              <div style={{ marginTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '0.78rem', fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  {editingId === item.id ? (
                    <div>
                      <textarea
                        value={tempNote}
                        onChange={(e) => setTempNote(e.target.value)}
                        rows="2"
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.3)',
                          border: '1px solid var(--border-glass)',
                          color: 'var(--text-primary)',
                          padding: '4px',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          resize: 'vertical',
                          outline: 'none',
                          marginBottom: '4px'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingId(null)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-secondary)',
                            fontSize: '0.7rem',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveNote(item)}
                          style={{
                            background: 'var(--accent-secondary)',
                            border: 'none',
                            color: 'white',
                            fontSize: '0.7rem',
                            fontWeight: '600',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>My Note: </span>
                      <span>{item.userNote || "Click edit to add a personal review note..."}</span>
                    </div>
                  )}
                </div>

                {editingId !== item.id && (
                  <button
                    onClick={() => handleStartEdit(item)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-neon)',
                      fontSize: '0.72rem',
                      cursor: 'pointer',
                      textAlign: 'left',
                      textDecoration: 'underline',
                      alignSelf: 'flex-start'
                    }}
                  >
                    Edit Note
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

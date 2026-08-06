import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function WatchPartyModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  
  // Create Group Form State
  const [createUsername, setCreateUsername] = useState('');
  const [groupName, setGroupName] = useState('');
  
  // Join Group Form State
  const [joinUsername, setJoinUsername] = useState('');
  const [groupCode, setGroupCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!createUsername.trim()) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!groupName.trim()) {
      setErrorMessage('Please enter a group name.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          groupName: groupName.trim(),
          creatorName: createUsername.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const data = await response.json();
      console.log('Group created:', data);

      onClose(); // Close the modal
      navigate('/lobby', {
        state: {
          groupName: groupName.trim(),
          groupCode: data.code,
          currentUser: createUsername.trim(),
          members: [createUsername.trim()],
        },
      });
    } catch (err) {
      console.error('Create group error:', err);
      setErrorMessage('Unable to create group. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanUsername = joinUsername.trim();
    const cleanCode = groupCode.trim().toUpperCase();

    if (!cleanUsername) {
      setErrorMessage('Please enter your name.');
      return;
    }
    if (!cleanCode) {
      setErrorMessage('Please enter a room code.');
      return;
    }
    if (cleanCode.length !== 6) {
      setErrorMessage('Room code must be exactly 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/groups/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: cleanCode,
          username: cleanUsername,
        }),
      });

      const data = await response.json();
      console.log('Join response:', data);

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Unable to join group. Check the code and try again.');
        return;
      }

      onClose(); // Close the modal
      navigate('/lobby', {
        state: {
          groupName: data.group.groupName,
          groupCode: data.group.code,
          currentUser: cleanUsername,
          members: data.group.members || [],
        },
      });
    } catch (err) {
      console.error('Join group error:', err);
      setErrorMessage('Server connection error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="watch-party-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '30px' }}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        
        {/* Toggle Tabs */}
        <div style={{ display: 'flex', width: '100%', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
          <button 
            type="button"
            onClick={() => { setActiveTab('create'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'create' ? '2px solid var(--primary-red)' : 'none',
              color: activeTab === 'create' ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Create Room
          </button>
          <button 
            type="button"
            onClick={() => { setActiveTab('join'); setErrorMessage(''); }}
            style={{
              flex: 1,
              padding: '10px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'join' ? '2px solid var(--primary-red)' : 'none',
              color: activeTab === 'join' ? '#fff' : 'var(--text-muted)',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            Join Room
          </button>
        </div>

        {errorMessage && (
          <div style={{ width: '100%', color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '15px', textAlign: 'left', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {activeTab === 'create' ? (
          <form onSubmit={handleCreateGroup} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px' }}>YOUR NAME</label>
              <input 
                type="text" 
                placeholder="e.g. Alex" 
                value={createUsername} 
                onChange={(e) => setCreateUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px' }}>ROOM/GROUP NAME</label>
              <input 
                type="text" 
                placeholder="e.g. Friday Movie Night" 
                value={groupName} 
                onChange={(e) => setGroupName(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-start-party"
              style={{ marginTop: '10px' }}
            >
              {loading ? 'Creating...' : 'Create Watch Party 🍿'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoinGroup} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px', textAlign: 'left' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px' }}>YOUR NAME</label>
              <input 
                type="text" 
                placeholder="e.g. Sam" 
                value={joinUsername} 
                onChange={(e) => setJoinUsername(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)', marginBottom: '5px' }}>ROOM CODE</label>
              <input 
                type="text" 
                maxLength={6}
                placeholder="e.g. JKLW36" 
                value={groupCode} 
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontWeight: '700',
                  letterSpacing: '2px',
                  textAlign: 'center',
                  outline: 'none'
                }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="btn-start-party"
              style={{ marginTop: '10px', background: '#38bdf8', color: '#000' }}
            >
              {loading ? 'Joining...' : 'Join Watch Party 🎟️'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}

export default WatchPartyModal;

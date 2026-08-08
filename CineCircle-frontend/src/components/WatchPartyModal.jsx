import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function WatchPartyModal({ isOpen, onClose, user, onOpenAuth }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  
  // Create Group Form State
  const [createUsername, setCreateUsername] = useState(user ? user.username : '');
  const [groupName, setGroupName] = useState('');
  
  // Join Group Form State
  const [joinUsername, setJoinUsername] = useState(user ? user.username : '');
  const [groupCode, setGroupCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [joinedRooms, setJoinedRooms] = useState([]);
 
   const navigate = useNavigate();
 
   // Load initial username values and joined rooms when modal is opened
   useEffect(() => {
     if (isOpen) {
       setCreateUsername(user ? user.username : '');
       setJoinUsername(user ? user.username : '');

       const key = user ? `cinecircle_joined_rooms_${user.id || user._id}` : 'cinecircle_joined_rooms_guest';
       try {
         const saved = localStorage.getItem(key);
         setJoinedRooms(saved ? JSON.parse(saved) : []);
       } catch (err) {
         setJoinedRooms([]);
       }
     }
   }, [isOpen, user]);
 
   if (!isOpen) return null;

   const saveJoinedRoom = (code, name, username) => {
     const key = user ? `cinecircle_joined_rooms_${user.id || user._id}` : 'cinecircle_joined_rooms_guest';
     try {
       let history = JSON.parse(localStorage.getItem(key) || '[]');
       history = history.filter(r => r.code !== code);
       history.unshift({ code, name, username });
       localStorage.setItem(key, JSON.stringify(history.slice(0, 5)));
     } catch (err) {
       console.error('Failed to save joined room:', err);
     }
   };

   const handleReenterJoinedRoom = async (code, name, roomUsername) => {
     setErrorMessage('');
     setLoading(true);
     try {
       const response = await fetch('http://localhost:5000/api/groups/join', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           code: code.toUpperCase(),
           username: roomUsername,
           userId: user ? (user.id || user._id) : undefined
         })
       });
       
       const data = await response.json();
       if (!response.ok || !data.success) {
         setErrorMessage(data.message || 'Unable to rejoin group.');
         return;
       }
       
       onClose();
       navigate('/lobby', {
         state: {
           groupName: data.group.groupName || name,
           groupCode: data.group.code,
           currentUser: roomUsername,
           members: data.group.members || []
         }
       });
     } catch (err) {
       console.error("Rejoin error:", err);
       setErrorMessage("Server connection error.");
     } finally {
       setLoading(false);
     }
   };
 
   if (!user) {
     return (
       <div className="modal-backdrop" onClick={onClose} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <div className="watch-party-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '440px', padding: '40px', textAlign: 'center' }}>
           <button className="modal-close-btn" onClick={onClose}>✕</button>
           
           <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔐</div>
           <h2 style={{ fontSize: '22px', fontWeight: '800', marginBottom: '12px', color: '#fff' }}>
             Authentication Required
           </h2>
           <p style={{ color: 'var(--text-muted, #aaa)', fontSize: '14px', lineHeight: '1.6', marginBottom: '28px' }}>
             You must be signed in to create or join a Watch Party. Log in or create an account to start sharing recommendations with friends!
           </p>
           
           <button 
             onClick={() => {
               onClose();
               onOpenAuth();
             }}
             style={{
               width: '100%',
               padding: '14px',
               borderRadius: '8px',
               border: 'none',
               backgroundColor: 'var(--primary-red, #E50914)',
               color: '#fff',
               fontSize: '15px',
               fontWeight: '700',
               cursor: 'pointer',
               boxShadow: '0 4px 12px rgba(229, 9, 20, 0.3)',
               transition: 'background-color 0.2s ease'
             }}
           >
             Sign In / Sign Up
           </button>
         </div>
       </div>
     );
   }

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

      saveJoinedRoom(data.code, groupName.trim(), createUsername.trim());
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
          userId: user ? (user.id || user._id) : undefined
        }),
      });

      const data = await response.json();
      console.log('Join response:', data);

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || 'Unable to join group. Check the code and try again.');
        return;
      }

      saveJoinedRoom(data.group.code, data.group.groupName, cleanUsername);
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

        {joinedRooms.length > 0 && (
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '800', color: 'var(--accent-gold, #FFD700)', marginBottom: '10px', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
              🏠 ACTIVE JOINED ROOMS
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {joinedRooms.map(room => (
                <button
                  type="button"
                  key={room.code}
                  onClick={() => handleReenterJoinedRoom(room.code, room.name, room.username)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    transition: 'all 0.2s ease',
                    width: '100%'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'var(--primary-red)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
                >
                  <span style={{ fontWeight: '600' }}>🍿 {room.name}</span>
                  <span style={{ fontSize: '0.72rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '4px', color: '#ff4d4d', fontWeight: '800' }}>
                    {room.code}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default WatchPartyModal;

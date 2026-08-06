import { useState } from 'react';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' or 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register State
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginEmail.trim(),
          password: loginPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regUsername.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: regUsername.trim(),
          email: regEmail.trim(),
          password: regPassword.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const backdropStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalStyle = {
    width: '100%',
    maxWidth: '400px',
    background: 'rgba(20, 20, 20, 0.95)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
    padding: '35px',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '15px',
    right: '20px',
    background: 'none',
    border: 'none',
    color: '#aaa',
    fontSize: '1.2rem',
    cursor: 'pointer',
  };

  const tabStyle = (active) => ({
    flex: 1,
    padding: '10px',
    background: 'none',
    border: 'none',
    borderBottom: active ? '2px solid var(--primary-red)' : 'none',
    color: active ? '#fff' : 'var(--text-muted)',
    fontWeight: '700',
    cursor: 'pointer',
    outline: 'none',
  });

  const inputStyle = {
    width: '100%',
    padding: '12px 14px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    color: '#fff',
    outline: 'none',
    fontSize: '0.95rem',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    marginBottom: '6px',
    textAlign: 'left',
    letterSpacing: '0.5px',
  };

  const btnStyle = {
    width: '100%',
    padding: '12px',
    background: 'var(--primary-red)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'background-color 0.2s',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <button style={closeBtnStyle} onClick={onClose}>✕</button>
        
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '10px' }}>
          <button 
            type="button" 
            onClick={() => { setActiveTab('login'); setErrorMessage(''); }}
            style={tabStyle(activeTab === 'login')}
          >
            Sign In
          </button>
          <button 
            type="button" 
            onClick={() => { setActiveTab('register'); setErrorMessage(''); }}
            style={tabStyle(activeTab === 'register')}
          >
            Sign Up
          </button>
        </div>

        {errorMessage && (
          <div style={{ color: '#ff4d4d', fontSize: '0.85rem', background: 'rgba(255, 77, 77, 0.1)', padding: '8px 12px', borderRadius: '6px', textAlign: 'left' }}>
            ⚠️ {errorMessage}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div>
              <label style={labelStyle}>USERNAME</label>
              <input 
                type="text" 
                placeholder="e.g. movie_lover" 
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>EMAIL ADDRESS</label>
              <input 
                type="email" 
                placeholder="email@example.com" 
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>PASSWORD</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                disabled={loading}
                style={inputStyle}
              />
            </div>

            <button type="submit" disabled={loading} style={btnStyle}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthModal;

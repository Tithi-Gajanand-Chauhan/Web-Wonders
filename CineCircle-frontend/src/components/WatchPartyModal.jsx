import { useState } from 'react';

function WatchPartyModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const roomCode = 'CINE-7829-ROOM';

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://cinecircle.app/party/${roomCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="watch-party-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>✕</button>
        <h2>Watch Party Room</h2>
        <p>Sync playback with friends and vote on what to watch live.</p>
        
        <div className="party-link-box">
          <input type="text" readOnly value={`https://cinecircle.app/party/${roomCode}`} />
          <button className="btn-copy" onClick={handleCopy}>
            {copied ? 'Copied' : 'Copy Link'}
          </button>
        </div>

        <button className="btn-start-party" onClick={onClose}>
          Start Room
        </button>
      </div>
    </div>
  );
}

export default WatchPartyModal;

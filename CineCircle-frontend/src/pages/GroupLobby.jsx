import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function GroupLobby() {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    groupName,
    groupCode,
    members: initialMembers = [],
    currentUser,
  } = location.state || {};

  const [localUser, setLocalUser] = useState(currentUser);
  const [members, setMembers] = useState(initialMembers);
  const [copied, setCopied] = useState(false);
  const [generating,setGenerating] = useState(false);
  const [groupWatchlist, setGroupWatchlist] = useState([]);

  const [activeUser, setActiveUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cinecircle_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const saveRoomToHistory = (code, name, username) => {
    const savedUser = localStorage.getItem('cinecircle_user');
    if (!savedUser) return;
    try {
      const u = JSON.parse(savedUser);
      const userId = u.id || u._id;
      
      // 1. Save to cinecircle_saved_rooms_${userId} (Navbar dropdown key)
      const keyNavbar = `cinecircle_saved_rooms_${userId}`;
      const existingNavbar = JSON.parse(localStorage.getItem(keyNavbar) || '[]');
      const idxNavbar = existingNavbar.findIndex(r => r.code === code);
      if (idxNavbar !== -1) {
        existingNavbar[idxNavbar].username = username;
      } else {
        existingNavbar.unshift({ code, name: name || `Room ${code}`, username });
      }
      localStorage.setItem(keyNavbar, JSON.stringify(existingNavbar.slice(0, 5)));

      // 2. Save to cinecircle_recent_rooms_${userId} (WatchPartyModal key)
      const keyModal = `cinecircle_recent_rooms_${userId}`;
      const existingModal = JSON.parse(localStorage.getItem(keyModal) || '[]');
      const idxModal = existingModal.findIndex(r => r.code === code);
      if (idxModal !== -1) {
        existingModal[idxModal].username = username;
      } else {
        existingModal.unshift({ code, name: name || `Room ${code}`, joinedAt: Date.now(), username });
      }
      localStorage.setItem(keyModal, JSON.stringify(existingModal.slice(0, 4)));
    } catch (e) {
      console.error("Failed to save room to history", e);
    }
  };

  useEffect(() => {
    const checkAuthChange = () => {
      try {
        const saved = localStorage.getItem('cinecircle_user');
        const parsed = saved ? JSON.parse(saved) : null;
        
        if (parsed && (!activeUser || parsed.username !== activeUser.username)) {
          setActiveUser(parsed);
          setLocalUser(parsed.username);
          saveRoomToHistory(groupCode, groupName, parsed.username);

          if (localUser && localUser !== parsed.username) {
            fetch("http://localhost:5000/api/groups/join", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                code: groupCode, 
                username: parsed.username, 
                oldUsername: localUser,
                userId: parsed.id || parsed._id
              })
            }).catch(err => console.error("Auto-join mid-session failed:", err));
          }
        }
      } catch (e) {
        console.error(e);
      }
    };

    if (activeUser && groupCode) {
      saveRoomToHistory(groupCode, groupName, localUser);
    }

    const authInterval = setInterval(checkAuthChange, 1000);
    return () => clearInterval(authInterval);
  }, [activeUser, groupCode, groupName, localUser]);

  useEffect(() => {
    if (!groupCode) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/groups/status/${groupCode}`
        );
        const data = await response.json();
        console.log("LOBBY STATUS:", data);

        if (data.generating) {
          setGenerating(true);
        }

        // If recommendations are ready or everyone is ready and not already fetching
        if (data.hasRecommendations || (data.everyoneReady && !data.generating)) {
          clearInterval(interval);
          setGenerating(true);

          const recResponse = await fetch(
            "http://localhost:5000/api/groups/recommend",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({ groupCode })
            }
          );

          const recData = await recResponse.json();
          console.log("RECOMMENDATION RESPONSE:", recData);

          // Handle if still generating response message
          if (recData.message === "Already generating" && !recData.recommendations) {
            // Keep polling
            return;
          }

          const finalRecs = Array.isArray(recData.recommendations)
            ? recData.recommendations
            : (recData.recommendations?.recommendations || []);

          const finalCompat = recData.groupCompatibilityScore || recData.recommendations?.groupCompatibilityScore || 80;
          const finalSummary = recData.negotiationSummary || recData.recommendations?.negotiationSummary || "";

          navigate("/recommendation", {
            state: {
              groupCode,
              currentUser: localUser,
              recommendations: finalRecs,
              compatibility: finalCompat,
              summary: finalSummary
            }
          });
        }
      } catch (error) {
        console.log("Lobby checking error:", error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [groupCode, localUser, navigate]);



useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/groups/${groupCode}`
      );
      const data = await response.json();
      if (data.success) {
        setMembers(data.members || []);
        setGroupWatchlist(data.watchlist || []);
      }
    } catch (error) {
      console.log("Member sync error:", error);
    }
  }, 3000);

  return () => clearInterval(interval);
}, [groupCode]);

  if (!groupName || !groupCode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#141414",
          color: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Segoe UI', Roboto, sans-serif",
        }}
      >
        <div
          style={{
            backgroundColor: "#1E1E1E",
            padding: "40px",
            borderRadius: "16px",
            textAlign: "center",
            border: "1px solid #2B2B2B",
            maxWidth: "400px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>⚠️</div>
          <h2 style={{ marginBottom: "12px", fontSize: "22px" }}>
            No Group Data Found
          </h2>
          <p style={{ color: "#AAA", marginBottom: "24px", fontSize: "14px" }}>
            It looks like this session expired or the server restarted.
          </p>
          <button
            onClick={() => navigate("/")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#E50914",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }


  function handleReady() {
    navigate("/preferences", {
      state: {
        groupName,
        groupCode,
        currentUser: localUser,
        members,
      },
    });
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(groupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="group-lobby-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "white",
        padding: "40px 20px",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "540px",
          textAlign: "center",
        }}
      >
        {/* Header Branding */}
        <div style={{ marginBottom: "8px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#E50914",
              textTransform: "uppercase",
            }}
          >
            CineCircle Lobby
          </span>
        </div>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "800",
            marginBottom: "24px",
            letterSpacing: "-0.5px",
          }}
        >
          {groupName}
        </h1>

        {/* Group Code Card */}
        <div
          style={{
            background: "linear-gradient(145deg, #1E1E1E, #181818)",
            border: "1px solid #2C2C2C",
            padding: "24px",
            borderRadius: "16px",
            marginBottom: "32px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.4)",
          }}
        >
          <p
            style={{
              fontSize: "13px",
              color: "#A0A0A0",
              margin: "0 0 12px 0",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Share Room Code
          </p>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              backgroundColor: "#111111",
              border: "1px solid #333333",
              padding: "10px 20px",
              borderRadius: "12px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "20px" }}>🔑</span>
            <span
              style={{
                fontSize: "26px",
                fontWeight: "700",
                letterSpacing: "4px",
                color: "#FFFFFF",
                fontFamily: "monospace",
              }}
            >
              {groupCode}
            </span>
          </div>

          <div>
            <button
              onClick={handleCopyCode}
              style={{
                padding: "8px 18px",
                backgroundColor: copied ? "#2E7D32" : "#2B2B2B",
                color: "white",
                border: "1px solid #3A3A3A",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copied ? "✓ Code Copied!" : "📋 Copy Code"}
            </button>
          </div>
        </div>

        {/* Members Section */}
        <div
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #282828",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
            }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: "700", margin: 0 }}>
              👥 Active Members ({members.length})
            </h2>

            {/* Live Polling Pulse Indicator */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  display: "inline-block",
                  boxShadow: "0 0 8px #4CAF50",
                }}
              />
              <span style={{ fontSize: "11px", color: "#888" }}>Live Sync</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {members.length > 0 ? (
              members.map((member, index) => (
                <div
                  key={index}
                  style={{
                    backgroundColor: "#111111",
                    border: "1px solid #2A2A2A",
                    padding: "12px 18px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "16px" }}>👤</span>
                    <span style={{ fontWeight: "600", fontSize: "15px" }}>
                      {member}
                    </span>
                  </div>
                  {member === currentUser && (
                    <span
                      style={{
                        fontSize: "11px",
                        backgroundColor: "#E5091422",
                        color: "#E50914",
                        border: "1px solid #E5091455",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontWeight: "600",
                      }}
                    >
                      You
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "#777", fontSize: "14px", margin: "10px 0" }}>
                Waiting for members to join...
              </p>
            )}
          </div>
        </div>

        {/* Shared Room Watchlist Section */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          backgroundColor: "#111111",
          border: "1px solid #2C2C2C",
          borderRadius: "14px",
          textAlign: "left"
        }}>
          <h3 style={{
            margin: "0 0 16px 0",
            fontSize: "15px",
            fontWeight: "800",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <span>🍿</span> Shared Room Watchlist ({groupWatchlist.length})
          </h3>

          {groupWatchlist.length > 0 ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              maxHeight: "220px",
              overflowY: "auto",
              paddingRight: "4px"
            }}>
              {groupWatchlist.map((movie) => {
                const myUsername = activeUser?.username || localUser || "Guest";
                const isLikedByMe = movie.likes && movie.likes.includes(myUsername);
                const isAddedByMe = movie.addedBy && movie.addedBy.toLowerCase().trim() === myUsername.toLowerCase().trim();
                const likesCount = movie.likes ? movie.likes.length : 0;
                const likesTooltip = movie.likes && movie.likes.length > 0
                  ? `Liked by: ${movie.likes.join(", ")}`
                  : "Like this movie";

                return (
                  <div
                    key={movie.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      backgroundColor: "#161616",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      border: "1px solid #222"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <img
                        src={movie.poster_path ? (movie.poster_path.startsWith('/') ? `https://image.tmdb.org/t/p/w92${movie.poster_path}` : movie.poster_path) : 'https://via.placeholder.com/92x138'}
                        alt={movie.title}
                        style={{ width: "32px", height: "48px", objectFit: "cover", borderRadius: "4px" }}
                      />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: "700", fontSize: "14px", color: "#FFF", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {movie.title}
                        </div>
                        <div style={{ fontSize: "12px", color: "#888" }}>
                          Rating: {movie.vote_average?.toFixed(1) || "7.5"} • {movie.release_date?.split('-')[0] || "2026"}
                          {movie.addedBy && ` • Added by ${movie.addedBy}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            const res = await fetch(`http://localhost:5000/api/groups/${groupCode}/watchlist/${movie.id}/like`, {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ username: myUsername })
                            });
                            const data = await res.json();
                            if (data.success) {
                              setGroupWatchlist(data.watchlist);
                            }
                          } catch (err) {
                            console.error("Like toggle error:", err);
                          }
                        }}
                        style={{
                          background: isLikedByMe ? "rgba(229, 9, 20, 0.15)" : "rgba(255,255,255,0.05)",
                          border: isLikedByMe ? "1px solid #E50914" : "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "8px",
                          padding: "4px 10px",
                          color: isLikedByMe ? "#E50914" : "#AAA",
                          fontSize: "12px",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          transition: "all 0.15s ease"
                        }}
                        title={likesTooltip}
                      >
                        <span>{isLikedByMe ? "❤️" : "🤍"}</span>
                        <span>{likesCount}</span>
                      </button>

                      {isAddedByMe && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await fetch(`http://localhost:5000/api/groups/${groupCode}/watchlist/remove`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ movieId: movie.id, username: myUsername })
                              });
                              // Optimistic update
                              setGroupWatchlist(prev => prev.filter(m => m.id !== movie.id));
                            } catch (err) {
                              console.error("Remove error:", err);
                            }
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#EF4444",
                            fontSize: "12px",
                            fontWeight: "750",
                            cursor: "pointer",
                            padding: "4px 8px",
                            borderRadius: "4px"
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p style={{ color: "#777", fontSize: "13px", margin: "10px 0" }}>
              No movies saved yet. Save compromise recommendations below to see them here!
            </p>
          )}
        </div>

        {/* Footer Text */}
        <p
          style={{
            color: "#888888",
            fontSize: "13px",
            lineHeight: "1.5",
            marginBottom: "24px",
          }}
        >
          Everyone selects their movie preferences.
          <br />
          CineCircle AI will find the perfect match for the group.
        </p>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <button
            onClick={async () => {
              try {
                await fetch(`http://localhost:5000/api/groups/${groupCode}/leave`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ username: localUser })
                });

                // Clear history
                const guestKey = 'cinecircle_recent_rooms_guest';
                const guestRooms = JSON.parse(localStorage.getItem(guestKey) || '[]');
                localStorage.setItem(guestKey, JSON.stringify(guestRooms.filter(r => r.code !== groupCode)));

                const guestJoinedKey = 'cinecircle_joined_rooms_guest';
                const guestJoinedRooms = JSON.parse(localStorage.getItem(guestJoinedKey) || '[]');
                localStorage.setItem(guestJoinedKey, JSON.stringify(guestJoinedRooms.filter(r => r.code !== groupCode)));

                const savedUser = localStorage.getItem('cinecircle_user');
                if (savedUser) {
                  const u = JSON.parse(savedUser);
                  const userId = u.id || u._id;
                  
                  const keyNavbar = `cinecircle_saved_rooms_${userId}`;
                  const existingNavbar = JSON.parse(localStorage.getItem(keyNavbar) || '[]');
                  localStorage.setItem(keyNavbar, JSON.stringify(existingNavbar.filter(r => r.code !== groupCode)));

                  const keyModal = `cinecircle_recent_rooms_${userId}`;
                  const existingModal = JSON.parse(localStorage.getItem(keyModal) || '[]');
                  localStorage.setItem(keyModal, JSON.stringify(existingModal.filter(r => r.code !== groupCode)));

                  const keyJoined = `cinecircle_joined_rooms_${userId}`;
                  const existingJoined = JSON.parse(localStorage.getItem(keyJoined) || '[]');
                  localStorage.setItem(keyJoined, JSON.stringify(existingJoined.filter(r => r.code !== groupCode)));
                }
              } catch (e) {
                console.error("Leave room error:", e);
              }
              navigate("/");
            }}
            style={{
              flex: "1",
              padding: "16px",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.5)",
              backgroundColor: "transparent",
              color: "#EF4444",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              transition: "transform 0.1s ease, background-color 0.2s ease",
            }}
          >
            🚪 Leave Room
          </button>
          
          <button
            onClick={handleReady}
            style={{
              flex: "2",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#E50914",
              color: "white",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "700",
              boxShadow: "0 6px 20px rgba(229, 9, 20, 0.4)",
              transition: "transform 0.1s ease, background-color 0.2s ease",
            }}
          >
            I'm Ready 🎬
          </button>
        </div>
      </div>
    </div>
  );
}

export default GroupLobby;
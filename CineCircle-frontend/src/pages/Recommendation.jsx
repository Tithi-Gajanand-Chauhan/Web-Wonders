import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const genreIdToName = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western"
};

const countryCodeToName = {
  "US": "United States",
  "IN": "India",
  "GB": "United Kingdom",
  "CA": "Canada",
  "FR": "France",
  "DE": "Germany",
  "IT": "Italy",
  "ES": "Spain",
  "JP": "Japan",
  "KR": "South Korea",
  "CN": "China",
  "RU": "Russia",
  "BR": "Brazil",
  "MX": "Mexico",
  "AU": "Australia"
};

function Recommendation() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    groupCode,
    currentUser,
    recommendations: savedRecommendations = [],
    compatibility: savedCompatibility = 0,
    summary: savedSummary = "",
  } = location.state || {};

  const [localUser, setLocalUser] = useState(currentUser);
  const [recommendations, setRecommendations] = useState(savedRecommendations);
  const [compatibility, setCompatibility] = useState(savedCompatibility);
  const [summary, setSummary] = useState(savedSummary);
  const [compatibilityAnalysis, setCompatibilityAnalysis] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});
  const [winner, setWinner] = useState(null);
  const [votedMovies, setVotedMovies] = useState({});
  const [copied, setCopied] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);
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
          saveRoomToHistory(groupCode, location.state?.groupName, parsed.username);

          if (localUser && localUser !== parsed.username) {
            fetch("https://cinecircle-backend-gjfd.onrender.com/api/groups/join", {
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
      saveRoomToHistory(groupCode, location.state?.groupName, localUser);
    }

    const authInterval = setInterval(checkAuthChange, 1000);
    return () => clearInterval(authInterval);
  }, [activeUser, groupCode, localUser]);

  // Fetch group watchlist on mount
  useEffect(() => {
    if (!groupCode) return;
    async function fetchWatchlist() {
      try {
        const res = await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/group/${groupCode}`);
        const data = await res.json();
        if (data && data.watchlist) {
          setGroupWatchlist(data.watchlist);
        }
      } catch (err) {
        console.error("Error fetching group watchlist:", err);
      }
    }
    fetchWatchlist();
  }, [groupCode]);

  // Sync state if passed via router location state
  useEffect(() => {
    if (savedRecommendations.length > 0) setRecommendations(savedRecommendations);
    if (savedCompatibility) setCompatibility(savedCompatibility);
    if (savedSummary) setSummary(savedSummary);
  }, [savedRecommendations, savedCompatibility, savedSummary]);

  // Fetch active recommendations and hasPrev on mount
  useEffect(() => {
    if (!groupCode) return;
    
    async function syncRecommendations() {
      try {
        const response = await fetch("https://cinecircle-backend-gjfd.onrender.com/api/groups/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ groupCode }),
        });
        if (response.ok) {
          const data = await response.json();
          const recs = Array.isArray(data.recommendations) ? data.recommendations : (data.recommendations || []);
          setRecommendations(recs);
          setCompatibility(data.groupCompatibilityScore || 80);
          setCompatibilityAnalysis(data.compatibilityAnalysis || null);
          setSummary(data.negotiationSummary || "");
          setHasPrev(data.hasPrev || false);
        }
      } catch (err) {
        console.error("Error syncing recommendations:", err);
      }
    }
    syncRecommendations();
  }, [groupCode]);

  // Show Alternative recommendations
  async function handleRegenerate() {
    setLoadingRecs(true);
    setWinner(null); // Reset winner
    setVotedMovies({}); // Reset user votes
    try {
      const response = await fetch("https://cinecircle-backend-gjfd.onrender.com/api/groups/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupCode, forceRegenerate: true }),
      });
      if (response.ok) {
        const data = await response.json();
        const recs = Array.isArray(data.recommendations) ? data.recommendations : (data.recommendations || []);
        setRecommendations(recs);
        setCompatibility(data.groupCompatibilityScore || 80);
        setCompatibilityAnalysis(data.compatibilityAnalysis || null);
        setSummary(data.negotiationSummary || "");
        setHasPrev(data.hasPrev || false);
      } else {
        alert("Failed to fetch alternative recommendations.");
      }
    } catch (err) {
      console.error("Error regenerating recommendations:", err);
      alert("Error contacting the server.");
    } finally {
      setLoadingRecs(false);
    }
  }

  // Go back to previous recommendations
  async function handleGoBack() {
    setLoadingRecs(true);
    setWinner(null); // Reset winner
    setVotedMovies({}); // Reset user votes
    try {
      const response = await fetch("https://cinecircle-backend-gjfd.onrender.com/api/groups/recommend/back", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ groupCode }),
      });
      if (response.ok) {
        const data = await response.json();
        const recs = Array.isArray(data.recommendations) ? data.recommendations : (data.recommendations || []);
        setRecommendations(recs);
        setCompatibility(data.groupCompatibilityScore || 80);
        setCompatibilityAnalysis(data.compatibilityAnalysis || null);
        setSummary(data.negotiationSummary || "");
        setHasPrev(data.hasPrev || false);
      } else {
        alert("Failed to go back to previous recommendations.");
      }
    } catch (err) {
      console.error("Error going back in recommendations history:", err);
      alert("Error contacting the server.");
    } finally {
      setLoadingRecs(false);
    }
  }

  // Live polling for group votes so everyone sees live vote tallies
  useEffect(() => {
    if (!groupCode) return;

    const fetchVotes = async () => {
      try {
        const response = await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/votes/${groupCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.votes) setVoteCounts(data.votes);
          if (data.watchlist) setGroupWatchlist(data.watchlist);
        }
      } catch (error) {
        console.error("Error polling votes:", error);
      }
    };

    fetchVotes();
    const interval = setInterval(fetchVotes, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [groupCode]);

  // Missing session fallback
  if (!groupCode) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#141414",
          color: "white",
          display: "flex",
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
          <h2 style={{ marginBottom: "12px", fontSize: "22px" }}>No Session Found</h2>
          <p style={{ color: "#AAA", marginBottom: "24px", fontSize: "14px" }}>
            Session expired or missing group context.
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

  // Fetch Group Winner
  async function getWinner() {
    try {
      const response = await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/winner/${groupCode}`);
      const data = await response.json();
      setWinner(data);
    } catch (error) {
      console.error("Winner calculation error:", error);
    }
  }

  // Submit/Toggle Vote Handler
  async function handleVote(movieId) {

  const isCurrentlyVoted = !!votedMovies[movieId];

  const targetMovie = recommendations.find(
    movie => movie.movieId === movieId
  );

  // Only allow one selected movie
  const updatedVotes = {};

  if (!isCurrentlyVoted) {
    updatedVotes[movieId] = true;
  }

  setVotedMovies(updatedVotes);

  try {

    const response = await fetch(
      "https://cinecircle-backend-gjfd.onrender.com/api/groups/vote",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          groupCode,
          movieId,
          movieTitle: targetMovie?.title,
          username: localUser,
          action: isCurrentlyVoted
            ? "unvote"
            : "vote"
        })
      }
    );

    const data = await response.json();

    console.log(data);

    if (data.votes) {
      setVoteCounts(data.votes);
    }

  } catch (err) {

    console.error(err);

  }

}

  // Share summary feature
  const copyGroupSummary = () => {
    const textToCopy = `🍿 CineCircle Group Results!\nRoom: ${groupCode}\nCompatibility: ${compatibility}%\n\n${summary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "#FFFFFF",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ width: "100%", maxWidth: "850px" }}>
        
        {/* Banner Header Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #1F1F1F 0%, #141414 100%)",
            border: "1px solid #2C2C2C",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "32px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "16px",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  letterSpacing: "2px",
                  color: "#E50914",
                  textTransform: "uppercase",
                }}
              >
                CineCircle AI Consensus • Code: {groupCode}
              </span>
              <h1
                style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  margin: "6px 0 0 0",
                  letterSpacing: "-0.5px",
                }}
              >
                Top Group Matches 🎬
              </h1>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {compatibility !== null && (
                <div
                  style={{
                    backgroundColor: "#E5091422",
                    border: "1px solid #E5091455",
                    padding: "8px 16px",
                    borderRadius: "20px",
                  }}
                >
                  <span
                    style={{
                      color: "#E50914",
                      fontWeight: "700",
                      fontSize: "14px",
                    }}
                  >
                    🎯 Compatibility: {compatibility}%
                  </span>
                </div>
              )}

              <button
                onClick={copyGroupSummary}
                style={{
                  padding: "8px 14px",
                  backgroundColor: "#2B2B2B",
                  color: "#AAA",
                  border: "1px solid #3B3B3B",
                  borderRadius: "20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                {copied ? "✓ Copied!" : "📋 Share"}
              </button>

              <button
                onClick={async () => {
                  try {
                    const myUsername = activeUser?.username || localUser || "Guest";
                    await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/${groupCode}/leave`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ username: myUsername })
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
                  padding: "8px 14px",
                  backgroundColor: "transparent",
                  color: "#EF4444",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  borderRadius: "20px",
                  fontSize: "13px",
                  cursor: "pointer",
                  fontWeight: "600",
                  transition: "all 0.2s ease"
                }}
              >
                🚪 Leave Room
              </button>
            </div>
          </div>

          {summary && (
            <p
              style={{
                fontSize: "15px",
                color: "#B0B0B0",
                lineHeight: "1.6",
                margin: 0,
              }}
            >
              {summary}
            </p>
          )}
        </div>

        {/* Compatibility Analytics Section */}
        {compatibilityAnalysis && (
          <div
            className="compatibility-analytics-card"
            style={{
              background: "linear-gradient(135deg, #1F1F1F 0%, #171717 100%)",
              border: "1px solid #333",
              borderRadius: "16px",
              padding: "28px",
              marginBottom: "32px",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "800",
                color: "#E50914",
                marginTop: 0,
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                letterSpacing: "-0.3px",
              }}
            >
              📊 Compatibility Analytics
            </h2>

            {/* Pairwise Matches Grid */}
            {compatibilityAnalysis && compatibilityAnalysis.pairwise && compatibilityAnalysis.pairwise.length > 0 ? (
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "13px", color: "#888", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
                  Member Pairwise Match Matrix
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "14px" }}>
                  {compatibilityAnalysis.pairwise.map((pair, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: "#262626",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #363636",
                        transition: "transform 0.2s ease, border-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.borderColor = "#E5091488";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.borderColor = "#363636";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <span style={{ fontSize: "14px", fontWeight: "700", color: "#FFF" }}>
                          👥 {pair.user1} + {pair.user2}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "800", color: "#E50914" }}>
                          {pair.score}% Match
                        </span>
                      </div>
                      {/* Progress Bar */}
                      <div
                        style={{
                          height: "6px",
                          width: "100%",
                          backgroundColor: "#3a3a3a",
                          borderRadius: "3px",
                          overflow: "hidden",
                          marginBottom: "8px"
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pair.score}%`,
                            backgroundColor: "#E50914",
                            borderRadius: "3px",
                            transition: "width 0.5s ease-in-out",
                          }}
                        />
                      </div>
                      {pair.sharedGenres && pair.sharedGenres.length > 0 ? (
                        <div style={{ fontSize: "11px", color: "#888", display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                          <span style={{ color: "#aaa" }}>Shared:</span>
                          {pair.sharedGenres.map((g, i) => (
                            <span key={i} style={{ backgroundColor: "#1e1e1e", padding: "1px 6px", borderRadius: "4px", fontSize: "10px" }}>{g}</span>
                          ))}
                        </div>
                      ) : (
                        <div style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>No shared genres selected</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ backgroundColor: "#262626", padding: "16px", borderRadius: "12px", border: "1px solid #363636", color: "#888", fontSize: "13px", textAlign: "center", marginBottom: "24px" }}>
                Add more members to compute member-to-member compatibility!
              </div>
            )}

            {/* Shared Agreements & Resolved Conflicts */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              {/* Agreements (Shared Tastes) */}
              <div
                style={{
                  backgroundColor: "#262626",
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid #363636",
                }}
              >
                <h4 style={{ fontSize: "14px", color: "#4CAF50", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>✓</span> Shared Tastes (Agreements)
                </h4>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#B0B0B0", fontSize: "13px", lineHeight: "1.6" }}>
                  {compatibilityAnalysis?.agreements?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "6px" }}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Conflicts (Negotiated Points) */}
              <div
                style={{
                  backgroundColor: "#262626",
                  padding: "18px",
                  borderRadius: "12px",
                  border: "1px solid #363636",
                }}
              >
                <h4 style={{ fontSize: "14px", color: "#FF9800", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 12px 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡</span> Resolved Conflicts (Negotiations)
                </h4>
                <ul style={{ margin: 0, paddingLeft: "18px", color: "#B0B0B0", fontSize: "13px", lineHeight: "1.6" }}>
                  {compatibilityAnalysis?.conflicts?.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: "6px" }}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Winner Header Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0 }}>
            Recommendations ({recommendations.length})
          </h2>
          
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={handleGoBack}
              disabled={!hasPrev || loadingRecs}
              style={{
                padding: "10px 16px",
                backgroundColor: !hasPrev || loadingRecs ? "#1E1E1E" : "#2B2B2B",
                color: !hasPrev || loadingRecs ? "#666" : "#FFF",
                border: "1px solid #444",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: !hasPrev || loadingRecs ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
              }}
            >
              ⬅️ Previous Rec
            </button>

            <button
              onClick={handleRegenerate}
              disabled={loadingRecs}
              style={{
                padding: "10px 16px",
                backgroundColor: "#2B2B2B",
                color: "#E50914",
                border: "1px solid #E50914",
                borderRadius: "10px",
                fontWeight: "600",
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🔄 Recommend Alternatives
            </button>

            <button
              onClick={getWinner}
              style={{
                padding: "10px 20px",
                backgroundColor: winner ? "#FFD700" : "#2B2B2B",
                color: winner ? "#000" : "#FFD700",
                border: "1px solid #FFD700",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                boxShadow: winner ? "0 0 16px rgba(255, 215, 0, 0.4)" : "none",
              }}
            >
              {winner ? "🏆 Winner Calculated!" : "🏆 Calculate Final Winner"}
            </button>
          </div>
        </div>

        {/* Winner Highlight Banner */}
        {winner && (
          <div
            style={{
              backgroundColor: "#1E1E1E",
              border: "2px solid #FFD700",
              padding: "24px",
              borderRadius: "16px",
              marginBottom: "32px",
              textAlign: "center",
              boxShadow: "0 0 24px rgba(255, 215, 0, 0.25)",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <span style={{ fontSize: "36px" }}>👑</span>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#FFD700",
                margin: "8px 0 4px 0",
              }}
            >
              Group Winner: {winner.title}
            </h2>
            <p style={{ color: "#AAA", margin: 0, fontSize: "14px" }}>
              Selected with <strong>{winner.votes || 0}</strong> group vote(s)! Get the popcorn ready.
            </p>
          </div>
        )}

        {/* Shared Watchlist Horizontal Tray */}
        {groupWatchlist.length > 0 && (
          <div
            style={{
              background: "linear-gradient(135deg, #1A1A1A 0%, #111111 100%)",
              border: "1px solid #2B2B2B",
              borderRadius: "16px",
              padding: "20px 24px",
              marginBottom: "32px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.4)"
            }}
          >
            <h3 style={{ margin: "0 0 16px 0", fontSize: "15px", fontWeight: "800", color: "#FFD700", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>🍿</span> Shared Room Watchlist ({groupWatchlist.length})
            </h3>
            <div style={{ display: "flex", gap: "16px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin" }}>
              {groupWatchlist.map((m) => {
                const myUsername = activeUser?.username || localUser || "Guest";
                const isLikedByMe = m.likes && m.likes.includes(myUsername);
                const likesCount = m.likes ? m.likes.length : 0;
                const likesTooltip = m.likes && m.likes.length > 0
                  ? `Liked by: ${m.likes.join(", ")}`
                  : "Like this movie";

                const isAddedByMe = m.addedBy && m.addedBy.toLowerCase().trim() === myUsername.toLowerCase().trim();

                return (
                  <div key={m.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", flexShrink: 0, width: "86px", textAlign: "center" }}>
                    <div style={{ position: "relative", width: "76px", height: "110px" }}>
                      <img
                        src={m.poster_path ? (m.poster_path.startsWith('/') ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : m.poster_path) : 'https://via.placeholder.com/92x138'}
                        alt={m.title}
                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px", border: "1px solid #333" }}
                      />
                      {isAddedByMe && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            try {
                              await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/${groupCode}/watchlist/remove`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ movieId: m.id, username: myUsername })
                              });
                              setGroupWatchlist(prev => prev.filter(item => item.id !== m.id));
                            } catch (err) {
                              console.error("Remove error:", err);
                            }
                          }}
                          style={{
                            position: "absolute",
                            top: "-6px",
                            right: "-6px",
                            width: "18px",
                            height: "18px",
                            borderRadius: "50%",
                            backgroundColor: "#EF4444",
                            color: "#FFF",
                            border: "none",
                            fontSize: "9px",
                            fontWeight: "900",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.5)"
                          }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                    
                    <span 
                      style={{ fontSize: "11px", color: "#EEE", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}
                      title={m.title}
                    >
                      {m.title}
                    </span>

                    {m.addedBy && (
                      <span 
                        style={{ fontSize: "9px", color: "#888", fontWeight: "500", fontStyle: "italic", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", width: "100%" }}
                        title={`Added by ${m.addedBy}`}
                      >
                        by {m.addedBy}
                      </span>
                    )}

                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        try {
                          const res = await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/${groupCode}/watchlist/${m.id}/like`, {
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
                        borderRadius: "12px",
                        padding: "2px 8px",
                        color: isLikedByMe ? "#E50914" : "#AAA",
                        fontSize: "9px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        marginTop: "2px",
                        transition: "all 0.15s ease"
                      }}
                      title={likesTooltip}
                    >
                      <span>{isLikedByMe ? "❤️" : "🤍"}</span>
                      <span>{likesCount}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {loadingRecs && (
          <div style={{ textAlign: "center", padding: "40px", color: "#E50914", fontWeight: "700", border: "1px dashed rgba(229, 9, 20, 0.3)", borderRadius: "16px", marginBottom: "24px" }}>
            🔄 Finding alternative movies... Please wait...
          </div>
        )}

        {/* Movie Cards List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", opacity: loadingRecs ? 0.4 : 1, transition: "opacity 0.2s ease" }}>
          {recommendations.map((movie, index) => {
            const isWinnerMovie = winner && (String(winner.movieId) === String(movie.movieId) || winner.title === movie.title);
            const isVotedByMe = !!votedMovies[movie.movieId];

            return (
              <div
                key={movie.movieId || index}
                className="recommendation-movie-card"
                style={{
                  backgroundColor: "#1A1A1A",
                  border: isWinnerMovie ? "2px solid #FFD700" : "1px solid #2B2B2B",
                  borderRadius: "16px",
                  padding: "20px",
                  boxShadow: isWinnerMovie
                    ? "0 0 20px rgba(255, 215, 0, 0.15)"
                    : "0 4px 16px rgba(0, 0, 0, 0.3)",
                  position: "relative",
                  transition: "all 0.2s ease",
                }}
              >
                {isWinnerMovie && (
                  <span
                    style={{
                      position: "absolute",
                      top: "-12px",
                      right: "20px",
                      backgroundColor: "#FFD700",
                      color: "#000",
                      fontSize: "11px",
                      fontWeight: "800",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    🏆 Final Winner
                  </span>
                )}

                <div style={{ position: "relative", flexShrink: 0 }}>
                  <img
                    src={
                      movie.poster ||
                      "https://via.placeholder.com/180x260?text=No+Poster"
                    }
                    alt={movie.title}
                    style={{
                      width: "130px",
                      height: "190px",
                      objectFit: "cover",
                      borderRadius: "10px",
                      backgroundColor: "#111111",
                      display: "block"
                    }}
                  />
                  {(movie.badge || (movie.genres && movie.genres.length > 0 && genreIdToName[movie.genres[0]])) && (
                    <span
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        backgroundColor: "#FFFFFF",
                        color: "#141414",
                        fontSize: "0.62rem",
                        fontWeight: "800",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
                      }}
                    >
                      {movie.badge || `TOP ${genreIdToName[movie.genres[0]].toUpperCase()}`}
                    </span>
                  )}
                </div>

                <div
                  className="recommendation-movie-details"
                  style={{
                    flexGrow: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minHeight: "190px",
                  }}
                >
                  <div>
                    <div
                      className="recommendation-movie-title-row"
                    >
                      <h3
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          margin: 0,
                        }}
                      >
                        {index + 1}. {movie.title}
                      </h3>
                      <span
                        style={{
                          fontSize: "13px",
                          backgroundColor: "#2B2B2B",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          color: "#FFD700",
                          fontWeight: "600",
                        }}
                      >
                        ⭐ {movie.rating ? Number(movie.rating).toFixed(1) : "N/A"}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "13px",
                        color: "#AAA",
                        margin: "0 0 12px 0",
                        lineHeight: "1.5",
                      }}
                    >
                      <strong style={{ color: "#FFF" }}>AI Reason:</strong>{" "}
                      {movie.explainableAIReason || "Matched based on group preferences."}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px", fontSize: "12.5px" }}>
                      {movie.matchedMembers && movie.matchedMembers.length > 0 && (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>🎯</span>
                          <strong style={{ color: "#AAA" }}>Matches:</strong>
                          <span style={{ color: "#E50914", fontWeight: "700" }}>{movie.matchedMembers.join(", ")}</span>
                        </div>
                      )}
                      
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", color: "#888" }}>
                        <span>📅</span>
                        <strong style={{ color: "#AAA" }}>Year:</strong>
                        <span style={{ color: "#FFF" }}>
                          {movie.releaseDate ? movie.releaseDate.split('-')[0] : (movie.year || '2026')}
                        </span>
                        
                        <span style={{ color: "#444" }}>•</span>
                        
                        <span>🏷️</span>
                        <strong style={{ color: "#AAA" }}>Genre:</strong>
                        <span style={{ color: "#FFF" }}>
                          {movie.genres && movie.genres.length > 0 
                            ? movie.genres.map(id => genreIdToName[id]).filter(Boolean).slice(0, 3).join(', ') 
                            : (movie.genre || 'N/A')}
                        </span>
                      </div>

                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      onClick={() =>
                        navigate(`/movie/${movie.movieId}`, {
                          state: {
                            recommendations,
                            compatibility,
                            summary,
                            groupCode,
                            currentUser: localUser,
                          },
                        })
                      }
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#2B2B2B",
                        color: "#FFFFFF",
                        border: "1px solid #3D3D3D",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      🎬 View Details
                    </button>

                    <button
                      onClick={() => handleVote(movie.movieId)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: isVotedByMe ? "#2E7D32" : "#E50914",
                        color: "#FFFFFF",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "background-color 0.2s ease",
                      }}
                    >
                      {isVotedByMe ? "✓ Voted" : "👍 Vote"}
                    </button>

                    <button
                      onClick={async () => {
                        try {
                          const username = activeUser?.username || localUser || "Guest";
                          const movieObj = {
                            id: movie.movieId || movie.id,
                            title: movie.title,
                            poster_path: movie.poster || movie.poster_path,
                            vote_average: Number(movie.rating) || 7.5,
                            release_date: movie.releaseDate || movie.year || "2026",
                            overview: movie.overview || "",
                            addedBy: username,
                            likes: []
                          };

                          const res = await fetch(`https://cinecircle-backend-gjfd.onrender.com/api/groups/${groupCode}/watchlist/add`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ 
                              movie: movieObj,
                              addedBy: username
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            setGroupWatchlist(prev => {
                              const exists = prev.some(m => m.id === movieObj.id);
                              if (!exists) return [...prev, movieObj];
                              return prev;
                            });

                            const hasUser = !!localStorage.getItem('cinecircle_user');
                            if (!hasUser) {
                              alert(`"${movie.title}" saved to the Shared Room Watchlist! 🍿\n\nNote: If you want to save this recommendation to your personal profile permanently, please sign in or sign up first!`);
                            } else {
                              alert(`"${movie.title}" saved to the Shared Room Watchlist! 🍿`);
                            }
                          }
                        } catch (err) {
                          console.error("Failed to add to shared watchlist:", err);
                        }
                      }}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#1F1F1F",
                        color: "#FFD700",
                        border: "1px solid rgba(255, 215, 0, 0.4)",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      🍿 Save to Room
                    </button>

                    <span
                      style={{
                        fontSize: "13px",
                        color: "#AAA",
                        marginLeft: "auto",
                        fontWeight: "600",
                      }}
                    >
                      Group Votes: {voteCounts[movie.movieId] || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Recommendation;
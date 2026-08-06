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

  const [recommendations, setRecommendations] = useState(savedRecommendations);
  const [compatibility, setCompatibility] = useState(savedCompatibility);
  const [summary, setSummary] = useState(savedSummary);
  const [voteCounts, setVoteCounts] = useState({});
  const [winner, setWinner] = useState(null);
  const [votedMovies, setVotedMovies] = useState({});
  const [copied, setCopied] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [loadingRecs, setLoadingRecs] = useState(false);

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
        const response = await fetch("http://localhost:5000/api/groups/recommend", {
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
      const response = await fetch("http://localhost:5000/api/groups/recommend", {
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
      const response = await fetch("http://localhost:5000/api/groups/recommend/back", {
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
        const response = await fetch(`http://localhost:5000/api/groups/votes/${groupCode}`);
        if (response.ok) {
          const data = await response.json();
          if (data.votes) setVoteCounts(data.votes);
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
      const response = await fetch(`http://localhost:5000/api/groups/winner/${groupCode}`);
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
      "http://localhost:5000/api/groups/vote",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          groupCode,
          movieId,
          movieTitle: targetMovie?.title,
          username: currentUser,
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
                style={{
                  backgroundColor: "#1A1A1A",
                  border: isWinnerMovie ? "2px solid #FFD700" : "1px solid #2B2B2B",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  gap: "20px",
                  flexDirection: "row",
                  alignItems: "flex-start",
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
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "8px",
                      }}
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
                        ⭐ {movie.rating || "N/A"}
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
                            currentUser,
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
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function JoinGroup() {
  const [groupCode, setGroupCode] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  async function joinGroup(e) {
    if (e) e.preventDefault();
    setErrorMessage("");

    const cleanUsername = username.trim();
    const cleanCode = groupCode.trim().toUpperCase();

    if (!cleanUsername) {
      setErrorMessage("Please enter your name.");
      return;
    }

    if (!cleanCode) {
      setErrorMessage("Please enter a group code.");
      return;
    }

    if (cleanCode.length !== 6) {
      setErrorMessage("Group code must be exactly 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/groups/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: cleanCode,
          username: cleanUsername,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (!response.ok || !data.success) {
        setErrorMessage(data.message || "Unable to join group. Check the code and try again.");
        setLoading(false);
        return;
      }

      // Navigate to Lobby with clean payload state
      navigate("/lobby", {
        state: {
          groupName: data.group.groupName,
          groupCode: data.group.code,
          currentUser: cleanUsername,
          members: data.group.members || [],
        },
      });
    } catch (error) {
      console.error("Join group error:", error);
      setErrorMessage("Server connection error. Please make sure the backend is running.");
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "#FFFFFF",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#1E1E1E",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.6)",
          border: "1px solid #2B2B2B",
          textAlign: "center",
        }}
      >
        {/* Branding & Header */}
        <div style={{ fontSize: "42px", marginBottom: "12px" }}>🎟️</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "800",
            marginBottom: "8px",
            letterSpacing: "-0.5px",
          }}
        >
          Join CineCircle
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#A0A0A0",
            marginBottom: "28px",
            lineHeight: "1.4",
          }}
        >
          Enter your name and the 6-character room code shared by your session host.
        </p>

        {/* In-UI Error Banner */}
        {errorMessage && (
          <div
            style={{
              backgroundColor: "#E5091422",
              border: "1px solid #E50914",
              color: "#FF6B6B",
              padding: "12px 16px",
              borderRadius: "10px",
              fontSize: "13px",
              marginBottom: "24px",
              textAlign: "left",
            }}
          >
            ⚠️ {errorMessage}
          </div>
        )}

        <form onSubmit={joinGroup}>
          {/* Input 1: Username */}
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: "700",
                color: "#CCCCCC",
                marginBottom: "8px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Your Name
            </label>
            <input
              type="text"
              placeholder="e.g. Alex"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#121212",
                border: "1px solid #333333",
                borderRadius: "10px",
                color: "#FFFFFF",
                fontSize: "15px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Input 2: Group Code */}
          <div style={{ textAlign: "left", marginBottom: "30px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <label
                style={{
                  fontSize: "12px",
                  fontWeight: "700",
                  color: "#CCCCCC",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Room Code
              </label>
              <span style={{ fontSize: "12px", color: "#888888" }}>
                {groupCode.length}/6
              </span>
            </div>
            <input
              type="text"
              maxLength={6}
              placeholder="e.g. X7K9P2"
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px 16px",
                backgroundColor: "#121212",
                border: `1px solid ${
                  groupCode.length === 6 ? "#E50914" : "#333333"
                }`,
                borderRadius: "10px",
                color: "#FFFFFF",
                fontSize: "18px",
                fontWeight: "700",
                letterSpacing: "3px",
                fontFamily: "monospace",
                textAlign: "center",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s ease",
              }}
            />
          </div>

          {/* Action Buttons */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "15px",
              backgroundColor: loading ? "#666" : "#E50914",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.2s ease",
              boxShadow: loading ? "none" : "0 4px 16px rgba(229, 9, 20, 0.4)",
              marginBottom: "16px",
            }}
          >
            {loading ? "Joining Room..." : "Join Group 🍿"}
          </button>
        </form>

        {/* Back Link */}
        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "#888888",
            fontSize: "13px",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}

export default JoinGroup;
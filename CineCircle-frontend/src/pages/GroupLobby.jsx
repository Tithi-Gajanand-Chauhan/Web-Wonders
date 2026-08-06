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

  const [members, setMembers] = useState(initialMembers);
  const [copied, setCopied] = useState(false);
  const [generating,setGenerating] = useState(false);

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
              currentUser,
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
  }, [groupCode, currentUser, navigate]);



useEffect(() => {

  const interval = setInterval(async()=>{

    try{

      const response = await fetch(
        `http://localhost:5000/api/groups/${groupCode}`
      );


      const data = await response.json();


      setMembers(data.members);


    }
    catch(error){

      console.log(
        "Member sync error:",
        error
      );

    }


  },3000);


  return ()=>clearInterval(interval);


},[groupCode]);

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
        currentUser,
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

        {/* Action Button */}
        <button
          onClick={handleReady}
          style={{
            width: "100%",
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
  );
}

export default GroupLobby;
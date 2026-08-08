import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateGroup() {
  const [groupName, setGroupName] = useState("");
  const [username, setUsername] = useState("");

  const navigate = useNavigate();

  async function createGroup() {
    if (username.trim() === "") {
      alert("Please enter your name.");
      return;
    }

    if (groupName.trim() === "") {
      alert("Please enter a group name.");
      return;
    }

    try {
      const response = await fetch(
        "https://cinecircle-backend-gjfd.onrender.com/api/groups/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            groupName,
            creatorName: username,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create group");
      }

      const data = await response.json();

      console.log("Backend response:", data);

      navigate("/lobby", {
        state: {
          groupName,
          groupCode: data.code,
          currentUser: username,
          members: [username],
        },
      });

    } catch (error) {
      console.error("Create group error:", error);
      alert("Unable to create group. Please try again.");
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
        padding: "20px"
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "#1E1E1E",
          padding: "40px",
          borderRadius: "16px",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.5)",
          border: "1px solid #2B2B2B",
          textAlign: "center"
        }}
      >
        {/* Header Icon & Title */}
        <div style={{ fontSize: "42px", marginBottom: "10px" }}>🍿</div>
        <h1
          style={{
            fontSize: "28px",
            fontWeight: "700",
            marginBottom: "8px",
            letterSpacing: "-0.5px"
          }}
        >
          Create a Group
        </h1>
        <p
          style={{
            fontSize: "14px",
            color: "#A0A0A0",
            marginBottom: "30px"
          }}
        >
          Start a session and invite your friends to pick the perfect movie.
        </p>

        {/* Input: Your Name */}
        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#CCCCCC",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            Your Name
          </label>
          <input
            type="text"
            placeholder="e.g. Tithi"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#121212",
              border: "1px solid #333333",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Input: Group Name */}
        <div style={{ textAlign: "left", marginBottom: "30px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: "600",
              color: "#CCCCCC",
              marginBottom: "8px",
              textTransform: "uppercase",
              letterSpacing: "0.5px"
            }}
          >
            Group Name
          </label>
          <input
            type="text"
            placeholder="e.g. Friday Movie Night"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 16px",
              backgroundColor: "#121212",
              border: "1px solid #333333",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "15px",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={createGroup}
          style={{
            width: "100%",
            padding: "15px",
            backgroundColor: "#E50914",
            color: "#FFFFFF",
            border: "none",
            borderRadius: "10px",
            fontSize: "16px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
            boxShadow: "0 4px 14px rgba(229, 9, 20, 0.4)"
          }}
        >
          Create Group
        </button>
      </div>
    </div>
  );
}
export default CreateGroup;
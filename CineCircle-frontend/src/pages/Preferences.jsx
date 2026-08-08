import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";


function Preferences() {

  const navigate = useNavigate();
  const location = useLocation();

  const { groupName, groupCode, currentUser } = location.state || {};


  const [genres, setGenres] = useState([]);
  const [mood, setMood] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");


  if (!groupCode || !currentUser) {
    return <h2>No Group Data Found</h2>;
  }



  const genreList = [
    "Action",
    "Comedy",
    "Sci-Fi",
    "Romance",
    "Horror",
    "Thriller"
  ];


  const moodList = [
    "Happy",
    "Relaxed",
    "Excited",
    "Emotional",
    "Sad"
  ];


  const languageList = [
    "English",
    "Hindi",
    "Gujarati",
    "Marathi",
    "Telugu"
  ];


  const durationList = [
    "Under 2 hours",
    "2–3 hours",
    "More than 3 hours"
  ];



  function handleGenreChange(e) {

    const value = e.target.value;


    if(e.target.checked){

      setGenres([...genres,value]);

    }

    else{

      setGenres(
        genres.filter(
          (genre)=>genre!==value
        )
      );

    }

  }



  async function savePreferences(){

    if(
      genres.length===0 ||
      !mood ||
      !language ||
      !duration
    ){

      alert("Please fill all preferences.");
      return;

    }



    const preferences={

      user:currentUser,
      genres,
      mood,
      language,
      duration

    };



    try{


      const response = await fetch(
        "https://cinecircle-backend-gjfd.onrender.com/api/groups/preferences",
        {

          method:"POST",

          headers:{
            "Content-Type":"application/json"
          },

          body:JSON.stringify({

            groupCode,

            preferences

          })

        }
      );


      const data = await response.json();

if(!response.ok){

  alert(data.error || "Something went wrong");
  return;

}


console.log("PREFERENCE SAVED:", data);


const statusResponse = await fetch(
  `https://cinecircle-backend-gjfd.onrender.com/api/groups/status/${groupCode}`
);


const statusData = await statusResponse.json();


console.log("GROUP STATUS:", statusData);



if(statusData.everyoneReady){


  const recResponse = await fetch(
    "https://cinecircle-backend-gjfd.onrender.com/api/groups/recommend",
    {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        groupCode
      })
    }
  );


  const recData = await recResponse.json();

  console.log("FINAL RECOMMENDATIONS:", recData);

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
else{


  alert(
    `Waiting for other members... ${statusData.submittedPreferences}/${statusData.totalMembers} completed`
  );


  navigate("/lobby", {
    state:{
      groupName,
      groupCode,
      currentUser,
      members: []
    }
  });


}  
      



    }

    catch(error){

      console.error(error);

      alert("Server error. Try again.");

    }


  }



  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#141414",
        color: "#FFFFFF",
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
          maxWidth: "600px",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "700",
              letterSpacing: "2px",
              color: "#E50914",
              textTransform: "uppercase",
            }}
          >
            CineCircle Preference Engine
          </span>
          <h1 style={{ fontSize: "32px", fontWeight: "800", margin: "8px 0 12px 0" }}>
            Select Your Preferences
          </h1>
          <div
            style={{
              display: "inline-flex",
              gap: "16px",
              backgroundColor: "#1E1E1E",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "1px solid #2E2E2E",
              fontSize: "13px",
              color: "#AAAAAA",
            }}
          >
            <span>🎬 Group: <strong style={{ color: "white" }}>{groupName}</strong></span>
            <span>🔑 Code: <strong style={{ color: "white", fontFamily: "monospace" }}>{groupCode}</strong></span>
          </div>
        </div>

        {/* Form Card Container */}
        <div
          style={{
            backgroundColor: "#1A1A1A",
            border: "1px solid #282828",
            borderRadius: "16px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.5)",
            marginBottom: "30px",
          }}
        >
          {/* Genres Section */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#E0E0E0" }}>
              🎭 Genres <span style={{ fontSize: "12px", fontWeight: "normal", color: "#888" }}>(Select multiple)</span>
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {genreList.map((genre) => {
                const isSelected = genres.includes(genre);
                return (
                  <label
                    key={genre}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "10px 16px",
                      backgroundColor: isSelected ? "#E5091422" : "#121212",
                      border: `1px solid ${isSelected ? "#E50914" : "#333333"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: isSelected ? "#FFFFFF" : "#CCCCCC",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="checkbox"
                      value={genre}
                      onChange={handleGenreChange}
                      style={{ display: "none" }}
                    />
                    <span>{isSelected ? "✓" : "+"}</span>
                    {genre}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Mood Section */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#E0E0E0" }}>
              ✨ Mood
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {moodList.map((item) => {
                const isSelected = mood === item;
                return (
                  <label
                    key={item}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: isSelected ? "#E50914" : "#121212",
                      border: `1px solid ${isSelected ? "#E50914" : "#333333"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: isSelected ? "#FFFFFF" : "#CCCCCC",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="mood"
                      value={item}
                      onChange={(e) => setMood(e.target.value)}
                      style={{ display: "none" }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Language Section */}
          <div style={{ marginBottom: "28px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#E0E0E0" }}>
              🌐 Language
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {languageList.map((item) => {
                const isSelected = language === item;
                return (
                  <label
                    key={item}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: isSelected ? "#E50914" : "#121212",
                      border: `1px solid ${isSelected ? "#E50914" : "#333333"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: isSelected ? "#FFFFFF" : "#CCCCCC",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="language"
                      value={item}
                      onChange={(e) => setLanguage(e.target.value)}
                      style={{ display: "none" }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Duration Section */}
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "12px", color: "#E0E0E0" }}>
              ⏱️ Duration
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {durationList.map((item) => {
                const isSelected = duration === item;
                return (
                  <label
                    key={item}
                    style={{
                      padding: "10px 16px",
                      backgroundColor: isSelected ? "#E50914" : "#121212",
                      border: `1px solid ${isSelected ? "#E50914" : "#333333"}`,
                      borderRadius: "10px",
                      cursor: "pointer",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: isSelected ? "#FFFFFF" : "#CCCCCC",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <input
                      type="radio"
                      name="duration"
                      value={item}
                      onChange={(e) => setDuration(e.target.value)}
                      style={{ display: "none" }}
                    />
                    {item}
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={savePreferences}
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
          Save Preferences 🚀
        </button>
      </div>
    </div>
  );
}


export default Preferences;
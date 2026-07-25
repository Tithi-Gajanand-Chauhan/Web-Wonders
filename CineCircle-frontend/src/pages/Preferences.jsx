import { useState } from "react";
import {useNavigate, useLocation } from "react-router-dom";

function Preferences() {
  const navigate = useNavigate();
  const location = useLocation();
  const { groupName, groupCode, currentUser } = location.state || {};
  if (!groupCode || !currentUser) {
    return <h2>No Group Data Found</h2>;
}
  
  const [genres, setGenres] = useState([]);
  const [mood, setMood] = useState("");
  const [language, setLanguage] = useState("");
  const [duration, setDuration] = useState("");
  const genreList = ["Action","Comedy","Sci-Fi","Romance","Horror"];

  const moodList = ["Happy","Relaxed","Excited","Emotional","Sad"];

  const languageList = [
  "English",
  "Hindi",
  "Gujarati",
  "Marathi",
  "Telugu",
  ];

  const durationList = [
  "Under 2 hours",
  "2–3 hours",
  "More than 3 hours",
  ];

  function handleGenreChange(e) {
    const value = e.target.value;
    const checked = e.target.checked;

    if (checked) {
      setGenres([...genres, value]);
    } else {
      setGenres(genres.filter((genre) => genre !== value));
    }
  }

  async function savePreferences() {
    if (
      genres.length === 0 ||
      mood === "" ||
      language === "" ||
      duration === ""
    ) {
    alert("Please fill all preferences.");
    return;
  }

  const preferences = {
    user: currentUser,
    genres,
    mood,
    language,
    duration,
  };

  const response = await fetch("http://localhost:5000/api/groups/preferences", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        groupCode: groupCode,
        preferences: preferences
    })
  });

  const data = await response.json();

  if (!response.ok) {
    alert(data.error || "Something went wrong");
    return;
  }

  console.log(data);

  alert("Preferences Saved!");

  navigate("/recommendation", {
    state: {
      groupCode: groupCode
    }
  });
  }

  return (
    <div>
      <h1>Select Your Preferences</h1>

      <p>Group: {groupName}</p>
      <p>Code: {groupCode}</p>

      <h2>Genres</h2>

      {genreList.map((genre) => (
        <div key={genre}>
          <input type="checkbox" value={genre} onChange={handleGenreChange}/>
          <label>{genre}</label>
        </div>
      ))}
      <p>Selected Genres: {genres.join(", ")}</p>

      <h2>Mood</h2>

      {moodList.map((item) => (
        <div key={item}>
          <input type="radio" name="mood" value={item} onChange={(e) => setMood(e.target.value)}/>
          <label>{item}</label>
        </div>
      ))}
      <p>Selected Mood: {mood}</p>

      <h2>Language</h2>

      {languageList.map((item) => (
        <div key={item}>
          <input type="radio" name="language" value={item} onChange={(e) => setLanguage(e.target.value)}/>
          <label>{item}</label>
        </div>
      ))}

      <p>Selected Language: {language}</p>

      <h2>Duration</h2>

      {durationList.map((item) => (
        <div key={item}>
          <input type="radio" name="duration" value={item} onChange={(e) => setDuration(e.target.value)}/>
          <label>{item}</label>
        </div>
      ))}

      <p>Selected Duration: {duration}</p>

      <button onClick={savePreferences}>Save Preferences</button>
    </div>
  );
}

export default Preferences;
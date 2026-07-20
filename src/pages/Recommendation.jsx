import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


function Recommendation() {
  
  const [movie, setMovie] = useState(null);
  const location = useLocation();
  const { groupCode } = location.state || {};

  if (!groupCode) {
    return <h2>No Group Data Found</h2>;
  }

  useEffect(() => {
    async function getRecommendation() {
        const response = await fetch("http://localhost:5000/api/recommend", {
            method: "POST",
            headers:{
              "Content-Type":"application/json",
            },
            body: JSON.stringify({
              groupCode: groupCode
            })
        });
        const data = await response.json();
        setMovie(data.movie);
    }
    getRecommendation();}, [groupCode]);

    if (!movie) {
    return <h2>Loading recommendation...</h2>;
    }
  
  return (
    <div>
      <h1>Your Recommendation</h1>

      <img src={movie.poster} alt={movie.title}/>
      <h2>{movie.title}</h2>

      <p><strong>Genre:</strong> {movie.genre}</p>

      <p><strong>Language:</strong> {movie.language}</p>

      <p><strong>Duration:</strong> {movie.duration}</p>

      <p><strong>Rating:</strong> ⭐ {movie.rating}</p>

      <h3>Why this recommendation?</h3>

      <p>{movie.reason}</p>

      <button>Watch Trailer</button>

      <button>Recommend Another</button>


    </div>
  );
}

export default Recommendation;
function Recommendation() {
  
  const movie = {
    title: "Interstellar",
    genre: "Sci-Fi, Adventure",
    language: "English",
    duration: "2h 49m",
    rating: "4.8",
    poster: "https://via.placeholder.com/250x350",
    reason: "Your group likes Sci-Fi, English movies, and longer watch times."
  };
  
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
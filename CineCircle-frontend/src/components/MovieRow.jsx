import MovieCard from './MovieCard';

function MovieRow({ title, movies }) {
  return (
    <section className="movie-row">
      <h2 className="row-title">{title}</h2>
      <div className="row-scroll">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </section>
  );
}

export default MovieRow;
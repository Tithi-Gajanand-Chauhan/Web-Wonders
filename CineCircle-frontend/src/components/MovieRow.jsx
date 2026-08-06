import { useRef } from 'react';
import MovieCard from './MovieCard';

function MovieRow({
  title,
  movies = [],
  isTop10 = false,
  onPlayTrailer,
  onToggleWatchlist,
  isInWatchlist,
}) {
  const rowRef = useRef(null);

  const handleScroll = (direction) => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: scrollLeft + scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className={`movie-row-wrapper ${isTop10 ? 'top10-row-wrapper' : ''}`}>
      <div className="row-header">
        <div className="row-title-box">
          <h2 className="row-title">{title}</h2>
          <button className="explore-all-btn">Explore All ›</button>
        </div>
        <div className="row-header-dashes">
          <span className="dash active" />
          <span className="dash" />
          <span className="dash" />
        </div>
      </div>

      <div className="row-controls-wrapper">
        <button
          className="scroll-arrow arrow-left"
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className="row-scroll-container" ref={rowRef}>
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id || index}
              movie={movie}
              isTop10={isTop10}
              rank={isTop10 ? index + 1 : undefined}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isSaved={isInWatchlist ? isInWatchlist(movie.id) : false}
            />
          ))}
        </div>

        <button
          className="scroll-arrow arrow-right"
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}

export default MovieRow;
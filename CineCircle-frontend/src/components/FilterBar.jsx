function FilterBar({
  genres = [],
  genreFilter,
  setGenreFilter,
  yearFilter,
  setYearFilter,
  ratingFilter,
  setRatingFilter,
}) {
  const hasActiveFilters = genreFilter || yearFilter || ratingFilter;

  const clearFilters = () => {
    setGenreFilter('');
    setYearFilter('');
    setRatingFilter('');
  };

  return (
    <div className="filter-bar-container">
      <div className="filter-select-wrapper">
        <select
          className={`filter-select-pill ${genreFilter ? 'active' : ''}`}
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">Genres</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>

        <select
          className={`filter-select-pill ${yearFilter ? 'active' : ''}`}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">Release Year</option>
          {Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          className={`filter-select-pill ${ratingFilter ? 'active' : ''}`}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">User Rating</option>
          <option value="9">Rating 9.0+</option>
          <option value="8">Rating 8.0+</option>
          <option value="7">Rating 7.0+</option>
        </select>

        {hasActiveFilters && (
          <button className="filter-reset-btn" onClick={clearFilters}>
            Reset Filters ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default FilterBar;
function FilterBar({
  genres,
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
    <div className="filters-bar">
      <div className="filter-group">
        <label className="filter-label">Genre</label>
        <select
          className={`filter-select ${genreFilter ? 'filter-active' : ''}`}
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="">All</option>
          {genres.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Year</label>
        <select
          className={`filter-select ${yearFilter ? 'filter-active' : ''}`}
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
        >
          <option value="">All</option>
          {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Rating</label>
        <select
          className={`filter-select ${ratingFilter ? 'filter-active' : ''}`}
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
        >
          <option value="">Any</option>
          <option value="9">9+</option>
          <option value="8">8+</option>
          <option value="7">7+</option>
          <option value="6">6+</option>
          <option value="5">5+</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button className="filter-clear-btn" onClick={clearFilters}>
          Clear Filters ✕
        </button>
      )}
    </div>
  );
}

export default FilterBar;
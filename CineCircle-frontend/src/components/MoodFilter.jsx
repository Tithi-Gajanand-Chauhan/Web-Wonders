const CATEGORIES = [
  { id: 'All', label: 'All Categories' },
  { id: 'Sci-Fi', label: 'Sci-Fi Universe' },
  { id: 'Cartoons & Animation', label: 'Cartoons & Animation' },
  { id: 'Action', label: 'Action & Thriller' },
  { id: 'Feel-Good', label: 'Comedy & Drama' },
  { id: 'Dark & Gritty', label: 'Crime & Mystery' },
  { id: 'Award Winners', label: 'Award Winners' },
];

function MoodFilter({ selectedMood, onSelectMood }) {
  return (
    <div className="category-tabs-container">
      <div className="category-pills-row">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`category-pill ${selectedMood === cat.id ? 'active' : ''}`}
            onClick={() => onSelectMood(cat.id)}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodFilter;

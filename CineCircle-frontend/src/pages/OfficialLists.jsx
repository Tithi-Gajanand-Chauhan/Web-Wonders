import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMoviesByList } from '../services/api';
import './OfficialLists.css';

const LISTS_DEFINITION = [
  {
    category: "By Decade 📅",
    description: "Explore cinema history through curated films grouped by the decade of release.",
    lists: [
      { id: "decade-1970s", name: "Top Films of the 1970s", desc: "The golden age of cinema featuring revolutionary filmmaking." },
      { id: "decade-1980s", name: "Top Films of the 1980s", desc: "Classic blockbusters, pop-culture icons, and synth soundtracks." },
      { id: "decade-1990s", name: "Top Films of the 1990s", desc: "The indie revolution, groundbreaking CGI, and iconic storytelling." },
      { id: "decade-2000s", name: "Top Films of the 2000s", desc: "New millennium masterpieces and high-concept cinema." },
      { id: "decade-2010s", name: "Top Films of the 2010s", desc: "The modern classics, superhero epics, and streaming breakthroughs." },
      { id: "decade-2020s", name: "Top Films of the 2020s", desc: "Films of the current decade showing the latest in cinema." }
    ]
  },
  {
    category: "By Director 🎬",
    description: "Discover works from historically underrepresented or distinct director categories.",
    lists: [
      { id: "director-women", name: "Top Films by Women Directors", desc: "Powerful narratives and distinct cinematic visions from top female filmmakers." },
      { id: "director-black", name: "Top Films by Black Directors", desc: "Essential voices and ground-breaking stories in black cinema history." },
      { id: "director-queer", name: "Top Films by Queer Directors", desc: "Important, pioneering, and evocative films depicting queer narratives." }
    ]
  },
  {
    category: "By Format 📹",
    description: "Browse film listings organized by their runtimes, production style, and formats.",
    lists: [
      { id: "format-documentaries", name: "Top Documentaries", desc: "Real-world stories, historical captures, and insightful real-life tales." },
      { id: "format-animated", name: "Top Animated Films", desc: "Breathtaking artistry, hand-drawn and digital animation masterpieces." },
      { id: "format-shorts", name: "Top Short Films", desc: "Compelling storytelling packed into brief, high-impact running times." },
      { id: "format-miniseries", name: "Top Miniseries", desc: "Highly-acclaimed, long-form episodic stories that feel like extended movies." }
    ]
  },
  {
    category: "By Subgenre ☯️",
    description: "Dive deep into specific niche movie styles beyond typical broad genres.",
    lists: [
      { id: "subgenre-romcom", name: "Romantic Comedy", desc: "Classic laugh-out-loud stories about falling in love and finding matches." },
      { id: "subgenre-samurai", name: "Samurai Films", desc: "Legendary sword fights, honor codes, and Japanese historical epics." },
      { id: "subgenre-spy", name: "Spy Films", desc: "High-octane espionage, secret operations, gadgets, and double agents." },
      { id: "subgenre-wuxia", name: "Wuxia Films", desc: "Breathtaking martial arts, fantasy elements, and traditional Chinese tales." }
    ]
  },
  {
    category: "By Region/Nation 🌎",
    description: "Travel the world through the lens of international regional cinema hubs.",
    lists: [
      { id: "region-indian", name: "Top 100 Indian Films", desc: "Vibrant musicals, high-drama stories, and Bollywood/Tollywood masterpieces." },
      { id: "region-japanese", name: "Japanese Masterpieces", desc: "Timeless black-and-white classics, surreal features, and beautiful stories." },
      { id: "region-latin", name: "Latin American Cinema", desc: "Evocative, raw, and colorful filmmaking from South & Central America." }
    ]
  },
  {
    category: "By Popularity Metrics ❤️",
    description: "Browse curated films sorted by total user fan counts and metrics.",
    lists: [
      { id: "popularity-mostfans", name: "Top Films with the Most Fans", desc: "The ultimate fan favorites that have been watched, rated, and loved the most." }
    ]
  }
];

function OfficialLists() {
  const navigate = useNavigate();
  const [listsMovies, setListsMovies] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadPreviews() {
      try {
        setLoading(true);
        const previewData = {};
        
        // Fetch previews in parallel for a premium, fast experience
        const promises = LISTS_DEFINITION.flatMap(cat => cat.lists).map(async (list) => {
          try {
            const data = await getMoviesByList(list.id, 1);
            if (active) {
              previewData[list.id] = (data?.results || []).slice(0, 5);
            }
          } catch (e) {
            console.error(`Failed to fetch preview for list ${list.id}:`, e);
            if (active) {
              previewData[list.id] = [];
            }
          }
        });

        await Promise.all(promises);
        if (active) {
          setListsMovies(previewData);
        }
      } catch (err) {
        console.error("Failed to load previews:", err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPreviews();
    window.scrollTo(0, 0);

    return () => { active = false; };
  }, []);

  const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w185';

  return (
    <div className="official-lists-page">
      <div className="lists-hero-banner">
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="lists-hero-content">
          <h1>Official Curated Lists</h1>
          <p>Discover cinema beyond standard genres. Explore collections grouped by decades, directors, formats, subgenres, regions, and fans popularity.</p>
        </div>
      </div>

      <div className="lists-content-container">
        {LISTS_DEFINITION.map((cat, idx) => (
          <section key={idx} className="category-group-section">
            <div className="category-group-header">
              <h2>{cat.category}</h2>
              <p className="category-group-subtitle">{cat.description}</p>
            </div>

            <div className="lists-cards-grid">
              {cat.lists.map((list) => {
                const movies = listsMovies[list.id] || [];
                return (
                  <div key={list.id} className="list-card-item">
                    <div className="list-card-details">
                      <h3>{list.name}</h3>
                      <p>{list.desc}</p>
                    </div>

                    <div className="list-card-preview-row">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <div key={i} className="preview-poster-skeleton animate-pulse" />
                        ))
                      ) : movies.length === 0 ? (
                        <div className="preview-no-movies">No movies found in this list</div>
                      ) : (
                        movies.map((movie) => {
                          const posterUrl = movie.poster_path
                            ? (movie.poster_path.startsWith('/') ? `${IMAGE_BASE_URL}${movie.poster_path}` : movie.poster_path)
                            : 'https://via.placeholder.com/154x231?text=No+Poster';
                          
                          return (
                            <div 
                              key={movie.id} 
                              className="preview-poster-wrapper"
                              onClick={() => navigate(`/movie/${movie.id}`)}
                              title={`${movie.title} - View Details`}
                            >
                              <img src={posterUrl} alt={movie.title} className="preview-poster-img" />
                              <div className="preview-poster-hover-overlay">
                                <span className="preview-poster-title">{movie.title}</span>
                                <span className="preview-poster-rating">★ {movie.vote_average?.toFixed(1) || '0.0'}</span>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button 
                      className="list-card-explore-btn"
                      onClick={() => navigate(`/explore/${list.id}`)}
                    >
                      Explore List Matches
                      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" className="btn-arrow-icon">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default OfficialLists;

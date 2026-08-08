import { useState, useEffect, useMemo } from 'react';
import HeroSpotlight from '../components/HeroSpotlight';
import TrendingSection from '../components/TrendingSection';
import MovieRow from '../components/MovieRow';

import {
  getPopularMovies,
  getRecentMovies,
  getSciFiMovies,
  getAnimationMovies,
  getKoreanMovies,
  getChineseMovies,
  getHindiMovies,
  getGujaratiMovies,
  getMarathiMovies,
  getTeluguMovies,
  getTamilMovies,
  getBengaliMovies,
  getMalayalamMovies,
  getGenres,
} from '../services/api';

function Home({ onPlayTrailer, onToggleWatchlist, isInWatchlist, onOpenWatchParty, safeSearch = true }) {
  const [rows, setRows] = useState({
    popular: [],
    recent: [],
    scifi: [],
    animation: [],
    korean: [],
    chinese: [],
    hindi: [],
    gujarati: [],
    marathi: [],
    telugu: [],
    tamil: [],
    bengali: [],
    malayalam: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAll() {
      try {
        setLoading(true);
        const [
          popular, recent, scifi, animation, korean, chinese,
          hindi, gujarati, marathi, telugu, tamil, bengali, malayalam,
          genreData
        ] = await Promise.all([
          getPopularMovies(),
          getRecentMovies(),
          getSciFiMovies(),
          getAnimationMovies(),
          getKoreanMovies(),
          getChineseMovies(),
          getHindiMovies(),
          getGujaratiMovies(),
          getMarathiMovies(),
          getTeluguMovies(),
          getTamilMovies(),
          getBengaliMovies(),
          getMalayalamMovies(),
          getGenres(),
        ]);

        setRows({
          popular: popular.results || [],
          recent: recent.results || [],
          scifi: scifi.results || [],
          animation: animation.results || [],
          korean: korean.results || [],
          chinese: chinese.results || [],
          hindi: hindi.results || [],
          gujarati: gujarati.results || [],
          marathi: marathi.results || [],
          telugu: telugu.results || [],
          tamil: tamil.results || [],
          bengali: bengali.results || [],
          malayalam: malayalam.results || [],
        });
      } catch (err) {
        console.error('Failed to fetch movies:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAll();
  }, []);

  const applyFilters = (movies) => {
    return movies.filter((movie) => {
      // Safe Search filter
      if (safeSearch) {
        if (movie.adult === true) return false;
        if (movie.age_rating === '18+' || movie.age_rating === 'NC-17') return false;
      }

      return true;
    });
  };

  const filteredRows = useMemo(
    () => ({
      popular: applyFilters(rows.popular).slice(0, 10),
      recent: applyFilters(rows.recent).slice(0, 10),
      scifi: applyFilters(rows.scifi).slice(0, 10),
      animation: applyFilters(rows.animation).slice(0, 10),
      korean: applyFilters(rows.korean).slice(0, 10),
      chinese: applyFilters(rows.chinese).slice(0, 10),
      hindi: applyFilters(rows.hindi).slice(0, 10),
      telugu: applyFilters(rows.telugu).slice(0, 10),
      tamil: applyFilters(rows.tamil).slice(0, 10),
      bengali: applyFilters(rows.bengali).slice(0, 10),
      malayalam: applyFilters(rows.malayalam).slice(0, 10),
      marathi: applyFilters(rows.marathi).slice(0, 10),
      gujarati: applyFilters(rows.gujarati).slice(0, 10),
    }),
    [rows, safeSearch]
  );

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#141414'
      }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <main className="home-page-layout">
      {/* Hero Spotlight Featured Banner */}
      {filteredRows.popular.length > 0 && (
        <HeroSpotlight
          movies={filteredRows.popular}
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />
      )}

      <div className="home-content-container">
        {/* Watch Party Quick-Start Banner */}
        <div
          style={{
            background: "linear-gradient(135deg, #E50914 0%, #9B0F15 100%)",
            borderRadius: "16px",
            padding: "28px",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "24px",
            boxShadow: "0 8px 32px rgba(229, 9, 20, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <div style={{ flex: "1 1 500px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", letterSpacing: "1.5px", textTransform: "uppercase", color: "#FFD700", display: "block", marginBottom: "6px" }}>
              🍿 Collaborative Group Decision Engine
            </span>
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: "0 0 8px 0", color: "#FFF", letterSpacing: "-0.5px" }}>
              Host an AI-Powered Watch Party Room!
            </h2>
            <p style={{ fontSize: "14px", color: "rgba(255,255,255,0.9)", margin: 0, lineHeight: "1.5", maxWidth: "600px" }}>
              Tired of endless scrolling? Gather your friends in a shared lobby, enter your moods, and let CineCircle negotiate your tastes to find the perfect movie compromise in 60 seconds!
            </p>
          </div>
          
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <button
              onClick={onOpenWatchParty}
              style={{
                padding: "12px 24px",
                backgroundColor: "#FFFFFF",
                color: "#000",
                border: "none",
                borderRadius: "10px",
                fontWeight: "750",
                fontSize: "14px",
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
            >
              Start a Room 🍿
            </button>
            
            <button
              onClick={onOpenWatchParty}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#FFFFFF",
                border: "2px solid #FFFFFF",
                borderRadius: "10px",
                fontWeight: "750",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "scale(1.03)";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              Join Room 🎟️
            </button>
          </div>
        </div>



        {/* Dynamic Trending Tabs: Today Trending, Weekly Trending, Monthly Trending, New Releases */}
        <TrendingSection
          onPlayTrailer={onPlayTrailer}
          onToggleWatchlist={onToggleWatchlist}
          isInWatchlist={isInWatchlist}
        />

        {/* Categorized Movie Rows */}
          <>
             <MovieRow
              title="New Releases & Recent Hits"
              movies={filteredRows.recent}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="recent"
            />

            <MovieRow
              title="Top Rated Masterpieces"
              movies={filteredRows.popular}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="popular"
            />

            <MovieRow
              title="Sci-Fi Universe"
              movies={filteredRows.scifi}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="scifi"
            />

            <MovieRow
              title="Cartoons & Animated Hits"
              movies={filteredRows.animation}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="animation"
            />

            <MovieRow
              title="Korean Masterpieces & Cinema"
              movies={filteredRows.korean}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="korean"
            />

             <MovieRow
              title="Chinese Cinema & Blockbusters"
              movies={filteredRows.chinese}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="chinese"
            />

            <MovieRow
              title="Bollywood & Hindi Blockbusters"
              movies={filteredRows.hindi}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="indian"
            />

            <MovieRow
              title="Telugu Cinema & Hits"
              movies={filteredRows.telugu}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="telugu"
            />

            <MovieRow
              title="Tamil Cinema & Hits"
              movies={filteredRows.tamil}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="tamil"
            />

            <MovieRow
              title="Bengali Cinema & Hits"
              movies={filteredRows.bengali}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="bengali"
            />

            <MovieRow
              title="Malayalam Cinema & Hits"
              movies={filteredRows.malayalam}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="malayalam"
            />

            <MovieRow
              title="Marathi Cinema & Hits"
              movies={filteredRows.marathi}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="marathi"
            />

            <MovieRow
              title="Gujarati Cinema & Hits"
              movies={filteredRows.gujarati}
              onPlayTrailer={onPlayTrailer}
              onToggleWatchlist={onToggleWatchlist}
              isInWatchlist={isInWatchlist}
              section="gujarati"
            />
          </>
      </div>
    </main>
  );
}

export default Home;
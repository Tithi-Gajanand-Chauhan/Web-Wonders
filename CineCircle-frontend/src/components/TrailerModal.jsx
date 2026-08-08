import { useEffect, useState } from 'react';
import { getTrailerIframeUrl, getMovieTrailerKey, fetchMovieTrailer, fetchMovieVideos } from '../services/api';

function TrailerModal({ movie, onClose }) {
  const [iframeSrc, setIframeSrc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [trailersList, setTrailersList] = useState([]);
  const [activeKey, setActiveKey] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (!movie) return;

    let cancelled = false;

    async function loadTrailer() {
      setLoading(true);
      setError(false);
      setIframeSrc(null);
      setTrailersList([]);
      setActiveKey(null);

      let knownKey = getMovieTrailerKey(movie);
      let list = [];
      let primaryKey = null;

      try {
        const data = await fetchMovieVideos(movie.id);
        if (!cancelled && data && Array.isArray(data.trailers) && data.trailers.length > 0) {
          const filtered = data.trailers.filter(v => v.type === 'Trailer' || v.type === 'Teaser');
          
          const getRelevanceScore = (v) => {
            let score = 0;
            const nameLower = (v.name || '').toLowerCase();
            if (v.type === 'Trailer') score += 50;
            if (v.official) score += 30;

            if (nameLower.includes('official trailer')) score += 100;
            else if (nameLower.includes('trailer')) score += 40;
            else if (nameLower.includes('teaser')) score += 20;

            if (nameLower.includes('official')) score += 10;

            // List of words that usually identify short marketing clips, bts, interviews, or song/music videos rather than trailers
            const negativeKeywords = [
              'bts', 'behind the scenes', 'interview', 'making of', 'song', 
              'clip', 'tv spot', 'promo', 'featurette', 'scene', 'lyric', 
              'thank', 'appreciat', 'review', 'reaction', 'reel', 'short',
              'status', 'teaser spot', 'clipping', 'tribute'
            ];
            for (const word of negativeKeywords) {
              if (nameLower.includes(word)) {
                score -= 200;
                break;
              }
            }
            return score;
          };

          const highQualityOnly = filtered.filter(v => getRelevanceScore(v) >= 0);

          if (highQualityOnly.length > 0) {
            list = highQualityOnly.sort((a, b) => {
              const getLangCode = (t) => {
                const lower = (t.name || '').toLowerCase();
                const movieTitle = (movie.title || '').toLowerCase();
                const movieOrigTitle = (movie.original_title || '').toLowerCase();
                let nameWithoutTitle = lower;
                if (movieTitle) nameWithoutTitle = nameWithoutTitle.replace(movieTitle, '');
                if (movieOrigTitle) nameWithoutTitle = nameWithoutTitle.replace(movieOrigTitle, '');

                if (nameWithoutTitle.includes('telugu')) return 'te';
                if (nameWithoutTitle.includes('tamil')) return 'ta';
                if (nameWithoutTitle.includes('malayalam')) return 'ml';
                if (nameWithoutTitle.includes('bengali') || nameWithoutTitle.includes('bangla')) return 'bn';
                if (nameWithoutTitle.includes('hindi')) return 'hi';
                if (nameWithoutTitle.includes('marathi')) return 'mr';
                if (nameWithoutTitle.includes('gujarati')) return 'gu';
                if (nameWithoutTitle.includes('kannada')) return 'kn';
                if (nameWithoutTitle.includes('punjabi')) return 'pa';
                if (nameWithoutTitle.includes('urdu')) return 'ur';
                if (nameWithoutTitle.includes('odia') || nameWithoutTitle.includes('oriya')) return 'or';
                if (nameWithoutTitle.includes('assamese')) return 'as';

                // Check for wrong language tags on TMDB
                if (t.language && t.language !== 'en') {
                  const langMapKeywords = { 
                    bn: 'bengali', te: 'telugu', ta: 'tamil', ml: 'malayalam', hi: 'hindi',
                    mr: 'marathi', gu: 'gujarati', kn: 'kannada', pa: 'punjabi', ur: 'urdu',
                    or: 'odia', as: 'assamese'
                  };
                  const langKeyword = langMapKeywords[t.language];
                  const hasKeyword = langKeyword && lower.includes(langKeyword);
                  if (!hasKeyword) {
                    return movie.original_language || 'en';
                  }
                }

                if (t.language === 'en') {
                  const origLang = movie.original_language || 'en';
                  if (origLang !== 'en') {
                    return origLang;
                  }
                }
                return t.language;
              };

              const aLang = getLangCode(a);
              const bLang = getLangCode(b);

              const origLang = movie.original_language || 'en';
              const langsOrder = [origLang, 'en', 'hi'];
              const uniqueOrder = [...new Set(langsOrder)];

              const aIdx = uniqueOrder.indexOf(aLang);
              const bIdx = uniqueOrder.indexOf(bLang);
              
              if (aIdx !== -1 && bIdx !== -1 && aIdx !== bIdx) return aIdx - bIdx;
              if (aIdx !== -1 && bIdx === -1) return -1;
              if (bIdx !== -1 && aIdx === -1) return 1;
              
              const aScore = getRelevanceScore(a);
              const bScore = getRelevanceScore(b);
              if (aScore !== bScore) {
                return bScore - aScore;
              }
              
              return 0;
            });
            primaryKey = list[0].key;
          }
        }
      } catch (err) {
        console.error('Failed to load dynamic trailers:', err);
      }

      if (cancelled) return;

      if (list.length === 0) {
        if (knownKey) {
          list = [{
            key: knownKey,
            name: 'Official Trailer',
            language: 'en',
            type: 'Trailer',
            official: true
          }];
          primaryKey = knownKey;
        } else {
          const fallbackKey = movie.trailer_key;
          if (fallbackKey) {
            list = [{
              key: fallbackKey,
              name: 'Trailer',
              language: 'en',
              type: 'Trailer',
              official: true
            }];
            primaryKey = fallbackKey;
          } else {
            const DIVERSE_TRAILERS = [
              'JfVOs4VSpmA', 'Way9Dexny3w', 'uYPbbksJxIg', 'g4Hbz2jLXvQ',
              'zSWdZVtXT7E', 'YoHD9XEInc0', 'LEjhY15eCx0', '5xH0HfJHsaY',
              'gCcx85zbxz4', 'XdKzUbAiswE', '9ix7TUGVYIo', 'ByXuk9QqQkk'
            ];
            const index = Math.abs(parseInt(movie.id) || 0) % DIVERSE_TRAILERS.length;
            const fallbackKeyKey = DIVERSE_TRAILERS[index];
            list = [{
              key: fallbackKeyKey,
              name: 'Official Trailer',
              language: 'en',
              type: 'Trailer',
              official: true
            }];
            primaryKey = fallbackKeyKey;
          }
        }
      }

      if (list.length > 0 && primaryKey) {
        setTrailersList(list);
        setActiveKey(primaryKey);
        setIframeSrc(`https://www.youtube.com/embed/${primaryKey}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&enablejsapi=1`);
        setLoading(false);
      } else {
        setError(true);
        setLoading(false);
      }
    }

    loadTrailer();
    return () => { cancelled = true; };
  }, [movie]);

  const handleTrailerChange = (key) => {
    setActiveKey(key);
    setIframeSrc(`https://www.youtube.com/embed/${key}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&enablejsapi=1`);
  };

  const getTrailerLabel = (t) => {
    const langMap = {
      en: 'English',
      hi: 'Hindi',
      te: 'Telugu',
      ta: 'Tamil',
      ml: 'Malayalam',
      bn: 'Bengali',
      mr: 'Marathi',
      gu: 'Gujarati',
      ko: 'Korean',
      ja: 'Japanese',
      es: 'Spanish',
      fr: 'French',
      zh: 'Chinese',
      kn: 'Kannada',
      pa: 'Punjabi',
      ur: 'Urdu',
      or: 'Odia',
      as: 'Assamese'
    };

    // Parse language from title in case TMDB categorised it as 'en' but the title explicitly specifies a regional language
    let detectedLanguage = null;
    const lowerName = (t.name || '').toLowerCase();
    
    // Strip movie title to avoid matching words from the title (e.g. "Bangla" in "Bhooth Bangla")
    const movieTitle = (movie.title || '').toLowerCase();
    const movieOrigTitle = (movie.original_title || '').toLowerCase();
    let nameWithoutTitle = lowerName;
    if (movieTitle) nameWithoutTitle = nameWithoutTitle.replace(movieTitle, '');
    if (movieOrigTitle) nameWithoutTitle = nameWithoutTitle.replace(movieOrigTitle, '');

    if (nameWithoutTitle.includes('telugu')) detectedLanguage = 'Telugu';
    else if (nameWithoutTitle.includes('tamil')) detectedLanguage = 'Tamil';
    else if (nameWithoutTitle.includes('malayalam')) detectedLanguage = 'Malayalam';
    else if (nameWithoutTitle.includes('bengali') || nameWithoutTitle.includes('bangla')) detectedLanguage = 'Bengali';
    else if (nameWithoutTitle.includes('hindi')) detectedLanguage = 'Hindi';
    else if (nameWithoutTitle.includes('marathi')) detectedLanguage = 'Marathi';
    else if (nameWithoutTitle.includes('gujarati')) detectedLanguage = 'Gujarati';
    else if (nameWithoutTitle.includes('kannada')) detectedLanguage = 'Kannada';
    else if (nameWithoutTitle.includes('punjabi')) detectedLanguage = 'Punjabi';
    else if (nameWithoutTitle.includes('urdu')) detectedLanguage = 'Urdu';
    else if (nameWithoutTitle.includes('odia') || nameWithoutTitle.includes('oriya')) detectedLanguage = 'Odia';
    else if (nameWithoutTitle.includes('assamese')) detectedLanguage = 'Assamese';

    // If TMDb language tag is different from movie language, verify if the title actually contains that language's name.
    // If it doesn't, treat it as a contributor entry mistake and fallback to movie's original language.
    if (!detectedLanguage && t.language && t.language !== 'en') {
      const videoLangName = langMap[t.language] || '';
      const hasVideoLangInTitle = videoLangName && lowerName.includes(videoLangName.toLowerCase());
      if (!hasVideoLangInTitle) {
        const origLang = movie.original_language || 'en';
        if (langMap[origLang]) {
          detectedLanguage = langMap[origLang];
        }
      }
    }

    // If no language is explicitly mentioned in the title, and the TMDB language is 'en',
    // but the movie's original language is regional, treat this default trailer as the original language!
    if (!detectedLanguage && t.language === 'en') {
      const origLang = movie.original_language || 'en';
      if (origLang !== 'en' && langMap[origLang]) {
        detectedLanguage = langMap[origLang];
      }
    }

    const langName = detectedLanguage || langMap[t.language] || '';
    if (langName) {
      const hasLang = t.name.toLowerCase().includes(langName.toLowerCase());
      return hasLang ? t.name : `${langName}: ${t.name || t.type || 'Trailer'}`;
    }
    return t.name || 'Trailer';
  };

  if (!movie) return null;

  return (
    <div className="modal-backdrop trailer-backdrop" onClick={onClose}>
      <div className="trailer-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn trailer-close-btn" onClick={onClose}>✕</button>
        <div className="trailer-iframe-wrapper">
          {loading && (
            <div className="modal-loading-placeholder">
              <div className="modal-spinner" />
              <span>Loading Trailer...</span>
            </div>
          )}

          {error && !loading && (
            <div className="modal-error-placeholder">
              <span>🎬 Trailer not available for this movie</span>
            </div>
          )}

          {!loading && iframeSrc && (
            <iframe
              src={iframeSrc}
              title={`${movie.title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        <div className="trailer-modal-info">
          <h2>{movie.title}</h2>
          <div className="modal-meta-row">
            <span className="badge-match">{movie.match_percentage || 98}% Match</span>
            <span className="badge-age">{movie.age_rating || 'PG-13'}</span>
            <span>Rating {movie.vote_average?.toFixed(1)}</span>
            <span>{movie.release_date?.split('-')[0]}</span>
          </div>
          <p>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}

export default TrailerModal;

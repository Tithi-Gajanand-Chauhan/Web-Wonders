import { useState } from 'react';

const RATING_LABELS = {
  1: "Appalling",
  2: "Horrible",
  3: "Very Bad",
  4: "Bad",
  5: "Average",
  6: "Fine",
  7: "Good",
  8: "Very Good",
  9: "Excellent",
  10: "Masterpiece"
};

export default function RatingSystem({ reviews, onRatingSubmit, userRating }) {
  const [hoverRating, setHoverRating] = useState(0);

  // Calculate stats from reviews
  const totalReviews = reviews.length;
  const ratingCounts = Array(11).fill(0); // 0 to 10
  let ratingSum = 0;

  reviews.forEach(r => {
    const val = Math.round(r.rating);
    if (val >= 1 && val <= 10) {
      ratingCounts[val]++;
      ratingSum += val;
    }
  });

  const avgRating = totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : "N/A";

  const handleStarClick = (ratingValue) => {
    if (onRatingSubmit) {
      onRatingSubmit(ratingValue);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', marginBottom: '16px', fontWeight: '600' }}>
        Ratings & Stats
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px', alignItems: 'center' }}>
        {/* Left: Overall Rating Box */}
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-glass)', paddingRight: '16px' }}>
          <div style={{ fontSize: '3rem', fontWeight: '800', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', lineHeight: '1' }}>
            {avgRating}
          </div>
          <div style={{ color: 'var(--star-color)', fontSize: '1.25rem', margin: '4px 0' }}>★</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
          </div>
        </div>

        {/* Right: Stars Distribution chart */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(stars => {
            const count = ratingCounts[stars];
            const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <span style={{ width: '16px', color: 'var(--text-secondary)', textAlign: 'right' }}>{stars}</span>
                <span style={{ color: 'var(--text-muted)' }}>★</span>
                <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div 
                    style={{ 
                      height: '100%', 
                      width: `${percentage}%`, 
                      background: 'linear-gradient(90deg, var(--accent-primary), var(--accent-neon))',
                      borderRadius: '3px',
                      transition: 'width 0.5s ease-out'
                    }}
                  />
                </div>
                <span style={{ width: '20px', color: 'var(--text-secondary)', textAlign: 'left' }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-glass)', paddingTop: '20px', textAlign: 'center' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '10px' }}>
          {userRating > 0 ? "Your Rating" : "Rate this media"}
        </h4>
        
        {/* Star Rating Inputs */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '4px', marginBottom: '8px' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(starIdx => {
            const isLit = (hoverRating || userRating) >= starIdx;
            return (
              <button
                key={starIdx}
                type="button"
                onMouseEnter={() => setHoverRating(starIdx)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => handleStarClick(starIdx)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1.65rem',
                  color: isLit ? 'var(--star-color)' : 'rgba(255, 255, 255, 0.15)',
                  textShadow: isLit ? '0 0 10px var(--star-glow)' : 'none',
                  transition: 'transform 0.15s ease, color 0.15s ease',
                  transform: (hoverRating === starIdx) ? 'scale(1.25)' : 'scale(1)'
                }}
              >
                ★
              </button>
            );
          })}
        </div>

        {/* Dynamic Label Indicator */}
        <div style={{ minHeight: '20px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--accent-neon)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {(hoverRating || userRating) > 0 ? (
            <span>
              {(hoverRating || userRating)}/10 - {RATING_LABELS[hoverRating || userRating]}
            </span>
          ) : (
            <span style={{ color: 'var(--text-muted)' }}>Hover and click to rate</span>
          )}
        </div>
      </div>
    </div>
  );
}

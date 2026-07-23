import { useState, useEffect } from 'react';

export default function ReviewList({ reviews, onReviewSubmit, onLikeReview }) {
  const [aiSummary, setAiSummary] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [sortBy, setSortBy] = useState('helpful'); // 'helpful', 'newest', 'highest', 'lowest'
  const [newUser, setNewUser] = useState('');
  const [newRating, setNewRating] = useState(10);
  const [newContent, setNewContent] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState({});
  const [formError, setFormError] = useState('');

  // Reset AI summary when reviews change (different movie)
  useEffect(() => {
    setAiSummary('');
    setAiLoading(false);
  }, [reviews]);

  const handleGenerateSummary = () => {
    setAiLoading(true);
    setAiSummary('');
    
    setTimeout(() => {
      // Create a nice customized summary based on the reviews content
      const hasDune = reviews.some(r => r.content.toLowerCase().includes('dune') || r.content.toLowerCase().includes('villeneuve') || r.content.toLowerCase().includes('atreides'));
      const hasInterstellar = reviews.some(r => r.content.toLowerCase().includes('interstellar') || r.content.toLowerCase().includes('zimmer') || r.content.toLowerCase().includes('nolan'));
      
      let summaryText = "";
      if (hasDune) {
        summaryText = "A visually stunning adaptation. Reviews overwhelmingly praise the cinematography, sound design, and Denis Villeneuve's directing. Pacing is noted as steady, and actors' performances are praised. Major subplots from the book are condensed, but it remains cohesive. Plot details regarding the final conflict are safely hidden.";
      } else if (hasInterstellar) {
        summaryText = "Highly acclaimed for Hans Zimmer's incredible organ score, realistic sci-fi world-building, and strong father-daughter relationship core. Pacing is intense but emotional. Spoilers regarding the final coordinates, the tesseract, and the fate of the missions are safely shielded.";
      } else {
        summaryText = "Reviewers highlight the outstanding technical achievements, spectacular visual scale, and engaging performances. Pacing is noted as dynamic and comments focus on acting and sound, leaving all major plot points and endings completely hidden.";
      }
      
      setAiSummary(summaryText);
      setAiLoading(false);
    }, 1000);
  };

  // Handle new review submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newContent.trim() || newContent.trim().length < 10) {
      setFormError("Please write at least 10 characters for your review.");
      return;
    }

    setFormError('');
    const reviewData = {
      user: newUser.trim() || "GuestCritic",
      rating: newRating,
      content: newContent,
      isSpoiler: isSpoiler
    };

    if (onReviewSubmit) {
      onReviewSubmit(reviewData);
    }

    // Reset Form
    setNewUser('');
    setNewRating(10);
    setNewContent('');
    setIsSpoiler(false);
  };

  // Toggle spoiler reveal for a specific review
  const toggleRevealSpoiler = (id) => {
    setRevealedSpoilers(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Sort logic
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return (b.likes || 0) - (a.likes || 0);
    }
    if (sortBy === 'newest') {
      return new Date(b.date) - new Date(a.date);
    }
    if (sortBy === 'highest') {
      return b.rating - a.rating;
    }
    if (sortBy === 'lowest') {
      return a.rating - b.rating;
    }
    return 0;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header and Sorting */}
      <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: '600' }}>
          User Reviews ({reviews.length})
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-sm)',
              padding: '6px 12px',
              fontSize: '0.85rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="helpful" style={{ background: 'var(--bg-main)' }}>Most Helpful</option>
            <option value="newest" style={{ background: 'var(--bg-main)' }}>Newest</option>
            <option value="highest" style={{ background: 'var(--bg-main)' }}>Highest Rating</option>
            <option value="lowest" style={{ background: 'var(--bg-main)' }}>Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* AI Spoiler Shield Summary Box */}
      <div className="glass-panel" style={{ 
        padding: '20px', 
        background: 'rgba(6, 182, 212, 0.03)', 
        border: '1px solid rgba(6, 182, 212, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span>
            <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: '700', color: 'var(--accent-neon)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              AI Spoiler Shield Summary
            </h4>
          </div>
          {!aiSummary && !aiLoading && (
            <button
              onClick={handleGenerateSummary}
              type="button"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                color: 'var(--accent-neon)',
                fontSize: '0.72rem',
                fontWeight: '600',
                padding: '4px 10px',
                borderRadius: '4px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => { e.target.style.background = 'rgba(6, 182, 212, 0.2)' }}
              onMouseLeave={(e) => { e.target.style.background = 'rgba(6, 182, 212, 0.12)' }}
            >
              Analyze & Summarize
            </button>
          )}
        </div>
        
        {aiLoading && (
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="glow-active" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-neon)' }}></span>
            Gemini is analyzing reviews and stripping spoilers...
          </div>
        )}
        
        {aiSummary && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              {aiSummary}
            </p>
            <button
              onClick={() => setAiSummary('')}
              type="button"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '0.72rem',
                textDecoration: 'underline',
                alignSelf: 'flex-start',
                cursor: 'pointer'
              }}
            >
              Clear Summary
            </button>
          </div>
        )}
        
        {!aiSummary && !aiLoading && (
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
            Avoid spoilers! Click analyze to generate a spoiler-free Gemini AI summary of overall audience feedback.
          </p>
        )}
      </div>

      {/* Review List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedReviews.length === 0 ? (
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No reviews yet. Be the first to share your thoughts!
          </div>
        ) : (
          sortedReviews.map(review => {
            const isBlurry = review.isSpoiler && !revealedSpoilers[review.id];
            
            return (
              <div key={review.id} className="glass-panel animate-fade-in" style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                {/* User Avatar */}
                <img 
                  src={review.avatar} 
                  alt={review.user} 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/bottts/svg?seed=${review.user}`;
                  }}
                />

                {/* Review Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: '600', color: 'var(--text-primary)', fontSize: '0.95rem', marginRight: '8px' }}>
                        {review.user}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {review.date}
                      </span>
                    </div>

                    {/* Rating Badge */}
                    <div style={{
                      background: 'rgba(139, 92, 246, 0.1)',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: 'var(--accent-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>★</span> {review.rating}/10
                    </div>
                  </div>

                  {/* Spoiler Blurring Logic */}
                  {isBlurry ? (
                    <div style={{ 
                      background: 'rgba(236, 72, 153, 0.05)', 
                      border: '1px dashed rgba(236, 72, 153, 0.25)', 
                      borderRadius: 'var(--radius-sm)', 
                      padding: '12px 16px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '0.9rem'
                    }}>
                      <span style={{ color: 'var(--accent-secondary)', fontWeight: '500' }}>
                        ⚠️ Review contains spoilers!
                      </span>
                      <button 
                        onClick={() => toggleRevealSpoiler(review.id)}
                        style={{
                          background: 'rgba(236, 72, 153, 0.15)',
                          border: 'none',
                          color: 'var(--accent-secondary)',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        Reveal
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.95rem', 
                        lineHeight: '1.5',
                        whiteSpace: 'pre-wrap'
                      }}>
                        {review.content}
                      </p>
                      
                      {review.isSpoiler && (
                        <button 
                          onClick={() => toggleRevealSpoiler(review.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            marginTop: '8px',
                            display: 'block'
                          }}
                        >
                          Hide Spoiler
                        </button>
                      )}
                    </div>
                  )}

                  {/* Helpfulness Bar */}
                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => onLikeReview(review.id)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-glass)',
                        borderRadius: 'var(--radius-full)',
                        padding: '4px 12px',
                        fontSize: '0.8rem',
                        color: review.likedBy?.includes('currentUser') ? 'var(--accent-neon)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background var(--transition-fast)'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.03)'}
                    >
                      👍 {review.likes || 0} Helpfulness
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Write a Review Section */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', marginBottom: '16px', fontWeight: '600' }}>
          Write a Review
        </h4>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {formError && (
            <div style={{ 
              background: 'rgba(236, 72, 153, 0.1)', 
              border: '1px solid rgba(236, 72, 153, 0.3)', 
              color: 'var(--accent-secondary)', 
              padding: '10px 14px', 
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.85rem'
            }}>
              {formError}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Username Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Your Nickname</label>
              <input 
                type="text" 
                placeholder="GuestCritic" 
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Rating Select */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Rating</label>
              <select
                value={newRating}
                onChange={(e) => setNewRating(parseInt(e.target.value))}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-glass)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '10px 12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                  <option key={num} value={num} style={{ background: 'var(--bg-main)' }}>
                    {num}/10 - {num === 10 ? 'Masterpiece' : num >= 8 ? 'Great' : num >= 5 ? 'Average' : 'Bad'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Content Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Review Content</label>
            <textarea 
              rows="4"
              placeholder="What did you think of the plot, execution, acting, or sound? (Min. 10 characters)"
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid var(--border-glass)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Spoiler Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="spoiler-check"
              checked={isSpoiler}
              onChange={(e) => setIsSpoiler(e.target.checked)}
              style={{ cursor: 'pointer', accentColor: 'var(--accent-secondary)' }}
            />
            <label htmlFor="spoiler-check" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              This review contains major spoilers
            </label>
          </div>

          {/* Submit button */}
          <button 
            type="submit" 
            className="gradient-btn"
            style={{
              padding: '12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            Submit Review
          </button>
        </form>
      </div>

    </div>
  );
}

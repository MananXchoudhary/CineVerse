import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { movieService, movieSearchService, reviewService } from '../../services/api';
import { MovieCard } from '../../components/common/MovieCard';
import {
  Plus, X, Film, Search, SortAsc, ChevronLeft, ChevronRight,
  Star, Upload, MessageSquare, AlertCircle,
} from 'lucide-react';
import './MovieCatalog.css';

const PAGE_SIZE = 6;

// ─────────────────────────────────────────────────────────────
// StarRating — interactive star picker
// ─────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, readOnly = false }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="star-picker" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${(hover || value) >= star ? 'active' : ''}`}
          onClick={() => !readOnly && onChange && onChange(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          disabled={readOnly}
          aria-label={`${star} star`}
        >
          <Star size={18} fill={(hover || value) >= star ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// ReviewsPanel — slide-in drawer
// ─────────────────────────────────────────────────────────────
const ReviewsPanel = ({ movie, onClose }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewService.getReviews(movie.id);
        setReviews(Array.isArray(data) ? data : []);
      } catch {
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [movie.id]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '—';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating.'); return; }
    if (!reviewText.trim()) { setError('Please write a review.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const newReview = await reviewService.addReview({
        movieId: String(movie.id),
        userId: `user_${user?.username || 'guest'}`,
        username: user?.username || 'Guest User',
        rating,
        text: reviewText.trim(),
      });
      setReviews((prev) => [newReview, ...prev]);
      setRating(0);
      setReviewText('');
    } catch {
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="reviews-overlay" onClick={onClose}>
      <div className="reviews-drawer glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reviews-header flex">
          <div>
            <h3 className="reviews-title">{movie.title}</h3>
            <p className="reviews-subtitle">
              Reviews &amp; Ratings
              {reviews.length > 0 && (
                <span className="reviews-avg-badge">
                  <Star size={12} fill="currentColor" /> {avgRating} avg ({reviews.length})
                </span>
              )}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} aria-label="Close reviews">
            <X size={20} />
          </button>
        </div>

        {/* Add Review Form */}
        <div className="add-review-section glass-panel">
          <h4 className="add-review-title">
            <MessageSquare size={14} /> Write a Review
          </h4>
          <form onSubmit={handleSubmit}>
            <div className="star-row flex-center">
              <span className="star-label">Your Rating:</span>
              <StarRating value={rating} onChange={setRating} />
            </div>
            <textarea
              className="review-textarea"
              placeholder="Share your thoughts about this movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              disabled={submitting}
            />
            {error && (
              <p className="review-error flex-center">
                <AlertCircle size={13} /> {error}
              </p>
            )}
            <button type="submit" className="btn-primary review-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Reviews List */}
        <div className="reviews-list">
          {loading ? (
            <div className="flex-center" style={{ padding: '30px 0' }}>
              <span className="spinner-small"></span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="reviews-empty text-center">
              <MessageSquare size={36} className="empty-icon" />
              <p>No reviews yet — be the first to review!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.reviewId} className="review-card">
                <div className="review-card-header flex">
                  <div className="reviewer-avatar">{(review.username || 'U')[0]}</div>
                  <div className="reviewer-info">
                    <span className="reviewer-name">{review.username}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  <div className="review-stars flex-center">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={13}
                        fill={i < review.rating ? 'currentColor' : 'none'}
                        className={i < review.rating ? 'star-filled' : 'star-empty'}
                      />
                    ))}
                    <span className="review-rating-num">{review.rating}.0</span>
                  </div>
                </div>
                <p className="review-text">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// Main MovieCatalog component
// ─────────────────────────────────────────────────────────────
export const MovieCatalog = () => {
  const { user, hasPermission } = useAuth();

  // Catalog state
  const [movies, setMovies] = useState([]);
  const [totalMovies, setTotalMovies] = useState(0);
  const [loading, setLoading] = useState(true);

  // Day 05: Search, Sort, Pagination state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');

  // Day 05: Reviews panel state
  const [reviewsMovie, setReviewsMovie] = useState(null);

  // Add Movie Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [overview, setOverview] = useState('');
  const [genres, setGenres] = useState('');
  const [runtime, setRuntime] = useState('2h 00m');
  const [posterUrl, setPosterUrl] = useState('');
  // Day 05: File Upload state
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [category, setCategory] = useState('Bollywood');
  const [isRecent, setIsRecent] = useState(false);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const totalPages = Math.ceil(totalMovies / PAGE_SIZE);

  // ── Fetch movies with search + sort + pagination (Day 05 Search API) ──
  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      // If no search/sort needed, use category filter with base movieService
      if (!searchQuery && activeFilter !== 'All' && activeFilter !== 'Recent') {
        const result = await movieService.getMovies();
        const list = result.data || result;
        const filtered = list.filter((m) => m.category === activeFilter);
        setTotalMovies(filtered.length);
        const page = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
        setMovies(page);
      } else {
        // Use search service (handles search, sort, pagination)
        const result = await movieSearchService.search({
          q: searchQuery,
          sortBy,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        let { movies: fetchedMovies, total } = result;
        // Apply category filter post-search if needed
        if (activeFilter === 'Recent') fetchedMovies = fetchedMovies.filter((m) => m.isRecent);
        setMovies(fetchedMovies);
        setTotalMovies(total);
      }
    } catch (e) {
      console.error('Error fetching movies', e);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortBy, currentPage, activeFilter]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isModalOpen) handleCloseModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, activeFilter]);

  // ── Add Movie ──
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTitle(''); setTagline(''); setOverview(''); setGenres('');
    setRuntime('2h 00m'); setPosterUrl(''); setPosterFile(null);
    setPosterPreview(''); setCategory('Bollywood'); setIsRecent(false);
    setFormError('');
  };

  // Day 05: File Upload — FileReader API
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFormError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFormError('File size must be under 5 MB.');
      return;
    }
    setFormError('');
    setPosterFile(file);
    // Simulate: Read file locally → convert to Data URL (Spring Boot: MultipartFile)
    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPosterUrl(''); // clear URL if file selected
  };

  const handleAddMovieSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) { setFormError('Movie title is required.'); return; }
    if (!overview.trim()) { setFormError('Movie overview is required.'); return; }

    setFormError('');
    setSubmitting(true);

    const finalPoster =
      posterPreview ||
      posterUrl.trim() ||
      'https://images.unsplash.com/photo-1542204172-e70528091869?auto=format&fit=crop&w=400&h=600&q=80';

    const movieData = {
      title: title.trim(),
      tagline: tagline.trim() || 'Experience the magic on screen.',
      overview: overview.trim(),
      genres: genres ? genres.split(',').map((g) => g.trim()) : ['General'],
      runtime: runtime.trim(),
      posterUrl: finalPoster,
      backdropUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&h=675&q=80',
      category,
      isRecent,
    };

    try {
      await movieService.addMovie(movieData);
      await fetchMovies();
      handleCloseModal();
    } catch {
      setFormError('Failed to add movie. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filters = [
    { id: 'All', label: '🎬 All Movies' },
    { id: 'Recent', label: '🔥 Recent' },
    { id: 'Bollywood', label: 'Bollywood' },
    { id: 'South Indian', label: 'South Indian' },
    { id: 'Hollywood', label: 'Hollywood' },
  ];

  return (
    <div className="catalog-container container">
      {/* ── Header ── */}
      <div className="catalog-header flex">
        <div>
          <h2>Cinematic Catalog</h2>
          <p>Explore current hits and secure your seats</p>
        </div>
        {hasPermission('ADD_MOVIES') && (
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex-center">
            <Plus size={20} /> Add New Movie
          </button>
        )}
      </div>

      {/* ── Day 05: Search + Sort Bar ── */}
      <div className="catalog-search-bar glass-panel flex">
        <div className="search-input-wrapper flex-center">
          <Search size={16} className="search-icon" />
          <input
            id="catalog-search"
            type="text"
            className="search-input"
            placeholder="Search by title or genre…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search movies"
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              type="button"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="sort-wrapper flex-center">
          <SortAsc size={15} />
          <label htmlFor="sort-select" className="sort-label">Sort:</label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="rating">Rating ↓</option>
            <option value="title">Title A–Z</option>
            <option value="date">Release Date ↓</option>
          </select>
        </div>
      </div>

      {/* ── Category Filter Tabs ── */}
      <div className="catalog-filters flex">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`filter-tab-btn ${activeFilter === f.id ? 'active' : ''}`}
          >
            {f.label}
          </button>
        ))}
        {searchQuery && (
          <span className="search-results-label">
            Results for "<strong>{searchQuery}</strong>" — {totalMovies} found
          </span>
        )}
      </div>

      {/* ── Movie Grid ── */}
      {loading ? (
        <div className="loader-container flex-center">
          <span className="spinner-small"></span>
        </div>
      ) : movies.length === 0 ? (
        <div className="empty-state text-center">
          <Film size={48} className="empty-icon" />
          <p>No movies found{searchQuery ? ` for "${searchQuery}"` : ' in this category'}.</p>
          {searchQuery && (
            <button className="btn-secondary" onClick={() => setSearchQuery('')}>Clear Search</button>
          )}
        </div>
      ) : (
        <>
          <div className="movie-grid">
            {movies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onReviewsClick={() => setReviewsMovie(movie)}
              />
            ))}
          </div>

          {/* ── Day 05: Pagination ── */}
          {totalPages > 1 && (
            <div className="pagination-bar flex-center">
              <button
                className="page-btn flex-center"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  className={`page-btn ${currentPage === pg ? 'active' : ''}`}
                  onClick={() => setCurrentPage(pg)}
                  aria-label={`Page ${pg}`}
                >
                  {pg}
                </button>
              ))}

              <button
                className="page-btn flex-center"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>

              <span className="pagination-info">
                Page {currentPage} of {totalPages} &nbsp;·&nbsp; {totalMovies} movies
              </span>
            </div>
          )}
        </>
      )}

      {/* ── Day 05: Reviews Panel ── */}
      {reviewsMovie && (
        <ReviewsPanel movie={reviewsMovie} onClose={() => setReviewsMovie(null)} />
      )}

      {/* ── Add Movie Modal ── */}
      {isModalOpen && (
        <div
          className="modal-overlay flex-center"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-label="Add movie modal"
        >
          <div
            className="modal-content glass-panel"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header flex">
              <h3>Add New Movie to Catalog</h3>
              <button onClick={handleCloseModal} className="close-btn" aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            {formError && (
              <div className="error-banner flex">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleAddMovieSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="movie-title">Movie Title *</label>
                <input id="movie-title" type="text" placeholder="e.g., Star Wars: Reborn"
                  value={title} onChange={(e) => setTitle(e.target.value)} disabled={submitting} />
              </div>

              <div className="form-group">
                <label htmlFor="movie-tagline">Tagline</label>
                <input id="movie-tagline" type="text" placeholder="e.g., The galaxy's final hope rises."
                  value={tagline} onChange={(e) => setTagline(e.target.value)} disabled={submitting} />
              </div>

              <div className="form-group">
                <label htmlFor="movie-overview">Overview / Synopsis *</label>
                <textarea id="movie-overview" placeholder="Enter a brief plot description..."
                  value={overview} onChange={(e) => setOverview(e.target.value)}
                  disabled={submitting} rows={3} />
              </div>

              <div className="form-row grid-2">
                <div className="form-group">
                  <label htmlFor="movie-genres">Genres (comma separated)</label>
                  <input id="movie-genres" type="text" placeholder="e.g., Action, Sci-Fi"
                    value={genres} onChange={(e) => setGenres(e.target.value)} disabled={submitting} />
                </div>
                <div className="form-group">
                  <label htmlFor="movie-runtime">Runtime</label>
                  <input id="movie-runtime" type="text" placeholder="e.g., 2h 15m"
                    value={runtime} onChange={(e) => setRuntime(e.target.value)} disabled={submitting} />
                </div>
              </div>

              <div className="form-row grid-2">
                <div className="form-group">
                  <label htmlFor="movie-category">Category *</label>
                  <select id="movie-category" value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={submitting} className="form-select">
                    <option value="Bollywood">Bollywood</option>
                    <option value="South Indian">South Indian</option>
                    <option value="Hollywood">Hollywood</option>
                  </select>
                </div>
                <div className="form-group flex-center-start" style={{ gap: '10px', marginTop: '24px' }}>
                  <input id="movie-recent" type="checkbox" checked={isRecent}
                    onChange={(e) => setIsRecent(e.target.checked)}
                    disabled={submitting} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  <label htmlFor="movie-recent" style={{ cursor: 'pointer', userSelect: 'none', margin: 0 }}>
                    Mark as Recent Release
                  </label>
                </div>
              </div>

              {/* Day 05: File Upload Section */}
              <div className="form-group">
                <label>Poster Image</label>
                <div className="file-upload-zone">
                  {posterPreview ? (
                    <div className="file-preview-row flex-center">
                      <img src={posterPreview} alt="Preview" className="poster-preview-img" />
                      <div className="file-preview-info">
                        <p className="file-name">{posterFile?.name}</p>
                        <p className="file-hint">File loaded via FileReader API</p>
                        <button type="button" className="btn-link remove-file-btn"
                          onClick={() => { setPosterFile(null); setPosterPreview(''); }}>
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label htmlFor="poster-file-input" className="file-upload-label flex-center">
                      <Upload size={24} />
                      <span>Click to upload poster image</span>
                      <span className="file-hint">JPG, PNG, WebP — Max 5 MB</span>
                      <input id="poster-file-input" type="file" accept="image/*"
                        onChange={handleFileChange} className="file-input-hidden" disabled={submitting} />
                    </label>
                  )}
                </div>
                <div className="file-url-fallback">
                  <span className="or-divider">— or paste an image URL —</span>
                  <input id="movie-poster" type="text"
                    placeholder="https://images.unsplash.com/…"
                    value={posterUrl} onChange={(e) => { setPosterUrl(e.target.value); setPosterPreview(''); setPosterFile(null); }}
                    disabled={submitting || !!posterFile} />
                </div>
              </div>

              <div className="modal-actions flex">
                <button type="button" onClick={handleCloseModal} className="btn-secondary" disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-center" disabled={submitting}>
                  {submitting ? <span className="spinner-small"></span> : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCatalog;

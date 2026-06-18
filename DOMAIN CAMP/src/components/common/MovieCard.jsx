import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Star, Clock, Calendar } from 'lucide-react';
import './MovieCard.css';

export const MovieCard = ({ movie, onReviewsClick }) => {
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  const handleBookClick = (e) => {
    e.stopPropagation();
    navigate(`/booking/${movie.id}`);
  };

  const handleManageClick = (e) => {
    e.stopPropagation();
    alert(`Schedules and shows management console active for movie: "${movie.title}"`);
  };

  return (
    <div className="movie-card-v2 glass-panel-interactive">
      <div className="poster-wrapper-v2">
        <img 
          src={movie.posterUrl} 
          alt={movie.title} 
          className="poster-img-v2" 
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://placehold.co/300x450/1a0a2e/c8a45a?text=${encodeURIComponent(movie.title)}`;
          }}
        />
        {movie.isRecent && (
          <div className="recent-badge-v2 animate-pulse-subtle">
            🔥 New
          </div>
        )}
        <div 
          className="rating-badge-v2"
          onClick={(e) => { e.stopPropagation(); onReviewsClick && onReviewsClick(); }}
          style={{ cursor: onReviewsClick ? 'pointer' : 'default' }}
          title="View Reviews"
        >
          <Star size={12} fill="currentColor" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.0'}</span>
          <span className="vote-count" style={{ fontSize: '0.6rem', opacity: 0.8, marginLeft: '2px' }}>
            ({movie.votes || '2.4k'})
          </span>
        </div>
      </div>
      
      <div className="movie-details-v2">
        <h3 className="movie-title-v2">{movie.title}</h3>
        <p className="movie-tagline-v2">{movie.tagline}</p>
        <div className="movie-meta-v2 flex">
          <span className="flex-center"><Clock size={12} /> {movie.runtime}</span>
          <span className="flex-center"><Calendar size={12} /> {movie.releaseDate ? movie.releaseDate.split('-')[0] : '2026'}</span>
        </div>
        <p className="movie-overview-v2">{movie.overview.slice(0, 110)}...</p>
        <div className="movie-genres-v2 flex">
          {movie.genres.map((g) => (
            <span key={g} className="genre-pill-v2">{g}</span>
          ))}
        </div>

        <div className="movie-actions-v2">
          {hasPermission('BOOK_TICKETS') ? (
            <button 
              onClick={handleBookClick} 
              className="btn-primary book-btn-v2 flex-center"
            >
              Book Tickets
            </button>
          ) : (
            <button 
              onClick={handleManageClick} 
              className="btn-secondary manage-btn-v2 flex-center"
            >
              Manage Showtimes
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;

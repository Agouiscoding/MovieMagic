// frontend/src/components/MovieCard.jsx
import { Link } from 'react-router-dom';

export default function MovieCard({
  item,
  type = 'movie',
  showFavorite = false,
  isFavorite = false,
  onFavorite,
}) {
  const title = type === 'movie' ? item.title : item.name;
  const date = type === 'movie' ? item.release_date : item.first_air_date;

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  const detailPath = `/detail/${type}/${item.id}`;

  return (
    <div className="media-card">
      {/* Clickable area: poster + text */}
      <Link to={detailPath} className="media-card-link">
        <img
          src={poster}
          alt={title}
          loading="lazy"
        />
        <div className="media-card-body">
          <div className="media-title">{title}</div>
          <div className="media-meta">{date || '—'}</div>
          <div className="media-rating">
            ⭐ {item.vote_average?.toFixed?.(1) ?? '-'}
          </div>
        </div>
      </Link>

      {/* Favorite button below (not inside link) */}
      {showFavorite && (
        <div className="media-actions">
          <button
            className="btn btn-primary"
            onClick={isFavorite ? undefined : onFavorite}
            disabled={isFavorite}
          >
            {isFavorite ? 'Saved' : 'Save Favorite'}
          </button>
        </div>
      )}
    </div>
  );
}

// // frontend/src/components/MovieCard.jsx

// export default function MovieCard({
//   item,
//   type = 'movie',
//   showFavorite = false,   // whether to show favorite button
//   onFavorite,             // callback when user clicks favorite
// }) {
//   const title = type === 'movie' ? item.title : item.name;
//   const date = type === 'movie' ? item.release_date : item.first_air_date;

//   const poster = item.poster_path
//     ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
//     : 'https://via.placeholder.com/300x450?text=No+Image';

//   return (
//     <div className="media-card">
//       {/* Poster */}
//       <img
//         src={poster}
//         alt={title}
//         loading="lazy"
//       />

//       {/* Text content */}
//       <div className="media-card-body">
//         <div className="media-title">{title}</div>
//         <div className="media-meta">{date || '—'}</div>
//         <div className="media-rating">
//           ⭐ {item.vote_average?.toFixed?.(1) ?? '-'}
//         </div>

//         {/* Favorite button (optional) */}
//         {showFavorite && onFavorite && (
//           <div className="media-actions">
//             <button className="btn btn-primary" onClick={onFavorite}>
//               Save As Favorite
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


// frontend/src/components/MovieCard.jsx

export default function MovieCard({
  item,
  type = 'movie',
  showFavorite = false,   // whether to show favorite button
  isFavorite = false,     // whether this item is already saved
  onFavorite,             // callback when user clicks favorite
}) {
  const title = type === 'movie' ? item.title : item.name;
  const date = type === 'movie' ? item.release_date : item.first_air_date;

  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w300${item.poster_path}`
    : 'https://via.placeholder.com/300x450?text=No+Image';

  return (
    <div className="media-card">
      {/* Poster */}
      <img
        src={poster}
        alt={title}
        loading="lazy"
      />

      {/* Text content */}
      <div className="media-card-body">
        <div className="media-title">{title}</div>
        <div className="media-meta">{date || '—'}</div>
        <div className="media-rating">
          ⭐ {item.vote_average?.toFixed?.(1) ?? '-'}
        </div>

        {/* Favorite button */}
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
    </div>
  );
}

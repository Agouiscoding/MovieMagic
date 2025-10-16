// frontend/src/components/MovieCard.jsx
export default function MovieCard({ item, type = 'movie' }) {
  const title = type === 'movie' ? item.title : item.name;
  const date = type === 'movie' ? item.release_date : item.first_air_date;
  const poster = item.poster_path
    ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
    : 'https://via.placeholder.com/200x300?text=No+Image';

  return (
    <div style={{ width: 200 }}>
      <img alt={title} src={poster} loading="lazy" style={{ width: '100%', borderRadius: 8 }} />
      <div style={{ marginTop: 6 }}>
        <strong>{title}</strong>
        <div style={{ fontSize: 12, opacity: 0.7 }}>{date || '—'}</div>
        <div style={{ fontSize: 12 }}>⭐ {item.vote_average?.toFixed?.(1) ?? '-'}</div>
      </div>
    </div>
  );
}

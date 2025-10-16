// frontend/src/components/FiltersBar.jsx
import { useEffect, useMemo, useState } from 'react';

// TMDb genre & sort constants (same as before)
const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

const MOVIE_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity ↓' },
  { value: 'popularity.asc', label: 'Popularity ↑' },
  { value: 'vote_average.desc', label: 'Rating ↓' },
  { value: 'vote_average.asc', label: 'Rating ↑' },
  { value: 'primary_release_date.desc', label: 'Release date ↓' },
  { value: 'primary_release_date.asc', label: 'Release date ↑' },
];

const TV_SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Popularity ↓' },
  { value: 'popularity.asc', label: 'Popularity ↑' },
  { value: 'vote_average.desc', label: 'Rating ↓' },
  { value: 'vote_average.asc', label: 'Rating ↑' },
  { value: 'first_air_date.desc', label: 'First air date ↓' },
  { value: 'first_air_date.asc', label: 'First air date ↑' },
];

/**
 * FiltersBar
 * Props:
 *  - type: 'movie' | 'tv'
 *  - onApply: ({ genres, sortBy, year?, fromDate?, toDate? }) => void
 */
export default function FiltersBar({ type, onApply }) {
  const [year, setYear] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [genres, setGenres] = useState([]);
  const [sortBy, setSortBy] = useState('popularity.desc');

  const genreOptions = useMemo(() => (type === 'movie' ? MOVIE_GENRES : TV_GENRES), [type]);
  const sortOptions = useMemo(() => (type === 'movie' ? MOVIE_SORT_OPTIONS : TV_SORT_OPTIONS), [type]);

  useEffect(() => {
    setGenres([]);
    setSortBy('popularity.desc');
    setYear('');
    setFromDate('');
    setToDate('');
  }, [type]);

  function toggleGenre(id) {
    setGenres((prev) => (prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]));
  }

  function applyFilters() {
    onApply({
      genres,
      sortBy,
      year: year.trim() || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
    });
  }

  return (
    <div style={{ display: 'grid', gap: 12, marginBottom: 12 }}>
      {/* Sort */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ width: 80 }}>Sort</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Year */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ width: 80 }}>Year</label>
        <input
          placeholder="e.g., 2023"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          style={{ width: 160 }}
        />
      </div>

      {/* Release Date Range */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <label style={{ width: 80 }}>From</label>
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <label>To</label>
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
      </div>

      {/* Genres */}
      <div>
        <div style={{ marginBottom: 6, fontWeight: 600 }}>Genres</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {genreOptions.map((g) => (
            <label key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <input
                type="checkbox"
                checked={genres.includes(g.id)}
                onChange={() => toggleGenre(g.id)}
              />
              {g.name}
            </label>
          ))}
        </div>
      </div>

      {/* Apply button */}
      <div>
        <button onClick={applyFilters}>Apply Filters</button>
      </div>
    </div>
  );
}

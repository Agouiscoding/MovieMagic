// frontend/src/pages/Search.jsx
import { useEffect, useRef, useState } from 'react';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import { useAuth } from '../auth/AuthProvider.jsx';
import { addFavorite, listFavorites } from '../api/flaskClient.js';
import FiltersBar from '../components/FiltersBar';
import { discoverMedia, searchMedia } from '../api/flaskClient';

export default function Search() {
  const { user, idToken } = useAuth();
  const [type, setType] = useState('movie'); // 'movie' | 'tv'

  // Keep last inputs (query/filters) in state
  const [lastQuery, setLastQuery] = useState(''); // keyword for /api/search
  const [lastFilters, setLastFilters] = useState({
    // filters for /api/discover
    genres: [],
    sortBy: 'popularity.desc',
    year: undefined,
  });

  // Result state
  const [data, setData] = useState({
    results: [],
    page: 1,
    total_pages: 1,
    total_results: 0,
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Favorites state (store keys: `${media_type}-${tmdb_id}`)
  const [favorites, setFavorites] = useState(new Set());

  // Abort controller for in-flight request
  const acRef = useRef(null);

  // Load favorites when user logs in
  useEffect(() => {
    if (!user || !idToken) {
      setFavorites(new Set());
      return;
    }

    async function loadFavorites() {
      try {
        const list = await listFavorites({ idToken });
        const set = new Set(
          (list || []).map((f) => `${f.media_type}-${f.tmdb_id}`)
        );
        setFavorites(set);
      } catch {
        // optional: handle error silently in UI
      }
    }

    loadFavorites();
  }, [user, idToken]);

  // Helper to mark one item as favorite in local state
  function markFavoriteLocally(media_type, tmdb_id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.add(`${media_type}-${tmdb_id}`);
      return next;
    });
  }

  // Unified runner: if query exists, use /search; else use /discover
  async function run(page = 1, opts = {}) {
    const query = opts.query !== undefined ? opts.query : lastQuery;
    const filters = { ...lastFilters, ...opts.filters };

    // Abort previous request
    acRef.current?.abort();
    acRef.current = new AbortController();

    setLoading(true);
    setErr('');

    try {
      let res;
      if (query?.trim()) {
        // Text search
        res = await searchMedia({
          type,
          query,
          page,
          language: 'en-US',
          year: filters.year, // year also applies to search; backend handles mapping
          signal: acRef.current.signal,
        });
        setLastQuery(query);
      } else {
        // Discover with filters
        res = await discoverMedia({
          type,
          page,
          language: 'en-US',
          region: 'US',
          include_adult: 'false',
          genres: filters.genres || [],
          sortBy: filters.sortBy || 'popularity.desc',
          year: filters.year,
          signal: acRef.current.signal,
        });
        setLastFilters(filters);
      }
      setData(res);
    } catch (e) {
      if (e.name !== 'AbortError') setErr(e.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  }

  // Called when user submits keyword search
  async function handleSearch({ query, year }) {
    await run(1, { query, filters: { ...lastFilters, year: year || undefined } });
  }

  // Called when user applies filters (discover mode)
  async function handleApplyFilters({ genres, sortBy, year }) {
    await run(1, { query: '', filters: { genres, sortBy, year } });
  }

  // Rerun when switching media type
  useEffect(() => {
    run(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Pagination helpers
  const goPrev = () => run(data.page - 1);
  const goNext = () => run(data.page + 1);

  return (
    <div className="container" style={{ padding: 24 }}>
      <h2>Search & Filter {type === 'movie' ? 'Movies' : 'TV Shows'}</h2>

      {/* Media type toggle */}
      <div style={{ marginBottom: 8 }}>
        <label>
          <input
            type="radio"
            checked={type === 'movie'}
            onChange={() => setType('movie')}
          />{' '}
          Movie
        </label>{' '}
        <label>
          <input
            type="radio"
            checked={type === 'tv'}
            onChange={() => setType('tv')}
          />{' '}
          TV
        </label>
      </div>

      {/* Keyword search (if query exists → /api/search) */}
      <SearchBar onSearch={handleSearch} />

      {/* Filters (if no query → /api/discover) */}
      <FiltersBar type={type} onApply={handleApplyFilters} />

      {/* Status */}
      {loading && <p>Loading…</p>}
      {err && <p style={{ color: 'red' }}>{err}</p>}
      {!loading && !err && data.results?.length === 0 && <p>No results.</p>}

      {/* Results grid */}
      <div className="grid-media">
        {data.results?.map((it) => {
          const favKey = `${type}-${it.id}`;
          const isFavorite = favorites.has(favKey);

          return (
            <MovieCard
              key={favKey}
              item={it}
              type={type}
              showFavorite={!!user}
              isFavorite={isFavorite}
              onFavorite={async () => {
                try {
                  await addFavorite({
                    media_type: type,
                    tmdb_id: it.id,
                    title: type === 'movie' ? it.title : it.name,
                    poster_path: it.poster_path,
                    idToken,
                  });
                  markFavoriteLocally(type, it.id);
                } catch (e) {
                  // optional: handle error
                  console.error('Failed to save favorite', e);
                }
              }}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div
          style={{
            marginTop: 16,
            display: 'flex',
            gap: 8,
            alignItems: 'center',
          }}
        >
          <button
            className="btn"
            disabled={loading || data.page <= 1}
            onClick={goPrev}
          >
            Prev
          </button>
          <span>
            Page {data.page} / {data.total_pages}
          </span>
          <button
            className="btn"
            disabled={loading || data.page >= data.total_pages}
            onClick={goNext}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

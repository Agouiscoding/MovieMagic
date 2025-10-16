// // frontend/src/pages/Search.jsx
// import { useEffect, useRef, useState } from 'react';
// import SearchBar from '../components/SearchBar';
// import MovieCard from '../components/MovieCard';
// import { searchMedia } from '../api/flaskClient';

// export default function Search() {
//   // 'movie' | 'tv'
//   const [type, setType] = useState('movie');

//   // TMDb-style response shape
//   const [data, setData] = useState({ results: [], page: 1, total_pages: 1, total_results: 0 });

//   // Keep the last search params in state (avoid querying the DOM)
//   const [last, setLast] = useState({ query: '', year: undefined, language: 'en-US' });

//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');

//   // Keep a ref to the current AbortController to cancel in-flight requests
//   const acRef = useRef(null);

//   // Core search runner reused by initial search, pagination, and type changes
//   async function runSearch(page = 1, nextParams) {
//     const params = { ...last, ...nextParams }; // allow overrides
//     if (!params.query?.trim()) return;

//     // abort previous request (prevents race conditions)
//     acRef.current?.abort();
//     acRef.current = new AbortController();

//     setLoading(true);
//     setErr('');

//     try {
//       const res = await searchMedia({
//         type,
//         query: params.query,
//         page,
//         language: params.language,
//         year: params.year,
//         signal: acRef.current.signal,
//       });
//       setData(res);
//       setLast(params); // persist the latest successful params
//     } catch (e) {
//       if (e.name !== 'AbortError') setErr(e.message || 'Search failed');
//     } finally {
//       setLoading(false);
//     }
//   }

//   // Called by <SearchBar /> when the user submits
//   async function handleSearch({ query, year }) {
//     await runSearch(1, { query, year: year || undefined });
//   }

//   // Re-run the search when switching between movie/tv (if a query exists)
//   useEffect(() => {
//     if (last.query) runSearch(1);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [type]);

//   // Simple pagination handlers
//   const goPrev = () => runSearch(data.page - 1);
//   const goNext = () => runSearch(data.page + 1);

//   return (
//     <div style={{ padding: 24 }}>
//       <h2>Search {type === 'movie' ? 'Movies' : 'TV Shows'}</h2>

//       {/* Media type toggle */}
//       <div style={{ marginBottom: 8 }}>
//         <label>
//           <input
//             type="radio"
//             checked={type === 'movie'}
//             onChange={() => setType('movie')}
//           />{' '}
//           Movie
//         </label>{' '}
//         <label>
//           <input
//             type="radio"
//             checked={type === 'tv'}
//             onChange={() => setType('tv')}
//           />{' '}
//           TV
//         </label>
//       </div>

//       {/* Search form (your existing component) */}
//       <SearchBar onSearch={handleSearch} />

//       {/* Status area */}
//       {loading && <p>Loading…</p>}
//       {err && <p style={{ color: 'red' }}>{err}</p>}
//       {!loading && !err && last.query && data.results?.length === 0 && (
//         <p>No results found.</p>
//       )}

//       {/* Results grid */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: 16 }}>
//         {data.results?.map((it) => (
//           <MovieCard key={`${type}-${it.id}`} item={it} type={type} />
//         ))}
//       </div>

//       {/* Pagination */}
//       {data.total_pages > 1 && (
//         <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
//           <button disabled={loading || data.page <= 1} onClick={goPrev}>Prev</button>
//           <span>
//             Page {data.page} / {data.total_pages}
//           </span>
//           <button disabled={loading || data.page >= data.total_pages} onClick={goNext}>Next</button>
//         </div>
//       )}
//     </div>
//   );
// }


// frontend/src/pages/Search.jsx
import { useEffect, useRef, useState } from 'react';
import SearchBar from '../components/SearchBar';
import MovieCard from '../components/MovieCard';
import FiltersBar from '../components/FiltersBar';
import { discoverMedia, searchMedia } from '../api/flaskClient';

export default function Search() {
  // 'movie' | 'tv'
  const [type, setType] = useState('movie');

  // Keep last inputs (query/filters) in state
  const [lastQuery, setLastQuery] = useState('');                  // keyword for /api/search
  const [lastFilters, setLastFilters] = useState({                 // filters for /api/discover
    genres: [],
    sortBy: 'popularity.desc',
    year: undefined,
  });

  // Result state
  const [data, setData] = useState({ results: [], page: 1, total_pages: 1, total_results: 0 });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  // Abort controller for in-flight request
  const acRef = useRef(null);

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
    // Clear stored filters when switching to keyword mode (optional)
    await run(1, { query, filters: { ...lastFilters, year: year || undefined } });
  }

  // Called when user applies filters (discover mode)
  async function handleApplyFilters({ genres, sortBy, year }) {
    // Clear stored query when switching to discover mode
    await run(1, { query: '', filters: { genres, sortBy, year } });
  }

  // Rerun when switching media type
  useEffect(() => {
    // If lastQuery exists, repeat search; else repeat discover
    run(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  // Pagination helpers
  const goPrev = () => run(data.page - 1);
  const goNext = () => run(data.page + 1);

  return (
    <div style={{ padding: 24 }}>
      <h2>Search & Filter {type === 'movie' ? 'Movies' : 'TV Shows'}</h2>

      {/* Media type toggle */}
      <div style={{ marginBottom: 8 }}>
        <label>
          <input type="radio" checked={type === 'movie'} onChange={() => setType('movie')} /> Movie
        </label>{' '}
        <label>
          <input type="radio" checked={type === 'tv'} onChange={() => setType('tv')} /> TV
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, 200px)', gap: 16 }}>
        {data.results?.map((it) => (
          <MovieCard key={`${type}-${it.id}`} item={it} type={type} />
        ))}
      </div>

      {/* Pagination */}
      {data.total_pages > 1 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
          <button disabled={loading || data.page <= 1} onClick={goPrev}>Prev</button>
          <span>Page {data.page} / {data.total_pages}</span>
          <button disabled={loading || data.page >= data.total_pages} onClick={goNext}>Next</button>
        </div>
      )}
    </div>
  );
}

// frontend/src/pages/Trending.jsx
import { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { getTrending, addFavorite, listFavorites } from '../api/flaskClient';
import { useAuth } from '../auth/AuthProvider.jsx';

// Config for sections
const SECTIONS = [
  {
    id: 'movie-day',
    title: 'Trending Movies Today',
    type: 'movie',
    window: 'day',
  },
  {
    id: 'movie-week',
    title: 'Trending Movies This Week',
    type: 'movie',
    window: 'week',
  },
  {
    id: 'tv-day',
    title: 'Trending TV Shows Today',
    type: 'tv',
    window: 'day',
  },
  {
    id: 'tv-week',
    title: 'Trending TV Shows This Week',
    type: 'tv',
    window: 'week',
  },
];

// Common language / region options
const LANGUAGE_OPTIONS = [
  { value: 'en-US', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'zh-CN', label: '简体中文 (中国)' },
  { value: 'zh-TW', label: '繁體中文 (台湾)' },
  { value: 'ja-JP', label: '日本語' },
];

const REGION_OPTIONS = [
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'CN', label: 'China' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'JP', label: 'Japan' },
];

export default function Trending() {
  const { user, idToken } = useAuth();

  // Global language / region
  const [language, setLanguage] = useState('en-US');
  const [region, setRegion] = useState('US');

  /**
   * sectionsState structure:
   * {
   *   [id]: {
   *     loading: boolean,
   *     error: string,
   *     results: array,
   *     page: number,
   *     total_pages: number
   *   }
   * }
   */
  const [sectionsState, setSectionsState] = useState({});

  // Favorites (shared across sections), keys: `${media_type}-${tmdb_id}`
  const [favorites, setFavorites] = useState(new Set());

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
      } catch (e) {
        console.error('Failed to load favorites', e);
      }
    }

    loadFavorites();
  }, [user, idToken]);

  // Helper: mark one item as favorite in local state
  function markFavoriteLocally(media_type, tmdb_id) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.add(`${media_type}-${tmdb_id}`);
      return next;
    });
  }

  // Helper: get section config by id
  function getSectionConfig(id) {
    return SECTIONS.find((s) => s.id === id);
  }

  // Helper: update specific section state
  function updateSection(id, patch) {
    setSectionsState((prev) => ({
      ...prev,
      [id]: {
        // default initial state
        loading: false,
        error: '',
        results: [],
        page: 1,
        total_pages: 1,
        ...(prev[id] || {}),
        ...patch,
      },
    }));
  }

  // Load one section for a specific page
  async function loadSection(id, page = 1) {
    const config = getSectionConfig(id);
    if (!config) return;

    updateSection(id, { loading: true, error: '', results: [], page });

    try {
      const data = await getTrending({
        type: config.type,
        window: config.window,
        page,
        language,
        region,
      });

      updateSection(id, {
        loading: false,
        results: data.results || [],
        total_pages: data.total_pages || 1,
        page: data.page || page,
      });
    } catch (e) {
      updateSection(id, {
        loading: false,
        error: e.message || 'Failed to load trending',
      });
    }
  }

  // When language / region changes, reload all sections from page 1
  useEffect(() => {
    SECTIONS.forEach((sec) => {
      loadSection(sec.id, 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, region]);

  return (
    <div className="container" style={{ padding: 24 }}>
      <h2>Trending Movies & TV</h2>

      {/* Global language / region controls */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          margin: '12px 0 24px',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>Language:</span>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span>Region:</span>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          >
            {REGION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Each section in vertical layout */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {SECTIONS.map((sec) => {
          const state = sectionsState[sec.id] || {
            loading: true,
            error: '',
            results: [],
            page: 1,
            total_pages: 1,
          };

          const canPrev = state.page > 1;
          const canNext = state.page < state.total_pages;

          return (
            <section key={sec.id}>
              {/* Title + page info */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <h3 style={{ margin: 0 }}>{sec.title}</h3>
                <span style={{ fontSize: 14, color: '#666' }}>
                  Page {state.page} / {state.total_pages}
                </span>
              </div>

              {/* Status */}
              {state.loading && <p>Loading…</p>}
              {state.error && (
                <p style={{ color: 'red' }}>{state.error}</p>
              )}
              {!state.loading &&
                !state.error &&
                (!state.results || state.results.length === 0) && (
                  <p>No results.</p>
                )}

              {/* Grid results */}
              {state.results && state.results.length > 0 && (
                <div className="grid-media">
                  {state.results.map((item) => {
                    const mediaType = item.media_type || sec.type;
                    const favKey = `${mediaType}-${item.id}`;
                    const isFavorite = favorites.has(favKey);

                    return (
                      <MovieCard
                        key={favKey}
                        item={item}
                        type={mediaType}
                        showFavorite={!!user}
                        isFavorite={isFavorite}
                        onFavorite={async () => {
                          try {
                            await addFavorite({
                              media_type: mediaType,
                              tmdb_id: item.id,
                              title:
                                mediaType === 'movie'
                                  ? item.title
                                  : item.name,
                              poster_path: item.poster_path,
                              idToken,
                            });
                            markFavoriteLocally(mediaType, item.id);
                          } catch (e) {
                            console.error('Failed to save favorite', e);
                          }
                        }}
                      />
                    );
                  })}
                </div>
              )}

              {/* Pagination for this section */}
              {state.total_pages > 1 && (
                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    className="btn"
                    disabled={state.loading || !canPrev}
                    onClick={() => loadSection(sec.id, state.page - 1)}
                  >
                    Prev
                  </button>
                  <span style={{ fontSize: 13 }}>
                    Page {state.page} / {state.total_pages}
                  </span>
                  <button
                    className="btn"
                    disabled={state.loading || !canNext}
                    onClick={() => loadSection(sec.id, state.page + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

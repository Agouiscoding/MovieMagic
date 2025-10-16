// Unified Flask API client
// Assumes Vite proxy in vite.config.js → proxy { '/api': 'http://localhost:5000' }

const API_BASE = '/api';

/** Build a query string while skipping null/undefined/empty values */
function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (typeof v === 'string' && v.trim() === '') return;
    q.set(k, v);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

/**
 * Core request wrapper
 * - Auto JSON parsing
 * - Throws on non-2xx responses
 * - Supports AbortController (pass signal)
 * - Ready for Firebase ID token in the future
 */
async function request(path, { method = 'GET', params, body, signal, idToken } = {}) {
  const url = API_BASE + path + buildQuery(params);
  const headers = { 'Content-Type': 'application/json' };

  // Optional authentication header (for Firebase later)
  if (idToken) headers.Authorization = `Bearer ${idToken}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // Ignore if response is not JSON
  }

  if (!res.ok) {
    const err = new Error(data?.error || data?.status_message || 'Request failed');
    err.status = res.status;
    err.response = data;
    throw err;
  }
  return data;
}

/* ----------------------------- Search API ----------------------------- */
/**
 * Search for movies or TV shows.
 * @param {Object} opts
 * @param {'movie'|'tv'} opts.type - media type (default 'movie')
 * @param {string} opts.query - search keyword (required)
 * @param {number} [opts.page=1] - page number
 * @param {string} [opts.language='en-US'] - language code
 * @param {number|string} [opts.year] - year filter
 * @param {AbortSignal} [opts.signal] - optional abort controller
 * @returns {Promise<Object>} TMDb-style response { page, results, total_pages, total_results }
 */
export function searchMedia({
  type = 'movie',
  query,
  page = 1,
  language = 'en-US',
  year,
  signal,
} = {}) {
  if (!query || !query.trim()) {
    return Promise.reject(new Error('query is required'));
  }
  return request('/search', {
    params: { type, query, page, language, year },
    signal,
  });
}

/** Shortcut: movie search only */
export function searchMovies(opts) {
  return searchMedia({ ...opts, type: 'movie' });
}

/** Shortcut: TV search only */
export function searchTV(opts) {
  return searchMedia({ ...opts, type: 'tv' });
}

/* ------------------------ Future API placeholders ------------------------ */

// Trending media (/api/trending)
export function getTrending({ type = 'movie', window = 'day', signal } = {}) {
  return request('/trending', { params: { type, window }, signal });
}

// Detailed info (/api/details)
export function getDetails({ type = 'movie', id, language = 'en-US', signal } = {}) {
  if (!id) throw new Error('id is required');
  return request('/details', { params: { type, id, language }, signal });
}

// Favorites (/api/favorites) – Firebase integration later
export function listFavorites({ idToken, signal } = {}) {
  return request('/favorites', { idToken, signal });
}

export function addFavorite({ media_type, tmdb_id, title, poster_path, idToken }) {
  return request('/favorites', {
    method: 'POST',
    body: { media_type, tmdb_id, title, poster_path },
    idToken,
  });
}

export function removeFavorite({ media_type, tmdb_id, idToken }) {
  return request(`/favorites/${media_type}/${tmdb_id}`, {
    method: 'DELETE',
    idToken,
  });
}

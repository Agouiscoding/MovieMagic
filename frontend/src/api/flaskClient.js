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


// Add this function to your existing flaskClient.js

/**
 * Discover media by filters (no keyword).
 * Automatically maps 'year' depending on media type:
 *  - movie → year
 *  - tv    → first_air_date_year
 */
// In frontend/src/api/flaskClient.js
export function discoverMedia({
  type = 'movie',
  page = 1,
  language = 'en-US',
  region = 'US',
  include_adult = 'false',
  genres = [],
  sortBy = 'popularity.desc',
  year,
  fromDate,
  toDate,
  signal,
} = {}) {
  const params = {
    type,
    page,
    language,
    region,
    include_adult,
    sort_by: sortBy,
  };

  if (genres.length) params.with_genres = genres.join(',');
  if (year) {
    if (type === 'movie') params.year = year;
    else params.first_air_date_year = year;
  }
  if (fromDate) params.fromDate = fromDate;
  if (toDate) params.toDate = toDate;

  return request('/discover', { params, signal });
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

/* ------------------------- Profile & Alerts API ------------------------- */

export function bootstrapUser({ idToken } = {}) {
  return request('/user/bootstrap', { method: 'POST', idToken });
}

export function getProfile({ idToken } = {}) {
  return request('/profile', { idToken });
}

export function updateProfile({ display_name, photo_url, idToken }) {
  return request('/profile', { method: 'PUT', body: { display_name, photo_url }, idToken });
}

export function getAlerts({ idToken } = {}) {
  return request('/alerts', { idToken });
}

export function updateAlerts({ frequency, keywords, channels, idToken }) {
  return request('/alerts', { method: 'PUT', body: { frequency, keywords, channels }, idToken });
}


/* --------------------------- Trending API --------------------------- */
/**
 * Get trending media from backend.
 * type: 'all' | 'movie' | 'tv'
 * window: 'day' | 'week'
 * language: TMDb language code, e.g. 'en-US', 'zh-CN'
 * region: TMDb region code, e.g. 'US', 'CN'
 */
export function getTrending({
  type = 'movie',
  window = 'day',
  page = 1,
  language = 'en-US',
  region = 'US',
  signal,
} = {}) {
  return request('/trending', {
    params: { type, window, page, language, region },
    signal,
  });
}

/* --------------------------- Details API --------------------------- */
/**
 * Get detailed info for a single movie or TV show.
 * mediaType: 'movie' | 'tv'
 * tmdbId: number or string
 */
export function getDetails({ mediaType, tmdbId, language = 'en-US', signal } = {}) {
  return request('/details', {
    params: { type: mediaType, id: tmdbId, language },
    signal,
  });
}


/* --------------------------- Media API --------------------------- */
export async function getMedia({ type, id }) {
  const r = await fetch(`/api/media?type=${type}&id=${id}`);
  if (!r.ok) throw new Error("Failed to load media");
  return await r.json();
}



/* --------------------------- Comments API --------------------------- */
// frontend/src/api/flaskClient.js

// List comments for one movie/tv
export async function fetchComments({ media_type, tmdb_id }) {
  const params = new URLSearchParams({
    media_type,
    tmdb_id: String(tmdb_id),
  });
  const r = await fetch(`/api/comments?${params.toString()}`);
  if (!r.ok) throw new Error("Failed to load comments");
  return await r.json();
}

// Add a new comment (requires idToken)
export async function addComment({ media_type, tmdb_id, content, idToken }) {
  const r = await fetch("/api/comments", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({
      media_type,
      tmdb_id,
      content,
    }),
  });

  if (!r.ok) {
    const data = await r.json().catch(() => ({}));
    throw new Error(data.error || "Failed to add comment");
  }

  return await r.json();
}

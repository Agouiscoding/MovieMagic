// frontend/src/pages/Detail.jsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDetails, getMedia } from '../api/flaskClient';
import { useAuth } from '../auth/AuthProvider.jsx';
import { fetchComments, addComment } from '../api/flaskClient';


export default function Detail() {
  const { mediaType, tmdbId } = useParams(); // /detail/:mediaType/:tmdbId

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  // Auth 
  const { user, idToken } = useAuth();
  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [newComment, setNewComment] = useState('');


  // Media: trailers + images
  const [trailers, setTrailers] = useState([]);
  const [backdrops, setBackdrops] = useState([]);
  const [mediaError, setMediaError] = useState('');

  // Pagination for media
  const [trailerPage, setTrailerPage] = useState(1); // 1-based
  const [imagePage, setImagePage] = useState(1);     // 1-based

    useEffect(() => {
    let aborted = false;

    async function loadComments() {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        const list = await fetchComments({
          media_type: mediaType,
          tmdb_id: tmdbId,
        });
        if (!aborted) setComments(list || []);
      } catch (e) {
        if (!aborted) setCommentsError(e.message || 'Failed to load comments');
      } finally {
        if (!aborted) setCommentsLoading(false);
      }
    }

    loadComments();
    return () => {
      aborted = true;
    };
  }, [mediaType, tmdbId]);

  async function handleSubmitComment(e) {
    e.preventDefault();
    if (!user || !idToken) return;
    const content = newComment.trim();
    if (!content) return;

    try {
      const created = await addComment({
        media_type: mediaType,
        tmdb_id: tmdbId,
        content,
        idToken,
      });
      // Prepend new comment
      setComments((prev) => [created, ...prev]);
      setNewComment('');
    } catch (e) {
      alert(e.message || 'Failed to add comment');
    }
  }



  useEffect(() => {
    let aborted = false;

    async function loadDetails() {
      setLoading(true);
      setErr('');
      try {
        const res = await getDetails({
          mediaType,
          tmdbId,
          language: 'en-US',
        });
        if (!aborted) setData(res);
      } catch (e) {
        if (!aborted) setErr(e.message || 'Failed to load details');
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    loadDetails();
    return () => {
      aborted = true;
    };
  }, [mediaType, tmdbId]);

  useEffect(() => {
    let aborted = false;

    async function loadMedia() {
      setMediaError('');
      try {
        const res = await getMedia({ type: mediaType, id: tmdbId });
        if (aborted) return;
        setTrailers(res.trailers || []);
        setBackdrops(res.backdrops || []);
        // Reset pages when media changes
        setTrailerPage(1);
        setImagePage(1);
      } catch (e) {
        if (!aborted) setMediaError(e.message || 'Failed to load media');
      }
    }

    loadMedia();
    return () => {
      aborted = true;
    };
  }, [mediaType, tmdbId]);

  if (loading) {
    return (
      <div className="container page">
        <p>Loading…</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="container page">
        <p style={{ color: 'red' }}>{err}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container page">
        <p>No data.</p>
      </div>
    );
  }

  const isTV = mediaType === 'tv';

  // Basic fields
  const title = isTV ? data.name : data.title;
  const date = isTV ? data.first_air_date : data.release_date;
  const year = date ? date.slice(0, 4) : '—';

  const poster = data.poster_path
    ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
    : 'https://via.placeholder.com/500x750?text=No+Image';

  const backdrop = data.backdrop_path
    ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}`
    : null;

  const genres = data.genres || [];
  const rating = data.vote_average ? data.vote_average.toFixed(1) : '-';
  const votes = data.vote_count || 0;
  const status = data.status || '—';
  const originLang = data.original_language || '—';

  const overview = data.overview || 'No overview available.';

  // Runtime / episode length
  const runtime = !isTV
    ? data.runtime
    : Array.isArray(data.episode_run_time) && data.episode_run_time.length > 0
    ? data.episode_run_time[0]
    : null;

  // Latest season (TV only, simplified)
  let latestSeason = null;
  if (isTV && Array.isArray(data.seasons) && data.seasons.length > 0) {
    latestSeason =
      [...data.seasons].reverse().find((s) => s.episode_count > 0) ||
      data.seasons[data.seasons.length - 1];
  }

  const cast = data.credits?.cast || [];
  const crew = data.credits?.crew || [];
   
  const mainCrew = crew
    .filter((c) =>
      ['Directing', 'Writing', 'Production'].includes(c.department)
    )
    .slice(0, 10);

  // Media pagination logic
  const TRAILERS_PER_PAGE = 1;
  const IMAGES_PER_PAGE = 2;

  const trailerTotalPages = trailers.length
    ? Math.ceil(trailers.length / TRAILERS_PER_PAGE)
    : 1;

  const imageTotalPages = backdrops.length
    ? Math.ceil(backdrops.length / IMAGES_PER_PAGE)
    : 1;

  const trailerStart = (trailerPage - 1) * TRAILERS_PER_PAGE;
  const visibleTrailers = trailers.slice(
    trailerStart,
    trailerStart + TRAILERS_PER_PAGE,
  );

  const imageStart = (imagePage - 1) * IMAGES_PER_PAGE;
  const visibleImages = backdrops.slice(
    imageStart,
    imageStart + IMAGES_PER_PAGE,
  );

  return (
    <div className="detail-page">
      {/* Hero with backdrop */}
      <div
        className="detail-hero"
        style={{
          backgroundImage: backdrop
            ? `linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.6)), url(${backdrop})`
            : 'linear-gradient(to right, rgba(15,23,42,0.95), rgba(15,23,42,0.6))',
        }}
      >
        <div className="container">
          <div className="detail-hero-inner">
            {/* Poster */}
            <div className="detail-poster">
              <img src={poster} alt={title} loading="lazy" />
            </div>

            {/* Main info */}
            <div className="detail-main">
              <h1 className="detail-title">
                {title} <span className="detail-year">({year})</span>
              </h1>

              <div className="detail-meta-row">
                <span className="detail-meta-pill">
                  {isTV ? 'TV Series' : 'Movie'}
                </span>
                {runtime && (
                  <span className="detail-meta-pill">{runtime} min</span>
                )}
                {genres.length > 0 && (
                  <span className="detail-meta-pill">
                    {genres.map((g) => g.name).join(' / ')}
                  </span>
                )}
              </div>

              <div className="detail-rating-row">
                <span className="detail-rating-score">⭐ {rating}</span>
                <span className="detail-rating-votes">
                  {votes.toLocaleString()} votes
                </span>
              </div>

              <div className="detail-overview-block">
                <h3>Overview</h3>
                <p>{overview}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body: main column + sidebar */}
      <div className="container detail-body">
        <div className="detail-layout">
          {/* Left main column */}
          <div className="detail-main-col">
            {/* Latest season (TV only) */}
            {isTV && latestSeason && (
              <section className="detail-section">
                <h2 className="detail-section-title">Latest Season</h2>
                <div className="latest-season-card">
                  <div className="latest-season-poster">
                    {latestSeason.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w185${latestSeason.poster_path}`}
                        alt={latestSeason.name}
                        loading="lazy"
                      />
                    ) : (
                      <div className="latest-season-placeholder">
                        {latestSeason.name?.[0] || '?'}
                      </div>
                    )}
                  </div>
                  <div className="latest-season-info">
                    <h3 className="latest-season-title">
                      {latestSeason.name}
                    </h3>
                    <div className="latest-season-meta">
                      <span>
                        {latestSeason.air_date
                          ? latestSeason.air_date.slice(0, 4)
                          : '—'}
                      </span>
                      <span> • {latestSeason.episode_count} episodes</span>
                    </div>
                    {latestSeason.overview && (
                      <p className="latest-season-overview">
                        {latestSeason.overview}
                      </p>
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* Cast */}
            {cast.length > 0 && (
              <section className="detail-section">
                <h2 className="detail-section-title">Top Billed Cast</h2>
                <div className="detail-cast-grid">
                  {cast.slice(0, 8).map((c) => (
                    <div
                      key={c.cast_id || c.credit_id || c.id}
                      className="detail-cast-card"
                    >
                      {c.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w185${c.profile_path}`}
                          alt={c.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="detail-cast-placeholder">
                          {c.name?.[0] || '?'}
                        </div>
                      )}
                      <div className="detail-cast-name">{c.name}</div>
                      <div className="detail-cast-role">
                        {c.character || '—'}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Media: trailers + images with pagination */}
            <section className="detail-section">
              <h2 className="detail-section-title">Media</h2>

              {mediaError && (
                <p style={{ color: 'salmon', fontSize: 13 }}>
                  {mediaError}
                </p>
              )}

              {/* Trailers (paged, 1 per page) */}
              {trailers.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Trailers</h3>

                  <div className="trailer-grid">
                    {visibleTrailers.map((t) => (
                      <div key={t.id} className="trailer-item">
                        <div className="trailer-frame-wrapper">
                          <iframe
                            src={`https://www.youtube.com/embed/${t.key}`}
                            title={t.name}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <div className="trailer-title">{t.name}</div>
                      </div>
                    ))}
                  </div>

                  {trailerTotalPages > 1 && (
                    <div className="media-pager">
                      <button
                        className="btn btn-secondary"
                        disabled={trailerPage <= 1}
                        onClick={() =>
                          setTrailerPage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </button>
                      <span className="media-pager-label">
                        Trailer {trailerPage} / {trailerTotalPages}
                      </span>
                      <button
                        className="btn btn-secondary"
                        disabled={trailerPage >= trailerTotalPages}
                        onClick={() =>
                          setTrailerPage((p) =>
                            Math.min(trailerTotalPages, p + 1),
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Images (paged, 2 per page) */}
              {backdrops.length > 0 && (
                <div>
                  <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Images</h3>

                  <div className="backdrop-grid">
                    {visibleImages.map((b, idx) => (
                      <img
                        key={idx}
                        src={`https://image.tmdb.org/t/p/w780${b.file_path}`}
                        alt="still"
                        className="backdrop-img"
                      />
                    ))}
                  </div>

                  {imageTotalPages > 1 && (
                    <div className="media-pager">
                      <button
                        className="btn btn-secondary"
                        disabled={imagePage <= 1}
                        onClick={() =>
                          setImagePage((p) => Math.max(1, p - 1))
                        }
                      >
                        Prev
                      </button>
                      <span className="media-pager-label">
                        Page {imagePage} / {imageTotalPages}
                      </span>
                      <button
                        className="btn btn-secondary"
                        disabled={imagePage >= imageTotalPages}
                        onClick={() =>
                          setImagePage((p) =>
                            Math.min(imageTotalPages, p + 1),
                          )
                        }
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}

              {trailers.length === 0 &&
                backdrops.length === 0 &&
                !mediaError && (
                  <p style={{ fontSize: 14, color: '#9ca3af' }}>
                    No media available.
                  </p>
                )}
            </section>
          {/* Comments section */}
            <section className="detail-section">
              <h2 className="detail-section-title">Comments</h2>

              {/* Write comment */}
              {user ? (
                <form className="comment-form" onSubmit={handleSubmitComment}>
                  <textarea
                    className="comment-textarea"
                    placeholder="Share your thoughts about this title..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <div className="comment-actions">
                    <button
                      type="submit"
                      className="btn"
                      disabled={!newComment.trim()}
                    >
                      Post Comment
                    </button>
                  </div>
                </form>
              ) : (
                <p style={{ fontSize: 14, color: '#9ca3af' }}>
                  Please sign in to post a comment.
                </p>
              )}

              {/* Comment list */}
              <div className="comment-list">
                {commentsLoading && <p>Loading comments…</p>}
                {commentsError && (
                  <p style={{ color: 'salmon', fontSize: 13 }}>{commentsError}</p>
                )}

                {!commentsLoading && !commentsError && comments.length === 0 && (
                  <p style={{ fontSize: 14, color: '#9ca3af' }}>
                    No comments yet. Be the first one to comment!
                  </p>
                )}

                {comments.map((c) => (
                  <div key={c.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">
                        {c.author_name || 'User'}
                      </span>
                      {c.created_at && (
                        <span className="comment-time">
                          {new Date(c.created_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                    <p className="comment-content">{c.content}</p>
                  </div>
                ))}
              </div>
            </section>

            
          </div>

          {/* Right sidebar */}
          <aside className="detail-side-col">
            <section className="detail-side-section">
              <h3 className="detail-side-heading">Details</h3>
              <dl className="detail-side-list">
                <div>
                  <dt>Type</dt>
                  <dd>{isTV ? 'TV Series' : 'Movie'}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{status}</dd>
                </div>
                <div>
                  <dt>Original Language</dt>
                  <dd>{originLang.toUpperCase()}</dd>
                </div>
                {runtime && (
                  <div>
                    <dt>Runtime</dt>
                    <dd>{runtime} min</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className="detail-side-section">
              <h3 className="detail-side-heading">Genres</h3>
              <div className="tag-list">
                {genres.length === 0 && (
                  <span className="tag-chip muted">—</span>
                )}
                {genres.map((g) => (
                  <span key={g.id} className="tag-chip">
                    {g.name}
                  </span>
                ))}
              </div>
            </section>

            <section className="detail-side-section">
              <h3 className="detail-side-heading">Score</h3>
              <div className="detail-score-box">
                <div className="detail-score-number">⭐ {rating}</div>
                <div className="detail-score-sub">
                  {votes.toLocaleString()} votes
                </div>
              </div>
            </section>

            <section className="detail-side-section">
              <h3 className="detail-side-heading">Crew</h3>

              {mainCrew.length === 0 ? (
                <p className="detail-side-empty">No crew data available.</p>
              ) : (
                <ul className="crew-list">
                  {mainCrew.map((m) => (
                    <li
                      key={m.credit_id || `${m.id}-${m.job}`}
                      className="crew-row"
                    >
                      <div className="crew-name">{m.name}</div>
                      <div className="crew-job">{m.job}</div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
      

            

          </aside>
        </div>
      </div>
    </div>
  );
}

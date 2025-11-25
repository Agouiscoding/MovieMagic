# backend/routes/comments.py
from flask import Blueprint, request, jsonify, g
from auth import require_auth
from db import get_session
from models import Comment, User  # User 如果你有的话

bp = Blueprint("comments", __name__, url_prefix="/api/comments")


@bp.get("")
def list_comments():
    """List comments for a given media_type + tmdb_id."""
    media_type = (request.args.get("media_type") or "").lower()
    tmdb_id = (request.args.get("tmdb_id") or "").strip()

    if media_type not in {"movie", "tv"}:
        return jsonify({"error": "media_type must be movie|tv"}), 400
    if not tmdb_id:
        return jsonify({"error": "tmdb_id required"}), 400

    with get_session() as db:
        rows = (
            db.query(Comment)
            .filter_by(media_type=media_type, tmdb_id=tmdb_id)
            .order_by(Comment.created_at.desc())
            .all()
        )

        return jsonify([
            {
                "id": c.id,
                "uid": c.uid,
                "media_type": c.media_type,
                "tmdb_id": c.tmdb_id,
                "content": c.content,
                "author_name": c.author_name,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in rows
        ])


@bp.post("")
@require_auth
def add_comment():
    """Add a new comment (login required)."""
    uid = g.user["uid"]
    data = request.get_json(silent=True) or {}

    media_type = (data.get("media_type") or "").lower()
    tmdb_id = str(data.get("tmdb_id") or "").strip()
    content = (data.get("content") or "").strip()

    if media_type not in {"movie", "tv"}:
        return jsonify({"error": "media_type must be movie|tv"}), 400
    if not tmdb_id:
        return jsonify({"error": "tmdb_id required"}), 400
    if not content:
        return jsonify({"error": "content required"}), 400
    if len(content) > 2000:
        return jsonify({"error": "content too long"}), 400

    # You can try to read author's display name/email from your User table, or from g.user
    author_name = g.user.get("email") or g.user.get("name") or "Anonymous"

    with get_session() as db:
        c = Comment(
            uid=uid,
            media_type=media_type,
            tmdb_id=tmdb_id,
            content=content,
            author_name=author_name[:255],
        )
        db.add(c)
        db.flush()
        return jsonify({
            "id": c.id,
            "uid": c.uid,
            "media_type": c.media_type,
            "tmdb_id": c.tmdb_id,
            "content": c.content,
            "author_name": c.author_name,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }), 201


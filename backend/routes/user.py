from __future__ import annotations

from datetime import datetime
from flask import Blueprint, jsonify, request, g

from auth import require_auth
from db import get_session
from models import User, Favorite, AlertPreference


bp = Blueprint("user", __name__, url_prefix="/api")


@bp.post("/user/bootstrap")
@require_auth
def bootstrap_user():
    # No-op: require_auth ensures user row exists/updated
    return jsonify({"ok": True}), 200


@bp.get("/profile")
@require_auth
def get_profile():
    uid = g.user["uid"]
    with get_session() as db:
        user = db.get(User, uid)
        if not user:
            return jsonify({"error": "user not found"}), 404
        return jsonify({
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "created_at": user.created_at.isoformat(),
        })


@bp.put("/profile")
@require_auth
def update_profile():
    uid = g.user["uid"]
    data = request.get_json(silent=True) or {}
    display_name = data.get("display_name")
    photo_url = data.get("photo_url")
    with get_session() as db:
        user = db.get(User, uid)
        if not user:
            return jsonify({"error": "user not found"}), 404
        if display_name is not None:
            user.display_name = str(display_name)[:200]
        if photo_url is not None:
            user.photo_url = str(photo_url)[:500]
        db.add(user)
    return jsonify({"ok": True})


@bp.get("/alerts")
@require_auth
def get_alerts():
    uid = g.user["uid"]
    with get_session() as db:
        ap = db.query(AlertPreference).filter_by(uid=uid).first()
        if not ap:
            return jsonify({"frequency": "weekly", "keywords": "", "channels": ""})
        return jsonify({
            "frequency": ap.frequency,
            "keywords": ap.keywords or "",
            "channels": ap.channels or "",
            "updated_at": ap.updated_at.isoformat() if ap.updated_at else None,
        })


@bp.put("/alerts")
@require_auth
def update_alerts():
    uid = g.user["uid"]
    data = request.get_json(silent=True) or {}
    frequency = (data.get("frequency") or "weekly").lower()
    keywords = (data.get("keywords") or "").strip()
    channels = (data.get("channels") or "").strip()

    if frequency not in {"daily", "weekly", "monthly"}:
        return jsonify({"error": "invalid frequency"}), 400

    with get_session() as db:
        ap = db.query(AlertPreference).filter_by(uid=uid).first()
        if not ap:
            ap = AlertPreference(uid=uid)
        ap.frequency = frequency
        ap.keywords = keywords[:1000]
        ap.channels = channels[:200]
        ap.updated_at = datetime.utcnow()
        db.add(ap)
    return jsonify({"ok": True})


@bp.get("/favorites")
@require_auth
def list_favorites():
    uid = g.user["uid"]
    with get_session() as db:
        rows = (
            db.query(Favorite)
            .filter_by(uid=uid)
            .order_by(Favorite.created_at.desc())
            .all()
        )
        return jsonify([
            {
                "id": f.id,
                "media_type": f.media_type,
                "tmdb_id": f.tmdb_id,
                "title": f.title,
                "poster_path": f.poster_path,
                "created_at": f.created_at.isoformat(),
            }
            for f in rows
        ])


@bp.post("/favorites")
@require_auth
def add_favorite():
    uid = g.user["uid"]
    data = request.get_json(silent=True) or {}
    media_type = (data.get("media_type") or "").lower()
    tmdb_id = str(data.get("tmdb_id") or "").strip()
    title = (data.get("title") or "").strip()
    poster_path = (data.get("poster_path") or "").strip()

    if media_type not in {"movie", "tv"}:
        return jsonify({"error": "media_type must be movie|tv"}), 400
    if not tmdb_id:
        return jsonify({"error": "tmdb_id required"}), 400

    with get_session() as db:
        # Upsert-like behavior: ignore if exists
        exists = (
            db.query(Favorite)
            .filter_by(uid=uid, media_type=media_type, tmdb_id=tmdb_id)
            .first()
        )
        if exists:
            return jsonify({"ok": True, "id": exists.id})

        fav = Favorite(
            uid=uid,
            media_type=media_type,
            tmdb_id=tmdb_id,
            title=title[:300] or None,
            poster_path=poster_path[:500] or None,
        )
        db.add(fav)
        db.flush()
        return jsonify({"ok": True, "id": fav.id}), 201


@bp.delete("/favorites/<media_type>/<tmdb_id>")
@require_auth
def remove_favorite(media_type: str, tmdb_id: str):
    uid = g.user["uid"]
    media_type = (media_type or "").lower()
    if media_type not in {"movie", "tv"}:
        return jsonify({"error": "media_type must be movie|tv"}), 400

    with get_session() as db:
        row = (
            db.query(Favorite)
            .filter_by(uid=uid, media_type=media_type, tmdb_id=str(tmdb_id))
            .first()
        )
        if not row:
            return jsonify({"error": "not found"}), 404
        db.delete(row)
    return jsonify({"ok": True})

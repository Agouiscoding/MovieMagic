# backend/routes/details.py
from flask import Blueprint, request, jsonify
import os
import requests

bp = Blueprint("details", __name__, url_prefix="/api")

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")


@bp.get("/details")
def get_details():
    """Proxy TMDb movie/TV details with extra info."""
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY not configured"}), 500

    media_type = (request.args.get("type") or "").lower()
    tmdb_id = request.args.get("id")
    language = request.args.get("language", "en-US")

    if media_type not in {"movie", "tv"}:
        return jsonify({"error": "type must be movie|tv"}), 400
    if not tmdb_id:
        return jsonify({"error": "id is required"}), 400

    # Choose TMDb path by media type
    path = f"/movie/{tmdb_id}" if media_type == "movie" else f"/tv/{tmdb_id}"

    # Ask TMDb for extra data (credits, videos, recommendations)
    params = {
      "api_key": TMDB_API_KEY,
      "language": language,
      "append_to_response": "credits,videos,recommendations",
    }

    r = requests.get(TMDB_BASE + path, params=params, timeout=10)
    if r.status_code != 200:
        return jsonify({"error": "TMDb error", "status": r.status_code}), 502

    return jsonify(r.json())

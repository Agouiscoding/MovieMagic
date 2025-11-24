# backend/routes/trending.py
import os
import requests
from flask import Blueprint, request, jsonify

bp = Blueprint("trending", __name__, url_prefix="/api")

TMDB_BASE = "https://api.themoviedb.org/3"
TMDB_API_KEY = os.getenv("TMDB_API_KEY")


@bp.route("/trending")
def trending():
    """Proxy TMDb /trending endpoint."""
    if not TMDB_API_KEY:
        return jsonify({"error": "TMDB_API_KEY missing"}), 500

    media_type = request.args.get("type", "all")  # all | movie | tv
    time_window = request.args.get("window", "day")  # day | week
    page = request.args.get("page", 1)
    language = request.args.get("language", "en-US")
    region = request.args.get("region", "US")

    if media_type not in ("all", "movie", "tv"):
        return jsonify({"error": "type must be all|movie|tv"}), 400
    if time_window not in ("day", "week"):
        return jsonify({"error": "window must be day|week"}), 400

    url = f"{TMDB_BASE}/trending/{media_type}/{time_window}"
    params = {
        "api_key": TMDB_API_KEY,
        "page": page,
        "language": language,
        "region": region,
    }

    try:
        resp = requests.get(url, params=params, timeout=10)
    except requests.RequestException as e:
        return jsonify({"error": str(e)}), 502

    return jsonify(resp.json()), resp.status_code

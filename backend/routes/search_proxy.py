# backend/routes/search_proxy.py
import os
import requests
from flask import Blueprint, request, jsonify

bp = Blueprint("tmdb_search", __name__, url_prefix="/api")
TMDB = "https://api.themoviedb.org/3"
API_KEY = os.getenv("TMDB_API_KEY")

def with_key(params: dict | None = None):
    params = params or {}
    params["api_key"] = API_KEY
    return params

@bp.get("/search")
def search():
    """
    /api/search?type=movie|tv&query=Inception&page=1&language=en-US&year=2010
    """
    media_type = request.args.get("type", "movie")  # movie | tv
    query = request.args.get("query", "").strip()
    page = request.args.get("page", 1)
    language = request.args.get("language", "en-US")
    year = request.args.get("year")  # 电影可用 year，电视剧用 first_air_date_year

    if not API_KEY:
        return jsonify({"error": "TMDB_API_KEY missing"}), 500
    if not query:
        return jsonify({"error": "query required"}), 400
    if media_type not in ("movie", "tv"):
        return jsonify({"error": "type must be movie|tv"}), 400

    path = f"{TMDB}/search/{media_type}"
    params = {
        "query": query,
        "page": page,
        "language": language,
        "include_adult": "false",
    }
    # 电影 year，电视剧 first_air_date_year（二选一）
    if year:
        if media_type == "movie":
            params["year"] = year
        else:
            params["first_air_date_year"] = year

    r = requests.get(path, params=with_key(params), timeout=10)
    return jsonify(r.json()), r.status_code

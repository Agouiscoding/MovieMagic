# backend/routes/discover.py
import os
import requests
from flask import Blueprint, request, jsonify

bp = Blueprint("tmdb_discover", __name__, url_prefix="/api")
TMDB = "https://api.themoviedb.org/3"
API_KEY = os.getenv("TMDB_API_KEY")

def with_key(params=None):
    params = params or {}
    params["api_key"] = API_KEY
    return params

@bp.get("/discover")
def discover():
    if not API_KEY:
        return jsonify({"error": "TMDB_API_KEY missing"}), 500

    media_type = request.args.get("type", "movie")
    if media_type not in ("movie", "tv"):
        return jsonify({"error": "type must be movie|tv"}), 400

    path = f"{TMDB}/discover/{media_type}"
    params = {}

    # Basic filters
    params["language"] = request.args.get("language", "en-US")
    params["region"] = request.args.get("region", "US")
    params["include_adult"] = request.args.get("include_adult", "false")
    params["sort_by"] = request.args.get("sort_by", "popularity.desc")
    params["page"] = request.args.get("page", 1)
    if g := request.args.get("with_genres"):
        params["with_genres"] = g

    # Year filter
    year = request.args.get("year")
    if year:
        if media_type == "movie":
            params["year"] = year
        else:
            params["first_air_date_year"] = year

    # ✅ New: release date range
    from_date = request.args.get("fromDate")
    to_date = request.args.get("toDate")

    if from_date:
        if media_type == "movie":
            params["primary_release_date.gte"] = from_date
        else:
            params["first_air_date.gte"] = from_date

    if to_date:
        if media_type == "movie":
            params["primary_release_date.lte"] = to_date
        else:
            params["first_air_date.lte"] = to_date

    r = requests.get(path, params=with_key(params), timeout=10)
    return jsonify(r.json()), r.status_code

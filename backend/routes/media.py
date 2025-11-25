from flask import Blueprint, request, jsonify
import requests
import os

bp = Blueprint("media", __name__, url_prefix="/api/media")

TMDB_KEY = os.getenv("TMDB_API_KEY")
BASE = "https://api.themoviedb.org/3"


@bp.get("")
def get_media():
    media_type = request.args.get("type", "movie")
    tmdb_id = request.args.get("id")

    if not tmdb_id:
        return jsonify({"error": "id required"}), 400

    # Fetch videos
    url_videos = f"{BASE}/{media_type}/{tmdb_id}/videos?api_key={TMDB_KEY}&language=en-US"
    videos = requests.get(url_videos).json().get("results", [])

    # Filter YouTube trailers
    yt_trailers = [
        v for v in videos
        if v["site"] == "YouTube" and v["type"] in ("Trailer", "Teaser")
    ]

    # Fetch images
    url_images = f"{BASE}/{media_type}/{tmdb_id}/images?api_key={TMDB_KEY}"
    imgs_raw = requests.get(url_images).json()

    backdrops = imgs_raw.get("backdrops", [])[:20]   # 取前 20 张

    return jsonify({
        "trailers": yt_trailers,
        "backdrops": backdrops,
    })

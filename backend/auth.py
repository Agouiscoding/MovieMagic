from __future__ import annotations

import json
import os
from functools import wraps
from typing import Callable, Optional

from flask import request, jsonify, g
import firebase_admin
from firebase_admin import auth as fb_auth
from firebase_admin import credentials

from db import get_session
from models import User


_firebase_inited = False


def init_firebase():
    global _firebase_inited
    if _firebase_inited:
        return

    # Prefer GOOGLE_APPLICATION_CREDENTIALS or explicit FIREBASE_CREDENTIALS_JSON
    cred: Optional[credentials.Base] = None

    json_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS") or os.getenv("FIREBASE_CREDENTIALS_JSON")
    if json_path and os.path.exists(json_path):
        cred = credentials.Certificate(json_path)
    else:
        # Fallback to application default credentials (for local envs with gcloud)
        try:
            cred = credentials.ApplicationDefault()
        except Exception:
            cred = None

    project_id = os.getenv("FIREBASE_PROJECT_ID") or os.getenv("GOOGLE_CLOUD_PROJECT")

    if cred is not None and project_id:
        firebase_admin.initialize_app(cred, {"projectId": project_id})
    elif cred is not None:
        firebase_admin.initialize_app(cred)
    elif project_id:
        firebase_admin.initialize_app(options={"projectId": project_id})
    else:
        firebase_admin.initialize_app()

    _firebase_inited = True


def require_auth(fn: Callable):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        init_firebase()

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Missing Authorization Bearer token"}), 401

        token = auth_header.split(" ", 1)[1].strip()
        try:
            decoded = fb_auth.verify_id_token(token)
        except Exception as e:
            return jsonify({"error": f"Invalid token: {e}"}), 401

        uid = decoded.get("uid")
        email = decoded.get("email")
        name = decoded.get("name")
        picture = decoded.get("picture")

        g.user = {"uid": uid, "email": email, "display_name": name, "photo_url": picture}

        # Ensure a user row exists
        with get_session() as db:
            user = db.get(User, uid)
            if not user:
                user = User(uid=uid, email=email, display_name=name, photo_url=picture)
                db.add(user)
            else:
                # Update cached fields if changed
                changed = False
                if user.email != email:
                    user.email = email
                    changed = True
                if user.display_name != name:
                    user.display_name = name
                    changed = True
                if user.photo_url != picture:
                    user.photo_url = picture
                    changed = True
                if changed:
                    db.add(user)

        return fn(*args, **kwargs)

    return wrapper

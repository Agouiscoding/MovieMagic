from __future__ import annotations

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, UniqueConstraint,func
from sqlalchemy.orm import relationship

from db import Base


class User(Base):
    __tablename__ = "users"

    uid = Column(String, primary_key=True)  # Firebase UID
    email = Column(String, nullable=True)
    display_name = Column(String, nullable=True)
    photo_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    alerts = relationship("AlertPreference", back_populates="user", uselist=False, cascade="all, delete-orphan")


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), nullable=False, index=True)
    media_type = Column(String, nullable=False)  # 'movie' | 'tv'
    tmdb_id = Column(String, nullable=False)
    title = Column(String, nullable=True)
    poster_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="favorites")

    __table_args__ = (
        UniqueConstraint("uid", "media_type", "tmdb_id", name="uq_user_fav"),
    )


class AlertPreference(Base):
    __tablename__ = "alert_preferences"

    id = Column(Integer, primary_key=True, autoincrement=True)
    uid = Column(String, ForeignKey("users.uid", ondelete="CASCADE"), nullable=False, unique=True)
    frequency = Column(String, default="weekly")  # daily | weekly | monthly, etc.
    keywords = Column(Text, nullable=True)  # comma-separated keywords
    channels = Column(Text, nullable=True)  # e.g., 'email,push'
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", back_populates="alerts")


class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, autoincrement=True)

    uid = Column(String(128), nullable=False)  # Firebase uid
    media_type = Column(String(10), nullable=False)  # "movie" | "tv"
    tmdb_id = Column(String(32), nullable=False)     # TMDB id as string
    content = Column(Text, nullable=False)

    # snapshot of user info, so even if profile changes we still keep name at that time
    author_name = Column(String(255), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

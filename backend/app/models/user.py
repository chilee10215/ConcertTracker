from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    followed_artists = relationship("UserArtist", back_populates="user")
    wishlist = relationship("UserWishlist", back_populates="user")


class UserArtist(Base):
    __tablename__ = "user_artists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    position = Column(Integer, nullable=True)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="followed_artists")
    artist = relationship("Artist", back_populates="followers")


class UserWishlist(Base):
    __tablename__ = "user_wishlist"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    concert_id = Column(Integer, ForeignKey("concerts.id"), nullable=False)
    added_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="wishlist")
    concert = relationship("Concert", back_populates="wishlisted_by")

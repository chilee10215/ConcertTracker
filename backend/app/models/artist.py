from sqlalchemy import Column, Integer, String, JSON
from sqlalchemy.orm import relationship

from app.database import Base


class Artist(Base):
    __tablename__ = "artists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    image_url = Column(String, default="")
    genres = Column(JSON, default=list)

    followers = relationship("UserArtist", back_populates="artist")
    concerts = relationship("Concert", back_populates="artist")

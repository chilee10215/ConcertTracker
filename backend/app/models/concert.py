from datetime import datetime

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Concert(Base):
    __tablename__ = "concerts"

    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    title = Column(String, nullable=False)
    date = Column(DateTime, nullable=True)
    location = Column(String, default="")
    venue = Column(String, default="")
    price_range = Column(String, default="")
    ticket_start_date = Column(DateTime, nullable=True)
    lottery_registration_date = Column(DateTime, nullable=True)
    platform = Column(String, default="")
    organizer = Column(String, default="")
    official_link = Column(String, default="")
    status = Column(String, default="upcoming")  # upcoming, on_sale, lottery_open
    last_updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    artist = relationship("Artist", back_populates="concerts")
    wishlisted_by = relationship("UserWishlist", back_populates="concert")

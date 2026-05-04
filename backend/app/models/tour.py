from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Tour(Base):
    __tablename__ = "tours"

    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, default="")
    year = Column(Integer, nullable=True)

    artist = relationship("Artist", back_populates="tours")
    sale_events = relationship("SaleEvent", back_populates="tour", cascade="all, delete-orphan")

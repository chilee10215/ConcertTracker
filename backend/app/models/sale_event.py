from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text, Enum, func
from sqlalchemy.orm import relationship

from app.database import Base

VALID_SALE_TYPES = ["FC_LOTTERY", "GENERAL_LOTTERY", "GENERAL_SALE", "REMAINING"]
VALID_PLATFORMS = ["Eplus", "Pia", "Lawson", "Melon", "Interpark", "Other"]


class SaleEvent(Base):
    __tablename__ = "sale_events"

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey("tours.id"), nullable=False)
    type = Column(Enum(*VALID_SALE_TYPES), nullable=False)
    registration_start = Column(DateTime, nullable=False)
    registration_end = Column(DateTime, nullable=False)
    result_date = Column(DateTime, nullable=True)
    platform = Column(Enum(*VALID_PLATFORMS), nullable=False)
    link = Column(String, default="")
    notes = Column(Text, default="")
    created_at = Column(DateTime, server_default=func.now())

    tour = relationship("Tour", back_populates="sale_events")

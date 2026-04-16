from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ConcertBase(BaseModel):
    title: str
    date: Optional[datetime] = None
    location: str = ""
    venue: str = ""
    price_range: str = ""
    ticket_start_date: Optional[datetime] = None
    lottery_registration_date: Optional[datetime] = None
    platform: str = ""
    organizer: str = ""
    official_link: str = ""
    status: str = "upcoming"


class ConcertResponse(ConcertBase):
    id: int
    artist_id: int
    artist_name: str = ""
    is_wishlisted: bool = False
    last_updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

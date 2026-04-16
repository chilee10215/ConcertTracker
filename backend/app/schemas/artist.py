from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ArtistBase(BaseModel):
    name: str
    image_url: str = ""
    genres: list[str] = []


class ArtistCreate(ArtistBase):
    pass


class ArtistResponse(ArtistBase):
    id: int
    next_concert_date: Optional[datetime] = None
    next_concert_venue: Optional[str] = None

    class Config:
        from_attributes = True


class ArtistSearchResult(BaseModel):
    name: str
    image_url: str = ""
    genres: list[str] = []
    source: str = "mock"


class FollowRequest(BaseModel):
    artist_id: Optional[int] = None
    name: str
    image_url: str = ""
    genres: list[str] = []

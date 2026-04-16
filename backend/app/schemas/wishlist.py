from datetime import datetime

from pydantic import BaseModel

from app.schemas.concert import ConcertResponse


class WishlistItem(BaseModel):
    id: int
    concert: ConcertResponse
    added_at: datetime

    class Config:
        from_attributes = True

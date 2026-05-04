from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.sale_event import VALID_SALE_TYPES, VALID_PLATFORMS


class TourBase(BaseModel):
    name: str
    description: str = ""
    year: Optional[int] = None


class TourCreate(TourBase):
    artist_id: int


class TourResponse(TourBase):
    id: int
    artist_id: int

    model_config = {"from_attributes": True}


class SaleEventBase(BaseModel):
    type: str
    registration_start: datetime
    registration_end: datetime
    result_date: Optional[datetime] = None
    platform: str
    link: str = ""
    notes: str = ""


class SaleEventCreate(SaleEventBase):
    tour_id: int


class SaleEventResponse(SaleEventBase):
    id: int
    tour_id: int
    created_at: datetime

    model_config = {"from_attributes": True}


class SaleEventWithArtist(SaleEventResponse):
    artist_name: str
    artist_id: int
    tour_name: str

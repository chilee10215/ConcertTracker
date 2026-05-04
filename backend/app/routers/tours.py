from datetime import datetime, timezone
from typing import List, Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.dependencies import get_db, get_current_user
from app.models.artist import Artist
from app.models.tour import Tour
from app.models.sale_event import SaleEvent
from app.models.user import User, UserArtist
from app.schemas.sale_event import TourResponse, SaleEventResponse, SaleEventWithArtist

router = APIRouter()


@router.get("/artist/{artist_id}", response_model=List[TourResponse])
def get_tours_for_artist(
    artist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    artist = db.query(Artist).filter(Artist.id == artist_id).first()
    if not artist:
        raise HTTPException(status_code=404, detail="Artist not found")
    return db.query(Tour).filter(Tour.artist_id == artist_id).all()


@router.get("/{tour_id}/sale-events", response_model=List[SaleEventResponse])
def get_sale_events_for_tour(
    tour_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail="Tour not found")
    return tour.sale_events


@router.get("/upcoming-sales", response_model=List[SaleEventWithArtist])
def get_upcoming_sales_for_followed_artists(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    followed = db.query(UserArtist).filter(UserArtist.user_id == current_user.id).all()
    artist_ids = [f.artist_id for f in followed]

    if not artist_ids:
        return []

    tours = (
        db.query(Tour)
        .options(joinedload(Tour.artist))
        .filter(Tour.artist_id.in_(artist_ids))
        .all()
    )
    tour_ids = [t.id for t in tours]
    tour_map: Dict[int, Tour] = {t.id: t for t in tours}

    if not tour_ids:
        return []

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    events = (
        db.query(SaleEvent)
        .filter(
            SaleEvent.tour_id.in_(tour_ids),
            SaleEvent.registration_end >= now,
        )
        .order_by(SaleEvent.registration_start)
        .offset(skip)
        .limit(limit)
        .all()
    )

    result = []
    for event in events:
        tour = tour_map[event.tour_id]
        result.append(
            SaleEventWithArtist(
                **{c.key: getattr(event, c.key) for c in event.__table__.columns},
                artist_name=tour.artist.name,
                artist_id=tour.artist_id,
                tour_name=tour.name,
            )
        )

    return result

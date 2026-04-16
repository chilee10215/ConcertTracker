from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User, UserWishlist
from app.models.concert import Concert

router = APIRouter()


@router.get("/artist/{artist_id}")
def get_concerts_by_artist(
    artist_id: int,
    platform: str = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(Concert).filter(Concert.artist_id == artist_id)
    if platform:
        query = query.filter(Concert.platform == platform)
    concerts = query.order_by(Concert.date.asc()).all()

    wishlisted_ids = {
        w.concert_id
        for w in db.query(UserWishlist).filter(UserWishlist.user_id == current_user.id).all()
    }

    return [
        {
            "id": c.id,
            "artist_id": c.artist_id,
            "artist_name": c.artist.name if c.artist else "",
            "title": c.title,
            "date": c.date.isoformat() if c.date else None,
            "location": c.location,
            "venue": c.venue,
            "price_range": c.price_range,
            "ticket_start_date": c.ticket_start_date.isoformat() if c.ticket_start_date else None,
            "lottery_registration_date": c.lottery_registration_date.isoformat() if c.lottery_registration_date else None,
            "platform": c.platform,
            "organizer": c.organizer,
            "official_link": c.official_link,
            "status": c.status,
            "is_wishlisted": c.id in wishlisted_ids,
            "last_updated_at": c.last_updated_at.isoformat() if c.last_updated_at else None,
        }
        for c in concerts
    ]


@router.get("/{concert_id}")
def get_concert(
    concert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=404, detail="Concert not found")

    is_wishlisted = (
        db.query(UserWishlist)
        .filter(UserWishlist.user_id == current_user.id, UserWishlist.concert_id == concert_id)
        .first()
        is not None
    )

    return {
        "id": concert.id,
        "artist_id": concert.artist_id,
        "artist_name": concert.artist.name if concert.artist else "",
        "title": concert.title,
        "date": concert.date.isoformat() if concert.date else None,
        "location": concert.location,
        "venue": concert.venue,
        "price_range": concert.price_range,
        "ticket_start_date": concert.ticket_start_date.isoformat() if concert.ticket_start_date else None,
        "lottery_registration_date": concert.lottery_registration_date.isoformat() if concert.lottery_registration_date else None,
        "platform": concert.platform,
        "organizer": concert.organizer,
        "official_link": concert.official_link,
        "status": concert.status,
        "is_wishlisted": is_wishlisted,
        "last_updated_at": concert.last_updated_at.isoformat() if concert.last_updated_at else None,
    }

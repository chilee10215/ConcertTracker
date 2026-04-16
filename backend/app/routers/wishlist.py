from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User, UserWishlist
from app.models.concert import Concert

router = APIRouter()


@router.get("")
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    items = (
        db.query(UserWishlist)
        .filter(UserWishlist.user_id == current_user.id)
        .all()
    )
    return [
        {
            "id": item.id,
            "added_at": item.added_at.isoformat() if item.added_at else None,
            "concert": {
                "id": item.concert.id,
                "artist_id": item.concert.artist_id,
                "artist_name": item.concert.artist.name if item.concert.artist else "",
                "title": item.concert.title,
                "date": item.concert.date.isoformat() if item.concert.date else None,
                "location": item.concert.location,
                "venue": item.concert.venue,
                "price_range": item.concert.price_range,
                "ticket_start_date": item.concert.ticket_start_date.isoformat() if item.concert.ticket_start_date else None,
                "lottery_registration_date": item.concert.lottery_registration_date.isoformat() if item.concert.lottery_registration_date else None,
                "platform": item.concert.platform,
                "organizer": item.concert.organizer,
                "official_link": item.concert.official_link,
                "status": item.concert.status,
                "is_wishlisted": True,
                "last_updated_at": item.concert.last_updated_at.isoformat() if item.concert.last_updated_at else None,
            },
        }
        for item in items
    ]


@router.post("/{concert_id}")
def add_to_wishlist(
    concert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    concert = db.query(Concert).filter(Concert.id == concert_id).first()
    if not concert:
        raise HTTPException(status_code=404, detail="Concert not found")

    existing = (
        db.query(UserWishlist)
        .filter(UserWishlist.user_id == current_user.id, UserWishlist.concert_id == concert_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already in wishlist")

    item = UserWishlist(user_id=current_user.id, concert_id=concert_id)
    db.add(item)
    db.commit()
    return {"detail": "Added to wishlist"}


@router.delete("/{concert_id}")
def remove_from_wishlist(
    concert_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    item = (
        db.query(UserWishlist)
        .filter(UserWishlist.user_id == current_user.id, UserWishlist.concert_id == concert_id)
        .first()
    )
    if not item:
        raise HTTPException(status_code=404, detail="Not in wishlist")
    db.delete(item)
    db.commit()
    return {"detail": "Removed from wishlist"}

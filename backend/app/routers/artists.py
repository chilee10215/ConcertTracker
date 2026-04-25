from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.dependencies import get_db, get_current_user
from app.models.user import User, UserArtist
from app.models.artist import Artist
from app.models.concert import Concert
from app.schemas.artist import ArtistResponse, ArtistSearchResult, FollowRequest
from app.services.ticketmaster import search_artists


class ReorderRequest(BaseModel):
    artist_ids: List[int]

router = APIRouter()


@router.get("/search", response_model=list[ArtistSearchResult])
async def search(q: str = Query(..., min_length=1), _user: User = Depends(get_current_user)):
    results = await search_artists(q)
    return results


@router.get("/followed", response_model=list[ArtistResponse])
def get_followed_artists(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_artists = (
        db.query(UserArtist)
        .filter(UserArtist.user_id == current_user.id)
        .order_by(
            UserArtist.position.asc().nulls_last(),
            UserArtist.id.asc(),
        )
        .all()
    )
    results = []
    for ua in user_artists:
        artist = ua.artist
        next_concert = (
            db.query(Concert)
            .filter(Concert.artist_id == artist.id)
            .filter(Concert.date != None)
            .order_by(Concert.date.asc())
            .first()
        )
        results.append(ArtistResponse(
            id=artist.id,
            name=artist.name,
            image_url=artist.image_url,
            genres=artist.genres or [],
            next_concert_date=next_concert.date if next_concert else None,
            next_concert_venue=next_concert.venue if next_concert else None,
        ))
    return results


@router.post("/follow", response_model=ArtistResponse)
def follow_artist(
    data: FollowRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if data.artist_id:
        artist = db.query(Artist).filter(Artist.id == data.artist_id).first()
        if not artist:
            raise HTTPException(status_code=404, detail="Artist not found")
    else:
        artist = db.query(Artist).filter(Artist.name == data.name).first()
        if not artist:
            artist = Artist(name=data.name, image_url=data.image_url, genres=data.genres)
            db.add(artist)
            db.commit()
            db.refresh(artist)

    existing = (
        db.query(UserArtist)
        .filter(UserArtist.user_id == current_user.id, UserArtist.artist_id == artist.id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already following this artist")

    ua = UserArtist(user_id=current_user.id, artist_id=artist.id)
    db.add(ua)
    db.commit()

    return ArtistResponse(
        id=artist.id,
        name=artist.name,
        image_url=artist.image_url,
        genres=artist.genres or [],
    )


@router.delete("/follow/{artist_id}")
def unfollow_artist(
    artist_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ua = (
        db.query(UserArtist)
        .filter(UserArtist.user_id == current_user.id, UserArtist.artist_id == artist_id)
        .first()
    )
    if not ua:
        raise HTTPException(status_code=404, detail="Not following this artist")
    db.delete(ua)
    db.commit()
    return {"detail": "Unfollowed"}


@router.put("/reorder")
def reorder_artists(
    data: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user_artist_map = {
        ua.artist_id: ua
        for ua in db.query(UserArtist).filter(UserArtist.user_id == current_user.id).all()
    }
    for position, artist_id in enumerate(data.artist_ids):
        if artist_id in user_artist_map:
            user_artist_map[artist_id].position = position
    db.commit()
    return {"success": True}

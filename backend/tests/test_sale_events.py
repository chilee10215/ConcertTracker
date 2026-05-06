"""
Tests for Tour and SaleEvent data models and routes.
TDD Red phase — these tests are written before the models exist.
"""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient


# ── Model / DB tests ──────────────────────────────────────────────────────────

def test_tour_can_be_created(db, sample_artist):
    from app.models.tour import Tour

    tour = Tour(
        artist_id=sample_artist.id,
        name="Summer Live 2026",
        description="Nationwide summer tour",
        year=2026,
    )
    db.add(tour)
    db.commit()
    db.refresh(tour)

    assert tour.id is not None
    assert tour.name == "Summer Live 2026"
    assert tour.artist_id == sample_artist.id


def test_sale_event_can_be_created(db, sample_artist):
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    tour = Tour(artist_id=sample_artist.id, name="Arena Tour 2026", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    event = SaleEvent(
        tour_id=tour.id,
        type="FC_LOTTERY",
        registration_start=now + timedelta(days=1),
        registration_end=now + timedelta(days=7),
        result_date=now + timedelta(days=14),
        platform="Eplus",
        link="https://eplus.jp/example",
        notes="FC membership required 30 days prior",
    )
    db.add(event)
    db.commit()
    db.refresh(event)

    assert event.id is not None
    assert event.type == "FC_LOTTERY"
    assert event.platform == "Eplus"
    assert event.tour_id == tour.id


def test_sale_event_types_are_valid(db, sample_artist):
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent, VALID_SALE_TYPES

    assert set(VALID_SALE_TYPES) == {"FC_LOTTERY", "GENERAL_LOTTERY", "GENERAL_SALE", "REMAINING"}

    tour = Tour(artist_id=sample_artist.id, name="Tour", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for sale_type in VALID_SALE_TYPES:
        event = SaleEvent(
            tour_id=tour.id,
            type=sale_type,
            registration_start=now + timedelta(days=1),
            registration_end=now + timedelta(days=7),
            platform="Pia",
        )
        db.add(event)
    db.commit()


def test_sale_event_platforms_are_valid(db, sample_artist):
    from app.models.sale_event import VALID_PLATFORMS

    assert set(VALID_PLATFORMS) == {"Eplus", "Pia", "Lawson", "Melon", "Interpark", "Other"}


def test_tour_has_sale_events_relationship(db, sample_artist):
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    tour = Tour(artist_id=sample_artist.id, name="Fan Meeting 2026", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    for i in range(3):
        event = SaleEvent(
            tour_id=tour.id,
            type="GENERAL_SALE",
            registration_start=now + timedelta(days=i),
            registration_end=now + timedelta(days=i + 5),
            platform="Lawson",
        )
        db.add(event)
    db.commit()
    db.refresh(tour)

    assert len(tour.sale_events) == 3


def test_artist_has_tours_relationship(db, sample_artist):
    from app.models.tour import Tour

    for i in range(2):
        tour = Tour(artist_id=sample_artist.id, name=f"Tour {i}", year=2026)
        db.add(tour)
    db.commit()
    db.refresh(sample_artist)

    assert len(sample_artist.tours) == 2


# ── API route tests ───────────────────────────────────────────────────────────

def test_get_tours_for_artist_returns_empty_list_when_no_tours(client, auth_headers, sample_artist):
    response = client.get(f"/api/tours/artist/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_get_tours_for_invalid_artist_returns_404(client, auth_headers):
    response = client.get(f"/api/tours/artist/99999", headers=auth_headers)
    assert response.status_code == 404


def test_get_tours_for_artist_returns_tours(client, db, auth_headers, sample_artist):
    from app.models.tour import Tour

    tour = Tour(artist_id=sample_artist.id, name="Dome Tour 2026", year=2026)
    db.add(tour)
    db.commit()

    response = client.get(f"/api/tours/artist/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Dome Tour 2026"
    assert data[0]["artist_id"] == sample_artist.id


def test_get_sale_events_for_tour(client, db, auth_headers, sample_artist):
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    tour = Tour(artist_id=sample_artist.id, name="Arena Tour 2026", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    event = SaleEvent(
        tour_id=tour.id,
        type="GENERAL_SALE",
        registration_start=now + timedelta(days=5),
        registration_end=now + timedelta(days=10),
        platform="Melon",
        link="https://melon.com/ticket",
        notes="",
    )
    db.add(event)
    db.commit()

    response = client.get(f"/api/tours/{tour.id}/sale-events", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "GENERAL_SALE"
    assert data[0]["platform"] == "Melon"


def test_get_sale_events_for_invalid_tour_returns_404(client, auth_headers):
    response = client.get(f"/api/tours/99999/sale-events", headers=auth_headers)
    assert response.status_code == 404


def test_get_upcoming_sale_events_for_followed_artists(client, db, auth_headers, test_user, sample_artist):
    from app.models.user import UserArtist
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    # User follows the artist
    follow = UserArtist(user_id=test_user.id, artist_id=sample_artist.id, position=0)
    db.add(follow)

    tour = Tour(artist_id=sample_artist.id, name="Spring Tour 2026", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    event = SaleEvent(
        tour_id=tour.id,
        type="FC_LOTTERY",
        registration_start=now + timedelta(days=3),
        registration_end=now + timedelta(days=8),
        platform="Eplus",
    )
    db.add(event)
    db.commit()

    response = client.get("/api/tours/upcoming-sales", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["type"] == "FC_LOTTERY"
    assert data[0]["artist_name"] == sample_artist.name


def test_get_upcoming_sales_filters_out_past_events(client, db, auth_headers, test_user, sample_artist):
    from app.models.user import UserArtist
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    follow = UserArtist(user_id=test_user.id, artist_id=sample_artist.id, position=0)
    db.add(follow)

    tour = Tour(artist_id=sample_artist.id, name="Old Tour", year=2025)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    # Past event (ended 5 days ago)
    past_event = SaleEvent(
        tour_id=tour.id,
        type="GENERAL_SALE",
        registration_start=now - timedelta(days=10),
        registration_end=now - timedelta(days=5),
        platform="Eplus",
    )
    # Future event (ends in 10 days)
    future_event = SaleEvent(
        tour_id=tour.id,
        type="FC_LOTTERY",
        registration_start=now + timedelta(days=3),
        registration_end=now + timedelta(days=10),
        platform="Pia",
    )
    db.add(past_event)
    db.add(future_event)
    db.commit()

    response = client.get("/api/tours/upcoming-sales", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    # Only future event should be returned
    assert len(data) == 1
    assert data[0]["type"] == "FC_LOTTERY"
    assert data[0]["platform"] == "Pia"


def test_get_upcoming_sales_supports_pagination(client, db, auth_headers, test_user, sample_artist):
    from app.models.user import UserArtist
    from app.models.tour import Tour
    from app.models.sale_event import SaleEvent

    follow = UserArtist(user_id=test_user.id, artist_id=sample_artist.id, position=0)
    db.add(follow)

    tour = Tour(artist_id=sample_artist.id, name="Tour", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    # Create 5 future events
    for i in range(5):
        event = SaleEvent(
            tour_id=tour.id,
            type="GENERAL_SALE",
            registration_start=now + timedelta(days=i),
            registration_end=now + timedelta(days=i + 5),
            platform="Eplus",
        )
        db.add(event)
    db.commit()

    # Get first 2 (skip=0, limit=2)
    response = client.get("/api/tours/upcoming-sales?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

    # Get next 2 (skip=2, limit=2)
    response = client.get("/api/tours/upcoming-sales?skip=2&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


# ── POST endpoint tests (admin creation) ───────────────────────────────────────

def test_create_tour_returns_201(client, auth_headers, sample_artist):
    response = client.post(
        "/api/tours",
        headers=auth_headers,
        json={
            "artist_id": sample_artist.id,
            "name": "New World Tour 2026",
            "description": "A worldwide concert tour",
            "year": 2026,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "New World Tour 2026"
    assert data["artist_id"] == sample_artist.id
    assert data["year"] == 2026
    assert "id" in data


def test_create_tour_with_invalid_artist_returns_404(client, auth_headers):
    response = client.post(
        "/api/tours",
        headers=auth_headers,
        json={
            "artist_id": 99999,
            "name": "Ghost Tour",
            "year": 2026,
        },
    )
    assert response.status_code == 404
    assert "Artist not found" in response.json()["detail"]


def test_create_sale_event_returns_201(client, db, auth_headers, sample_artist):
    from app.models.tour import Tour

    tour = Tour(artist_id=sample_artist.id, name="Test Tour", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    response = client.post(
        "/api/tours/sale-events",
        headers=auth_headers,
        json={
            "tour_id": tour.id,
            "type": "FC_LOTTERY",
            "registration_start": (now + timedelta(days=1)).isoformat(),
            "registration_end": (now + timedelta(days=7)).isoformat(),
            "result_date": (now + timedelta(days=14)).isoformat(),
            "platform": "Eplus",
            "link": "https://eplus.jp/example",
            "notes": "FC membership required",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["type"] == "FC_LOTTERY"
    assert data["platform"] == "Eplus"
    assert data["tour_id"] == tour.id
    assert "id" in data


def test_create_sale_event_with_invalid_tour_returns_404(client, auth_headers):
    response = client.post(
        "/api/tours/sale-events",
        headers=auth_headers,
        json={
            "tour_id": 99999,
            "type": "GENERAL_SALE",
            "registration_start": "2026-05-10T00:00:00",
            "registration_end": "2026-05-15T00:00:00",
            "platform": "Pia",
        },
    )
    assert response.status_code == 404
    assert "Tour not found" in response.json()["detail"]


# ── Authorization tests ───────────────────────────────────────────────────────

def test_create_tour_requires_admin_role(client, db, sample_artist):
    from app.models.user import User, UserRole
    from app.services.auth_service import hash_password, create_access_token

    # Create non-admin user
    user = User(
        email="user@example.com",
        password_hash=hash_password("password"),
        role=UserRole.USER.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    response = client.post(
        "/api/tours",
        headers=headers,
        json={
            "artist_id": sample_artist.id,
            "name": "Test Tour",
            "year": 2026,
        },
    )
    assert response.status_code == 403
    assert "Admin access required" in response.json()["detail"]


def test_create_sale_event_requires_admin_role(client, db, sample_artist):
    from app.models.user import User, UserRole
    from app.models.tour import Tour
    from app.services.auth_service import hash_password, create_access_token

    # Create tour
    tour = Tour(artist_id=sample_artist.id, name="Test Tour", year=2026)
    db.add(tour)
    db.commit()
    db.refresh(tour)

    # Create non-admin user
    user = User(
        email="user@example.com",
        password_hash=hash_password("password"),
        role=UserRole.USER.value,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    headers = {"Authorization": f"Bearer {token}"}

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    response = client.post(
        "/api/tours/sale-events",
        headers=headers,
        json={
            "tour_id": tour.id,
            "type": "GENERAL_SALE",
            "registration_start": (now + timedelta(days=1)).isoformat(),
            "registration_end": (now + timedelta(days=7)).isoformat(),
            "platform": "Eplus",
        },
    )
    assert response.status_code == 403
    assert "Admin access required" in response.json()["detail"]


def test_get_all_tours_returns_all_tours(client, db, auth_headers, sample_artist):
    from app.models.tour import Tour

    # Create multiple tours
    for i in range(3):
        tour = Tour(artist_id=sample_artist.id, name=f"Tour {i}", year=2026)
        db.add(tour)
    db.commit()

    response = client.get("/api/tours", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3

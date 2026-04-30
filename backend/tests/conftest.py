import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta

from app.main import app
from app.database import Base
from app.dependencies import get_db
from app.models.user import User
from app.models.artist import Artist
from app.models.concert import Concert
from app.services.auth_service import hash_password, create_access_token

SQLALCHEMY_TEST_URL = "sqlite:///./test_concert_tracker.db"

test_engine = create_engine(
    SQLALCHEMY_TEST_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_and_teardown_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def test_user(db):
    user = User(
        email="test@example.com",
        password_hash=hash_password("password123"),
        username="testuser",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@pytest.fixture
def auth_token(test_user):
    return create_access_token(test_user.id)


@pytest.fixture
def auth_headers(auth_token):
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture
def sample_artist(db):
    artist = Artist(
        name="Test Artist",
        image_url="https://example.com/image.jpg",
        genres=["Pop", "Rock"],
    )
    db.add(artist)
    db.commit()
    db.refresh(artist)
    return artist


@pytest.fixture
def sample_concert(db, sample_artist):
    concert = Concert(
        artist_id=sample_artist.id,
        title="Test Concert",
        date=datetime.utcnow() + timedelta(days=30),
        location="Tokyo, Japan",
        venue="Tokyo Dome",
        price_range="$100-$300",
        platform="Ticketmaster",
        organizer="Live Nation",
        official_link="https://example.com/concert",
        status="upcoming",
    )
    db.add(concert)
    db.commit()
    db.refresh(concert)
    return concert

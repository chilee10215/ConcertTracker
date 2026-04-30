from unittest.mock import patch, AsyncMock
from app.models.artist import Artist


def test_search_artists_returns_results(client, auth_headers):
    with patch("app.routers.artists.search_artists", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = [
            {"name": "Taylor Swift", "image_url": "https://example.com/ts.jpg", "genres": ["Pop"], "source": "mock"}
        ]
        response = client.get("/api/artists/search?q=Taylor", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Taylor Swift"


def test_search_artists_returns_empty_for_no_match(client, auth_headers):
    with patch("app.routers.artists.search_artists", new_callable=AsyncMock) as mock_search:
        mock_search.return_value = []
        response = client.get("/api/artists/search?q=xyzzzz", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_search_artists_requires_auth(client):
    response = client.get("/api/artists/search?q=Taylor")
    assert response.status_code == 403


def test_get_followed_artists_empty(client, auth_headers):
    response = client.get("/api/artists/followed", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_follow_new_artist_creates_and_returns_artist(client, auth_headers):
    response = client.post("/api/artists/follow", json={
        "name": "New Artist",
        "image_url": "https://example.com/image.jpg",
        "genres": ["Rock"],
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Artist"
    assert data["genres"] == ["Rock"]


def test_follow_artist_by_existing_id(client, auth_headers, sample_artist):
    response = client.post("/api/artists/follow", json={
        "artist_id": sample_artist.id,
        "name": sample_artist.name,
        "image_url": sample_artist.image_url,
        "genres": sample_artist.genres,
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == sample_artist.id


def test_follow_same_artist_twice_returns_400(client, auth_headers, sample_artist):
    payload = {
        "artist_id": sample_artist.id,
        "name": sample_artist.name,
        "image_url": sample_artist.image_url,
        "genres": sample_artist.genres,
    }
    client.post("/api/artists/follow", json=payload, headers=auth_headers)
    response = client.post("/api/artists/follow", json=payload, headers=auth_headers)
    assert response.status_code == 400
    assert "Already following" in response.json()["detail"]


def test_get_followed_artists_returns_followed(client, auth_headers, sample_artist):
    client.post("/api/artists/follow", json={
        "artist_id": sample_artist.id,
        "name": sample_artist.name,
        "image_url": sample_artist.image_url,
        "genres": sample_artist.genres,
    }, headers=auth_headers)
    response = client.get("/api/artists/followed", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Test Artist"


def test_unfollow_artist_success(client, auth_headers, sample_artist):
    client.post("/api/artists/follow", json={
        "artist_id": sample_artist.id,
        "name": sample_artist.name,
        "image_url": sample_artist.image_url,
        "genres": sample_artist.genres,
    }, headers=auth_headers)
    response = client.delete(f"/api/artists/follow/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["detail"] == "Unfollowed"


def test_unfollow_non_followed_artist_returns_404(client, auth_headers, sample_artist):
    response = client.delete(f"/api/artists/follow/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 404


def test_reorder_artists_success(client, auth_headers, db):
    artist1 = Artist(name="Artist 1", image_url="", genres=[])
    artist2 = Artist(name="Artist 2", image_url="", genres=[])
    db.add_all([artist1, artist2])
    db.commit()
    db.refresh(artist1)
    db.refresh(artist2)

    client.post("/api/artists/follow", json={"artist_id": artist1.id, "name": artist1.name, "image_url": "", "genres": []}, headers=auth_headers)
    client.post("/api/artists/follow", json={"artist_id": artist2.id, "name": artist2.name, "image_url": "", "genres": []}, headers=auth_headers)

    response = client.put("/api/artists/reorder", json={"artist_ids": [artist2.id, artist1.id]}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["success"] is True


def test_reorder_artists_wrong_ids_returns_400(client, auth_headers, sample_artist):
    client.post("/api/artists/follow", json={
        "artist_id": sample_artist.id,
        "name": sample_artist.name,
        "image_url": sample_artist.image_url,
        "genres": sample_artist.genres,
    }, headers=auth_headers)
    response = client.put("/api/artists/reorder", json={"artist_ids": [9999]}, headers=auth_headers)
    assert response.status_code == 400

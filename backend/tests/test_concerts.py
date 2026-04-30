def test_get_concerts_by_artist_empty(client, auth_headers, sample_artist):
    response = client.get(f"/api/concerts/artist/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_get_concerts_by_artist_with_data(client, auth_headers, sample_concert, sample_artist):
    response = client.get(f"/api/concerts/artist/{sample_artist.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Concert"
    assert data[0]["artist_name"] == "Test Artist"
    assert data[0]["is_wishlisted"] is False


def test_get_concerts_by_artist_with_platform_filter_match(client, auth_headers, sample_concert, sample_artist):
    response = client.get(f"/api/concerts/artist/{sample_artist.id}?platform=Ticketmaster", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_get_concerts_by_artist_with_platform_filter_no_match(client, auth_headers, sample_concert, sample_artist):
    response = client.get(f"/api/concerts/artist/{sample_artist.id}?platform=Peatix", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_get_concert_by_id(client, auth_headers, sample_concert):
    response = client.get(f"/api/concerts/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == sample_concert.id
    assert data["title"] == "Test Concert"
    assert data["is_wishlisted"] is False


def test_get_concert_not_found_returns_404(client, auth_headers):
    response = client.get("/api/concerts/9999", headers=auth_headers)
    assert response.status_code == 404
    assert "Concert not found" in response.json()["detail"]


def test_get_concert_shows_wishlisted_true_after_adding(client, auth_headers, sample_concert):
    client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    response = client.get(f"/api/concerts/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["is_wishlisted"] is True


def test_get_concerts_requires_auth(client, sample_artist):
    response = client.get(f"/api/concerts/artist/{sample_artist.id}")
    assert response.status_code == 403

def test_get_wishlist_empty(client, auth_headers):
    response = client.get("/api/wishlist", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_add_concert_to_wishlist(client, auth_headers, sample_concert):
    response = client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["detail"] == "Added to wishlist"


def test_add_same_concert_twice_returns_400(client, auth_headers, sample_concert):
    client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    response = client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 400
    assert "Already in wishlist" in response.json()["detail"]


def test_add_nonexistent_concert_returns_404(client, auth_headers):
    response = client.post("/api/wishlist/9999", headers=auth_headers)
    assert response.status_code == 404
    assert "Concert not found" in response.json()["detail"]


def test_get_wishlist_returns_added_items(client, auth_headers, sample_concert):
    client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    response = client.get("/api/wishlist", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["concert"]["title"] == "Test Concert"
    assert data[0]["concert"]["is_wishlisted"] is True


def test_remove_concert_from_wishlist(client, auth_headers, sample_concert):
    client.post(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    response = client.delete(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["detail"] == "Removed from wishlist"

    get_response = client.get("/api/wishlist", headers=auth_headers)
    assert get_response.json() == []


def test_remove_non_wishlisted_returns_404(client, auth_headers, sample_concert):
    response = client.delete(f"/api/wishlist/{sample_concert.id}", headers=auth_headers)
    assert response.status_code == 404
    assert "Not in wishlist" in response.json()["detail"]


def test_wishlist_requires_auth(client):
    response = client.get("/api/wishlist")
    assert response.status_code == 403

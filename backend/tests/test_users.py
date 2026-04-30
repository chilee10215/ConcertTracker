import io


def test_get_profile_returns_current_user(client, test_user, auth_headers):
    response = client.get("/api/users/profile", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_get_profile_requires_auth(client):
    response = client.get("/api/users/profile")
    assert response.status_code == 403


def test_update_profile_username_success(client, test_user, auth_headers):
    response = client.put("/api/users/profile", data={"username": "newusername"}, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "newusername"


def test_update_profile_username_too_short_returns_400(client, test_user, auth_headers):
    response = client.put("/api/users/profile", data={"username": "a"}, headers=auth_headers)
    assert response.status_code == 400
    assert "at least 2 characters" in response.json()["detail"]


def test_update_profile_username_too_long_returns_400(client, test_user, auth_headers):
    response = client.put("/api/users/profile", data={"username": "a" * 31}, headers=auth_headers)
    assert response.status_code == 400
    assert "30 characters or fewer" in response.json()["detail"]


def test_update_profile_avatar_invalid_mime_type_returns_400(client, test_user, auth_headers):
    response = client.put(
        "/api/users/profile",
        files={"avatar": ("test.txt", io.BytesIO(b"not an image"), "text/plain")},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert "JPEG, PNG, GIF, and WebP" in response.json()["detail"]


def test_update_profile_avatar_no_filename_returns_error(client, test_user, auth_headers):
    # An empty filename is rejected by FastAPI's multipart parser (422) before
    # reaching our custom validation — both 400 and 422 are correct error responses.
    jpeg_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    response = client.put(
        "/api/users/profile",
        files={"avatar": ("", io.BytesIO(jpeg_bytes), "image/jpeg")},
        headers=auth_headers,
    )
    assert response.status_code in (400, 422)


def test_update_profile_avatar_too_large_returns_400(client, test_user, auth_headers):
    large_file = b"\xff\xd8\xff\xe0" + b"\x00" * (6 * 1024 * 1024)
    response = client.put(
        "/api/users/profile",
        files={"avatar": ("large.jpg", io.BytesIO(large_file), "image/jpeg")},
        headers=auth_headers,
    )
    assert response.status_code == 400
    assert "5 MB" in response.json()["detail"]


def test_update_profile_avatar_valid_jpeg_success(client, test_user, auth_headers):
    jpeg_bytes = b"\xff\xd8\xff\xe0" + b"\x00" * 100
    response = client.put(
        "/api/users/profile",
        files={"avatar": ("avatar.jpg", io.BytesIO(jpeg_bytes), "image/jpeg")},
        headers=auth_headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["avatar_url"] is not None
    assert data["avatar_url"].startswith("/uploads/avatars/")

def test_signup_success(client):
    response = client.post("/api/auth/signup", json={
        "email": "newuser@example.com",
        "password": "securepassword",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_signup_duplicate_email_returns_400(client, test_user):
    response = client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "password": "securepassword",
    })
    assert response.status_code == 400
    assert "already registered" in response.json()["detail"]


def test_signup_invalid_email_returns_422(client):
    response = client.post("/api/auth/signup", json={
        "email": "not-an-email",
        "password": "securepassword",
    })
    assert response.status_code == 422


def test_login_success(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "password123",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password_returns_401(client, test_user):
    response = client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword",
    })
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_email_returns_401(client):
    response = client.post("/api/auth/login", json={
        "email": "nobody@example.com",
        "password": "password123",
    })
    assert response.status_code == 401


def test_get_me_success(client, test_user, auth_headers):
    response = client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_get_me_invalid_token_returns_401(client):
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert response.status_code == 401


def test_get_me_no_token_returns_403(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 403

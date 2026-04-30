from datetime import datetime, timedelta

from jose import jwt

from app.services.auth_service import (
    hash_password,
    verify_password,
    create_access_token,
    decode_access_token,
)
from app.config import settings


def test_hash_password_creates_valid_hash():
    hashed = hash_password("mypassword")
    assert hashed != "mypassword"
    assert len(hashed) > 20


def test_hash_password_produces_different_hashes_each_time():
    hash1 = hash_password("mypassword")
    hash2 = hash_password("mypassword")
    assert hash1 != hash2  # bcrypt uses random salt


def test_verify_password_returns_true_for_correct_password():
    hashed = hash_password("mypassword")
    assert verify_password("mypassword", hashed) is True


def test_verify_password_returns_false_for_wrong_password():
    hashed = hash_password("mypassword")
    assert verify_password("wrongpassword", hashed) is False


def test_verify_password_returns_false_for_empty_password():
    hashed = hash_password("mypassword")
    assert verify_password("", hashed) is False


def test_create_access_token_returns_string():
    token = create_access_token(1)
    assert isinstance(token, str)
    assert len(token) > 0


def test_create_access_token_encodes_user_id():
    token = create_access_token(42)
    payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
    assert payload["sub"] == "42"


def test_decode_access_token_returns_user_id_for_valid_token():
    token = create_access_token(7)
    user_id = decode_access_token(token)
    assert user_id == 7


def test_decode_access_token_returns_none_for_invalid_token():
    result = decode_access_token("this.is.invalid")
    assert result is None


def test_decode_access_token_returns_none_for_expired_token():
    expire = datetime.utcnow() - timedelta(minutes=1)
    payload = {"sub": "1", "exp": expire}
    expired_token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    assert decode_access_token(expired_token) is None


def test_decode_access_token_returns_none_for_wrong_secret():
    payload = {"sub": "1", "exp": datetime.utcnow() + timedelta(minutes=30)}
    token = jwt.encode(payload, "wrong-secret", algorithm="HS256")
    assert decode_access_token(token) is None

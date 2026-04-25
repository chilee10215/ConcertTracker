import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse, ProfileUpdate

router = APIRouter()

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "avatars")
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def _ensure_upload_dir():
    os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/profile", response_model=UserResponse)
async def update_profile(
    username: Optional[str] = Form(None),
    avatar: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if username is not None:
        username = username.strip()
        if len(username) < 2:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username must be at least 2 characters")
        if len(username) > 30:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Username must be 30 characters or fewer")
        current_user.username = username

    if avatar is not None:
        if avatar.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, GIF, and WebP images are allowed")

        contents = await avatar.read()
        if len(contents) > MAX_SIZE_BYTES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Avatar must be smaller than 5 MB")

        _ensure_upload_dir()
        ext = avatar.filename.rsplit(".", 1)[-1].lower() if "." in avatar.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        with open(filepath, "wb") as f:
            f.write(contents)

        # Remove old avatar file if it was locally stored
        if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
            old_filename = current_user.avatar_url.split("/")[-1]
            old_path = os.path.join(UPLOAD_DIR, old_filename)
            if os.path.exists(old_path):
                os.remove(old_path)

        current_user.avatar_url = f"/uploads/avatars/{filename}"

    db.commit()
    db.refresh(current_user)
    return current_user

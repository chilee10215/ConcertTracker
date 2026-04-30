import os
import uuid
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserResponse
from app.config import UPLOAD_AVATARS_DIR, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE_BYTES, IMAGE_MAGIC_BYTES

router = APIRouter()


def _ensure_upload_dir():
    os.makedirs(UPLOAD_AVATARS_DIR, exist_ok=True)


def _validate_image_magic_bytes(data: bytes) -> bool:
    """Validate that uploaded file is actually an image by checking magic bytes."""
    for magic_bytes in IMAGE_MAGIC_BYTES.keys():
        if data.startswith(magic_bytes):
            return True
    return False


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
        # Validate content type header
        if avatar.content_type not in ALLOWED_IMAGE_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG, GIF, and WebP images are allowed")

        # Validate filename exists
        if not avatar.filename:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload must include a filename")

        _ensure_upload_dir()

        # Generate safe filename
        ext = avatar.filename.rsplit(".", 1)[-1].lower() if "." in avatar.filename else "jpg"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOAD_AVATARS_DIR, filename)

        # Stream file to disk with size validation
        file_size = 0
        with open(filepath, "wb") as f:
            while True:
                chunk = await avatar.read(8192)  # 8KB chunks
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_AVATAR_SIZE_BYTES:
                    os.remove(filepath)  # Clean up partial file
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Avatar must be smaller than 5 MB")
                f.write(chunk)

        # Validate magic bytes (actual file content)
        with open(filepath, "rb") as f:
            header = f.read(12)
        if not _validate_image_magic_bytes(header):
            os.remove(filepath)
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is not a valid image")

        # Remove old avatar file if it was locally stored
        if current_user.avatar_url and current_user.avatar_url.startswith("/uploads/avatars/"):
            old_filename = os.path.basename(current_user.avatar_url)
            old_path = os.path.join(UPLOAD_AVATARS_DIR, old_filename)
            try:
                if os.path.exists(old_path):
                    os.remove(old_path)
            except OSError:
                pass  # Ignore errors removing old file

        current_user.avatar_url = f"/uploads/avatars/{filename}"

    db.commit()
    db.refresh(current_user)
    return current_user

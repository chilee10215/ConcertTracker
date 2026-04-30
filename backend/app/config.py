import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings"""
    DATABASE_URL: str = "sqlite:///./concert_tracker.db"
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Upload configuration
UPLOAD_BASE_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")
UPLOAD_AVATARS_DIR = os.path.join(UPLOAD_BASE_DIR, "avatars")

# File validation
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB

# Magic bytes for image validation (simple check)
IMAGE_MAGIC_BYTES = {
    b"\xff\xd8\xff": "jpeg",
    b"\x89PNG": "png",
    b"GIF8": "gif",
    b"RIFF": "webp",  # RIFF is the WebP container format
}

# Create settings instance
settings = Settings()

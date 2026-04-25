import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import engine, Base
from app.routers import auth, artists, concerts, wishlist, users

UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "..", "uploads")


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    os.makedirs(os.path.join(UPLOAD_DIR, "avatars"), exist_ok=True)
    yield


app = FastAPI(title="Concert Tracking API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files (avatars, etc.)
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(artists.router, prefix="/api/artists", tags=["artists"])
app.include_router(concerts.router, prefix="/api/concerts", tags=["concerts"])
app.include_router(wishlist.router, prefix="/api/wishlist", tags=["wishlist"])
app.include_router(users.router, prefix="/api/users", tags=["users"])


@app.get("/api/health")
def health_check():
    return {"status": "ok"}

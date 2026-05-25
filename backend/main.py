"""
Harmony Music Player - Backend API
FastAPI + SQLAlchemy + SQLite + Real File Storage
"""

from datetime import datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import MUSIC_DIR, DATABASE_PATH, ADMIN_USERNAME, ADMIN_PASSWORD
from models import User, init_tables, SessionLocal
from services import hash_password, verify_password, scan_music_directory
from routes import auth_router, music_router, playlists_router, requests_router, admin_router, history_router, ratings_router


def init_database():
    """Initialize database and admin account"""
    init_tables()
    
    db = SessionLocal()
    try:
        # Check/create admin from config
        admin = db.query(User).filter(User.username == ADMIN_USERNAME).first()
        if not admin:
            admin = User(
                id="admin-001",
                username=ADMIN_USERNAME,
                password_hash=hash_password(ADMIN_PASSWORD),
                role="admin"
            )
            db.add(admin)
            db.commit()
            print(f"✅ Created admin account: {ADMIN_USERNAME}")
        else:
            # Update admin password if changed in config
            if not verify_password(ADMIN_PASSWORD, admin.password_hash):
                admin.password_hash = hash_password(ADMIN_PASSWORD)
                db.commit()
                print(f"✅ Updated admin password")
        
        # Scan music directory
        scan_music_directory(db)
        
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifecycle handler"""
    print("🎵 Harmony Music Player starting...")
    print(f"📁 Music directory: {MUSIC_DIR}")
    print(f"💾 Database: {DATABASE_PATH}")
    init_database()
    yield
    print("👋 Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Harmony Music Player",
    version="2.3.0",
    description="A modern music player API with user management, playlists, play history, and track ratings",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(music_router)
app.include_router(playlists_router)
app.include_router(requests_router)
app.include_router(admin_router)
app.include_router(history_router)
app.include_router(ratings_router)


# Health check endpoints
@app.get("/api/ping")
async def ping():
    """Health check"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/stats")
async def public_stats():
    """Public stats endpoint"""
    from models import Track, Playlist
    
    db = SessionLocal()
    try:
        return {
            "total_tracks": db.query(Track).count(),
            "total_playlists": db.query(Playlist).count(),
        }
    finally:
        db.close()


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

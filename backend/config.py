"""
Configuration settings for Harmony Music Player
"""
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
MUSIC_DIR = BASE_DIR / "Music"
DATABASE_PATH = BASE_DIR / "harmony.db"

# Security
SECRET_KEY = os.getenv("SECRET_KEY", "harmony-music-secret-key-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Admin credentials
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "admin123")

# Allowed audio formats
ALLOWED_AUDIO_EXTENSIONS = {".mp3", ".flac", ".wav", ".m4a", ".ogg", ".aac", ".wma"}

# Ensure music directory exists
MUSIC_DIR.mkdir(parents=True, exist_ok=True)

# Database URL
DATABASE_URL = f"sqlite:///{DATABASE_PATH}"

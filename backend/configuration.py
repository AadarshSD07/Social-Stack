from dotenv import load_dotenv
from pathlib import Path
from rest_framework import status
import os

# Load .env file (only works locally - Render ignores it)
load_dotenv()  # Looks for .env in project root (same folder as manage.py)

class Config:
    """HTTP status code configuration"""
    success = status.HTTP_200_OK
    no_content = status.HTTP_204_NO_CONTENT
    unauthorized = status.HTTP_401_UNAUTHORIZED
    accepted = status.HTTP_202_ACCEPTED
    forbidden = status.HTTP_403_FORBIDDEN
    bad_request = status.HTTP_400_BAD_REQUEST
    created = status.HTTP_201_CREATED
    not_found = status.HTTP_404_NOT_FOUND

    """Project Configurations"""
    ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS").split(",")
    ALLOWED_HOSTS = [o.strip() for o in ALLOWED_HOSTS if o.strip()]
    BASE_DIR = Path(__file__).resolve().parent
    CORS_ALLOWED_ORIGINS = os.getenv("CORS_ALLOWED_ORIGINS", "").split(",")
    CORS_ALLOWED_ORIGINS = [o.strip() for o in CORS_ALLOWED_ORIGINS if o.strip()]
    DEBUG_MODE = os.getenv('DEBUG', 'False') == 'True'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
    STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
    STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

    """Project Variables"""
    posts_per_page = os.getenv('POSTS_PER_PAGE', '50')
    default_image = f"{os.getenv("VITE_BACKEND_DOMAIN")}/static/user_profile_images/default-user-image.png"

    """Postgres Configuration"""
    postgres_db = os.getenv("POSTGRES_DB")
    postgres_user = os.getenv("POSTGRES_USER", "social_stack")
    postgres_password = os.getenv("POSTGRES_PASSWORD")
    postgres_host = os.getenv("POSTGRES_HOST")
    postgres_port = os.getenv("POSTGRES_PORT", 5432)

    """Cloudinary Configuration"""
    cloudinary_url = os.getenv('CLOUDINARY_URL')
    cloud_name = os.getenv('CLOUD_NAME')
    api_key = os.getenv('API_KEY')
    api_secret = os.getenv('API_SECRET')
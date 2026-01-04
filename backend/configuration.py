from dotenv import load_dotenv
from rest_framework import status
import os

load_dotenv()  # Load variables from .env

class Config:
    success = status.HTTP_200_OK
    no_content = status.HTTP_204_NO_CONTENT
    unauthorized = status.HTTP_401_UNAUTHORIZED
    accepted = status.HTTP_202_ACCEPTED
    forbidden = status.HTTP_403_FORBIDDEN
    bad_request = status.HTTP_400_BAD_REQUEST

    database_url = os.getenv('DATABASE_URL')
    api_key = os.getenv('API_KEY')
    debug_mode = os.getenv('DEBUG', 'False') == 'True'
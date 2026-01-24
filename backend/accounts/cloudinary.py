import cloudinary
import cloudinary.uploader
from configuration import Config
from rest_framework.exceptions import ValidationError

def upload_image(image, folder):
    # Configuration
    if not image:
        return ValidationError("Image is not provided to store")
    elif not folder:
        return ValidationError("Folder name is not provided to store image!")

    cloudinary.config( 
        cloud_name = Config.cloud_name,
        api_key = Config.api_key,
        api_secret = Config.api_secret,
        secure=True
    )
    upload_result = cloudinary.uploader.upload(
        image,
        folder=folder,
        resource_type="auto"
    )
    return {
        "cloudinary_url": upload_result["secure_url"],
        "public_id": upload_result["public_id"]
    }

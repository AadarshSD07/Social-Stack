from accounts.cloudinary import upload_image
from configuration import Config
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ObjectDoesNotExist
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class UserRegistrationSerializer(serializers.Serializer):
    """
    Serializer for handling new user registrations.
    
    Validates unique credentials, ensures password strength, and 
    handles the secure creation of User instances.
    """
    username = serializers.CharField(
        required=True,
        max_length=150,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that username already exists.")]
    )
    password = serializers.CharField(
        required=True,
        write_only=True,
        min_length=8,
        style={'input_type': 'password'},
        help_text="Password must be at least 8 characters long."
    )
    first_name = serializers.CharField(required=True, max_length=30)
    last_name = serializers.CharField(required=True, max_length=150)
    email = serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all(), message="A user with that email already exists.")]
    )

    def create(self, validated_data):
        """
        Creates and returns a new User instance.
        
        Args:
            validated_data (dict): Data passed from the view after validation.
            
        Returns:
            User: The newly created user instance.
        """
        # We use User.objects.create_user because it handles password hashing 
        # automatically and is the standard practice in Django.
        if User.objects.filter(username=validated_data["username"]).exists():
            raise serializers.ValidationError({
                "username": "A user with that username already exists."
            })

        # Check if email already exists
        if User.objects.filter(email=validated_data["email"]).exists():
            raise serializers.ValidationError({
                "email": "A user with that email already exists."
            })

        # Hash the password
        password = validated_data.pop("password")
        hashed_password = make_password(password)

        # Create user with hashed password
        user = User.objects.create(
            **validated_data,
            password=hashed_password
        )
        return user

class ProfileInformationSerializer(serializers.Serializer):
    """
    Serializer for user profile information including username, name, email, and profile image.

    This serializer handles both retrieval and updates of user profile data,
    with special handling for the profile image stored in a related User model.
    """
    username=serializers.CharField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.CharField(required=True, allow_blank=True)
    imageUrl = serializers.ImageField(allow_null=True)

    def get(self, user_instance=None):
        """
        Retrieve user profile information.

        Args:
            user_instance: Django User model instance

        Returns:
            dict: Dictionary containing user profile data with keys matching serializer fields

        Raises:
            ValueError: If user_instance is None
        """
        if user_instance is None:
            raise ValueError("User instance is required")

        data = {}
        serializer_fields = self.get_fields()

        for field_name, field_instance in serializer_fields.items():
            # Handle regular fields that exist on user_instance
            if hasattr(user_instance, field_name):
                value = getattr(user_instance, field_name)

                # Convert value using field's representation if available
                if hasattr(field_instance, 'to_representation'):
                    value = field_instance.to_representation(value)

            # Handle special case for imageUrl
            elif field_name == 'imageUrl':
                default_image = ""
                try:
                    # Get the profile image if exists
                    if user_instance.profile_image:
                        value = user_instance.profile_image
                    else:
                        value = default_image
                except (AttributeError, ObjectDoesNotExist) as e:
                    logger.warning(f"Error fetching profile image for user {user_instance.id}: {e}")
                    value = default_image

            # Handle other non-existent fields
            else:
                logger.warning(f"Field '{field_name}' does not exist on User model")
                value = None

            data[field_name] = value

        return data

    def post(self, user_instance, post_data):
        """
        Update user profile information.

        Args:
            user_instance: Django User model instance to update
            post_data (dict): Dictionary containing fields to update

        Returns:
            tuple: (success: bool, message: str or None)
                   Returns (True, None) on success
                   Returns (False, error_message) on failure

        Raises:
            ValueError: If user_instance is None or post_data is empty
        """
        if user_instance is None:
            raise ValueError("User instance is required")

        if not post_data:
            raise ValueError("Data is required to update user details")

        serializer_fields = self.get_fields()
        updated_fields = []
        errors = []

        for field_name, field_instance in serializer_fields.items():
            # Skip if field not in post_data
            if field_name not in post_data:
                continue

            value = post_data[field_name]

            # Skip empty values except for allow_blank fields
            if value in [None, ''] and not getattr(field_instance, 'allow_blank', False):
                continue

            # Handle special fields
            if field_name == 'imageUrl':
                try:
                    cloud_image_info = upload_image(value, "user_profile_images")
                    cloudinary_url = cloud_image_info["cloudinary_url"]
                    user_instance.profile_image = cloudinary_url
                    user_instance.save()
                    updated_fields.append(field_name)
                except Exception as e:
                    error_msg = f"Error updating image: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)
                continue

            # Handle regular fields
            if hasattr(user_instance, field_name):
                try:
                    # Skip if value hasn't changed
                    current_value = getattr(user_instance, field_name)
                    if current_value == value:
                        continue

                    setattr(user_instance, field_name, value)
                    updated_fields.append(field_name)

                except Exception as e:
                    error_msg = f"Error setting field {field_name}: {str(e)}"
                    logger.error(error_msg)
                    errors.append(error_msg)

        # Save the user instance only once with all changes
        if updated_fields:
            try:
                user_instance.save()
                logger.info(f"Successfully updated fields for user {user_instance.id}: {updated_fields}")
            except Exception as e:
                error_msg = f"Error saving user instance: {str(e)}"
                logger.error(error_msg)
                return False, error_msg

        # Return results
        if errors:
            return False, "; ".join(errors)

        if not updated_fields:
            return True, "No fields were updated"

        return True, None

class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for authenticated password change requests.
    
    Validates the relationship between the old password, the new password,
    and a confirmation field.
    """
    old_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    new_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )
    confirm_password = serializers.CharField(
        required=True, 
        write_only=True,
        style={'input_type': 'password'}
    )

    def validate(self, attrs):
        """
        Perform cross-field validation for password logic.
        
        Checks:
        1. New password matches confirmation.
        2. New password is not the same as the old password.
        3. New password meets Django's security requirements.
        """
        # Ensure the two new password entries match
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "New passwords do not match."
            })
        
        # Prevent the user from 'changing' their password to the current one
        if attrs['old_password'] == attrs['new_password']:
            raise serializers.ValidationError({
                "new_password": "The new password cannot be the same as the old password."
            })

        # Run Django's built-in password validators (length, common patterns, etc.)
        validate_password(attrs['new_password'])
        
        return attrs
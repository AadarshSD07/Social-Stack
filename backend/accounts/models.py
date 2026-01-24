from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.
class Role(models.Model):
    """
    Model representing a user role with name and description.
    
    Used for role-based access control and user permission management.
    Each role has a unique name and optional descriptive text.
    
    Fields:
        name (CharField): Unique role identifier (max 100 chars)
        description (TextField): Detailed role explanation/purpose
        
    Usage:
        Role.objects.create(name="admin", description="System administrator")
        Role.objects.get(name="moderator")
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    class Meta:
        """Model metadata for ordering and verbose names."""
        verbose_name = "Role"
        verbose_name_plural = "Roles"
        ordering = ['name']

    def __str__(self):
        """String representation returns the role name."""
        return self.name


class User(AbstractUser):
    """
    Custom User model extending Django's AbstractUser with profile image and role.
    
    Provides additional user profile functionality while retaining all standard
    Django authentication features (username, email, groups, permissions, etc.).
    
    **IMPORTANT**: Set AUTH_USER_MODEL = 'yourapp.User' in settings.py before migrations.
    
    Fields:
        profile_image (ImageField): User profile picture with default avatar
        role (ForeignKey): Single role assignment from Role model (required)
        
    Usage:
        user = User.objects.create_user(username='john', email='john@example.com')
        user.profile_image = 'path/to/image.jpg'
        user.role = Role.objects.get(name='member')
        user.save()
    """
    profile_image = models.URLField(blank=True, null=True)
    role = models.ForeignKey(
        Role, 
        on_delete=models.PROTECT,  # Changed from CASCADE to prevent role deletion
        default=2,
        null=True,
        blank=True
    )

    class Meta:
        """Model metadata for admin interface and database."""
        verbose_name = "User"
        verbose_name_plural = "Users"
        ordering = ['username']

    def __str__(self):
        """String representation shows username and role."""
        return f"{self.username} ({self.role.name})"

    def get_user_role(self):
        """
        Get the user's role name as a string.
        
        Returns:
            str: Role name (e.g., 'admin', 'moderator', 'user')
        """
        return self.role.name

    @property
    def is_admin(self):
        return self.role.name == "admin"
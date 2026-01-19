from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.
class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.name}"


class User(AbstractUser):
    profile_image = models.ImageField(
        upload_to="user_profile_images", 
        default="user_profile_images/default-user-image.png"
    )
    role = models.ForeignKey(Role, on_delete=models.CASCADE, default=2)

    def get_user_role(self):
        return self.role.name

@receiver(post_save, sender=User)
def user_role_creation(sender, instance, created, **kwargs):
    roles = Role.objects.filter()
    if not roles.exists():
        roles.create(name="admin", description="Permission for everything in this project. Creator, Destroyer, Owner of the project.")
        roles.create(name="user", description="permission for selected pages and functionality of the project. Can only experience the project based on creation of admin.")

    if created:
        instance.role = roles.filter(name="user").first()
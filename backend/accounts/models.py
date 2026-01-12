from django.db import models
from django.contrib.auth.models import AbstractUser
from django.dispatch import receiver
from django.db.models.signals import post_save

# Create your models here.

class User(AbstractUser):
    pass

    def get_user_role(self):
        user_role = UserRole.objects.filter(user=self)
        if user_role.exists():
            return user_role.first().role.name
        else:
            return False

    def get_user_profile_image(self):
        user_profile = UserProfile.objects.filter(user = self.id)
        if user_profile.exists():
            return user_profile.first().image
        else:
            return False

class Role(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()

    def __str__(self):
        return f"{self.name}"

class UserRole(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    role = models.ForeignKey(Role, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.user.username}"

class UserProfile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to="user_profile_images", default="user_profile_images/default-user-image.png")

    def __str__(self):
        return f"{self.user.username}"


@receiver(post_save, sender=User)
def user_profile_creation(sender, instance, created, **kwargs):
    if created and not UserProfile.objects.filter(user=instance).exists():
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def user_role_creation(sender, instance, created, **kwargs):
    roles = Role.objects.filter()
    if not roles.exists():
        roles.create(name="admin", description="Permission for everything in this project. Creator, Destroyer, Owner of the project.")
        roles.create(name="user", description="permission for selected pages and functionality of the project. Can only experience the project based on creation of admin.")

    if created and not UserRole.objects.filter(user=instance).exists():
        UserRole.objects.create(user=instance, role=roles.filter(name="user").first())
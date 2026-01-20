from django.contrib import admin
from accounts.models import User, Role
# Register your models here.

class AdminUser(admin.ModelAdmin):
    list_display = ("id","username","role",)

admin.site.register(User, AdminUser)
admin.site.register(Role)
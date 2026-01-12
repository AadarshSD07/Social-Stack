from django.contrib import admin
from accounts.models import User, Role, UserRole, UserProfile
# Register your models here.

class AdminUserRole(admin.ModelAdmin):
    list_display = ("user","role_name",)

    def role_name(self, obj):
        return obj.role.name

admin.site.register(User)
admin.site.register(Role)
admin.site.register(UserRole, AdminUserRole)
admin.site.register(UserProfile)
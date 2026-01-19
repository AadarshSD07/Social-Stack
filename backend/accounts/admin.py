from django.contrib import admin
from accounts.models import User, Role
# Register your models here.

class AdminUserRole(admin.ModelAdmin):
    list_display = ("user","role_name",)

    def role_name(self, obj):
        return obj.role.name

admin.site.register(User)
admin.site.register(Role)
from django.urls import path
from accounts.views import AdminOnlyView, UserProfileInformation, ChangePasswordView

urlpatterns = [
    path("admin-test/", AdminOnlyView.as_view()),
    path("user-details/", UserProfileInformation.as_view()),
    path("change-user-password/", ChangePasswordView.as_view()),
]

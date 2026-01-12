from django.urls import path
from accounts import views

urlpatterns = [
    path("register/", views.UserRegistration.as_view()),
    path("user-details/", views.UserProfileInformation.as_view()),
    path("change-user-password/", views.ChangePasswordView.as_view()),
]

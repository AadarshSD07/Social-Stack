from configuration import Config
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import HasRole
from .serializers import ChangePasswordSerializer

# Create your views here.

class AdminOnlyView(APIView):
    permission_classes = [HasRole]
    required_roles = ["ADMIN"]

    def get(self, request):
        return Response({"message": "Admin access granted"})

class UserProfileInformation(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user_details = {
            "username": request.user.username,
            "firstName": request.user.first_name,
            "lastName": request.user.last_name
        }
        try:
            imageUrl = request.user.userprofile_set.get().image.url
        except Exception as e:
            imageUrl = "/media/user_profile_images/default-user-image.png"

        user_details["imageUrl"] = imageUrl
        return Response(user_details, status=Config.success)

    def post(self, request):
        post_data = request.data
        user_password = User.check_password(post_data["password"])
        if user_password:
            User.set_password(post_data["npassword"])
            response_status = Config.accepted
        else:
            response_status = Config.forbidden

        return Response(status=response_status)

class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def post(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            if not user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {"old_password": ["Wrong password."]},
                    status=Config.bad_request
                )

            user.set_password(serializer.validated_data['new_password'])
            user.save()

            update_session_auth_hash(request, user)

            return Response(
                {"message": "Password changed successfully."},
                status=Config.success
            )

        return Response(serializer.errors, status=Config.bad_request)
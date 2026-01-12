from configuration import Config
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from django.shortcuts import render
from rest_framework import permissions, generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from .serializers import ChangePasswordSerializer, ProfileInformationSerializer, UserRegistrationSerializer

# Create your views here.

class UserRegistration(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User created successfully."},
                status=Config.success)
        return Response(status=Config.success)

class UserProfileInformation(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileInformationSerializer

    def get(self, request):
        user_details = self.serializer_class().get(request.user)
        return Response(user_details, status=Config.success)

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            _ = self.serializer_class().post(request.user, request.data)
            return Response(
                {"message": "Data saved successfully."},
                status=Config.success)

        return Response(serializer.errors, status=Config.bad_request)

class ChangePasswordView(generics.UpdateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

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
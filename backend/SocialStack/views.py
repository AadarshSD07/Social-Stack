# views.py
from configuration import Config
from django.views.generic import TemplateView
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

def fetch_user_details(request):
    if request.user.is_authenticated:
        return {
            "fullName": (request.user.first_name + " " + request.user.last_name)[:15],
            "username": request.user.username,
            "isUserAdmin": request.user.role.name == "admin",
            "user_image": request.user.profile_image.url
        }
    else:
        return {}

class ReactAppView(TemplateView):
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        # Add any context data here
        return context

class HeaderDetails(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        response = fetch_user_details(request)
        return Response(response, status=Config.success)

        
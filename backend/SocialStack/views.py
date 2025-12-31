# views.py
from django.views.generic import TemplateView
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

def fetch_user_details(request):
    if request.user.is_authenticated:
        return {
            "fullName": request.user.first_name + " " + request.user.last_name,
            "username": request.user.username,
            "isUserAdmin": request.user.get_user_role() == "admin",
            "userImage": request.user.get_user_profile_image().url
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
    def get(self, request, format=None):
        response = fetch_user_details(request)
        return Response(response, status=status.HTTP_200_OK)
# views.py
from configuration import Config
from django.views.generic import TemplateView
from django.conf import settings
from django.middleware.csrf import get_token
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

class ReactAppView(TemplateView):
    """
    Django TemplateView serving React single-page application (SPA).
    
    Serves 'index.html' template as entry point for React Router and frontend bundle.
    Provides context data to React app via template variables if needed.
    
    Usage:
        - Serves React app at root path (/)
        - Handles all React Router client-side routing
        - Passes server-side data to React via context
        
    Template: 'index.html' - React root with script/style includes
    """
    template_name = 'index.html'
    
    def get_context_data(self, **kwargs):
        """
        Add context data for React app consumption.
        
        Override to pass server-side data (CSRF token, user info, config)
        to React frontend via template variables.
        
        Args:
            **kwargs: TemplateView context kwargs
            
        Returns:
            dict: Context with React-specific data
        """
        context = super().get_context_data(**kwargs)
        
        # Add CSRF token for API requests
        context['csrf_token'] = get_token(self.request)
        
        # Add user info for authenticated users
        if self.request.user.is_authenticated:
            context['user'] = {
                'id': self.request.user.id,
                'username': self.request.user.username,
                'is_staff': self.request.user.is_staff
            }
        
        # Add app configuration
        context['config'] = {
            'api_url': settings.API_URL,
            'debug': settings.DEBUG
        }
        
        return context


class HeaderDetails(APIView):
    """
    API endpoint to retrieve basic user header information for UI display.
    
    Returns user profile data for authenticated users, empty object for guests.
    Used to populate navigation bar, profile dropdowns, and user status indicators.
    
    Permissions: AllowAny - works for both authenticated and anonymous users
    
    Returns:
        200 Success (authenticated): User details for header display
        400 Bad Request (anonymous): Empty object {}
    """
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        """
        Handle GET request to fetch user header information.
        
        Args:
            request: HTTP request (authenticated or anonymous)
            
        Returns:
            Response: User profile data or empty object based on auth status
        """
        if request.user.is_authenticated:
            # Construct header information for authenticated users
            information = {
                "userId": request.user.id,
                "fullName": f"{request.user.first_name} {request.user.last_name}"[:15].strip(),
                "username": request.user.username,
                "user_image": request.user.profile_image if request.user.profile_image else f"{Config.default_image}"
            }
        else:
            # Return empty object for anonymous users
            information = {}
            
        return Response(information, status=Config.success)

        
"""
URL configuration for SocialStack project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.http import HttpResponse
from django.views.generic import TemplateView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from SocialStack.views import HeaderDetails, GoogleAuthView

def show_urls(request):
    """
    Debug view to display all registered URL patterns in the Django project.
    
    WARNING: Only use in development for debugging URL configuration.
    Exposes complete URL structure - never deploy to production.
    
    Args:
        request: HTTP request object
        
    Returns:
        HttpResponse: HTML list of all URL patterns (one per line)
    """
    from django.urls import get_resolver
    
    # Get root URL resolver containing all registered URL patterns
    resolver = get_resolver()
    urls = []
    
    # Extract string representation of each URL pattern
    for pattern in resolver.url_patterns:
        urls.append(str(pattern))
    
    # Return simple HTML with line breaks between patterns
    return HttpResponse('<br>'.join(urls))


urlpatterns = [
    path('admin/', admin.site.urls),
    path('debug-urls/', show_urls),
    path("auth/login/", TokenObtainPairView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path('header/', HeaderDetails.as_view(), name='header_details'),
    path("auth/google/", GoogleAuthView.as_view(), name='google_oauth2'),
    path("accounts/", include("accounts.urls")),
    path("social/", include("social.urls")),
    path('', TemplateView.as_view(template_name='index.html')),

]

# This serves media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
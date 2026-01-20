from django.urls import path
from social import views

urlpatterns = [
    path('posts/', views.SocialPostsAPIView.as_view(), name='posts'),
    path('dashboard/<int:id>/', views.UserDashboard.as_view(), name='user_dashboard'),
    path('like/<int:id>/', views.PostsLike.as_view(), name='like_post'),
    path('comment/<int:id>/', views.PostsComment.as_view(), name='comment_post'),
    path('search/<str:search_text>/', views.SearchUsersPosts.as_view(), name='search_users_posts'),
]

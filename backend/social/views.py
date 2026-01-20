from accounts.models import User
from collections import defaultdict
from configuration import Config
from django.db.models.functions import Cast, Coalesce
from django.db.models import Count, CharField, Value, Case, When, BooleanField, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, generics
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from social import serializers, models

import json

class CustomPostPagination(PageNumberPagination):
    """
    Custom pagination for posts

    Usage:
        - Add ?page=1 to get first page
        - Add ?page=2 to get second page, etc.
        - Response includes: count, next, previous, results

    Example response:
        {
            "count": 100,
            "next": "http://api.example.com/posts/?page=3",
            "previous": "http://api.example.com/posts/?page=1",
            "results": [...]
        }
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 50


class SocialPostsAPIView(APIView):
    """
    RESTful API for managing social media posts

    Endpoints:
        GET /api/posts/ - List all posts or search posts
        DELETE /api/posts/ - Delete a post (admin only)

    Query Parameters:
        - search: Filter posts by description (case-insensitive)
        - page: Page number for pagination (default: 1)
        - page_size: Number of posts per page (default: 10, max: 50)

    Authentication:
        - JWT Authentication required
        - User must be authenticated for all operations

    Permissions:
        - GET: Any authenticated user
        - DELETE: Admin users only
    """

    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = CustomPostPagination
    
    def get_public_posts_queryset(self, search=None):
        """
        Get base queryset with annotations for likes, user comparison

        Returns:
            QuerySet: Annotated UserPost queryset to delete own posts if not admin on search page
        """
        base_queryset = models.UserPost.objects.annotate(
            likes_count=Coalesce(Count('likes', distinct=True), Value(0)),
            same_user=Case(
                When(user__username=self.request.user.username, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            )
        ).select_related('user').prefetch_related('comments__user', 'likes')
        
        return base_queryset.filter(post_desc__icontains=search) if search else base_queryset
    
    def get_user_dashboard_queryset(self):
        """
        Get queryset filtered to current user's posts with annotations

        Returns:
            QuerySet: Annotated UserPost queryset for current user to delete own posts if not admin on search page
        """
        user_id = self.request.query_params.get('user_id', False)
        if user_id:
            filters = {"user__id": user_id}
        else:
            filters = {"user": self.request.user}

        return models.UserPost.objects.filter(
            **filters
        ).annotate(
            likes_count=Coalesce(Count('likes', distinct=True), Value(0)),
            same_user=Case(
                When(user__username=self.request.user.username, then=Value(True)),
                default=Value(False),
                output_field=BooleanField()
            )
        ).select_related('user').prefetch_related('comments__user', 'likes')

    def get_dashboard_information(self):
        user_id = self.request.query_params.get('user_id', False)
        id = self.request.user.id if not user_id else user_id
        user = User.objects.get(id = id)
        return {
            "userId": user.id,
            "fullName": (user.first_name + " " + user.last_name)[:15],
            "username": user.username,
            "user_image": user.profile_image.url
        }

    def get(self, request):
        """
        Retrieve social posts feed with optional search filtering

        Args:
            request: HTTP request object

        Query Parameters:
            search (str, optional): Search term to filter posts by description
            page (int, optional): Page number for pagination
            page_size (int, optional): Number of results per page

        Returns:
            Response: JSON response containing:
                - socialPosts: List of post objects with user info, likes, comments
                - permissionToDelete: Boolean indicating if user has admin role for all posts or whether dashboard for true value
                - userLikedPosts: List of post IDs liked by current user
                - userComments: Dictionary mapping post IDs to their comments

        Status Codes:
            200 OK: Successfully retrieved posts
            401 Unauthorized: Authentication failed

        Example:
            GET /api/posts/?search=hello&page=1&page_size=20
        """
        # Get base queryset
        post_type = request.query_params.get('post_type', '')
        search = request.query_params.get('search_text', None)
        if post_type == "dashboard":
            queryset = self.get_user_dashboard_queryset()
        else:
            queryset = self.get_public_posts_queryset(search)

        # Apply search filter if provided
        search_query = request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(post_desc__icontains=search_query)

        # Order by most recent
        queryset = queryset.order_by('-created_at')

        # Apply pagination
        paginator = self.pagination_class()
        paginated_posts = paginator.paginate_queryset(queryset, request)

        # Get list of post IDs for efficient querying
        post_ids = [post.id for post in paginated_posts]

        # Get posts liked by current user (only for posts in current page)
        liked_posts = list(
            models.PostLike.objects.filter(
                user=request.user,
                post__id__in=post_ids
            ).values_list('post__id', flat=True)
        )

        # Annotate posts with is_liked field
        for post in paginated_posts:
            post.is_liked = post.id in liked_posts

        # Get comments for posts in current page
        comments_qs = models.UserComment.objects.filter(
            post__id__in=post_ids
        ).select_related(
            'user'
        ).order_by('-created_at')

        # Group comments by post ID
        comments_dict = defaultdict(list)
        comment_serializer = serializers.CommentSerializer(comments_qs, many=True)
        for comment_data in comment_serializer.data:
            comments_dict[comment_data['post_id']].append(comment_data)

        # Serialize posts
        serializer = serializers.SocialPostSerializer(paginated_posts, many=True)

        # Add comments to each post
        posts_with_comments = []
        for post_data in serializer.data:
            post_data['comments'] = comments_dict.get(post_data['id'], [])
            posts_with_comments.append(post_data)

        # Build response
        response_data = {
            "socialPosts": posts_with_comments,
            "userLikedPosts": liked_posts,
            "userComments": dict(comments_dict)
        }

        # Check if page is dashboard
        if post_type == "dashboard":
            response_data["permissionToDelete"] = False
            response_data["userDashboardInformation"] = self.get_dashboard_information()
        else:
            response_data["permissionToDelete"] = request.user.get_user_role() == "admin"

        # Return paginated response
        return paginator.get_paginated_response(response_data)

    def post(self, request):
        """
        Create a new post for the authenticated user

        Args:
            request: HTTP request object

        Request Body:
            {
                "desc": string (required) - Post description/content
                "imageUrl": file (optional) - Image file for the post
            }

        Returns:
            Response: Success message with created post data

        Status Codes:
            201 Created: Post created successfully
            400 Bad Request: Invalid data provided
            401 Unauthorized: User not authenticated

        Example:
            POST /api/user/posts/
            Content-Type: multipart/form-data
            Body: {
                "desc": "My awesome post!",
                "imageUrl": <file>
            }

            Response:
            {
                "message": "Post created successfully",
                "post": {
                    "id": 123,
                    "post_desc": "My awesome post!",
                    ...
                }
            }
        """
        # Validate and create post using serializer
        serializer = serializers.CreatePostSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():
            post = serializer.save()
            return Response(
                {
                    "message": "Post created successfully",
                    "post": {
                        "id": post.id,
                        "post_desc": post.post_desc,
                        "imageurl": post.imageurl.url if post.imageurl else None,
                        "created_at": post.created_at
                    }
                },
                status=Config.created
            )

        return Response(
            {
                "error": "Invalid post data",
                "details": serializer.errors
            },
            status=Config.bad_request
        )
    
    def patch(self, request):
        """
        Update an existing post (edit post description)
        
        Args:
            request: HTTP request object
        
        Request Body:
            {
                "postId": int (required) - ID of the post to update
                "editedComment": string (required) - New post description
            }
        
        Returns:
            Response: Success/failure message
        
        Status Codes:
            200 OK: Post updated successfully
            204 No Content: Post not found or user is not the owner
            400 Bad Request: Invalid data provided
            401 Unauthorized: User not authenticated
        
        Notes:
            - Users can only update their own posts
            - Sets editedPost flag to True automatically
        
        Example:
            PATCH /api/user/posts/
            Body: {
                "postId": 123,
                "editedComment": "Updated post description"
            }
            
            Response:
            {
                "message": "Post updated successfully!",
                "post": {
                    "id": 123,
                    "post_desc": "Updated post description",
                    "editedPost": true
                }
            }
        """
        # Validate request data
        serializer = serializers.UpdatePostSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {
                    "error": "Invalid data",
                    "details": serializer.errors
                },
                status=Config.bad_request
            )
        
        validated_data = serializer.validated_data
        post_id = validated_data['postId']
        edited_comment = validated_data['editedComment']
        
        # Check if post exists and belongs to user
        try:
            post = models.UserPost.objects.get(
                id=post_id,
                user=request.user
            )
        except models.UserPost.DoesNotExist:
            return Response(
                {"message": "No post found for requested user!"},
                status=Config.no_content
            )
        
        # Update post
        post.post_desc = edited_comment
        post.editedPost = True
        post.save()
        
        return Response(
            {
                "message": "Post updated successfully!",
                "post": {
                    "id": post.id,
                    "post_desc": post.post_desc,
                    "editedPost": post.editedPost,
                    "updated_at": post.updated_at
                }
            },
            status=Config.success
        )

    def delete(self, request):
        """
        Delete a social post (admin only)
        
        Args:
            request: HTTP request object containing post ID in request body
        
        Request Body:
            {
                "postId": int - ID of the post to delete
            }
        
        Returns:
            Response: Success/failure message
        
        Status Codes:
            200 OK: Post deleted successfully
            204 No Content: Post not found
            400 Bad Request: Missing postId in request
            401 Unauthorized: User is not an admin
        
        Permissions:
            - Only users with 'admin' role can delete posts
        
        Example:
            DELETE /api/posts/
            Body: {"postId": 123}
        """
        # Validate request data
        post_id = request.data.get("postId")
        if not post_id:
            return Response(
                {"error": "postId is required"},
                status=Config.bad_request
            )
        
        # Build base filter
        filters = {"id": post_id}

        # Non-admin users can delete only their own posts
        if request.user.role.name != "admin":
            filters["user"] = request.user

        # Attempt to delete post (only if owned by user)
        try:
            post = models.UserPost.objects.get(**filters)
            post.delete()
            return Response(
                {"message": "Post deleted successfully"},
                status=Config.success
            )
        except models.UserPost.DoesNotExist:
            return Response(
                {"message": "No post found for requested user!"},
                status=Config.no_content
            )


class UserDashboard(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id):
        social_posts_view = SocialPostsAPIView()
        social_posts_view.request = self.request

        query_params = self.request._request.GET.copy()
        query_params['post_type'] = 'dashboard'
        query_params['page'] = '1'
        query_params['page_size'] = '45'
        query_params['user_id'] = id

        self.request._request.GET = query_params

        return social_posts_view.get(self.request)


class PostsLike(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = models.UserPost.objects.all()

    def post(self, request, id):
        post_data = request.data
        post = self.queryset.filter(id = id).first()
        if post_data["liked"]:
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)
        post.save()
        return Response(status=Config.success)


class PostsComment(APIView):
    """
    View to handle the creation of comments on a specific post.

    Requires JWT Authentication.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        """
        Creates a new comment for a given post ID.

        Args:
            request: The HTTP request object containing 'comment' data.
            id: The primary key of the UserPost being commented on.

        Returns:
            Response: JSON containing the new comment data or validation errors.
        """
        # 1. Ensure the post exists or return 404
        post_instance = get_object_or_404(models.UserPost, id=id)

        # 2. Initialize serializer with request data
        serializer = serializers.CommentSerializer(data=request.data)

        # 3. Validate and Save
        if serializer.is_valid():
            # We save by passing the user and post directly to the save() method
            serializer.save(user=request.user, post=post_instance)

            return Response(
                {
                    "message": "Comment posted successfully.",
                    "data": serializer.data
                }, 
                status=Config.created
            )

        # 4. Return errors if validation fails (e.g., empty comment)
        return Response(
            serializer.errors, 
            status=Config.bad_request
        )


class SearchUsersPosts(generics.ListAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = serializers.SearchUsersPostsSerializer
    queryset = User.objects.all()

    def get(self, request, search_text):
        serializer = self.get_serializer(data=self.get_queryset_data(search_text))
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=Config.success)

    def get_queryset_data(self, search_text):
        # Get users matching search text
        users = list(
            self.queryset.filter(
                Q(username__icontains=search_text) |
                Q(first_name__icontains=search_text) |
                Q(last_name__icontains=search_text)
            ).values(
                "id",
                "first_name",
                "last_name",
                "username",
                "profile_image"
            )
        )

        # Call SocialPostsAPIView directly with modified request
        social_posts_view = SocialPostsAPIView()
        social_posts_view.request = self.request

        # Copy and modify query params
        query_params = self.request._request.GET.copy()
        query_params['post_type'] = ''
        query_params['page'] = '1'
        query_params['page_size'] = '45'
        query_params['search'] = search_text

        self.request._request.GET = query_params

        # Call get() method directly
        posts_response = social_posts_view.get(self.request)

        # Extract paginated data
        posts = posts_response.data["results"]

        data = {
            "users": users,
            "posts": posts
        }
        return data
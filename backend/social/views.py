from accounts.models import User
from collections import defaultdict, OrderedDict
from configuration import Config
from django.db.models.functions import Coalesce
from django.db.models import Count, Value, Case, When, BooleanField, Q
from django.shortcuts import get_object_or_404
from rest_framework import permissions, generics
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.pagination import PageNumberPagination
from rest_framework.views import APIView
from rest_framework.response import Response
from social import serializers, models

def get_public_posts_queryset(request, search=None):
    """
    Builds the base queryset for public posts with annotations for likes
    and ownership flags.
    """
    base_queryset = models.UserPost.objects.annotate(
        # Ensures likes_count is 0 instead of None
        likes_count=Coalesce(Count('likes', distinct=True), Value(0)),
        # Helper boolean to identify if the post belongs to the requesting user
        same_user=Case(
            When(user__username=request.user.username, then=Value(True)),
            default=Value(False),
            output_field=BooleanField()
        )
    ).select_related('user').prefetch_related('comments__user', 'likes')

    # Apply search filter if search_text is provided
    return base_queryset.filter(post_desc__icontains=search) if search else base_queryset

def get_user_dashboard_queryset(request, user_id=None):
    """
    Fetches posts for a specific user dashboard (either the requester or a profile visit).
    """
    if user_id:
        filters = {"user__id": user_id}
    else:
        filters = {"user": request.user}

    return models.UserPost.objects.filter(
        **filters
    ).annotate(
        likes_count=Coalesce(Count('likes', distinct=True), Value(0)),
        same_user=Case(
            When(user__username=request.user.username, then=Value(True)),
            default=Value(False),
            output_field=BooleanField()
        )
    ).select_related('user').prefetch_related('comments__user', 'likes')

def get_dashboard_information(request, user_id=None):
    """
    Retrieves profile header information for the dashboard view.
    """
    id = request.user.id if not user_id else user_id
    user = User.objects.get(id = id)
    return {
        "userId": user.id,
        "fullName": (user.first_name + " " + user.last_name)[:15],
        "username": user.username,
        "user_image": user.profile_image if user.profile_image else f"{Config.default_image}"
    }

def build_paginated_posts_response(request, queryset, response_data=None):
    """
    Handles the heavy lifting of pagination, including manual hydration
    of 'is_liked' status and nested comments for the current page.
    """
    if response_data is None:
        response_data = {}

    paginator = CustomPostPagination()
    paginated_posts_response = paginator.paginate_queryset(queryset, request)

    # Extract IDs to optimize subsequent lookups for likes and comments
    post_ids = [post.id for post in paginated_posts_response]

    # Batch check which posts the current user has liked
    liked_posts = list(
        models.PostLike.objects.filter(
            user=request.user,
            post__id__in=post_ids
        ).values_list('post__id', flat=True)
    )

    # Inject the is_liked status into the model instances before serialization
    for post in paginated_posts_response:
        post.is_liked = post.id in liked_posts

    # Fetch all relevant comments in one query to avoid N+1 issues
    comments_qs = models.UserComment.objects.filter(
        post__id__in=post_ids
    ).select_related(
        'user'
    ).order_by('-created_at')

    # Group comments by post_id using a dictionary
    comments_dict = defaultdict(list)
    comment_serializer = serializers.CommentSerializer(comments_qs, many=True)
    for comment_data in comment_serializer.data:
        comments_dict[comment_data['post_id']].append(comment_data)

    serializer = serializers.PostSerializer(paginated_posts_response, many=True)

    # Attach the grouped comments to each post object
    posts_with_comments = []
    for post_data in serializer.data:
        post_data['comments'] = comments_dict.get(post_data['id'], [])
        posts_with_comments.append(post_data)

    response = {
        "socialPosts": posts_with_comments,
        "userLikedPosts": liked_posts,
        "userComments": dict(comments_dict)
    }

    return paginator.get_paginated_response(response | response_data)


class CustomPostPagination(PageNumberPagination):
    """
    Custom paginator that provides a full list of page URLs and total page counts.
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = int(Config.posts_per_page)

    def get_paginated_response(self, data):
        total_pages = self.page.paginator.num_pages
        current_page = self.page.number

        # Build list of metadata for each page available
        page_urls = []
        for page_num in range(1, total_pages + 1):
            url = self.request.build_absolute_uri()

            if '?' in url:
                base_url = url.split('?')[0]
                query_params = self.request.GET.copy()
                query_params['page'] = page_num
                page_url = f"{base_url}?{query_params.urlencode()}"
            else:
                page_url = f"{url}?page={page_num}"

            page_urls.append({
                'page': page_num,
                'url': page_url,
                'is_current': page_num == current_page
            })

        return Response(OrderedDict([
            ('count', self.page.paginator.count),
            ('total_pages', total_pages),
            ('current_page', current_page),
            ('page_size', self.page_size),
            ('next', self.get_next_link()),
            ('previous', self.get_previous_link()),
            ('pages', page_urls),
            ('results', data)
        ]))


class SocialPostsAPIView(generics.ListCreateAPIView):
    """
    Main feed API for viewing, creating, updating, and deleting posts.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        # Dynamically switch serializers based on the HTTP method
        if self.request.method == 'POST':
            return serializers.CreatePostSerializer
        if self.request.method == 'PATCH':
            return serializers.UpdatePostSerializer
        return serializers.PostSerializer

    def get_queryset(self):
        return get_public_posts_queryset(self.request).order_by('-created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        response_data = {
            "permissionToDelete": request.user.is_admin
        }
        return build_paginated_posts_response(request, queryset, response_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer_class()(
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
                        "imageurl": post.imageurl if post.imageurl else None,
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
        Updates the description of an existing post owned by the user.
        """
        serializer = self.get_serializer_class()(data=request.data)

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
        Deletes a social post.
        Admins can delete any post; regular users can only delete their own.
        """
        post_id = request.data.get("postId")
        if not post_id:
            return Response(
                {"error": "postId is required"},
                status=Config.bad_request
            )
        
        filters = {"id": post_id}

        # Restriction: Non-admins are filtered by their own user object
        if not request.user.is_admin:
            filters["user"] = request.user

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
    """
    API endpoint to retrieve posts and profile info for a specific user's dashboard.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, id=None):
        queryset = get_user_dashboard_queryset(request, id)
        queryset = queryset.order_by('-created_at')

        response_data = {
            "permissionToDelete" : False,
            "userDashboardInformation" : get_dashboard_information(request, id)
        }

        return build_paginated_posts_response(request, queryset, response_data)


class PostsLike(APIView):
    """
    Handles toggling a like on a specific post.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = models.UserPost.objects.all()

    def post(self, request, id):
        post_data = request.data
        post = self.queryset.filter(id=id).first()

        if not post:
            return Response({"error": "Post not found"}, status=Config.not_found)

        # Logic to add or remove user from the ManyToMany 'likes' field
        if post_data.get("liked", False):
            post.likes.add(request.user)
        else:
            post.likes.remove(request.user)

        post.save()
        return Response(status=Config.success)


class PostsComment(APIView):
    """
    Handles creating a new comment on a specific post.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, id):
        post_instance = get_object_or_404(models.UserPost, id=id)
        serializer = serializers.CommentSerializer(data=request.data)

        if serializer.is_valid():
            # Injecting user and post relationship during save
            serializer.save(user=request.user, post=post_instance)

            return Response(
                {
                    "message": "Comment posted successfully.",
                    "data": serializer.data
                }, 
                status=Config.created
            )

        return Response(
            serializer.errors, 
            status=Config.bad_request
        )


class SearchUsersPosts(APIView):
    """
    Unified search endpoint that returns both matching users and matching posts.
    """
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_users_queryset(self, search_text):
        """Finds up to 10 users whose name or username matches the search string."""
        default_image = f"{Config.default_image}"
        users = list(
            User.objects.filter(
                Q(username__icontains=search_text) |
                Q(first_name__icontains=search_text) |
                Q(last_name__icontains=search_text)
            ).annotate(
                imageUrl=Coalesce('profile_image', Value(default_image))
            ).values(
                "id", "first_name", "last_name", "username", "imageUrl"
            )[:10]
        )
        return users

    def get(self, request, search_text):
        # Validate and return search results
        serializer = serializers.SearchUsersPostsSerializer(data = self.get_queryset_data(search_text))
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=Config.success)

    def get_queryset_data(self, search_text):
        """Aggregates user search results and paginated post search results."""
        users = self.get_users_queryset(search_text)

        queryset = get_public_posts_queryset(self.request, search_text)
        queryset = queryset.order_by('-created_at')

        # Reuse the existing pagination logic
        posts_response = build_paginated_posts_response(self.request, queryset)
        posts = posts_response.data

        return {
            "users": users,
            "posts": posts
        }
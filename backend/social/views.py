from accounts.models import User
from collections import defaultdict
from configuration import Config
from django.db.models.functions import Cast, Coalesce
from django.db.models import Count, CharField, Value, Case, When, BooleanField, Q
from rest_framework import permissions
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.views import APIView
from rest_framework.response import Response
from social.models import UserPost, UserComment, PostLike

import json

class FetchSocialPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        if format:
            total_posts = list(
                self.queryset.annotate(
                    created_at_str=Cast('created_at', CharField()),
                    # Coalesce ensures that if Count is None, it returns 0
                    likes_count=Coalesce(Count('likes'), Value(0)),
                    same_user=Case(
                        When(user__username=request.user.username, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField()
                    )
                ).filter(
                    post_desc__icontains = format
                ).values(
                    "id",
                    "imageurl",
                    "user__username",
                    "user__userprofile__image",
                    "user__first_name",
                    "user__last_name",
                    "post_desc",
                    "editedPost",
                    "created_at_str",
                    "likes_count",
                    "same_user"
                ).order_by("-created_at")
            )
        else:
            total_posts = list(
                self.queryset.annotate(
                    created_at_str=Cast('created_at', CharField()),
                    # Coalesce ensures that if Count is None, it returns 0
                    likes_count=Coalesce(Count('likes'), Value(0)),
                    same_user=Case(
                        When(user__username=request.user.username, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField()
                    )
                ).values(
                    "id",
                    "imageurl",
                    "user__username",
                    "user__userprofile__image",
                    "user__first_name",
                    "user__last_name",
                    "post_desc",
                    "editedPost",
                    "created_at_str",
                    "likes_count",
                    "same_user"
                ).order_by("-created_at")
            )
        # liked_posts = list(PostLike.objects.filter(user=request.user).values_list("post__id", flat=True))
        liked_posts = list(
            PostLike.objects.filter(
                user=request.user,
                post__id__in = [pst["id"] for pst in total_posts]
            ).values_list(
                "post__id", flat=True
            )
        )
        raw_comments = list(
            UserComment.objects.annotate(
                created_at_str=Cast('created_at', CharField()),
            ).filter(
                post__id__in=[pst["id"] for pst in total_posts]
            ).values(
                "id",
                "user__first_name",
                "user__last_name",
                "user__userprofile__image",
                "post__id",
                "comment",
                "created_at_str"
            ).order_by("-created_at")
        )
        comments_dict = defaultdict(list)
        for comm in raw_comments:
            comments_dict[comm["post__id"]].append({
                "id": comm["id"],
                "user": comm["user__first_name"] + " " + comm["user__last_name"],
                "userImage":f'/media/{comm["user__userprofile__image"]}',
                "comment": comm["comment"],
                "timestamp": comm["created_at_str"]
            })
        is_user_admin = request.user.get_user_role() == "admin"
        posts = json.dumps(total_posts)
        response = {
            "socialPosts": posts,
            "isUserAdmin": is_user_admin,
            "userLikedPosts": liked_posts,
            "userComments": comments_dict
        }
        if format:
            return response
        return Response(response, status=Config.success)
    
    def delete(self, request):
        deleteId = request.data["postId"]
        if request.user.get_user_role() == "admin":
            post = self.queryset.filter(id = deleteId)
            if post.exists():
                post.delete()
                return Response("Success", status=Config.success)
            else:
                return Response(status=Config.no_content)
        else:
            return Response("Failure", status=Config.unauthorized)


class FetchUserPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, format=None):
        total_posts = list(
            self.queryset.filter(user = request.user)
            .annotate(
                created_at_str=Cast('created_at', CharField()),
                # Coalesce ensures that if Count is None, it returns 0
                likes_count=Coalesce(Count('likes'), Value(0)),
                same_user=Case(
                        When(user__username=request.user.username, then=Value(True)),
                        default=Value(False),
                        output_field=BooleanField()
                )
            ).values(
                "id",
                "imageurl",
                "user__username",
                "user__userprofile__image",
                "user__first_name",
                "user__last_name",
                "post_desc",
                "editedPost",
                "created_at_str",
                "likes_count",
                "same_user"
            ).order_by("-created_at")
        )
        # liked_posts = list(PostLike.objects.filter(user=request.user).values_list("post__id", flat=True))
        liked_posts = list(
            PostLike.objects.filter(
                user=request.user,
                post__id__in = [pst["id"] for pst in total_posts]
            ).values_list(
                "post__id", flat=True
            )
        )
        raw_comments = list(
            UserComment.objects.annotate(
                created_at_str=Cast('created_at', CharField()),
            ).filter(
                post__id__in=[pst["id"] for pst in total_posts]
            ).values(
                "id",
                "user__first_name",
                "user__last_name",
                "user__userprofile__image",
                "post__id",
                "comment",
                "created_at_str"
            ).order_by("-created_at")
        )
        comments_dict = defaultdict(list)
        for comm in raw_comments:
            comments_dict[comm["post__id"]].append({
                "id": comm["id"],
                "user": comm["user__first_name"] + " " + comm["user__last_name"],
                "userImage":f'/media/{comm["user__userprofile__image"]}',
                "comment": comm["comment"],
                "timestamp": comm["created_at_str"]
            })
        posts = json.dumps(total_posts)
        response = {
            "socialPosts": posts,
            "userLikedPosts": liked_posts,
            "userComments": comments_dict
        }
        return Response(response, status=Config.success)
    
    def post(self, request):
        post_data = request.data
        desc = post_data.get("desc")
        image_url = post_data.get("imageUrl")

        # Use create() once with all required data
        UserPost.objects.create(
            user=request.user,
            post_desc=desc,
            imageurl=image_url # Django handles None/Null correctly if image_url is missing
        )
        return Response("Success", status=Config.success)

    def patch(self, request):
        post_data = request.data
        post = self.queryset.filter(id = post_data["postId"], user=request.user)
        if post.exists():
            userPost = post.first()
            userPost.post_desc = post_data["editedComment"]
            userPost.editedPost = True
            userPost.save()
            return Response({"message": "Post updated successfully!"},status=Config.success)
        return Response({"message":"No post found for requested user!"}, status=Config.no_content)

    def delete(self, request):
        deleteId = request.data["postId"]
        post = self.queryset.filter(id = deleteId, user=request.user.id)
        if post.exists():
            post.delete()
            return Response("Success", status=Config.success)
        else:
            return Response(status=Config.no_content)


class PostsLike(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

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
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserComment.objects.all()

    def post(self, request, id):
        post_data = request.data
        post = UserPost.objects.filter(id = id).first()
        comment = self.queryset.create(user = request.user, comment=post_data["comment"], post=post)
        comment.save()
        return Response(status=Config.success)


class SearchUsersPosts(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = UserPost.objects.all()

    def get(self, request, search_text):
        users = list(
            User.objects.filter(
                Q(username__icontains=search_text)   |
                Q(first_name__icontains=search_text) |
                Q(last_name__icontains=search_text)
            ).values(
                "id",
                "first_name",
                "last_name",
                "username",
                "userprofile__image"
            )
        )
        fetch_social_posts = FetchSocialPosts()
        posts = fetch_social_posts.get(request, format=search_text)
        data = {
            "users": users,
            "posts": posts
        }
        return Response(data, status=Config.success)
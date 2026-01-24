from accounts.cloudinary import upload_image
from configuration import Config
from django.contrib.auth import get_user_model
import logging
from rest_framework import serializers
from social import models

User = get_user_model()
logger = logging.getLogger(__name__)
USER_POSTS = "user_posts"

class SearchUsersPostsSerializer(serializers.Serializer):
    users = serializers.ListField(child=serializers.DictField())
    posts = serializers.DictField()


class CommentSerializer(serializers.ModelSerializer):
    """
    Serializer for UserComment model with user details
    """
    user = serializers.CharField(source='user.get_full_name', read_only=True)
    user_image = serializers.SerializerMethodField()
    timestamp = serializers.CharField(source='created_at', read_only=True)
    post_id = serializers.IntegerField(source='post.id', read_only=True)

    class Meta:
        model = models.UserComment
        fields = ['id', 'user', 'user_image', 'post_id', 'comment', 'timestamp']

    def get_user_image(self, obj):
        """
        Get comment author's profile image URL
        """
        profile_image = obj.user.profile_image
        if profile_image:
            return f'/media/{profile_image}'
        return f"{Config.backend_domain}{Config.default_image}"


class PostSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for UserPost with all related data
    """
    user_id = serializers.CharField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    user_profile_image = serializers.SerializerMethodField()
    first_name = serializers.CharField(source='user.first_name', read_only=True)
    last_name = serializers.CharField(source='user.last_name', read_only=True)
    created_at_str = serializers.CharField(source='created_at', read_only=True)
    likes_count = serializers.IntegerField(read_only=True)
    same_user = serializers.BooleanField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True, default=False)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = models.UserPost
        fields = [
            'id',
            'imageurl',
            'user_id',
            'username',
            'user_profile_image',
            'first_name',
            'last_name',
            'post_desc',
            'editedPost',
            'created_at_str',
            'likes_count',
            'same_user',
            'is_liked',
            'comments'
        ]

    def get_user_profile_image(self, obj):
        """
        Get post author's profile image URL
        """
        profile_image = obj.user.profile_image
        if profile_image:
            return profile_image
        return f"{Config.backend_domain}{Config.default_image}"


class CreatePostSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new posts
    """
    desc = serializers.CharField(source='post_desc', write_only=True)
    imageUrl = serializers.ImageField(source='imageurl', required=False, allow_null=True)

    class Meta:
        model = models.UserPost
        fields = ['desc', 'imageUrl']

    def create(self, validated_data):
        """
        Create a new post with the authenticated user
        """
        # User is passed via context from the view
        user = self.context['request'].user

        # Build filters dict
        filters = {
            "user": user,
            "post_desc": validated_data.get('post_desc'),
        }

        # Handle image upload if provided
        imageurl = validated_data.get('imageurl')
        if imageurl:
            cloud_image_info = upload_image(imageurl, "user_posts")
            filters["imageurl"] = cloud_image_info["cloudinary_url"]

        return models.UserPost.objects.create(**filters)


class UpdatePostSerializer(serializers.Serializer):
    """
    Serializer for updating existing posts
    """
    postId = serializers.IntegerField(required=True)
    editedComment = serializers.CharField(required=True, allow_blank=False)

    def validate_editedComment(self, value):
        """
        Validate that edited comment is not empty
        """
        if not value or not value.strip():
            raise serializers.ValidationError("Post description cannot be empty")
        return value.strip()

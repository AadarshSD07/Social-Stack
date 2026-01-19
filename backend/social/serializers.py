from accounts import models as acc_models
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ObjectDoesNotExist
from rest_framework.exceptions import ValidationError
from rest_framework.validators import UniqueValidator
from social import models
import logging

User = get_user_model()
logger = logging.getLogger(__name__)

class SearchUsersPostsSerializer(serializers.Serializer):
    users = serializers.ListField(child=serializers.DictField())
    posts = serializers.DictField()

class UserBasicSerializer(serializers.ModelSerializer):
    """
    Basic user information serializer for nested representations
    """
    profile_image = serializers.SerializerMethodField()
    
    class Meta:
        model = acc_models.User
        fields = ['username', 'first_name', 'last_name', 'profile_image']
    
    def get_profile_image(self, obj):
        """
        Get user profile image URL with fallback to default
        """
        profile_image = obj.profile_image
        if profile_image:
            return f'/media/{profile_image}'
        return '/media/user_profile_images/default-user-image.png'


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
        return '/media/user_profile_images/default-user-image.png'


class SocialPostSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for UserPost with all related data
    """
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
            return f'/media/{profile_image}'
        return '/media/user_profile_images/default-user-image.png'


class UserPostSerializer(serializers.ModelSerializer):
    """
    Comprehensive serializer for UserPost with all related data (for user's own posts)
    """
    username = serializers.CharField(source='user.username', read_only=True)
    profile_image = serializers.SerializerMethodField()
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
            'username',
            'profile_image',
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
    
    def get_profile_image(self, obj):
        """
        Get post author's profile image URL
        """
        profile_image = obj.user.profile_image
        if profile_image:
            return f'/media/{profile_image}'
        return '/media/user_profile_images/default-user-image.png'


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
        return models.UserPost.objects.create(
            user=user,
            post_desc=validated_data.get('post_desc'),
            imageurl=validated_data.get('imageurl', None)
        )


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

from django.db import models
from accounts import models as acc_models

# Create your models here.
class UserPost(models.Model):
    """
    User's social media post with like functionality
    """
    user = models.ForeignKey(acc_models.User, on_delete=models.CASCADE,related_name='posts')
    post_desc = models.TextField()
    imageurl = models.ImageField(upload_to='user_posts', blank=True, null=True)
    likes = models.ManyToManyField(acc_models.User, through='PostLike', related_name='liked_posts', blank=True)
    editedPost = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}'s post - {self.created_at}"

    @property
    def like_count(self):
        """Get total number of likes"""
        return self.likes.count()

    @property
    def comment_count(self):
        """Get total number of comments"""
        return self.comments.count()

    def is_liked_by(self, user):
        """Check if a specific user has liked this post"""
        return self.likes.filter(id=user.id).exists()

    def toggle_like(self, user):
        """Toggle like for a user - returns (liked: bool, count: int)"""
        if self.is_liked_by(user):
            self.likes.remove(user)
            return False, self.like_count
        else:
            self.likes.add(user)
            return True, self.like_count


class PostLike(models.Model):
    """
    Through model for UserPost likes - tracks who liked and when
    """
    user = models.ForeignKey(acc_models.User, on_delete=models.CASCADE)
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', 'user']),
            models.Index(fields=['user', 'post']),
            models.Index(fields=['-created_at']),
        ]
        verbose_name = 'Post Like'
        verbose_name_plural = 'Post Likes'

    def __str__(self):
        return f"{self.user.username} likes post {self.post.id}"


class UserComment(models.Model):
    """
    Comments on user posts with like functionality
    """
    user = models.ForeignKey(acc_models.User, on_delete=models.CASCADE,related_name='comments')
    post = models.ForeignKey(UserPost, on_delete=models.CASCADE, related_name='comments')
    comment = models.TextField()
    imageurl = models.ImageField(upload_to='user_comments', blank=True, null=True)
    likes = models.ManyToManyField(acc_models.User, through='CommentLike', related_name='liked_comments', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}'s comment - {self.created_at}"

    @property
    def like_count(self):
        """Get total number of likes"""
        return self.likes.count()

    def is_liked_by(self, user):
        """Check if a specific user has liked this comment"""
        return self.likes.filter(id=user.id).exists()

    def toggle_like(self, user):
        """Toggle like for a user - returns (liked: bool, count: int)"""
        if self.is_liked_by(user):
            self.likes.remove(user)
            return False, self.like_count
        else:
            self.likes.add(user)
            return True, self.like_count


class CommentLike(models.Model):
    """
    Through model for UserComment likes - tracks who liked and when
    """
    user = models.ForeignKey(acc_models.User, on_delete=models.CASCADE)
    comment = models.ForeignKey(UserComment, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'comment')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['comment', 'user']),
            models.Index(fields=['user', 'comment']),
            models.Index(fields=['-created_at']),
        ]
        verbose_name = 'Comment Like'
        verbose_name_plural = 'Comment Likes'

    def __str__(self):
        return f"{self.user.username} likes comment {self.comment.id}"

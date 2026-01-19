import { useState, useEffect } from 'react';
import axios from "axios";
import { getTimeAgo } from '../Methods/TimestampCalculation';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import '../CSS/LikeButton.css';

const SocialPost = (props) => {
  const [userInformation, setUserInformation] = useState([]);
  const [liked, setLiked] = useState(props.userLiked);
  const [likeCount, setLikeCount] = useState(props.likesCount);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(props.userComments);
  const [newComment, setNewComment] = useState('');

  let commentsLength = comments ? comments.length : 0;
  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const config = LocalStorageVariables("config");

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
          const response = await axios.get(`${backendDomain}/header/`, config);
          setUserInformation(response.data);
      } catch (err) {
          console.error('Error:', err);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLike = async () => {
    setLiked(!liked);
    setLikeCount(liked ? likeCount - 1 : likeCount + 1);

    // API call to Django backend
    try {
      const response = await fetch(`${backendDomain}/social/like/${props.post.id}/`, {
        method: 'POST',
        headers: config["headers"],
        body: JSON.stringify({ liked: !liked })
      });
      const data = await response.json();
      // Handle response if needed
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const comment = {
      id: commentsLength + 1,
      user: userInformation["fullName"],
      user_image: userInformation["user_image"],
      comment: newComment,
      timestamp: 'Just now'
    };

    setComments([comment, ...comments]);
    setNewComment('');
    props.setcommentEdited(true);

    // API call to Django backend
    fetch(`${backendDomain}/social/comment/${props.post.id}/`, {
      method: 'POST',
      headers: config["headers"],
      body: JSON.stringify({ comment: newComment })
    })
    .then(response => response.json())
    .then(data => {
      console.log("Comment sent successfully")
    })
    .catch(error => {
      console.error('Error posting comment:', error);
    });
  };

  return (
    <>
    <div>
      {/* Action Buttons */}
      <div className="post-actions">
        <button className={`action-btn like-btn ${liked ? 'liked' : ''}`} onClick={handleLike}>
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill={liked ? '#ff0000' : 'none'}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span>{likeCount > 0 ? likeCount : ""}</span>
        </button>

        <button className="action-btn comment-btn" onClick={() => setShowComments(!showComments)}>
          <svg
            className="icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span>{commentsLength > 0 ? commentsLength : ""}</span>
        </button>
        { props.postEditable ?
            <button id={props.post.id} className='action-btn svgButton' onClick={() => props.handleEditClick(props.post)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pencil" viewBox="0 0 16 16">
                  <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
              </svg>
            </button>
          :
            ""
        }
        <button className="action-btn"></button>
        <button className="action-btn"></button>
        <button className="action-btn"></button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="comments-section">
          <div className="comment-form">
            <img src={`${backendDomain}${userInformation["user_image"]}`} alt="Your avatar" className="comment-avatar"/>
            <input type="text" placeholder="Write a comment..." value={newComment}
              onChange={(e) => setNewComment(e.target.value)} className="comment-input"
              onKeyDown={(e) => {
                // Check for Enter key and ensure the comment isn't just whitespace
                if (e.key === 'Enter' && newComment.trim()) {
                  handleCommentSubmit(e);
                }
              }}
              />
            <button onClick={handleCommentSubmit} className="comment-submit">Post</button>
          </div>

          <div className="comments-list">
            { commentsLength < 1 ? (
              <p className='text-center'>Be the first to comment</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <img src={`${backendDomain}${comment.user_image}`} alt={comment.user} className="comment-avatar"/>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-time">{
                      comment.timestamp === "Just now" ? comment.timestamp : getTimeAgo(comment.timestamp)
                      }</span>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default SocialPost;
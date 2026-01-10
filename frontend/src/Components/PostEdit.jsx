import {useState} from 'react'
import { getTimeAgoBoolean } from '../Methods/TimestampCalculation';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import SocialPost from './LikeButton';

const PostEdit = (props) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editComment, setEditComment] = useState(props.post.post_desc);

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const config = LocalStorageVariables("config");
    let post = props.post;
    const userLikedPosts = props.getPostsData.userLikedPosts;
    const userComments = props.getPostsData.userComments;

    const handleEditClick = (post) => {
        setIsEditing(true);
        setEditComment(post.post_desc);
    };

    const handleSave = async (postID) => {
        try {
            const response = await fetch(`${backendUrl}/social/user-posts/`, {
                method: 'PATCH',
                headers: config["headers"],
                body: JSON.stringify({ editedComment: editComment, postId: postID})
            });
            const data = await response.json();
            props.updateStatus({status: "success", message: data.message});
        } catch (error) {
            console.error('Error submitting edited comment:', error);
            props.updateStatus({status: "danger", message: "Not able to update the comment, Try again later!"});
        }
        console.log('Saved:', editComment);
        setIsEditing(false);
    };

    const handleCancel = (post) => {
        setIsEditing(false);
        setEditComment(post.post_desc); // Reset to original
    };
    return (
        <>
        {isEditing ? (
            <div className="edit-container">
                <textarea
                    className="post-text-input"
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    autoFocus
                />
                <div className="edit-buttons">
                    <button onClick={() => handleSave(post.id)}>Save</button>
                    <button onClick={() => handleCancel(post)}>Cancel</button>
                </div>
            </div>
        ) : (
            <>
            <p className="post-text">
                {editComment}
            </p>
            {   post.editedPost ? 
                    <div className="row">
                        <div className="col"></div>
                        <div className="col col-sm-1">
                            <figcaption  className='blockquote-footer'><em>edited</em></figcaption>
                        </div>
                    </div>
                : 
                    ""
            }
            <SocialPost
                userComments={userComments[post.id] ? userComments[post.id] : []}
                userLiked={userLikedPosts.includes(post.id)}
                likesCount={post.likes_count}
                post={post}
                postEditable={getTimeAgoBoolean(post.created_at_str)}
                handleEditClick={handleEditClick}
            />
            </>
        )}
        </>
    )
}

export default PostEdit

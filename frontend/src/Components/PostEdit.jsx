import {useState} from 'react'
import { getTimeAgoBoolean } from '../Methods/TimestampCalculation';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import SocialPost from './LikeButton';

const PostEdit = (props) => {
    let post_desc = props.getHighlightedText ? props.getHighlightedText(props.post.post_desc) : props.post.post_desc;
    const [isEditing, setIsEditing] = useState(false);
    const [editComment, setEditComment] = useState(post_desc);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const config = LocalStorageVariables("config");
    const userLikedPosts = props.getPostsData.userLikedPosts;
    const userComments = props.getPostsData.userComments;

    const handleEditClick = (post) => {
        setIsEditing(true);
        setEditComment(post.post_desc);
    };

    const handleSave = async (postID) => {
        try {
            const response = await fetch(`${backendDomain}/social/user-posts/`, {
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
                    <button onClick={() => handleSave(props.post.id)}>Save</button>
                    <button onClick={() => handleCancel(props.post)}>Cancel</button>
                </div>
            </div>
        ) : (
            <>
            <p className="post-text">
                {editComment}
            </p>
            {   props.post.editedPost ?
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
                userComments={userComments[props.post.id] ? userComments[props.post.id] : []}
                userLiked={userLikedPosts.includes(props.post.id)}
                likesCount={props.post.likes_count}
                post={props.post}
                postEditable={getTimeAgoBoolean(props.post.created_at_str) && props.postEditingPermission}
                handleEditClick={handleEditClick}
            />
            </>
        )}
        </>
    )
}

export default PostEdit

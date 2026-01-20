import {useState} from 'react'
import { getTimeAgoBoolean } from '../Methods/TimestampCalculation';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import SocialPost from './LikeButton';

const PostEdit = (props) => {
    let post_desc = props.getHighlightedText ? props.getHighlightedText(props.post.post_desc) : props.post.post_desc;
    const [isEditing, setIsEditing] = useState(false);
    const [editComment, setEditComment] = useState(post_desc);
    const [commentEdited, setcommentEdited] = useState(props.post.editedPost);

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
                    <button className='m-2' onClick={() => handleSave(props.post.id)}>Save</button>
                    <button onClick={() => handleCancel(props.post)}>Cancel</button>
                </div>
            </div>
        ) : (
            <>
            {
                props.postImage ? (
                    <>
                    <SocialPost
                        userComments={userComments[props.post.id] ? userComments[props.post.id] : []}
                        userLiked={userLikedPosts.includes(props.post.id)}
                        likesCount={props.post.likes_count}
                        post={props.post}
                        postEditable={getTimeAgoBoolean(props.post.created_at_str) && props.postEditingPermission}
                        handleEditClick={handleEditClick}
                        setcommentEdited={setcommentEdited}
                    />
                    <p className="post-text">
                        {editComment}
                    </p>
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                            <div className="timestamp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pin-angle-fill" viewBox="0 0 16 16">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/>
                                </svg>
                                &nbsp; {props.postTimeline}
                            </div>
                        </div>
                        { commentEdited ? 
                            <figcaption  className='blockquote-footer'><em>edited</em></figcaption>
                          : 
                            ""
                        }
                    </div>
                    </>
                ) : (
                    <>
                    <p className="post-text">
                        {editComment}
                    </p>
                    <SocialPost
                        userComments={userComments[props.post.id] ? userComments[props.post.id] : []}
                        userLiked={userLikedPosts.includes(props.post.id)}
                        likesCount={props.post.likes_count}
                        post={props.post}
                        postEditable={getTimeAgoBoolean(props.post.created_at_str) && props.postEditingPermission}
                        handleEditClick={handleEditClick}
                    />
                    <div className="d-flex align-items-center">
                        <div className="flex-grow-1">
                            <div className="timestamp">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pin-angle-fill" viewBox="0 0 16 16">
                                    <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/>
                                </svg>
                                &nbsp; {props.postTimeline}
                            </div>
                        </div>
                        { commentEdited ? 
                            <figcaption  className='blockquote-footer'><em>edited</em></figcaption>
                          : 
                            ""
                        }
                    </div>
                    </>
                )

            }
            </>
        )}
        </>
    )
}

export default PostEdit

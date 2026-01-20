import {useState, useEffect} from 'react'
import axios from "axios";
import { getTimeAgo } from '../Methods/TimestampCalculation';
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import PostEdit from '../Components/PostEdit';
import "../CSS/App.css"

const Posts = (props) => {
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const config = LocalStorageVariables("config");
  let backendUrl = `${backendDomain}/social/posts/`;
  let getPostsData = props.getPostsData;

  const updateStatus = (data) => {
    setStatus(data.status);
    setStatusMessage(data.message);
  }

  const deletePost = async (e) => {
    e.preventDefault();
    props.setError("");

    try {
      const response = await axios.delete(backendUrl,
        {
          data: {postId: e.currentTarget.id},
          headers : config["headers"]
        }
      );
      if (response.status === 200){
        const targetDiv = document.getElementById(`div-${e.target.parentNode.parentElement.id}`);
        if (targetDiv) {
          targetDiv.remove();
        } else {
          console.warn('Target div not found to remove the post in UI.');
        }
        updateStatus({status: "success", message: response.data.message});
      } else {
        updateStatus({status: "danger", message: "Facing error while deleting the post: " + response.status});
      }
    } catch (err) {
      props.setError(err);
    }
  };

  if (props.loading) return <div>Loading posts...</div>;
  if (props.error) return <div>Error: {props.error}</div>;

  const socialPosts = getPostsData.socialPosts;
  const getHighlightedText = props.getHighlightedText ? props.getHighlightedText : false;

  return (
    <>
    <div className="container">
      {statusMessage && (
        <div className={`alert alert-${status} mt-3`} role="alert">
            {statusMessage}
        </div>
      )}
      { socialPosts.length < 1 ? (
        <div className="mt-4 text-center">
          <p>No Posts To Display</p>
        </div>
      ) : (
        socialPosts.map((post, index) => (
            <div className="post-container mt-4 shadow-lg" id={`div-${post.id}`} key={index}>
              <div className="post-header">
                <div className="d-flex align-items-center">
                  <img src={`${backendDomain}${ post.user_profile_image}`}
                    alt="Profile" className="avatar me-3"/>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 fw-bold truncate-text">
                        {
                          post.first_name && post.last_name ?(
                            post.first_name + " " +post.last_name
                          )
                          :
                          "No fullname!"
                        }
                      </h5>
                    </div>
                    <div className="username truncate-text">@{post.username}</div>
                  </div>
                  { props.permissionToDelete || post.same_user ?
                    <button id={post.id} className='svgButton' onClick={deletePost}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                  : ""
                  }
                </div>
              </div>

              <div className="post-body">
                {
                  post.imageurl ?
                    <div className="postImageContainer">
                      <img
                        src={`${backendDomain}${post.imageurl}`}
                        alt="Post Image"
                        className="postImage me-3"
                      />
                    </div>
                  :
                    ""
                }
                <PostEdit
                  postImage={post.imageurl}
                  post={post}
                  postEditingPermission={props.postEditingPermission}
                  updateStatus={updateStatus}
                  getPostsData={props.getPostsData}
                  getHighlightedText={getHighlightedText}
                  postTimeline={getTimeAgo(post.created_at_str)}
                />
              </div>
            </div>
        )) )
      }
      {/* <nav aria-label="Page navigation example" className="d-flex justify-content-center mt-5">
        <ul className="pagination">
          {
            props.pagination[0] ?
              <li className="page-item"><a className="page-link" href={props.pagination[0]}>Previous</a></li>
            :
              <li className="page-item"><a className="page-link" href="#" disabled>Previous</a></li>
          }
          {
            props.pagination[1] ?
              <li className="page-item"><a className="page-link" href={props.pagination[1]}>Next</a></li>
            :
              <li className="page-item"><a className="page-link" href="#" disabled>Next</a></li>
          }
        </ul>
      </nav> */}
    </div>
    </>
  )
}

export default Posts
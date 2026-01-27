import {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { getTimeAgo } from '../Methods/TimestampCalculation';
import PostEdit from '../Components/PostEdit';
import "../CSS/App.css"

const Posts = (props) => {
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [pagination, setPagination] = useState(props.pagination || null);
  const [socialPosts, setSocialPosts] = useState(props.paginatedDataResults?.socialPosts || []);

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const backendUrl = `${backendDomain}/social/posts/`;
  const defaultImage = (gender) => {
    return `${backendDomain}/static/user_profile_images/default-avatar-${gender}.png`;
  };
  const getHighlightedText = props.getHighlightedText ? props.getHighlightedText : false;

  const updateStatus = (data) => {
    setStatus(data.status);
    setStatusMessage(data.message);
  }

  const deletePost = async (postId) => {
    props.setError(null);

    try {
      const config = {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json"
        }
      };
      const response = await axios.delete(backendUrl,
        {
          data: {postId: postId},
          headers : config["headers"]
        }
      );
      if (response.status === 200){
      } else {
        updateStatus({status: "danger", message: "Facing error while deleting the post: " + response.status});
      }
    } catch (err) {
      props.setError(err);
    }
  };

  const PageData = async (url) => {
    setSocialPosts([]);
    setPagination([]);
    const config = {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json"
        }
      };
    try {
      const response = await axios.get(
        url,
        config
      );
      let responseData = response.data;
      let searchPage = !getHighlightedText === false;
      let paginatedData = searchPage ? responseData.posts : responseData;

      setPagination(paginatedData);
      setSocialPosts(paginatedData.results.socialPosts);

    } catch (err) {
      console.log("Error with request " + err);
    }
  };

  const navigate = useNavigate();
  const handleClick = (e) => {
      navigate(`/dashboard/${e.target.id}`, { state: { onclick: true } });
  };

  return (
    <>
    <div className="container">
      {statusMessage && (
        <div className={`alert alert-${status} mt-3`} role="alert">
            {statusMessage}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      )}
      { socialPosts.length < 1 ? (
        <div className="mt-4 text-center">
          <p>No Posts To Display</p>
        </div>
      ) : (
        socialPosts.map((post, index) => (
            <div className="post-container mt-4 shadow-sm" id={`div-${post.id}`} key={index}>
              <div className="post-header mb-3">
                <div className="d-flex align-items-center">
                  <img src={`${post.user_profile_image ? post.user_profile_image : defaultImage(post.gender)}`}
                    alt="Profile" className="avatar me-3"/>
                  <div className="flex-grow-1">
                    {post.first_name && post.last_name ? (
                      <>
                      <div className="d-flex align-items-center">
                        <h5 id={post.user_id} onClick={handleClick} className="profileView mb-0 fw-bold truncate-text">
                            {post.first_name + " " +post.last_name}
                        </h5>
                      </div>
                      <div className="username truncate-text">@{post.username}</div>
                      </>
                    ) : (
                      <>
                      <div className="d-flex align-items-center">
                        <h5 id={post.user_id} onClick={handleClick} className="profileView mb-0 fw-bold truncate-text">
                            {post.username}
                        </h5>
                      </div>
                      </>
                    )}
                  </div>
                  { props.permissionToDelete || post.same_user ?(
                    <>
                    <button id={post.id} className='svgButton' data-bs-toggle="modal" data-bs-target={`#modal-${post.id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                    <div className="modal fade" id={`modal-${post.id}`} tabIndex="-1" aria-hidden="true">
                      <div className="modal-dialog modal-dialog-centered">
                          <div className="modal-content custom-confession-modal">
                              <div className="modal-body text-center p-4">
                                  <h5 className="modal-title mb-3">Destroy this post?</h5>
                                  <p className="text-muted">This action is permanent. This post will vanish forever.</p>
                                  
                                  <div className="d-flex gap-2 justify-content-center mt-4">
                                      <button type="button" className="btn-ghost" data-bs-dismiss="modal">Keep it</button>
                                      {/* 3. Pass the post ID to the delete function */}
                                      <button 
                                          type="button" 
                                          onClick={() => deletePost(post.id)} 
                                          className="btn-amber"
                                          data-bs-dismiss="modal"
                                      >
                                          Burn it
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                    </>
                  ) : ""
                  }
                </div>
              </div>

              <div className="post-body">
                {
                  post.imageurl ?
                    <div className="postImageContainer">
                      <img
                        src={`${post.imageurl}`}
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
                  paginatedDataResults={props.paginatedDataResults}
                  getHighlightedText={getHighlightedText}
                  postTimeline={getTimeAgo(post.created_at_str)}
                />
              </div>
            </div>
        )) )
      }
      {
        pagination && pagination.total_pages > 1 ?
          <nav aria-label="Page navigation example" className="d-flex justify-content-center mt-5">
            <ul className="pagination">
              <li className="page-item">
                <a className={`page-link ${!pagination.previous ? "disabledButton" : ""}`}
                  href="#"
                  onClick={(e) => {
                      if (!pagination.previous) {
                        e.preventDefault();
                        return false;
                      }
                      PageData(pagination.previous);
                    }}
                >
                  Previous
                </a>
              </li>
              {
                pagination.pages && pagination.pages.length > 2 ? (
                  pagination.pages.map((item, index) => (
                    <li key={index} className="page-item">
                      <a
                        className={`page-link ${item.is_current ? "disabledButton" : ""}`}
                        href="#"
                        aria-current={item.is_current ? "page" : undefined}
                        disabled={item.is_current}
                        onClick={(e) => {
                          if (item.is_current) {
                            e.preventDefault();
                            return false;
                          }
                          PageData(item.url);
                        }}
                      >
                        {item.page}
                      </a>
                    </li>
                  ))
                ) : (
                  ""
                )
              }
              <li className="page-item">
                <a className={`page-link ${!pagination.next ? "disabledButton" : ""}`}
                  href="#"
                  onClick={(e) => {
                      if (!pagination.next) {
                        e.preventDefault();
                        return false;
                      }
                      PageData(pagination.next);
                    }}
                >
                  Next
                </a>
              </li>
            </ul>
          </nav>
        :
          ""
      }
    </div>
    </>
  )
}

export default Posts
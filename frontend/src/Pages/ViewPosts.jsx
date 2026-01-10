import {useState, useEffect} from 'react'
import axios from "axios";
import { getTimeAgo } from '../Methods/TimestampCalculation';
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import PostEdit from '../Components/PostEdit';
import "../CSS/App.css"

export default function ViewPosts() {
  const [getPostsData, setGetPostsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const config = LocalStorageVariables("config");

  const updateStatus = (props) => {
    setStatus(props.status);
    setStatusMessage(props.message);
  }

  const deletePost = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.delete(`${backendUrl}/social/social-posts/`,
        {
          data: {postId: e.currentTarget.id},
          headers : config["headers"]
        }
      );
      if (response.status === 200){
        window.location.href = "/view-posts";
      } else {
        alert("Facing error while deleting the post: "+ response.status);
        window.location.href = "/view-posts";
      }
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

   useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/social/social-posts/`, config);
        setGetPostsData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;

  const socialPosts = JSON.parse(getPostsData.socialPosts);
  const isUserAdmin = getPostsData.isUserAdmin;

  return (
    <>
    <h3 className='fs-3'>All Posts</h3>
    <div className="container">
      {statusMessage && (
        <div className={`alert alert-${status}`} role="alert">
            {statusMessage}
        </div>
      )}
      { socialPosts.length < 1 ? (
        <div className="mt-4 text-center">
          <p>No Posts To Display</p>
        </div>
      ) :(
        socialPosts.map((post, index) => (
            <div className="post-container mt-4 shadow-sm" key={index}>
              <div className="post-header">
                <div className="d-flex align-items-center">
                  <img src={`${backendUrl}/media/${ post.user__userprofile__image}`}
                    alt="Profile" className="avatar me-3"/>
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center">
                        {
                          post.user__first_name && post.user__last_name ?
                          <h5 className="mb-0 fw-bold">{post.user__first_name} {post.user__last_name}</h5>
                          :
                          "No fullname!"
                        }
                    </div>
                    <div className="timestamp">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-pin-angle-fill" viewBox="0 0 16 16">
                        <path d="M9.828.722a.5.5 0 0 1 .354.146l4.95 4.95a.5.5 0 0 1 0 .707c-.48.48-1.072.588-1.503.588-.177 0-.335-.018-.46-.039l-3.134 3.134a6 6 0 0 1 .16 1.013c.046.702-.032 1.687-.72 2.375a.5.5 0 0 1-.707 0l-2.829-2.828-3.182 3.182c-.195.195-1.219.902-1.414.707s.512-1.22.707-1.414l3.182-3.182-2.828-2.829a.5.5 0 0 1 0-.707c.688-.688 1.673-.767 2.375-.72a6 6 0 0 1 1.013.16l3.134-3.133a3 3 0 0 1-.04-.461c0-.43.108-1.022.589-1.503a.5.5 0 0 1 .353-.146"/>
                      </svg>
                      &nbsp; {getTimeAgo(post.created_at_str)}
                    </div>
                    <div className="username">@{post.user__username}</div>
                  </div>
                  { isUserAdmin ?
                    <button id={post.id} className='svgButton' onClick={deletePost}><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash3" viewBox="0 0 16 16">
                      <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                    </svg></button>
                  : ""
                  }                  
                </div>
              </div>

              <div className="post-body">
                {
                  post.imageurl ?
                    <div className="postImageContainer">
                      <img
                        src={`${backendUrl}/media/${post.imageurl}`}
                        alt="Post Image"
                        className="postImage me-3"
                      />
                    </div>
                  :
                    ""
                }
                <PostEdit
                  post={post}
                  updateStatus={updateStatus}
                  getPostsData={getPostsData}
                />
              </div>
            </div>
        )) )
      }
    </div>
    </>
  )
}

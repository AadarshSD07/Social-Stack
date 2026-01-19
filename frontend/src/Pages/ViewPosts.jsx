import {useState, useEffect} from 'react'
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import Posts from "./Posts";
import axios from 'axios';

export default function ViewPosts() {
  const [getPostsData, setGetPostsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevUrl, setPrevUrl] = useState("");
  const [nextUrl, setNextUrl] = useState("");

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const backendUrl = `${backendDomain}/social/posts/?page=1&page_size=45`;
  const config = LocalStorageVariables("config");
  const postEditingPermission = false;
  const permissionToDelete = getPostsData.isUserAdmin;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          backendUrl,
          config
        );
        setGetPostsData(response.data.results);
        setPrevUrl(response.data.previous ? response.data.previous : "");
        setNextUrl(response.data.next ? response.data.next : "");
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

  return (
    <>
    <div className='mt-4 pb-5'>
      <h3 className='fs-3 text-center'>All Posts</h3>
      <Posts
        pageTitle={"viewposts"}
        postEditingPermission={postEditingPermission}
        getPostsData={getPostsData}
        permissionToDelete={permissionToDelete}
        loading={loading}
        setLoading={setLoading}
        error={error}
        setError={setError}
        pagination={[prevUrl, nextUrl]}
      />
    </div>
    </>
  )
}

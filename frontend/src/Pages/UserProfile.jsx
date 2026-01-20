import {useState, useEffect} from 'react';
import axios from 'axios';
import DashboardProfile from '../Components/DashboardProfile';
import Posts from "./Posts";

export default function UserProfile() {
  const [getPostsData, setGetPostsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prevUrl, setPrevUrl] = useState("");
  const [nextUrl, setNextUrl] = useState("");
  const [userInfo, setUserInfo] = useState({});

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  let userDashboard = window.location.pathname.replace("/dashboard/", "");
  let backendUrl = `${backendDomain}/social/dashboard/${userDashboard}/`;
  const postEditingPermission = true;
  const permissionToDelete = getPostsData ? getPostsData.permissionToDelete : false;

  useEffect(() => {
    const fetchPosts = async () => {
      const config = {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
            "Content-Type": "application/json"
        }
      };
      try {
        setLoading(true);
        const response = await axios.get(
          backendUrl,
          config
        );
        setGetPostsData(response.data);
        setUserInfo(response.data.results.userDashboardInformation);
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

  if (loading || !getPostsData) return <div>Loading posts...</div>;

  return (
    <>
    <DashboardProfile
        userInfo={userInfo}
        backendDomain={backendDomain}
        getPostsData={getPostsData}
    />
    <Posts
      pageTitle={"dashboard"}
      postEditingPermission={postEditingPermission}
      getPostsData={getPostsData.results}
      permissionToDelete={permissionToDelete}
      loading={loading}
      setLoading={setLoading}
      error={error}
      setError={setError}
      pagination={[prevUrl, nextUrl]}
    />
    </>
  )
}

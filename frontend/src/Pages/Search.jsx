import { useState } from "react";
import axios from "axios";
import Posts from "./Posts";
import LocalStorageVariables from "../Methods/LocalStorageVariables";

const Search = () => {
    const [error, setError] = useState(null);
    const [getPostsData, setGetPostsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [socialPosts, setSocialPosts] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchedUsers, setSearchedUsers] = useState([]);
    const [totalResponseUsers, setTotalResponseUsers] = useState(0);
    const [totalResponsePosts, setTotalResponsePosts] = useState(0);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const config = LocalStorageVariables("config");
    const permissionToDelete = getPostsData.permissionToDelete ? getPostsData.permissionToDelete : false;
    const postEditingPermission = true;

    const handleSubmit = async (e) => {
        e.preventDefault();
        return await Submit(e)
    }

    const Submit = async (e) => {
        let searchLetter = e.target.value
        setSocialPosts([]);
        setSearchedUsers([]);
        setSearchText(searchLetter);
        if (!searchLetter) {
            return
        }

        try {
            const response = await axios.get(
                `${backendDomain}/social/search/${searchLetter}/`,
                config
            );
            if (response.status === 200){
                setTotalResponseUsers(response.data.users.length);
                setTotalResponsePosts(response.data.posts.socialPosts.length);
                setSearchedUsers(response.data.users);
                setGetPostsData(response.data.posts);
                setSocialPosts(response.data.posts.socialPosts);
            }

        } catch (err) {
            console.log("Error with request " + err);
        }
    };

    const getHighlightedText = (text) => {
        if (!searchText.trim()) return text;

        // Split text on searchText term, preserving case using a capturing group (i for case-insensitive)
        const parts = text.split(new RegExp(`(${searchText})`, 'gi'));

        return (
            <span>
            {parts.map((part, index) =>
                part.toLowerCase() === searchText.toLowerCase() ? (
                    <mark key={index} className="highlighted-text">{part}</mark>
                ) : (
                    part
                )
            )}
            </span>
        );
    };

    if (loading) return <div>Loading ...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <>
        <form className="d-flex mb-3 w-75 mt-4">
            <input id='search' className="form-control me-2" onChange={Submit} type="search" placeholder="Search" aria-label="Search"
                onKeyDown={(e) => {
                    // Check for Enter key
                    if (e.key === 'Enter') {
                        handleSubmit(e);
                    }
                }}
            />
        </form>
        <div className="post-container2 p-3 mb-3 w-75">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <p className="form-label fs-3">Users</p>
                </div>
                <p className="form-label fs-6 text-primary">
                    {totalResponseUsers > 0 && `${totalResponseUsers} search${totalResponseUsers > 1 ? 'es' : ''}`}
                </p>
            </div>
            <div className="container">
                { searchedUsers.length < 1 ? (
                    <div className="mt-4 text-center">
                        <p>No Users</p>
                    </div>
                ) :(
                    searchedUsers.map((user, index) => (
                        <div className="post-container mt-3 shadow-lg" key={index}>
                            <div className="post-header2">
                                <div className="d-flex align-items-center">
                                    <img src={`${backendDomain}/media/${ user.profile_image}`} alt="Profile" className="avatar me-3"/>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center">
                                            {
                                            user.first_name && user.last_name ?
                                                <h5 className="mb-0 fw-bold truncate-text">{getHighlightedText(user.first_name)} {getHighlightedText(user.last_name)}</h5>
                                            :
                                                "No fullname!"
                                            }
                                        </div>
                                        <div className="username truncate-text">@{getHighlightedText(user.username)}</div>
                                    </div>
                                    <button id={user.id} className='btn btn-primary'>Profile</button>
                                </div>
                            </div>
                        </div>
                    )) )
                }
            </div>
            
        </div>
        <div className="post-container2 p-3 mb-3 w-75">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <p className="form-label fs-3">Posts</p>
                </div>
                <p className="form-label fs-6 text-primary">
                    {totalResponsePosts > 0 && `${totalResponsePosts} search${totalResponsePosts > 1 ? 'es' : ''}`}
                </p>
            </div>
            {
                socialPosts.length < 1 ? (
                    <div className="mt-4 text-center">
                        <p>No Posts</p>
                    </div>
                ) : (
                    <Posts
                        pageTitle={"dashboard"}
                        postEditingPermission={postEditingPermission}
                        getPostsData={getPostsData}
                        permissionToDelete={permissionToDelete}
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                        getHighlightedText={getHighlightedText}
                        pagination={[null, null]}
                    />
                )
            }
        </div>
        </>
    )
}

export default Search

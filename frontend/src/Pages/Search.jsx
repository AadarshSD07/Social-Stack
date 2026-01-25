import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Posts from "./Posts";

const Search = () => {
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [paginatedData, setPaginatedData] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [searchedUsers, setSearchedUsers] = useState([]);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const postsPerPage = import.meta.env.VITE_POSTS_PER_PAGE;
    const postEditingPermission = true;
    const defaultImage = `${backendDomain}/static/user_profile_images/default-user-image.png`;

    // Regex patterns to BLOCK (common malicious patterns)
    const BLOCKED_PATTERNS = [
        // ✅ BLOCKS: Numbers (123, asd123)
        /\d/,
        // ✅ BLOCKS: ALL special characters (!@#$%^&*()=-+][{}\|:;'"<>?/.)
        /[!@#$%^&*()_=\[\]{}|\\:;"'<>?\/.,~`+-]/,
        // ✅ Simple: Any non-alphabet character
        /[^a-zA-Z]/
    ];

    const isRegexPattern = (text) => {
        return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isRegexPattern(e.target.value)) {
            e.preventDefault();
            setError('❌ Regex patterns are not allowed (/, *, numbers only, etc.)');
            return;
        }
        return await Submit(e)
    }

    const Submit = async (e) => {
        let searchLetter = e.target.value;
        setSearchedUsers([]);
        setSearchText(searchLetter);
        setPaginatedData([]);
        if (searchLetter && isRegexPattern(searchLetter)) {
            setError('❌ Regex patterns are not allowed (/, *, numbers only, etc.)');
            return;
        } else {
            setError('');
        }
        if (!searchLetter) {
            return;
        }

        try {
            const config = {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
                    "Content-Type": "application/json"
                }
            };
            const response = await axios.get(
                `${backendDomain}/social/search/${searchLetter}/?page=1&page_size=${postsPerPage}`,
                config
            );
            if (response.status === 200){
                setPaginatedData(response.data.posts);
                setSearchedUsers(response.data.users);
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

    const navigate = useNavigate();
    const handleClick = (e) => {
        navigate(`/dashboard/${e.target.id}`, { state: { onclick: true } });
    };

    if (loading) return <div>Loading ...</div>;

    return (
        <>
        <form className="mb-3 w-75 mt-4">
            <input
                id='search'
                className={`form-control me-2 ${error ? 'is-invalid' : ''}`}
                onChange={Submit}
                type="search"
                placeholder="Search"
                aria-label="Search"
                onKeyDown={(e) => {
                    // Check for Enter key
                    if (e.key === 'Enter') {
                        handleSubmit(e);
                    }
                }}
            />
            {error && (
                <div className="invalid-feedback d-block mt-1">
                    {error}
                </div>
            )}
        </form>
        <div className="post-container2 p-3 mb-3 w-75">
            <div className="d-flex align-items-center">
                <div className="flex-grow-1">
                    <p className="form-label fs-3">Users</p>
                </div>
                <p className="form-label fs-6 text-primary">
                    {searchedUsers.length > 0 && `${searchedUsers.length} search${searchedUsers.length > 1 ? 'es' : ''}`}
                </p>
            </div>
            <div className="container">
                { searchedUsers.length < 1 ? (
                    <div className="mt-4 text-center">
                        <p>No Users</p>
                    </div>
                ) :(
                    searchedUsers.map((user, index) => (
                        <div className="post-container mt-3 shadow-sm" key={index}>
                            <div className="post-header2">
                                <div className="d-flex align-items-center">
                                    <img src={`${user.imageUrl ? user.imageUrl :defaultImage}`} alt="Profile" className="avatar me-3"/>
                                    <div className="flex-grow-1">
                                        {
                                            user.first_name && user.last_name ? (
                                                <>
                                                <div className="d-flex align-items-center">
                                                    <h5 className="mb-0 fw-bold truncate-text">{getHighlightedText(user.first_name)} {getHighlightedText(user.last_name)}</h5>
                                                </div>
                                                <div className="username truncate-text">@{getHighlightedText(user.username)}</div>
                                                </>
                                            )
                                            :
                                                <div className="d-flex align-items-center">
                                                    <h5 className="mb-0 fw-bold truncate-text">{getHighlightedText(user.username)}</h5>
                                                </div>
                                            }
                                    </div>
                                    {/* <button id={user.id} className='btn btn-primary'>Profile</button> */}
                                    <button id={user.id} className='btn btn-primary' onClick={handleClick}>profile</button>
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
                    {paginatedData.count > 0 && `${paginatedData.count} search${paginatedData.count > 1 ? 'es' : ''}`}
                </p>
            </div>
            {
                paginatedData.length < 1 ? (
                    <div className="mt-4 text-center">
                        <p>No Posts</p>
                    </div>
                ) : (
                    <Posts
                        pageTitle={"dashboard"}
                        postEditingPermission={postEditingPermission}
                        paginatedDataResults={paginatedData.results}
                        permissionToDelete={paginatedData.results.permissionToDelete}
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                        getHighlightedText={getHighlightedText}
                        pagination={paginatedData}
                    />
                )
            }
        </div>
        </>
    )
}

export default Search

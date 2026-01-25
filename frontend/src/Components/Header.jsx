import {useState, useEffect , useContext, useRef} from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation} from 'react-router-dom';
import { ThemeContext } from '../ThemeContext';
import axios from "axios";
import ChangePassword from "../Pages/ChangePassword";
import CreatePosts from '../Pages/CreatePosts';
import Dashboard from '../Pages/Dashboard';
import Footer from './Footer';
import Login from '../Pages/Login';
import Profile from '../Pages/Profile';
import Register from '../Pages/Register';
import Search from '../Pages/Search';
import UserProfile from '../Pages/UserProfile';
import ViewPosts from '../Pages/ViewPosts';

const NavbarWithRouter = (props) => {
    const { theme, applyThemeWithTransition } = useContext(ThemeContext);
    const [getHeaderDetails, setHeaderDetails] = useState([]);
    const thumbRef = useRef(null);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const defaultImage = `${backendDomain}/static/user_profile_images/default-user-image.png`;
    const fetchLocation = useLocation();

    useEffect(() => {
        const userDetails = async () => {
            if (props.isAuthenticated) {
                const config = {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("access")}`,
                        "Content-Type": "application/json"
                    }
                };
                try {
                    const response = await axios.get(`${backendDomain}/header/`, config);
                    setHeaderDetails(response.data);
                } catch (err) {
                    console.error('Error:', err);
                }
            }
        };

        userDetails();
    }, []);

    const onToggle = (e) => {
        const nextTheme = theme === "light" ? "dark" : "light";
        applyThemeWithTransition(nextTheme, thumbRef.current);
    };


    if (!props.isAuthenticated) {
        if (!["/register","/login","/"].includes(fetchLocation.pathname)) {
            localStorage.setItem("redirectPath", fetchLocation.pathname);
            return <Navigate to="/" state={{ from: fetchLocation.pathname }} replace />;
        }

        return (
            <>
            <nav className="navbar navbar-expand-lg bg-header">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/static/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                        <label className="ccs-toggle me-3">
                            <input
                                id="theme-toggle"
                                type="checkbox"
                                className="toggle-checkbox"
                                checked={theme === "light"}
                                onChange={onToggle}
                            />
                            <span className="ccs-track">
                                <span className="ccs-thumb">
                                </span>
                            </span>
                        </label>
                        <div className='d-flex'>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    {fetchLocation.pathname === "/register" ? (
                                        <Link className="navbar-brand" to="/login">Login</Link>
                                    ) : (
                                        <Link className="navbar-brand" to="/register">Register</Link>
                                    )}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </nav>
            <div className='page-content'>
                <Routes>
                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="/login/*" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                </Routes>
            </div>
            </>
        );
    } else {
        if (["/register","/login"].includes(fetchLocation.pathname)) {
            localStorage.setItem("redirectPath", fetchLocation.pathname);
            return <Navigate to="/" state={{ from: fetchLocation.pathname }} replace />;
        }

        return (
            <>
            <nav className="navbar navbar-expand-lg bg-header">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/static/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                        { getHeaderDetails ?
                            <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                                <Link className="nav-link theme-text" to="/">👤Dashboard</Link>
                                {/* <Link className="nav-link" to={`/dashboard/${getHeaderDetails.userId}`}>👤Dashboard</Link> */}
                                <Link className="nav-link theme-text" to="/view-posts">📝View Posts</Link>
                                <Link className="nav-link theme-text" to="/create-posts">➕Create Post</Link>
                                <Link className="nav-link theme-text" to="/search">🔍Search</Link>
                            </nav>
                            : ""
                        }
                        <label className="ccs-toggle me-3">
                            <input
                                id="theme-toggle"
                                type="checkbox"
                                className="toggle-checkbox"
                                checked={theme === "light"}
                                onChange={onToggle}
                            />
                            <span className="ccs-track">
                                <span className="ccs-thumb">
                                </span>
                            </span>
                        </label>
                        <div className='d-flex'>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    <a className="truncate-text nav-link dropdown-toggle theme-text" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src={`${getHeaderDetails.user_image ? getHeaderDetails.user_image : defaultImage}`} alt="User" className="avatar me-3"/>
                                        {
                                            getHeaderDetails.fullName?.trim() ? (
                                                getHeaderDetails.fullName
                                            ) : (
                                                getHeaderDetails.username
                                            )
                                        }
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">👤Profile</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/change-password">🗝️Change Password</Link>
                                        </li>
                                        <li><a className="dropdown-item" href="#" onClick={() => props.logout()}>🚪{"Logout"}</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>
                        <ul className="mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                    </div>
                </div>
            </nav>
            <div className='page-content pb-5'>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    {/* <Route 
                        path="/" 
                        element={
                            <Navigate to={`/dashboard/${getHeaderDetails.userId}`} replace />
                        }
                    /> */}
                    <Route path="/dashboard/:userId" element={<UserProfile />} />
                    <Route path="/view-posts" element={<ViewPosts />} />
                    <Route path="/create-posts" element={<CreatePosts />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/search" element={<Search />} />
                </Routes>
            </div>
            < Footer />
            </>
        )
    }
};


export default function Header(props) {
    return (
        <>
        <BrowserRouter>
            <NavbarWithRouter
                isAuthenticated={props.isAuthenticated}
                logout={props.logout}
            />
        </BrowserRouter>
        </>
    )
}

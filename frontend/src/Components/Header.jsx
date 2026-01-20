import {useState, useEffect} from 'react'
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation} from 'react-router-dom';
import axios from "axios";
import ChangePassword from "../Pages/ChangePassword";
import CreatePosts from '../Pages/CreatePosts';
import Dashboard from '../Pages/Dashboard';
import LocalStorageVariables from '../Methods/LocalStorageVariables';
import Login from '../Pages/Login';
import Profile from '../Pages/Profile';
import Register from '../Pages/Register';
import Search from '../Pages/Search';
import ViewPosts from '../Pages/ViewPosts';

const NavbarWithRouter = (props) => {
    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const fetchLocation = useLocation();

    if (!props.isAuthenticated) {
        if (!["/register","/login","/"].includes(fetchLocation.pathname)) {
            localStorage.setItem("redirectPath", fetchLocation.pathname);
            return <Navigate to="/" state={{ from: fetchLocation.pathname }} replace />;
        }

        return (
            <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/media/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className='collapse navbar-collapse' id='navbarSupportedContent'>
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
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
            <nav className="navbar navbar-expand-lg bg-body-tertiary">
                <div className="container-fluid">
                    <a className="navbar-brand" href="/">
                        <img src={`${backendDomain}/media/logo/SSLNewShortSVG.png`}
                            className="img-fluid sslogo" alt="Sample image" />
                    </a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <span></span>
                        </ul>
                        { props.getHeaderDetails ?
                            <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                                <Link className="nav-link" to="/">👤Dashboard</Link>
                                <Link className="nav-link" to="/view-posts">📝View Posts</Link>
                                <Link className="nav-link" to="/create-posts">➕Create Post</Link>
                                <Link className="nav-link" to="/search">🔍Search</Link>
                            </nav>
                            : ""
                        }
                        <div className='d-flex'>
                            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                                <li className="nav-item dropdown">
                                    <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                        <img src={`${backendDomain}${props.getHeaderDetails.user_image}`} alt="User" className="avatar me-3"/>
                                        {props.getHeaderDetails.fullName}
                                    </a>
                                    <ul className="dropdown-menu">
                                        <li>
                                            <Link className="dropdown-item" to="/profile">👤Profile</Link>
                                        </li>
                                        <li>
                                            <Link className="dropdown-item" to="/change-password">🗝️Change Password</Link>
                                        </li>
                                        <li><hr className="dropdown-divider"/></li>
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
            <div className='page-content'>
                <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/view-posts" element={<ViewPosts />} />
                    <Route path="/create-posts" element={<CreatePosts />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/change-password" element={<ChangePassword />} />
                    <Route path="/search" element={<Search />} />
                </Routes>
            </div>
            </>
        )
    }
};


export default function Header(props) {
    const [getHeaderDetails, setHeaderDetails] = useState([]);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const config = LocalStorageVariables("config");

    useEffect(() => {
        const userDetails = async () => {
        try {
            const response = await axios.get(`${backendDomain}/header/`, config);
            setHeaderDetails(response.data);
        } catch (err) {
            console.error('Error:', err);
        }
        };
    
        userDetails();
    }, []);

    return (
        <>
        <BrowserRouter>
            <NavbarWithRouter
                getHeaderDetails={getHeaderDetails}
                isAuthenticated={props.isAuthenticated}
                logout={props.logout}
            />
        </BrowserRouter>
        </>
    )
}

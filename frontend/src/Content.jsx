import React, {useState, useEffect} from 'react'
import axios from "axios";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './Pages/Dashboard';
import CreatePosts from './Pages/CreatePosts';
import ViewPosts from './Pages/ViewPosts';
import Profile from './Pages/Profile';

function Content(props) {
    const [getHeaderDetails, setHeaderDetails] = useState([]);

    const access = localStorage.getItem("access");
    const config = {
        headers: {
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json'
        }
    }

    useEffect(() => {
        const userDetails = async () => {
        try {
            const response = await axios.get("http://127.0.0.1:8000/header/", config);
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
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
          <div className="container-fluid">
            <a className="navbar-brand" href="/">Social Stack</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                <span></span>
              </ul>
                { getHeaderDetails ?
              <nav className="navbar-nav me-auto mb-2 mb-lg-0">
                <Link className="nav-link" to="/">👤Dashboard</Link>
                <Link className="nav-link" to="/view_posts">📝View Posts</Link>
                <Link className="nav-link" to="/create_posts">➕Create Post</Link>
              </nav>
              : ""
              }
              <div className='d-flex'>
                <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                    <li className="nav-item dropdown">
                      <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                        <img src={`http://127.0.0.1:8000${getHeaderDetails.userImage}`} alt="User" className="avatar me-3"/>
                        {getHeaderDetails.fullName}
                      </a>
                      <ul className="dropdown-menu">
                        <li>
                          <Link className="dropdown-item" to="/profile">👤Profile</Link>
                        </li>
                        <li><a className="dropdown-item" href="#">Another action</a></li>
                        <li><hr className="dropdown-divider"/></li>
                        <li><a className="dropdown-item" href="#" onClick={() => props.logout()}>🚪{"Logout"}</a></li>
                      </ul>
                    </li>
                </ul>
              </div>
            </div>
          </div>
        </nav>
        <div className='page-content mt-4'>
          <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/view_posts" element={<ViewPosts />} />
              <Route path="/create_posts" element={<CreatePosts />} />
              <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
    </BrowserRouter>
    </>
  )
}

export default Content

import React, {useState, useEffect} from 'react'
import axios from "axios";
import Login from './Pages/Login'
import { jwtDecode } from 'jwt-decode';
import Content from './Content';
import './App.css'

const isTokenValid = (token) => {
  if (!token) return false;

  try {
    let currentDate = new Date();
    let decodedToken = jwtDecode(token);
    return decodedToken.exp * 1000 > currentDate.getTime()
  } catch(err) {
    return false
  }
};

const refreshAccessToken = async () => {
  try {
    const refresh = localStorage.getItem("refresh");
    if (!refresh) return false;
    
    const response = await axios.post("http://127.0.0.1:8000/auth/refresh/",
      {refreshToken: refresh}
    );

    if (response.data.access) {
        localStorage.setItem("access", response.data.access);
        return true;
      }
    return false;
  } catch (err) {
    localStorage.removeItem("refresh");
    localStorage.removeItem("access");
    console.error('Error refreshing token:', err);
    return false;
  }
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const access = localStorage.getItem("access");
  const config = {
    headers: {
      'Authorization': `Bearer ${access}`,
      'Content-Type': 'application/json'
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      // Check if tokens exist
      if (localStorage.length === 0 || !localStorage.getItem("access")) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      // Check if current token is valid
      if (isTokenValid(access)) {
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // Token expired, try to refresh
      const refreshed = await refreshAccessToken();
      setIsAuthenticated(refreshed);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    window.location.href = "/";
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  if (isAuthenticated){
    return (
      <>
      <Content logout={handleLogout} />
      </>
    )
  } 
  return (
    <>
    <Login />
    </>
  )
}

export default App

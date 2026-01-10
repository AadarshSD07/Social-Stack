import {useState, useEffect} from 'react'
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import Header from './Components/Header';
import LocalStorageVariables from './Methods/LocalStorageVariables';
import './CSS/App.css'

const backendUrl = import.meta.env.VITE_BACKEND_URL;

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

const removeAccessRefresh = () => {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

const refreshAccessToken = async () => {
  try {
    const refresh = LocalStorageVariables("refresh");
    if (!refresh) return false;
    
    const response = await axios.post(`${backendUrl}/auth/refresh/`,
      {refresh: refresh}
    );

    if (response.data.access) {
      localStorage.setItem("access", response.data.access);
      return true;
      }
    return false;
  } catch (err) {
    removeAccessRefresh();
    console.error('Error refreshing token:', err);
    return false;
  }
}



function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const access = LocalStorageVariables("access");

  useEffect(() => {
    const checkAuth = async () => {
      // Check if tokens exist
      if (localStorage.length === 0 || !localStorage.getItem("access", null)) {
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
    removeAccessRefresh();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <>
    <Header logout={handleLogout} isAuthenticated={isAuthenticated}/>
    </>
  )
}

export default App

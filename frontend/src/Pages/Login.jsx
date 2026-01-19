import { useState } from "react";
import {Routes, Route, Link, redirect} from 'react-router-dom';
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const redirectPath = localStorage.getItem("redirectPath");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        `${backendDomain}/auth/login/`,
        {
          username: username,
          password: password,
        }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      window.location.href = redirectPath ? redirectPath: "/";

    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <div className='post-container p-3 shadow-lg field-width mt-4 pb-5'>
      <p className="text-center pt-4 fs-1">Login</p>
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <div className="form-group mt-2">
          <label className="fw-semibold" htmlFor="username">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control shadow-sm"
            placeholder="username" id="username" minLength="3" maxLength="150" disabled={loading} required />
        </div>
        
        <div className="form-group mt-2">
          <label className="fw-semibold" htmlFor="password">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control shadow-sm" 
            placeholder="password" id="password" minLength="8" disabled={loading} required />
          <small className="form-text text-muted">Password must be at least 8 characters long.</small>
        </div>
        
        <div className="d-flex justify-content-center mt-4 w-25 mx-auto">
          <button type="submit" className="login-button shadow mt-2" disabled={loading}>
            {loading ? 'SIGNING IN...' : 'SIGN IN'}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};

export default Login;

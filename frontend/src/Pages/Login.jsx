import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      setError(err.response.data.detail);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = async (credentialResponse) => {
    try {
      const res = await axios.post(`${backendDomain}/auth/google/`, {
        token: credentialResponse.credential
      });

      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      window.location.href = "/";
    } catch (err) {
      console.error("Google login failed", err);
    }
  };

  return (
    <>
    <div className='post-container p-3 shadow-sm field-width mt-4 pb-5'>
      <h2 className="pt-4 fw-bold">Welcome back</h2>
      <p className="text-muted pb-1">Please enter your details</p>
      <form className="mb-4" onSubmit={handleSubmit}>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
            <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
          </div>
        )}
        
        <div className="form-group mt-2">
          <label className="fw-semibold" htmlFor="username">Username</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control shadow-sm"
            placeholder="username" id="username" minLength="3" maxLength="150" disabled={loading} required />
        </div>
        
        <div className="form-group mt-2">
          <label className="fw-semibold" htmlFor="password">Password</label>
          <div className="input-group shadow-sm">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="password"
              id="password"
              minLength="8"
              disabled={loading}
              required
            />

            <button type="button" className="btn btn-outline-secondary" onClick={() => setShowPassword(!showPassword)} disabled={loading} tabIndex={-1} >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-eye" viewBox="0 0 16 16">
                <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
                <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
              </svg>
            </button>
          </div>

          <small className="form-text text-muted">Password must be at least 8 characters long.</small>
        </div>
        
        <div className="d-flex justify-content-center mt-4 mx-auto">
          <button type="submit" className="login-button shadow mt-2" disabled={loading}>
            {loading ? 'LOGGING IN...' : 'LOGIN'}
          </button>
        </div>
      </form>
      <div>
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={() => console.log("Login Failed")}
        />
      </div>
    </div>
    </>
  );
};

export default Login;

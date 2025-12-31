import { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/auth/login/",
        {
          username: username,
          password: password,
        }
      );

      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      window.location.href = "/";
    } catch (err) {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <a className="navbar-brand" href="/">Social Stack</a>
        
      </div>
    </nav>
    <div className='page-content'>
      <h1 className="text-center pt-4">Login</h1>
      <div className='container-md py-3 w-25'>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}
          
          <div className="form-group mt-2">
            <label htmlFor="username">Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control"
            placeholder="Username" id="username" minLength="3" maxLength="150" disabled={loading} required />
          </div>
          
          <div className="form-group mt-2">
            <label htmlFor="password">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control" 
              placeholder="Password" id="password" minLength="8" disabled={loading} required />

            <small className="form-text text-muted">Password must be at least 8 characters long.</small>
          </div>
          
          <button type="submit" className="btn btn-primary mt-2" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
    </>
  );
};

export default Login;

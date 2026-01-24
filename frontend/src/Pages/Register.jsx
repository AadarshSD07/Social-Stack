import { useState } from "react";
import axios from "axios";

const Register = () => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [firstname, setFirstname] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(false);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        // Create FormData object
        const formData = new FormData();

        // Add text fields
        formData.append('username', username);
        formData.append('email', email);
        formData.append('first_name', firstname);
        formData.append('last_name', lastname);
        formData.append('password', password);

        try {
            // Step 1: Register the user
            const registrationResponse = await axios.post(
                `${backendDomain}/accounts/register/`,
                {
                    username: username,
                    email: email,
                    first_name: firstname,
                    last_name: lastname,
                    password: password
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            );

            console.log('Registration successful:', registrationResponse.data);

            // Step 2: Auto-login only if registration succeeded
            const loginResponse = await axios.post(
                `${backendDomain}/auth/login/`,
                {
                    username: username,
                    password: password,
                }
            );

            // Step 3: Store tokens
            localStorage.setItem('access', loginResponse.data.access);
            localStorage.setItem('refresh', loginResponse.data.refresh);

            // Step 4: Redirect or update UI
            window.location.href = "/";
        } catch (err) {
            setError(err.response.data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <div className='post-container p-3 shadow-lg field-width mt-4 pb-5'>
            <h1 className="text-center pt-4 fs-1">Register</h1>
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
                    <label className="fw-semibold" htmlFor="email">Email</label>
                    <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control shadow-sm"
                        placeholder="email" id="email" minLength="3" maxLength="150" disabled={loading} required />
                </div>

                <div className="form-group mt-2 row">
                    <div className="col-md-6">
                        <label className="fw-semibold form-label" htmlFor="firstname">
                        First Name
                        </label>
                        <input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="first name" required />
                    </div>
                    <div className="col-md-6">
                        <label className="fw-semibold form-label" htmlFor="lastname">
                        Last Name
                        </label>
                        <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="last name" required />
                    </div>
                </div>
                
                <div className="form-group mt-2">
                    <label className="fw-semibold" htmlFor="password">Create Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control shadow-sm" 
                        placeholder="password" id="password" minLength="8" disabled={loading} required />

                    <small className="form-text text-muted">Password must be at least 8 characters long.</small>
                </div>
                
                <div className="d-flex justify-content-center mt-4 w-50 mx-auto">
                    <button type="submit" className="register-button shadow mt-2" disabled={loading}>
                        {loading ? 'SIGNING UP...' : 'SIGN UP'}
                    </button>
                </div>
            </form>
        </div>
        </>
    )
}

export default Register

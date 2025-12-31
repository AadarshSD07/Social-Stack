import { useState } from "react";

export default function Profile() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [npassword, setNPassword] = useState("");

    const Submit = async (e) => {
        e.preventDefault();
        const access = localStorage.getItem("access");
        const config = {
        headers: {
        'Authorization': `Bearer ${access}`,
        'Content-Type': 'application/json'
        }
        };
        try {
        const response = await axios.post(
            "http://127.0.0.1:8000/accounts/update-password/",
            {
                username: username,
                password: password,
                npassword: npassword
            },
            config
        );
        if (response.status === 200){
            setUsername("");
            setPassword("");
            window.location.href = "/";
        }

        } catch (err) {
        alert(err);
        console.log("Error with request");
        }
    }

    return (
        <>
        <div className="w-25">
            <form onSubmit={Submit}>
            <div className="mb-3">
                <label htmlFor="username" className="form-label">
                Username
                </label>
                <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control shadow-sm" 
                placeholder="username" />
            </div>
            <div className="mb-3">
                <label htmlFor="password" className="form-label">
                Old Password
                </label>
                <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} className="form-control shadow-sm" 
                placeholder="password" />
            </div>
            <div className="mb-3">
                <label htmlFor="npassword" className="form-label">
                New Password
                </label>
                <input id="npassword" value={password} onChange={(e) => setNPassword(e.target.value)} className="form-control shadow-sm" 
                placeholder="password" />
            </div>
            <button type="submit" className="btn btn-primary px-5">
                Change
            </button>
            </form>
        </div>
        </>
    )
}

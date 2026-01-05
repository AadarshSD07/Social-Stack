import { useState } from "react";
import LocalStorageVariables from "../Methods/LocalStorageVariables";
import axios from "axios";

export default function Profile() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [npassword, setNPassword] = useState("");

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const Submit = async (e) => {
        e.preventDefault();
        const config = LocalStorageVariables("config");
        try {
            const response = await axios.post(
                `${backendUrl}/accounts/change-user-password/`,
                {
                    username: username,
                    old_password: password,
                    new_password: npassword,
                    confirm_password: npassword
                },
                config
            );
            if (response.status === 200){
                setUsername("");
                setPassword("");
                window.location.href = "/";
            }

        } catch (err) {
            if (typeof(err.response.data) === "object") {
                let objKey = Object.keys(err.response.data)[0]
                let objVal = err.response.data[objKey][0].toLowerCase()
                alert("Error with the request, " + objKey.replace("_"," ") + " => " + objVal)
            } else {
                alert(err);
                console.log("Error with request");
            }
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
                 type="password" placeholder="password" />
            </div>
            <div className="mb-3">
                <label htmlFor="npassword" className="form-label">
                New Password
                </label>
                <input id="npassword" value={npassword} onChange={(e) => setNPassword(e.target.value)} className="form-control shadow-sm" 
                 type="password" placeholder="password" />
            </div>
            <button type="submit" className="btn btn-primary px-5">
                Change
            </button>
            </form>
        </div>
        </>
    )
}

import { useState } from "react";
import axios from "axios";

export default function ChangePassword() {
    const [password, setPassword] = useState("");
    const [npassword, setNPassword] = useState("");
    const [status, setStatus] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

    const Submit = async (e) => {
        e.preventDefault();
        const config = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
                "Content-Type": "application/json"
            }
        };
        try {
            const response = await axios.post(
                `${backendDomain}/accounts/change-user-password/`,
                {
                    old_password: password,
                    new_password: npassword,
                    confirm_password: npassword
                },
                config
            );
            if (response.status === 200){
                setPassword("");
                setStatus("success");
                setStatusMessage("Password changed successfully!");
            }

        } catch (err) {
            if (typeof(err.response.data) === "object") {
                let objKey = Object.keys(err.response.data)[0]
                let objVal = err.response.data[objKey][0].toLowerCase()
                setStatus("danger");
                console.log("Error with the request, " + objKey.replace("_"," ") + " => " + objVal);
                setStatusMessage(objVal);
            } else {
                alert(err);
                console.log("Error with request");
            }
        }
    }

    return (
        <>
        <div className="post-container p-3 shadow-sm field-width mt-4 pb-5">
            <form onSubmit={Submit}>
            {statusMessage && (
                <div className={`alert alert-${status}`} role="alert">
                    {statusMessage}
                    <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                </div>
            )}
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
            <button type="submit" className="btn shadow px-5">
                Change
            </button>
            </form>
        </div>
        </>
    )
}

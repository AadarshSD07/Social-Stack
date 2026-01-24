import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Profile() {
    const [status, setStatus] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [email, setEmail] = useState("");
    const [firstname, setFirstname] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [lastname, setLastname] = useState("");
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState("");

    const fileInputRef = useRef(null);

    const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
    useEffect(() => {
        const fetchUserDetails = async () => {
            const config = {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("access")}`,
                    "Content-Type": "application/json"
                }
            };
            try {
                const response = await axios.get(
                    `${backendDomain}/accounts/user-details/`,
                    config
                );
                if (response.status === 200){
                    setLoading(false);
                    setUsername(response.data["username"]);
                    setFirstname(response.data["first_name"]);
                    setLastname(response.data["last_name"]);
                    setEmail(response.data["email"]);
                    setImageUrl(response.data["imageUrl"]);
                } else {
                    setLoading(false);
                    alert("Status " + response.status.toString() + ": " + response.statusText.toString());
                }
            } catch (err) {
                setLoading(false);
                alert(err);
                console.log("Error with request");
            }
        }
        fetchUserDetails();
    }, []);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleImageRemoval = () => {
        setImageFile(null);
        setImagePreview('');
        fileInputRef.current.value = '';
    }

    const Submit = async (e) => {
        e.preventDefault();
        const formData = new FormData();

        formData.append('username', username);
        formData.append('first_name', firstname);
        formData.append('last_name', lastname);
        formData.append('email', email);

        const fileInput = fileInputRef.current;
        if (fileInput.files.length > 0) {
            formData.append('imageUrl', fileInput.files[0]);
        } else {
            formData.append('imageUrl', []);
        }

        const config = {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
                "Content-Type": "application/json"
            }
        };
        config["headers"]["Content-Type"] = "multipart/form-data";

        try {
            const response = await axios.post(
                `${backendDomain}/accounts/user-details/`,
                formData,
                config
            );
            if (response.status === 200){
                window.location.href = "/profile";
            }

        } catch (err) {
            setStatus("danger");
            setStatusMessage(err.response.data);
            console.log("Error with request: " + err);
        }
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
        {statusMessage && (
            <div className={`field-width alert alert-${status} mt-3`} role="alert">
                <div dangerouslySetInnerHTML={{ __html: statusMessage }} />
                <button 
                        type="button" 
                        className="btn-close" 
                        data-bs-dismiss="alert" 
                        aria-label="Close"
                        onClick={handleClose}
                    ></button>
            </div>
        )}
        <div className="post-container p-3 shadow-lg field-width mt-4 pb-5">
            <form onSubmit={Submit}>
                <div className="row">
                    <div className="col">
                        <div className="image-upload-container">
                            <div className="avatar-preview-container">
                                <div className="relative group d-flex justify-content-center mx-auto" onClick={handleAvatarClick}>
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview"
                                            className="avatar-profile w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : imageUrl ? (
                                        <img src={`${imageUrl}`} alt="User"
                                            className="avatar-profile w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="avatar-profile bg-gray-200 flex items-center justify-center cursor-pointer">
                                            <span className="text-gray-500">No Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="d-flex justify-content-center mx-auto">
                                    <input id="user_image" type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden ps-2 mt-4" />
                                </div>
                            </div>

                            {imageFile && (
                                <div className="mt-4 space-x-2">
                                    <button onClick={handleImageRemoval}
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" >
                                            Cancel
                                    </button>
                                </div>
                            )}

                            <p className="text-sm text-gray-500 mt-2 d-flex justify-content-center mt-4 w-100 mx-auto">
                                Click the image to upload a new profile picture
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <label htmlFor="username" className="form-label">
                        Username
                        </label>
                        <input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="form-control shadow-sm" 
                        placeholder="username" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <label htmlFor="firstname" className="form-label">
                        First Name
                        </label>
                        <input id="firstname" value={firstname} onChange={(e) => setFirstname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="first name" />
                    </div>
                    <div className="col">
                        <label htmlFor="lastname" className="form-label">
                        Last Name
                        </label>
                        <input id="lastname" value={lastname} onChange={(e) => setLastname(e.target.value)} className="form-control shadow-sm" 
                        type="text" placeholder="last name" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <label htmlFor="email" className="form-label">
                        Email
                        </label>
                        <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control shadow-sm" 
                        placeholder="email" />
                    </div>
                </div>
                <div className="mb-3 row">
                    <div className="col">
                        <button type="submit" className="btn btn-primary w-100" >
                            Change
                        </button>
                    </div>
                </div>
            </form>
        </div>
        </>
    )
}

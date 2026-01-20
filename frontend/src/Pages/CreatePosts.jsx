import { useState, useRef } from "react";
import axios from "axios";

export default function CreatePosts() {
  const [desc, setDesc] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const fileInputRef = useRef(null);
  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;

  // Handle image selection
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

  // Trigger file input click
  const handleAvatarClick = () => {
      fileInputRef.current.click();
  };

  // Handle image removal
  const handleImageRemoval = () => {
      setImageFile(null);
      setImagePreview('');
      fileInputRef.current.value = '';
  }

  const Submit = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
          "Authorization": `Bearer ${localStorage.getItem("access")}`,
          "Content-Type": "application/json"
      }
    };
    config["headers"]["Content-Type"] = "multipart/form-data";

    // Create FormData object
    const formData = new FormData();

    // Add text fields
    formData.append('desc', desc);

    // Add file if selected
    const fileInput = fileInputRef.current;
    if (fileInput.files.length > 0) {
        formData.append('imageUrl', fileInput.files[0]);
    } else {
        formData.append('imageUrl', []);
    }

    try {
      const response = await axios.post(
        `${backendDomain}/social/posts/`,
        formData,
        config
      );
      if (response.status === 201){
        setDesc("");
        setStatus("success");
        setStatusMessage(response.data.message);
        handleImageRemoval();
      }

    } catch (err) {
      setStatus("danger");
      setStatusMessage("Failure to create new post");
      console.log("Error with request " + err);
    }
  }

  return (
    <>
      <div className="w-75 mt-4 pb-5">
        <form onSubmit={Submit}>
          {statusMessage && (
            <div className={`alert alert-${status} mt-3`} role="alert">
                {statusMessage}
            </div>
          )}
          <div className="post-container p-3 mb-3 shadow-lg">
            <label htmlFor="desc" className="form-label fs-3">
              Create a New Post
            </label>

            <div className="image-upload-container">
              <div className="avatar-preview-container">
                  {/* Default/Current Image postImageContainer */}
                    {imagePreview ? (
                        // Show selected image preview
                        <div className="postImageContainer" onClick={handleAvatarClick}>
                          <img src={imagePreview} alt="Preview"
                              className="postImage me-3" />
                        </div>
                    ) : imageUrl ? (
                        // Show backend image if available
                        <div className="postImageContainer" onClick={handleAvatarClick}>
                          <img src={`${backendDomain}${imageUrl}`} alt="User"
                              className="postImage me-3" />
                        </div>
                    ) : (
                        // Fallback if no image
                        <span></span>
                    )}

                  {/* Hidden file input */}
                  <input id="user_image" type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
                  {/* Help text */}
                  <p className="text-sm text-gray-500 mt-2">
                      Click the image to upload a new profile picture
                  </p>
              </div>

              {/* Cancel button (only show when image is selected) */}
              {imageFile && (
                  <div className="mt-4 space-x-2">
                      <button onClick={handleImageRemoval}
                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors" >
                              Cancel
                      </button>
                  </div>
              )}
            </div>

            <textarea 
              id="desc" 
              value={desc} // ✅ Using lowercase 't'
              onChange={(e) => setDesc(e.target.value)} // ✅ Lowercase 't'
              className="form-control shadow mt-3" 
              placeholder='Write something...'
              required
            />
          <button type="submit" className="btn btn-primary px-5 mt-4 shadow">
            Post
          </button>
          </div>
        </form>
      </div>
    </>
  )
}
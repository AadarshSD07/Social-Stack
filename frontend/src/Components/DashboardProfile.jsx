import React from 'react'

const DashboardProfile = (props) => {
  const backendDomain = import.meta.env.VITE_BACKEND_DOMAIN;
  const defaultImage = `${backendDomain}/static/user_profile_images/default-user-image.png`;
  return (
    <div className="profile-container w-100 shadow-sm px-2">
      <div className="post-container mt-2 mb-2" id={`div-${props.userInfo.userId}`}>
        <div className="post-header mb-2">
          <div className="d-flex align-items-center justify-content-between w-100">

            {/* LEFT: Avatar + User Info */}
            <div className="d-flex align-items-center gap-3">

              <img
                src={props.userInfo.user_image ? props.userInfo.user_image : defaultImage}
                alt="Profile"
                className="dashboard-avatar"
              />

              <div>
                {props.userInfo.fullName?.trim() ? (
                  <>
                    <div className="fw-bold fs-5">
                      {props.userInfo.fullName}
                    </div>
                    <div className="text-muted small">
                      @{props.userInfo.username}
                    </div>
                  </>
                ) : (
                  <div className="fw-bold fs-5">
                    @{props.userInfo.username}
                  </div>
                )}

                <div className="text-muted small">
                  {props.userInfo.email}
                </div>
              </div>
            </div>

            {/* RIGHT: Post Count */}
            <div className="text-center px-3">
              <div className="fw-bold fs-4">
                {props.postsCount}
              </div>
              <div className="text-muted small">
                Posts
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardProfile

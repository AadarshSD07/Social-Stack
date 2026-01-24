import React from 'react'

const DashboardProfile = (props) => {
  return (
    <div className="profile-container shadow-lg w-100 px-2">
      <div className="post-container mt-2 mb-2" id={`div-${props.userInfo.userId}`}>
        <div className="post-header">
          <div className="d-flex align-items-center">

            <img src={`${props.userInfo.user_image}`}
              alt="Profile" className="dashboard-avatar me-3"/>

            <div className="flex-grow-1">

            {
              props.userInfo.fullName.trim() ? (
                <>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 fw-bold">{props.userInfo.fullName}</h2>
                  </div>
                  <div className="dashboard-username">@{props.userInfo.username}</div>
                </>
              ) : (
                <>
                  <div className="d-flex align-items-center">
                    <h2 className="mb-0 fw-bold">{props.userInfo.username}</h2>
                  </div>
                </>
              )
            }

            <div className='pt-5'>
              <div className='fs-5 fw-bold'>Posts</div>
              <div>{props.postsCount}</div>
            </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfile

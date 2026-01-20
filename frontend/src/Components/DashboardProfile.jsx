import React from 'react'

const DashboardProfile = (props) => {
  return (
    <div className="profile-container shadow-lg w-100 px-5">
      <div className="post-container mt-2 mb-2 px-5" id={`div-${props.userInfo.userId}`}>
        <div className="post-header">
          <div className="d-flex align-items-center">

            <img src={`${props.backendDomain}${props.userInfo.user_image}`}
              alt="Profile" className="dashboard-avatar me-3"/>

            <div className="flex-grow-1 px-3">

              <div className="d-flex align-items-center">
                <h2 className="mb-0 fw-bold truncate-text">{props.userInfo.fullName}</h2>
              </div>
              
              <div className="dashboard-username truncate-text">@{props.userInfo.username}</div>

              <div className='pt-5'>
                <div className='fs-5 fw-bold'>Posts</div>
                <div>{props.getPostsData.count}</div>
              </div>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardProfile

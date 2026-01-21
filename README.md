# 📱Social Media Project

A full-stack social media basic application built with Django backend and React frontend, featuring JWT authentication and Role-Based Access Control (RBAC). Now fully containerized with **Docker** for easy setup and deployment.

## ✨Features

### 🔐Authentication & Authorization
- JWT (JSON Web Token) based authentication
- Role-Based Access Control (RBAC) system with two roles:
  - **User**: Standard user with basic permissions
  - **Admin**: Elevated permissions for content moderation

### 👤User Capabilities
- Register and log in
- Create posts with descriptions and images
- View and manage own posts on the dashboard
- Edit post descriptions (within 1 hour of posting)
- View all posts from all users
- Like and comment on posts
- Search and filter posts
- Navigate to other users’ profile pages (merged with dashboard) via search
- Delete own posts

### 🛡️Admin Capabilities
- All user capabilities
- Delete posts of any user (content moderation)
- Manage inappropriate or unfit content

### 📂Application Sections
1. **Dashboard/User Profile** – Displays the logged-in user's posts and serves as the profile page for other users.
2. **View Posts** – Shows all posts from all users
3. **Create Post** – Form to create new posts with description and image fields
4. **Profile** – Form to update user details
5. **Change Password** – Form to change password using the previous password
6. **Search** – Searches users and posts by keyword and allows navigation to user dashboards

## 🛠️Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication

### Frontend
- React
- React Router
- Axios / Fetch

### Deployment
- Docker
- Docker Compose

## 📁Project Structure

```
project-root/
├── backend/          # Django backend application
├── frontend/         # React frontend application
├── docker-compose.yml # Docker Compose configuration
└── package.json      # Root package.json for concurrent server execution
```

## ⚙️Installation & Setup

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Build and run with Docker Compose**
   - First-time build:
     ```bash
     docker-compose up --build
     ```
   - Subsequent runs:
     ```bash
     docker-compose up
     ```

This will start both the **Django backend** and **React frontend** containers automatically.
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000` (or `http://localhost:5173` depending on config)

### Running Without Docker (Optional)
If you prefer manual setup:
- Backend:
  ```bash
  cd backend
  pip install -r requirements.txt
  python manage.py migrate
  python manage.py createsuperuser
  python manage.py runserver
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  npm start
  ```

## 📡API Endpoints

### Authentication
- `POST /auth/login/` – User login
- `POST /auth/refresh/` – Refresh JWT token

### Accounts
- `POST /accounts/register/` – Register a new user
- `GET/POST /accounts/user-details/` – Fetch or update user profile information
- `POST /accounts/change-user-password/` – Change user password

### Social
- `GET /social/posts/` – Get all posts
- `POST /social/posts/` – Create a new post
- `GET /social/dashboard/:id/` – Get a user’s dashboard (profile + posts)
- `DELETE /social/posts/:id/` – Delete a post (own posts for users, any post for admins)
- `POST /social/like/:id/` – Like a post
- `POST /social/comment/:id/` – Comment on a post
- `GET /social/search/<search_text>/` – Search users and posts by keyword, navigate to user dashboards

## 👥User Roles & Permissions

| Action                          | User | Admin |
|---------------------------------|------|-------|
| Create Post                     | ✓    | ✓     |
| View Own Posts                  | ✓    | ✓     |
| View All Posts                  | ✓    | ✓     |
| Edit Own Posts                  | ✓    | ✓     |
| Delete Own Posts                | ✓    | ✓     |
| Delete Any Post                 | ✗    | ✓     |
| Navigate to Other User Dashboards | ✓  | ✓     |

## 🔮Future Enhancements
- Dedicated user profile pages (expanded beyond dashboard)
- Real-time notifications
- Email verification

## 🤝Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜License
This project is licensed under the MIT License - see the LICENSE file for details.

## 📬Contact
For questions or support, please open an issue in the repository.
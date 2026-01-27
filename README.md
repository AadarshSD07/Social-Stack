# 📱 Confessions — Full-Stack Social Media Platform

**Confessions** is a full-stack basic social media application built with a **Django REST backend** and **React frontend**, featuring **JWT authentication**, **Google OAuth2 login**, **Role-Based Access Control (RBAC)**, **Cloudinary image storage**, and **light/dark theme support**.

The application is fully containerized using **Docker** and deployed using **Render (backend & database)** and **Vercel (frontend)**.

## 🚀 Live Demo
Frontend (Vercel): [https://theconfessions.vercel.app/](https://theconfessions.vercel.app/)
Backend API (Render): Hosted on Render (private API)

## 🧩 Architecture Overview
```
React (Vercel)
↓
Django REST API (Render)
↓
PostgreSQL (Render)
↓
Cloudinary (Media Storage)
```

- Frontend and backend are deployed independently
- Stateless backend using JWT authentication
- External media storage via Cloudinary

## ✨ Core Features

### 🔐 Authentication & Authorization
- JWT (JSON Web Token) based authentication
- **Google OAuth2 login support**
- Secure access & refresh token flow
- Role-Based Access Control (RBAC):
  - **User**: Standard user with basic permissions
  - **Admin**: Elevated permissions for content moderation

## 🔑 Google OAuth2 Authentication
Users can authenticate using their **Google account** directly from the login page.

### 🧭 Authentication Flow
```
Google ID Token
↓
Django Backend
↓
JWT Access + Refresh Tokens
↓
Stored in localStorage
↓
User Redirected to Dashboard
```

### 🛠️ Google OAuth2 Setup (Required)

1. Go to **Google Cloud Console**
   - https://console.cloud.google.com/

2. Create a **New Project**

3. Navigate to:
APIs & Services → OAuth Consent Screen

- Choose **External**
- Fill basic app information
- Add scopes: `email`, `profile`

4. Create OAuth Credentials:
APIs & Services → Credentials → Create Credentials → OAuth Client ID

- Application type: **Web Application**
- Authorized origins:
  ```
  http://localhost:5173
  https://theconfessions.vercel.app
  ```
- Authorized redirect URIs (if applicable)

5. Copy the **Client ID**

### 🔐 Required Environment Variable

```bash
GOOGLE_CLIENT_ID="your_google_client_id"
```

This Client ID is:
- Used in the React frontend for Google login
- Verified by Django backend before issuing JWT tokens

### 👤 User Capabilities
- Sign up and log in (email/password or Google OAuth)
- Create posts with images and descriptions
- View all posts from all users
- Like and comment on posts
- Search posts and users by keyword
- Navigate to other users’ dashboards
- Edit post descriptions **within 1 hour** of posting
- Delete own posts
- Manage profile information
- Change password securely

### 🛡️ Admin Capabilities
- All user privileges
- Delete posts from any user
- Manage inappropriate or unfit content

## ➕ Supporting Features

### 🎨 UI Enhancements
- **Light/Dark Theme Toggle** for improved accessibility and user experience

### ☁️ Cloudinary Integration
- Profile images and post images stored externally
- No local media storage dependency

- **Required environment variables:**:
  ```bash
  CLOUDINARY_URL="Cloudinary URL"
  CLOUD_NAME="Cloud name"
  API_KEY="API Key"
  API_SECRET="API Secret"
  ```  
- Learn more about Cloudinary [here](https://cloudinary.com/)

## 🔐 Authentication Flow
1. User logs in with credentials
2. Backend returns JWT access & refresh tokens
3. Frontend stores tokens securely
4. Access token is attached to protected API requests
5. Refresh token is used to obtain a new access token when expired

### 📂 Application Sections
1. **Dashboard/User Profile**
  Displays the logged-in user's posts and acts as a public profile for other users
2. **View Posts**
  Shows all posts from all users
3. **Create Post**
  Form to upload images and descriptions
4. **Profile**
  Update user details
5. **Change Password**
  Secure password update flow
6. **Search**
  Search users and posts and navigate to user dashboards

## 🛠️ Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- JWT Authentication
- Google OAuth2

### Frontend
- React
- React Router
- Axios / Fetch
- Google Identity Services

### Deployment & DevOps
- Docker & Docker Compose
- **Render (Backend & Database)**
- **Vercel (Frontend)**

## 📁 Project Structure

```
project-root/
├── backend/          # Django backend application
├── frontend/         # React frontend application
├── docker-compose.yml # Docker Compose configuration
└── package.json      # Root package.json for concurrent server execution in python
```

## ⚙️ Installation & Setup

### Prerequisites
- Docker
- Docker Compose

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Confessions
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

This starts:
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000` (or `http://localhost:5173` depending on config)

### Running Without Docker (Optional)
If you prefer manual setup:
- Backend:
  ```bash
  cd backend
  pip install -r requirements.txt
  python manage.py migrate
  python seed_roles_superuser.py
  python manage.py createsuperuser
  python manage.py runserver
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  npm start
  ```

## 🔌 API Endpoints

### Authentication
- `POST /auth/login/` – User login
- `POST /auth/refresh/` – Refresh JWT token
- `POST /auth/google/` – Authenticate and create new account using Google oauth2

### Accounts
- `POST /accounts/register/` – Register a new user
- `GET/POST /accounts/user-details/` – Fetch or update user profile information
- `POST /accounts/change-user-password/` – Change user password

### Social
- `GET /social/posts/` – Get all posts
- `POST /social/posts/` – Create a new post
- `GET /social/dashboard/{user_id}/` – Get a user’s dashboard (profile + posts)
- `DELETE /social/posts/{post_id}/` – Delete a post (own posts for users, any post for admins)
- `POST /social/like/{post_id}/` – Like a post
- `POST /social/comment/{post_id}/` – Comment on a post
- `GET /social/search/{query}/` – Search users and posts by keyword, navigate to user dashboards

## 👥 User Roles & Permissions

| Action                          | User | Admin |
|---------------------------------|------|-------|
| Create Post                     | ✓    | ✓     |
| View Own Posts                  | ✓    | ✓     |
| View All Posts                  | ✓    | ✓     |
| Edit Own Posts                  | ✓    | ✓     |
| Delete Own Posts                | ✓    | ✓     |
| Delete Any Post                 | ✗    | ✓     |
| Navigate to Other User Dashboards | ✓  | ✓     |

## �🔮 Future Enhancements
- Separate public profile pages (distinct from dashboards)
- Real-time notifications (WebSockets)
- Email verification & password recovery
- Improved moderation tools for admins

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License
This project is licensed under the MIT License.
See the [LICENSE](https://github.com/AadarshSD07/Confessions/blob/main/LICENSE/) file for details.

## 📬 Contact
For questions, feedback, or issues, please open an issue on GitHub.
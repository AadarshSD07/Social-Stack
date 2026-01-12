# Social Media Project

A full-stack social media basic application built with Django backend and React frontend, featuring JWT authentication and Role-Based Access Control (RBAC).

## Features

### Authentication & Authorization
- JWT (JSON Web Token) based authentication
- Role-Based Access Control (RBAC) system with two roles:
  - **User**: Standard user with basic permissions
  - **Admin**: Elevated permissions for content moderation

### Registration
- User can create an account from register page of website located alongside login page

### User Capabilities
- Create posts with descriptions and images
- View their own posts on the dashboard
- Edit their own post's description on dashboard which is posted less than an hour ago
- View all posts from any user
- Add comments or like any posts
- Post search and filtering
- Delete their own posts

### Admin Capabilities
- All user capabilities
- Delete posts of any user (content moderation)
- Manage inappropriate or unfit content

### Application Sections
1. **Dashboard**: Displays the logged-in user's posts
2. **View Posts**: Shows all posts from all users
3. **Create Post**: Form to create new posts with description field
4. **Profile**: Form to update user details
4. **Change Password**: Form to change password using previous password

## Tech Stack

### Backend
- Django
- Django REST Framework
- JWT Authentication

### Frontend
- React
- React Router (for navigation)
- Axios
- Fetch

## Project Structure

```
project-root/
├── backend/          # Django backend application
├── frontend/         # React frontend application
└── package.json      # Root package.json for concurrent server execution
```

## Installation

### Prerequisites
- Python 3.x
- Node.js and npm
- pip (Python package manager)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py createsuperuser  # Create admin user
   ```

4. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

## Running the Application

### Development Mode

From the root directory, run both servers concurrently:

```bash
npm run dev
```

This command will start:
- Django backend server (typically on `http://localhost:8000`)
- React frontend server (typically on `http://localhost:5143` or `http://localhost:3000`)

### Running Servers Separately

**Backend:**
```bash
cd backend
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token

### Posts
- `GET /social/social-posts/` - Get all posts
- `POST /social/user-posts/` - Create a new post
- `GET /social/user-posts/` - Get current user's posts
- `DELETE /social/user-posts/:id/` - Delete a post (own posts for users, any post for admins)

## User Roles & Permissions

| Action | User | Admin |
|--------|------|-------|
| Create Post | ✓ | ✓ |
| View Own Posts | ✓ | ✓ |
| View All Posts | ✓ | ✓ |
| Delete Own Posts | ✓ | ✓ |
| Delete Any Post | ✗ | ✓ |

## Future Enhancements

- User profile pages
- Real-time notifications
- Email verification

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

For questions or support, please open an issue in the repository.
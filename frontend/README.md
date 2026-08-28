# School Management System - Frontend

A modern React + Vite frontend for the School Management System with role-based authentication and a clean, production-ready architecture.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication with httpOnly cookies
  - Role-based access control (Admin, Teacher, Student)
  - Protected routes and middleware
  - Automatic token validation

- 🎨 **Modern UI**
  - Built with React and Tailwind CSS
  - Responsive design for all devices
  - Lucide React icons
  - Beautiful card-based layouts

- 🏗️ **Clean Architecture**
  - Organized folder structure
  - Centralized API services with Axios
  - Context API for global state
  - Custom hooks for common functionality
  - Reusable components

- 🚀 **Performance**
  - Vite for fast development and building
  - Code splitting with React Router
  - Optimized production builds

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ProtectedRoute.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   ├── Card.jsx
│   ├── Button.jsx
│   ├── FormInputs.jsx
│   ├── Alert.jsx
│   └── LoadingSpinner.jsx
├── pages/               # Page components
│   ├── LoginPage.jsx
│   ├── HomePage.jsx
│   ├── DashboardPage.jsx
│   ├── UnauthorizedPage.jsx
│   └── NotFoundPage.jsx
├── layouts/             # Layout components
│   ├── DashboardLayout.jsx
│   └── AuthLayout.jsx
├── services/            # API service files
│   ├── axios.js         # Axios instance with interceptors
│   ├── authAPI.js
│   ├── classAPI.js
│   ├── sectionAPI.js
│   ├── userAPI.js
│   ├── subjectAPI.js
│   ├── attendanceAPI.js
│   ├── examAPI.js
│   ├── resultAPI.js
│   └── timetableAPI.js
├── context/             # React Context
│   └── AuthContext.jsx
├── hooks/               # Custom hooks
│   └── useAuth.js
├── routes/              # Route definitions
│   └── index.jsx
├── App.jsx              # Main app component
├── main.jsx             # Entry point
└── index.css            # Tailwind & global styles
```

## Setup Instructions

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with your backend URL:
```bash
cp .env.example .env
```

Edit `.env` and set the API base URL:
```
VITE_API_BASE_URL=http://localhost:8000
```

### Development

Start the development server:
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Building

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Authentication Flow

1. **Login**: User submits email/password → Token stored in httpOnly cookie
2. **Session Check**: On app load, `AuthContext` validates existing session
3. **Protected Routes**: `ProtectedRoute` component checks authentication
4. **Role-Based Access**: Routes require specific roles (admin, teacher, student)
5. **Logout**: Token cleared from cookies, user redirected to login
6. **Token Expiration**: Automatic redirect to login on 401 response

## API Client

All API calls go through centralized service files using Axios:

```javascript
import userAPI from '../services/userAPI';

// Make API call
const response = await userAPI.getAllStudents();
```

The Axios instance includes:
- Base URL configuration
- Cookie-based authentication
- Request/response interceptors
- Error handling
- Automatic token validation

## Available Routes

### Public Routes
- `/` - Home page
- `/login` - Login page

### Protected Routes (Authenticated Users)
- `/dashboard` - Main dashboard

### Admin Routes
- `/students` - Student management
- `/teachers` - Teacher management
- `/classes` - Class management
- `/sections` - Section management
- `/subjects` - Subject management
- `/attendance` - Attendance records
- `/exams` - Exam management
- `/results` - Result management
- `/timetable` - Timetable management

### Teacher Routes
- `/attendance` - Mark attendance
- `/exams` - View exams
- `/results` - Add results
- `/timetable` - View personal timetable

### Student Routes
- `/attendance` - View attendance
- `/results` - View results
- `/timetable` - View timetable

## Components Documentation

### ProtectedRoute
Wraps routes that require authentication and/or specific roles:
```jsx
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

### useAuth Hook
Access authentication context in any component:
```jsx
const { user, isAuthenticated, isAdmin, login, logout } = useAuth();
```

### Form Components
Pre-built form inputs with validation:
```jsx
<Input label="Email" type="email" error={error} />
<Select label="Class" options={classes} />
<Textarea label="Description" />
```

### Alert Components
Display success/error messages:
```jsx
<ErrorAlert message="Something went wrong" onClose={handleClose} />
<SuccessAlert message="Success!" />
```

## Customization

### Styling
- Modify `tailwind.config.js` for colors and theme
- Global styles in `src/index.css`
- Utility classes defined for buttons, inputs, cards, etc.

### API Base URL
Change in `.env` file or environment variable:
```
VITE_API_BASE_URL=your_backend_url
```

### API Services
Add new API service in `src/services/`:
```javascript
// src/services/newAPI.js
import axiosClient from './axios';

const newAPI = {
  getAll: () => axiosClient.get('/api/endpoint'),
  // ... other methods
};

export default newAPI;
```

## Error Handling

The application handles errors globally:
- **401 Unauthorized**: Redirects to login
- **403 Forbidden**: Redirects to unauthorized page
- **Other Errors**: Displayed in alert components

## Next Steps

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Login with demo account
4. Build individual module pages as needed
5. Connect remaining API services

## Demo Accounts

The backend includes seeded admin accounts for testing. Check the backend documentation for credentials.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

ISC

## Support

For issues or questions, contact the development team.

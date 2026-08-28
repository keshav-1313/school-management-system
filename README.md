# 🎓 EduPulse - Smart School Management System

> **Smart School Management System**  
> A production-ready, full-stack enterprise School Management System built with **Node.js, Express, MongoDB, React 18, Vite, and Tailwind CSS**.

![EduPulse System Architecture](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite%20%7C%20Tailwind-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20MongoDB-339933?style=for-the-badge&logo=node.js)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 🌟 Overview

**EduPulse** is a modern SaaS-style School Management System designed to streamline academic operations, faculty oversight, student records, daily attendance tracking, examination grading, and weekly timetables. It features role-based access control (RBAC) with tailored portals for **Administrators, Teachers, and Students**.

---

## ✨ Key Features & Modules

### 📊 1. Admin & Role Dashboards
- **Multi-Role Portals**: Dedicated experiences for Admin, Teacher, and Student roles.
- **Metric Cards**: Real-time statistics on total students, teachers, active classes, and overall attendance rate.
- **Live System Feed**: Recent activity timeline tracking class submissions, exam score publications, and faculty onboarding.

### 🎓 2. Student Management
- Comprehensive student directory with roll numbers, class/section assignments, and contact records.
- Slide-over detail view, search/filtering, and modal-based creation/updating.

### 👨‍🏫 3. Teacher Management
- Faculty directory with qualifications, experience metrics, salary details, and subject assignments.
- Search and filter tools with real-time API integrations.

### 🏫 4. Classes, Sections & Subjects
- **Academic Hierarchy**: Class ➔ Section ➔ Students structure.
- Manage grade levels, assign section codes (A, B, C), and map course subjects to faculty teachers.

### 📅 5. Attendance Management
- Interactive daily class roster attendance interface (Present, Absent, Late toggles with optional remarks).
- Student attendance statistics and historical log reports.

### 📝 6. Exam & Result Management
- Examination scheduling with total marks, passing thresholds, and room assignments.
- Auto-calculated letter grades (A+ to F), GPA transcripts, and student report cards.

### 🗓️ 7. Timetable Management
- Weekly 6-day period schedule matrix (Monday to Saturday).
- Enforces time slot ordering (`startTime < endTime`) and checks for period overlaps.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, Axios, React Router v6 |
| **Backend** | Node.js, Express.js, MongoDB, Mongoose ORM |
| **Auth & Security** | JWT (JSON Web Tokens), Cookie Authentication, Bcrypt Password Hashing |
| **File Storage** | Cloudinary / Multer |
| **Email Service** | Mailtrap / Nodemailer |

---

## 📁 Repository Structure

```text
school-management-system/
├── backend/
│   ├── config/             # DB & Cloudinary connection setup
│   ├── controllers/        # API controllers (auth, student, teacher, class, attendance, exam, timetable, etc.)
│   ├── middleware/         # Auth, role-based protection & error handling
│   ├── models/             # Mongoose schemas & data models
│   ├── routes/             # RESTful Express route definitions
│   ├── utils/              # Admin seeder, token generator, email sender
│   ├── package.json
│   └── server.js           # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable UI components (Navbar, Sidebar, Toast, Modals, Cards, Tables)
    │   ├── context/        # Auth Context provider & JWT management
    │   ├── hooks/          # Custom hooks (useAuth)
    │   ├── layouts/        # Dashboard & Split-screen Auth Layouts
    │   ├── pages/          # App pages (HomePage, LoginPage, DashboardPage, StudentsPage, TimetablePage, etc.)
    │   ├── services/       # Centralized Axios API service layer
    │   └── routes/         # Protected & Public app routes
    ├── package.json
    └── tailwind.config.js
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas URI

---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment configuration file
cp .env.example .env   # Or create .env manually
```

Configure your `backend/.env` file:
```env
PORT=8000
FRONTEND_URL=http://localhost:3000
MONGO_URL=mongodb://localhost:27017/school_management_system
ADMIN_EMAIL=admin@school.com
ADMIN_PASSWORD=password
JWT_SECRET=your_jwt_secret_key
```

Seed initial Admin credentials and start backend server:
```bash
# Seed initial default admin user
npm run seed

# Run backend development server
npm run dev
```
The backend server will start on `http://localhost:8000`.

---

### 2. Frontend Setup

Open a new terminal window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run frontend development server
npm run dev
```
The application will launch on `http://localhost:3000`.

---

## 🔑 Default Demo Accounts

For quick-testing, use the built-in quick-fill demo buttons on the login page:

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@school.com` | `password` |
| **Faculty Teacher** | `teacher@school.com` | `password` |
| **Student** | `student@school.com` | `password` |

---

## 📝 License

Distributed under the **MIT License**. See `LICENSE` for more information.

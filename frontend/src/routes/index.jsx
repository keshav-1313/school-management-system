import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from '../components/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import { DashboardPage } from '../pages/DashboardPage';
import { StudentsPage } from '../pages/StudentsPage';
import { TeachersPage } from '../pages/TeachersPage';
import { ClassesPage } from '../pages/ClassesPage';
import { SectionsPage } from '../pages/SectionsPage';
import { SubjectsPage } from '../pages/SubjectsPage';
import { AttendancePage } from '../pages/AttendancePage';
import { ExamsPage } from '../pages/ExamsPage';
import { ResultsPage } from '../pages/ResultsPage';
import { TimetablePage } from '../pages/TimetablePage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route
                path="/login"
                element={
                    <PublicRoute>
                        <LoginPage />
                    </PublicRoute>
                }
            />

            {/* Protected Routes */}
            <Route
                path="/dashboard"
                element={
                    <ProtectedRoute>
                        <DashboardPage />
                    </ProtectedRoute>
                }
            />

            {/* Management Routes (Admin, Teacher, Student) */}
            <Route
                path="/students"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <StudentsPage />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/teachers"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <TeachersPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/classes"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <ClassesPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/sections"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <SectionsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/subjects"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <SubjectsPage />
                    </ProtectedRoute>
                }
            />

            {/* Shared Routes (Admin, Teacher, Student) */}
            <Route
                path="/attendance"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <AttendancePage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/exams"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <ExamsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/results"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <ResultsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/timetable"
                element={
                    <ProtectedRoute requiredRole={['admin', 'teacher', 'student']}>
                        <TimetablePage />
                    </ProtectedRoute>
                }
            />

            {/* Error Routes */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    );
};

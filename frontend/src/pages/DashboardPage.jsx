import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    Users,
    GraduationCap,
    UserCheck,
    Layers,
    BookOpen,
    ClipboardList,
    FileCheck,
    BarChart3,
    ArrowUpRight,
    Plus,
    RefreshCw,
    Calendar,
    Clock,
    Sparkles,
    CheckCircle2,
    XCircle,
    AlertCircle,
    TrendingUp,
    Shield,
    ChevronRight,
    Award
} from 'lucide-react';
import classAPI from '../services/classAPI';
import userAPI from '../services/userAPI';
import subjectAPI from '../services/subjectAPI';
import attendanceAPI from '../services/attendanceAPI';
import examAPI from '../services/examAPI';

export const DashboardPage = () => {
    const { user, isAdmin, isTeacher, isStudent } = useAuth();

    // Data States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [students, setStudents] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [exams, setExams] = useState([]);

    // Attendance State
    const [selectedClassId, setSelectedClassId] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [attendanceLoading, setAttendanceLoading] = useState(false);

    // Fetch All Dashboard Data from Backend APIs
    const fetchDashboardData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            if (isAdmin) {
                // Execute API calls in parallel
                const [studentsRes, teachersRes, classesRes, subjectsRes, examsRes] = await Promise.allSettled([
                    userAPI.getAllStudents(),
                    userAPI.getAllTeachers(),
                    classAPI.getAllClasses(),
                    subjectAPI.getAllSubjects(),
                    examAPI.getAllExams(),
                ]);

                const studentList = studentsRes.status === 'fulfilled' ? (studentsRes.value?.data?.students || []) : [];
                const teacherList = teachersRes.status === 'fulfilled' ? (teachersRes.value?.data?.teachers || []) : [];
                const classList = classesRes.status === 'fulfilled' ? (classesRes.value?.data?.classes || []) : [];
                const subjectList = subjectsRes.status === 'fulfilled' ? (subjectsRes.value?.data?.subjects || []) : [];
                const examList = examsRes.status === 'fulfilled' ? (examsRes.value?.data?.exams || []) : [];

                setStudents(studentList);
                setTeachers(teacherList);
                setClasses(classList);
                setSubjects(subjectList);
                setExams(examList);

                // Default attendance fetch for the first class if available
                if (classList.length > 0) {
                    const firstClassId = classList[0]._id;
                    setSelectedClassId(firstClassId);
                    try {
                        const attRes = await attendanceAPI.getAttendanceByClass(firstClassId);
                        setAttendanceData(attRes?.data?.attendance || []);
                    } catch (attErr) {
                        console.warn('Attendance fetch notice:', attErr);
                        setAttendanceData([]);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load dashboard data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Handle class selection change for Attendance Overview
    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        if (!classId) {
            setAttendanceData([]);
            return;
        }
        setAttendanceLoading(true);
        try {
            const res = await attendanceAPI.getAttendanceByClass(classId);
            setAttendanceData(res?.data?.attendance || []);
        } catch (err) {
            console.error('Error fetching attendance for class:', err);
            setAttendanceData([]);
        } finally {
            setAttendanceLoading(false);
        }
    };

    // Calculate Attendance Metrics
    const totalAttRecords = attendanceData.length;
    const presentCount = attendanceData.filter(a => a.status === 'present').length;
    const absentCount = attendanceData.filter(a => a.status === 'absent').length;
    const lateCount = attendanceData.filter(a => a.status === 'late').length;

    const presentPercentage = totalAttRecords > 0 ? ((presentCount / totalAttRecords) * 100).toFixed(1) : 0;
    const absentPercentage = totalAttRecords > 0 ? ((absentCount / totalAttRecords) * 100).toFixed(1) : 0;
    const latePercentage = totalAttRecords > 0 ? ((lateCount / totalAttRecords) * 100).toFixed(1) : 0;

    // Compute Class Distribution for Statistics
    const classDistribution = classes.map(c => {
        const studentCountInClass = students.filter(s => s.class?._id === c._id || s.class === c._id).length;
        const percentage = students.length > 0 ? Math.round((studentCountInClass / students.length) * 100) : 0;
        return {
            id: c._id,
            className: c.className,
            count: studentCountInClass,
            percentage,
        };
    });

    // Assemble Recent Activities from real backend entities
    const recentActivities = [
        ...students.map(s => ({
            id: `student-${s._id}`,
            type: 'student',
            title: `New Student Registered: ${s.user?.name || 'Student'}`,
            subtitle: `Class: ${s.class?.className || 'N/A'} • Roll #${s.rollNumber || 'N/A'}`,
            date: s.admissionDate || s.createdAt || new Date().toISOString(),
            icon: GraduationCap,
            badgeBg: 'bg-blue-50 text-blue-700',
        })),
        ...teachers.map(t => ({
            id: `teacher-${t._id}`,
            type: 'teacher',
            title: `Faculty Added: ${t.user?.name || 'Teacher'}`,
            subtitle: `Spec: ${t.subjectSpecialization || 'General'} • Exp: ${t.experience || 0} yrs`,
            date: t.joiningDate || t.createdAt || new Date().toISOString(),
            icon: UserCheck,
            badgeBg: 'bg-emerald-50 text-emerald-700',
        })),
        ...subjects.map(sub => ({
            id: `subject-${sub._id}`,
            type: 'subject',
            title: `Subject Created: ${sub.subjectName} (${sub.subjectCode})`,
            subtitle: `Class: ${sub.class?.className || 'N/A'}`,
            date: sub.createdAt || new Date().toISOString(),
            icon: BookOpen,
            badgeBg: 'bg-purple-50 text-purple-700',
        })),
        ...exams.map(ex => ({
            id: `exam-${ex._id}`,
            type: 'exam',
            title: `Exam Scheduled: ${ex.examName}`,
            subtitle: `Subject: ${ex.subject?.subjectName || 'N/A'} • Marks: ${ex.totalMarks}`,
            date: ex.examDate || ex.createdAt || new Date().toISOString(),
            icon: FileCheck,
            badgeBg: 'bg-amber-50 text-amber-700',
        })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

    return (
        <DashboardLayout>
            {/* User Profile Banner & Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
                {/* Background ambient light blur */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2.5">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-full text-xs font-semibold text-blue-200">
                                <Shield size={14} className="text-blue-400" />
                                System Administrator
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-medium text-emerald-300">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
                                Live Sync Active
                            </span>
                        </div>

                        <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                            Welcome back, {user?.name || 'Admin'}! 👋
                        </h1>

                        <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
                            Here is your real-time school management dashboard. Monitor student enrollments, faculty activities, class attendance, and academic performance.
                        </p>
                    </div>

                    {/* Quick Action Refresh & User Card */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start lg:self-center">
                        <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center font-bold text-lg text-white">
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </div>
                            <div className="text-left text-xs">
                                <p className="font-semibold text-white truncate max-w-[150px]">{user?.email}</p>
                                <p className="text-slate-300 text-[11px] mt-0.5">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => fetchDashboardData(true)}
                            disabled={refreshing || loading}
                            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-2xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={refreshing ? 'animate-spin text-blue-600' : 'text-slate-700'} />
                            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Error Banner State */}
            {error && (
                <ErrorBanner
                    title="API Connection Error"
                    message={error}
                    onRetry={() => fetchDashboardData()}
                />
            )}

            {/* Loading State */}
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {/* Role View: Admin Dashboard */}
                    {isAdmin && (
                        <div className="space-y-8">
                            {/* 1. Stat Cards Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Students Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                            <GraduationCap size={24} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full">
                                            <TrendingUp size={12} /> Live API
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Students</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{students.length}</h3>
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-medium">Enrolled in system</span>
                                        <Link to="/students" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                                            View <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Teachers Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                            <UserCheck size={24} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                                            Active Staff
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Teachers</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{teachers.length}</h3>
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-medium">Faculty members</span>
                                        <Link to="/teachers" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5">
                                            View <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Classes Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                            <Layers size={24} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full">
                                            Academic
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Classes</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{classes.length}</h3>
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-medium">Configured grades</span>
                                        <Link to="/classes" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-0.5">
                                            View <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>

                                {/* Subjects Card */}
                                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                                            <BookOpen size={24} />
                                        </div>
                                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full">
                                            Curriculum
                                        </span>
                                    </div>
                                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Subjects</p>
                                    <h3 className="text-3xl font-extrabold text-gray-900 mt-1">{subjects.length}</h3>
                                    <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                                        <span className="text-xs text-gray-500 font-medium">Offered subjects</span>
                                        <Link to="/subjects" className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5">
                                            View <ChevronRight size={14} />
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Quick Action Buttons */}
                            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                                            <Sparkles size={18} />
                                        </div>
                                        <div>
                                            <h2 className="text-base font-bold text-gray-900">Quick Actions</h2>
                                            <p className="text-xs text-gray-500">Fast shortcuts for administrative tasks</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    <Link
                                        to="/students"
                                        className="flex flex-col items-center justify-center p-4 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <GraduationCap size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-blue-900">Add Student</span>
                                        <span className="text-[10px] text-blue-600 mt-0.5">Enroll new</span>
                                    </Link>

                                    <Link
                                        to="/teachers"
                                        className="flex flex-col items-center justify-center p-4 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <UserCheck size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-emerald-900">Add Teacher</span>
                                        <span className="text-[10px] text-emerald-600 mt-0.5">Add faculty</span>
                                    </Link>

                                    <Link
                                        to="/classes"
                                        className="flex flex-col items-center justify-center p-4 bg-purple-50/60 hover:bg-purple-100/70 border border-purple-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <Layers size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-purple-900">Create Class</span>
                                        <span className="text-[10px] text-purple-600 mt-0.5">Grade setup</span>
                                    </Link>

                                    <Link
                                        to="/subjects"
                                        className="flex flex-col items-center justify-center p-4 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-amber-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <BookOpen size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-amber-900">Add Subject</span>
                                        <span className="text-[10px] text-amber-600 mt-0.5">Curriculum</span>
                                    </Link>

                                    <Link
                                        to="/attendance"
                                        className="flex flex-col items-center justify-center p-4 bg-rose-50/60 hover:bg-rose-100/70 border border-rose-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <ClipboardList size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-rose-900">Attendance</span>
                                        <span className="text-[10px] text-rose-600 mt-0.5">Track daily</span>
                                    </Link>

                                    <Link
                                        to="/exams"
                                        className="flex flex-col items-center justify-center p-4 bg-teal-50/60 hover:bg-teal-100/70 border border-teal-100 rounded-xl transition-all group text-center"
                                    >
                                        <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center mb-2.5 shadow-sm group-hover:scale-105 transition-transform">
                                            <FileCheck size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-teal-900">Schedule Exam</span>
                                        <span className="text-[10px] text-teal-600 mt-0.5">Assessments</span>
                                    </Link>
                                </div>
                            </div>

                            {/* 3. Two Column Layout: Attendance Overview & Statistics */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Left (2 cols): Attendance Overview */}
                                <div className="lg:col-span-2 space-y-8">
                                    {/* Attendance Overview Card */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                                        <ClipboardList size={18} />
                                                    </div>
                                                    <h2 className="text-base font-bold text-gray-900">Attendance Overview</h2>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-0.5">Real attendance data fetched by class</p>
                                            </div>

                                            {/* Class Selector Dropdown */}
                                            <div className="flex items-center gap-2">
                                                <label htmlFor="classSelect" className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                                                    Select Class:
                                                </label>
                                                <select
                                                    id="classSelect"
                                                    value={selectedClassId}
                                                    onChange={(e) => handleClassChange(e.target.value)}
                                                    className="bg-gray-50 border border-gray-200 text-gray-900 text-xs rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2 font-medium"
                                                >
                                                    {classes.length === 0 ? (
                                                        <option value="">No classes found</option>
                                                    ) : (
                                                        classes.map((c) => (
                                                            <option key={c._id} value={c._id}>
                                                                {c.className}
                                                            </option>
                                                        ))
                                                    )}
                                                </select>
                                            </div>
                                        </div>

                                        {attendanceLoading ? (
                                            <div className="py-12 text-center">
                                                <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                <p className="text-xs text-gray-500 mt-2">Fetching attendance records...</p>
                                            </div>
                                        ) : totalAttRecords === 0 ? (
                                            <EmptyState
                                                icon={ClipboardList}
                                                title="No Attendance Records Yet"
                                                description="There are no attendance entries recorded for the selected class."
                                                actionLabel="Mark Attendance"
                                                actionLink="/attendance"
                                            />
                                        ) : (
                                            <div className="space-y-6">
                                                {/* Percentage Header */}
                                                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-5 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs font-bold text-blue-900 uppercase tracking-wider">Overall Present Rate</p>
                                                        <div className="flex items-baseline gap-2 mt-1">
                                                            <span className="text-3xl font-extrabold text-blue-700">{presentPercentage}%</span>
                                                            <span className="text-xs text-gray-500 font-medium">({presentCount} of {totalAttRecords} marked)</span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-3">
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                                                            <CheckCircle2 size={14} /> {presentCount} Present
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 text-xs font-bold rounded-full">
                                                            <XCircle size={14} /> {absentCount} Absent
                                                        </span>
                                                        {lateCount > 0 && (
                                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                                                                <AlertCircle size={14} /> {lateCount} Late
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Progress Bars */}
                                                <div className="space-y-3">
                                                    <div>
                                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                                            <span className="text-emerald-700 flex items-center gap-1">
                                                                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span> Present Students
                                                            </span>
                                                            <span className="text-gray-900">{presentCount} ({presentPercentage}%)</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                            <div
                                                                className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                                                                style={{ width: `${presentPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                                            <span className="text-red-700 flex items-center gap-1">
                                                                <span className="w-2.5 h-2.5 bg-red-500 rounded-full"></span> Absent Students
                                                            </span>
                                                            <span className="text-gray-900">{absentCount} ({absentPercentage}%)</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                            <div
                                                                className="bg-red-500 h-3 rounded-full transition-all duration-500"
                                                                style={{ width: `${absentPercentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>

                                                    {lateCount > 0 && (
                                                        <div>
                                                            <div className="flex justify-between text-xs font-semibold mb-1">
                                                                <span className="text-amber-700 flex items-center gap-1">
                                                                    <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span> Late Students
                                                                </span>
                                                                <span className="text-gray-900">{lateCount} ({latePercentage}%)</span>
                                                            </div>
                                                            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                                                <div
                                                                    className="bg-amber-500 h-3 rounded-full transition-all duration-500"
                                                                    style={{ width: `${latePercentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Recent Activity Table & Timeline */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                                                    <Clock size={18} />
                                                </div>
                                                <div>
                                                    <h2 className="text-base font-bold text-gray-900">Recent Activity</h2>
                                                    <p className="text-xs text-gray-500">Live registrations and updates from API</p>
                                                </div>
                                            </div>
                                        </div>

                                        {recentActivities.length === 0 ? (
                                            <EmptyState
                                                title="No Recent Activity"
                                                description="Activities will show up here as students, teachers, subjects, or exams are added."
                                            />
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left border-collapse">
                                                    <thead>
                                                        <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                                            <th className="pb-3">Activity</th>
                                                            <th className="pb-3">Category</th>
                                                            <th className="pb-3">Timestamp</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-50 text-xs">
                                                        {recentActivities.map((act) => {
                                                            const IconComp = act.icon;
                                                            return (
                                                                <tr key={act.id} className="hover:bg-gray-50/60 transition-colors">
                                                                    <td className="py-3 pr-4">
                                                                        <div className="flex items-start gap-3">
                                                                            <div className="p-2 rounded-xl bg-gray-100 text-gray-700 mt-0.5">
                                                                                <IconComp size={16} />
                                                                            </div>
                                                                            <div>
                                                                                <p className="font-semibold text-gray-900">{act.title}</p>
                                                                                <p className="text-gray-500 text-[11px] mt-0.5">{act.subtitle}</p>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="py-3 px-2 whitespace-nowrap">
                                                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold capitalize ${act.badgeBg}`}>
                                                                            {act.type}
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-3 pl-2 text-gray-400 text-[11px] whitespace-nowrap">
                                                                        {new Date(act.date).toLocaleDateString('en-US', {
                                                                            month: 'short',
                                                                            day: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right (1 col): Useful Statistics & Breakdown */}
                                <div className="space-y-8">
                                    {/* Student Class Distribution Card */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                                <BarChart3 size={18} />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-gray-900">Class Distribution</h2>
                                                <p className="text-xs text-gray-500">Student count per grade</p>
                                            </div>
                                        </div>

                                        {classDistribution.length === 0 ? (
                                            <p className="text-xs text-gray-400 italic text-center py-4">No classes created yet</p>
                                        ) : (
                                            <div className="space-y-4">
                                                {classDistribution.map((item) => (
                                                    <div key={item.id}>
                                                        <div className="flex justify-between text-xs font-semibold mb-1">
                                                            <span className="text-gray-700">{item.className}</span>
                                                            <span className="text-gray-900">{item.count} students ({item.percentage}%)</span>
                                                        </div>
                                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                                                style={{ width: `${item.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Faculty & Subjects Summary */}
                                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                                                <Award size={18} />
                                            </div>
                                            <div>
                                                <h2 className="text-base font-bold text-gray-900">Academics & Exams</h2>
                                                <p className="text-xs text-gray-500">Active assessment records</p>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <FileCheck size={16} className="text-amber-600" />
                                                    <span className="text-xs font-semibold text-gray-700">Scheduled Exams</span>
                                                </div>
                                                <span className="text-sm font-extrabold text-gray-900">{exams.length}</span>
                                            </div>

                                            <div className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <BookOpen size={16} className="text-purple-600" />
                                                    <span className="text-xs font-semibold text-gray-700">Total Subjects</span>
                                                </div>
                                                <span className="text-sm font-extrabold text-gray-900">{subjects.length}</span>
                                            </div>

                                            <div className="p-3.5 bg-gray-50 rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <UserCheck size={16} className="text-emerald-600" />
                                                    <span className="text-xs font-semibold text-gray-700">Teaching Staff</span>
                                                </div>
                                                <span className="text-sm font-extrabold text-gray-900">{teachers.length}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Teacher Portal Placeholder view */}
                    {isTeacher && (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                            <UserCheck size={48} className="mx-auto text-emerald-600 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900">Welcome to Teacher Portal</h2>
                            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                                Access your class attendance records, manage student exam evaluations, and review timetables.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                                <Link to="/attendance" className="btn-primary text-xs">Mark Attendance</Link>
                                <Link to="/exams" className="btn-secondary text-xs">Manage Exams</Link>
                            </div>
                        </div>
                    )}

                    {/* Student Portal Placeholder view */}
                    {isStudent && (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                            <GraduationCap size={48} className="mx-auto text-blue-600 mb-4" />
                            <h2 className="text-xl font-bold text-gray-900">Welcome to Student Hub</h2>
                            <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                                View your overall attendance percentage, exam result scorecards, and daily class timetables.
                            </p>
                            <div className="mt-6 flex justify-center gap-4">
                                <Link to="/attendance" className="btn-primary text-xs">View My Attendance</Link>
                                <Link to="/results" className="btn-secondary text-xs">View My Results</Link>
                            </div>
                        </div>
                    )}
                </>
            )}
        </DashboardLayout>
    );
};

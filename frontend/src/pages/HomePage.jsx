import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    GraduationCap,
    Users,
    BookOpen,
    CalendarCheck,
    FileCheck2,
    Clock,
    Shield,
    UserCheck,
    User,
    ArrowRight,
    CheckCircle2,
    BarChart3,
    Layers,
    BookMarked,
    Sparkles,
    ChevronRight,
    Menu,
    X,
    Activity
} from 'lucide-react';

export const HomePage = () => {
    const { isAuthenticated, user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col font-sans">
            {/* 1. PROFESSIONAL RESPONSIVE NAVBAR */}
            <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Brand Logo & Subtitle */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-xl text-slate-900 tracking-tight font-heading">EduPulse</span>
                                    <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md border border-blue-100">
                                        SaaS
                                    </span>
                                </div>
                                <span className="text-xs text-slate-500 font-medium hidden sm:block">Smart School Management System</span>
                            </div>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
                            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
                            <a href="#modules" className="hover:text-blue-600 transition-colors">Modules</a>
                            <a href="#roles" className="hover:text-blue-600 transition-colors">Portals</a>
                            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How It Works</a>
                        </nav>

                        {/* Auth Navigation Actions */}
                        <div className="hidden sm:flex items-center gap-3">
                            {isAuthenticated ? (
                                <Link
                                    to="/dashboard"
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                                >
                                    <span>Dashboard</span>
                                    <ArrowRight size={14} />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Log In
                                    </Link>
                                    <Link
                                        to="/login"
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 flex items-center gap-2"
                                    >
                                        <span>Get Started</span>
                                        <ArrowRight size={14} />
                                    </Link>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Toggle Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
                        >
                            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Dropdown Navigation */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-fade-in">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Features</a>
                        <a href="#modules" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Modules</a>
                        <a href="#roles" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">Portals</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-700">How It Works</a>

                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                            {isAuthenticated ? (
                                <Link to="/dashboard" className="w-full text-center py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm">
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link to="/login" className="w-full text-center py-2.5 bg-slate-100 text-slate-800 font-bold text-xs rounded-xl">
                                        Log In
                                    </Link>
                                    <Link to="/login" className="w-full text-center py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm">
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* 2. HERO SECTION */}
            <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-white via-slate-50 to-slate-100/60">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
                        {/* Left Hero Text Column */}
                        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-xs font-bold text-blue-700 shadow-2xs">
                                <Sparkles size={14} className="text-blue-600" />
                                <span>Smart School Management System</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] font-heading">
                                Manage Your School with EduPulse
                            </h1>

                            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium">
                                Comprehensive school management system designed to streamline administrative tasks and enhance academic operations.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                                <Link
                                    to={isAuthenticated ? "/dashboard" : "/login"}
                                    className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-2xl shadow-lg shadow-blue-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Now"}</span>
                                    <ArrowRight size={16} />
                                </Link>

                                {!isAuthenticated && (
                                    <Link
                                        to="/login"
                                        className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-bold text-sm rounded-2xl shadow-xs transition-colors text-center"
                                    >
                                        Log In to Portal
                                    </Link>
                                )}
                            </div>

                            {/* Trust badges */}
                            <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-semibold">
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Real-time Analytics</span>
                                <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-500" /> Role-based Access</span>
                            </div>
                        </div>

                        {/* Right Hero Dashboard Mockup Preview */}
                        <div className="lg:col-span-6 relative">
                            <div className="relative mx-auto max-w-lg lg:max-w-none bg-slate-950 p-3 sm:p-4 rounded-3xl shadow-2xl border border-slate-800 shadow-slate-900/30">
                                {/* Mock Window Controls */}
                                <div className="flex items-center justify-between px-3 py-2 mb-3 border-b border-slate-800">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-400">EduPulse Admin Dashboard</span>
                                </div>

                                {/* Mock App UI Inside Container */}
                                <div className="bg-slate-900 rounded-2xl p-4 space-y-4 text-white text-xs">
                                    {/* Mock Stat Grid */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Total Students</p>
                                            <p className="text-xl font-extrabold text-white mt-0.5">248 Active</p>
                                        </div>
                                        <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/60">
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">Avg Attendance</p>
                                            <p className="text-xl font-extrabold text-emerald-400 mt-0.5">94.2%</p>
                                        </div>
                                    </div>

                                    {/* Mock Table Preview */}
                                    <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 space-y-2">
                                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                                            <span>Recent Activity</span>
                                            <span className="text-emerald-400">System Live</span>
                                        </div>

                                        <div className="space-y-1.5 pt-1">
                                            <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-lg text-[11px]">
                                                <span>Class 10 - Mathematics Attendance</span>
                                                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 font-bold rounded">Submitted</span>
                                            </div>
                                            <div className="flex items-center justify-between p-2 bg-slate-900/80 rounded-lg text-[11px]">
                                                <span>Mid-Term Exam Schedule</span>
                                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded">Published</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 3. PLATFORM FEATURES SECTION (6 Cards) */}
            <section id="features" className="py-20 bg-white border-y border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Comprehensive Platform
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                            Built to Power Modern Education
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base font-medium">
                            Everything your institution needs to manage students, teachers, classes, attendance, examinations, and weekly schedules.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* 1. Student Management */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-blue-500/20 group-hover:scale-110 transition-transform">
                                <GraduationCap size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Student Management</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Maintain student directories, roll numbers, admission details, parent contact records, and academic profiles.
                            </p>
                        </div>

                        {/* 2. Teacher Management */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                <UserCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Teacher Management</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Manage faculty profiles, qualifications, experience metrics, monthly compensation, and subject assignments.
                            </p>
                        </div>

                        {/* 3. Classes & Subjects */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                <Layers size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Classes & Subjects</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Structure grade levels, assign sections (Section A, B), and configure subject course codes linked to faculty.
                            </p>
                        </div>

                        {/* 4. Attendance */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-amber-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
                                <CalendarCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Attendance Tracking</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Mark daily class attendance roster with Present, Absent, and Late toggles, optional remarks, and percentage logs.
                            </p>
                        </div>

                        {/* 5. Exams & Results */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <FileCheck2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Exams & Results</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Schedule test evaluations with passing mark thresholds, auto-compute letter grades (A+ to F), and produce student report cards.
                            </p>
                        </div>

                        {/* 6. Timetable */}
                        <div className="bg-slate-50/70 hover:bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
                            <div className="w-12 h-12 bg-teal-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-md shadow-teal-500/20 group-hover:scale-110 transition-transform">
                                <Clock size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 font-heading">Timetable Schedule</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Generate weekly 6-day period matrices with start/end timing slots, preventing time overlaps and faculty conflicts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. DASHBOARD PREVIEW SECTION */}
            <section id="modules" className="py-20 bg-slate-900 text-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold text-blue-400 bg-blue-950 px-3 py-1 rounded-full uppercase tracking-wider border border-blue-800">
                            Live Management Workspace
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-heading">
                            Real-Time Insight & Operational Control
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            Experience a realistic preview of the active EduPulse dashboard interface.
                        </p>
                    </div>

                    {/* Preview Workspace Card Container */}
                    <div className="bg-slate-950 rounded-3xl border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-8">
                        {/* Top Metric Cards Row */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-blue-600/20 text-blue-400 rounded-xl">
                                    <GraduationCap size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold">Total Students</p>
                                    <p className="text-2xl font-bold text-white mt-0.5">248</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-xl">
                                    <UserCheck size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold">Total Teachers</p>
                                    <p className="text-2xl font-bold text-white mt-0.5">34</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-purple-600/20 text-purple-400 rounded-xl">
                                    <Layers size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold">Active Classes</p>
                                    <p className="text-2xl font-bold text-white mt-0.5">12</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 flex items-center gap-4">
                                <div className="p-3 bg-amber-600/20 text-amber-400 rounded-xl">
                                    <BarChart3 size={22} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 font-semibold">Attendance Rate</p>
                                    <p className="text-2xl font-bold text-emerald-400 mt-0.5">94.2%</p>
                                </div>
                            </div>
                        </div>

                        {/* Chart & Activity Rows */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                            {/* Attendance Bar Chart Preview */}
                            <div className="lg:col-span-7 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-sm text-slate-200">Attendance Distribution by Class</h4>
                                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                                        Live Data
                                    </span>
                                </div>

                                <div className="space-y-3 pt-2">
                                    {[
                                        { name: 'Class 10 - Section A', percent: 96 },
                                        { name: 'Class 9 - Section B', percent: 92 },
                                        { name: 'Class 8 - Section A', percent: 95 },
                                        { name: 'Class 7 - Section C', percent: 89 },
                                    ].map((c, idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between text-xs font-semibold text-slate-300">
                                                <span>{c.name}</span>
                                                <span className="text-emerald-400">{c.percent}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full" style={{ width: `${c.percent}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity Timeline Preview */}
                            <div className="lg:col-span-5 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 space-y-4">
                                <h4 className="font-bold text-sm text-slate-200">Recent School Activity Log</h4>
                                <div className="space-y-3 pt-1 text-xs">
                                    <div className="flex items-start gap-3">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                                        <div>
                                            <p className="text-slate-200 font-semibold">Attendance marked for Class 10</p>
                                            <p className="text-slate-400 text-[10px]">10 mins ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-2 h-2 rounded-full bg-blue-400 mt-1.5 shrink-0"></span>
                                        <div>
                                            <p className="text-slate-200 font-semibold">Mathematics Exam Results published</p>
                                            <p className="text-slate-400 text-[10px]">45 mins ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="w-2 h-2 rounded-full bg-purple-400 mt-1.5 shrink-0"></span>
                                        <div>
                                            <p className="text-slate-200 font-semibold">New Faculty Teacher onboarded</p>
                                            <p className="text-slate-400 text-[10px]">2 hours ago</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 5. BUILT FOR YOUR SCHOOL SECTION (3 Role Cards) */}
            <section id="roles" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Role-Based Access
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                            Built for Every Role in Your School
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base font-medium">
                            Tailored user interfaces designed specifically for Administrators, Teachers, and Students.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Admin Role */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4">
                            <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 font-heading">Administrator Console</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Full operational control over student enrollment, teacher profiles, grade structures, class sections, subjects, system security, and analytics.
                            </p>
                        </div>

                        {/* Teacher Role */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4">
                            <div className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-emerald-500/20">
                                <UserCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 font-heading">Teacher Portal</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Streamlined workflow to take daily class attendance, review subject curricula, schedule test evaluations, and publish student score grades.
                            </p>
                        </div>

                        {/* Student Role */}
                        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 space-y-4">
                            <div className="w-12 h-12 bg-purple-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-purple-500/20">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 font-heading">Student Hub</h3>
                            <p className="text-slate-600 text-xs leading-relaxed font-medium">
                                Personal portal to track attendance percentages, inspect examination results, view report cards, and check class timetables.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. HOW IT WORKS SECTION (4 Steps) */}
            <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                            Simple Workflow
                        </span>
                        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-heading">
                            How EduPulse Operates
                        </h2>
                        <p className="text-slate-600 text-sm sm:text-base font-medium">
                            Get your institution running smoothly in four quick steps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Step 1 */}
                        <div className="text-center space-y-3 relative">
                            <div className="w-14 h-14 bg-blue-50 text-blue-600 border border-blue-100 rounded-2xl flex items-center justify-center font-extrabold text-xl mx-auto font-heading">
                                1
                            </div>
                            <h3 className="text-base font-bold text-slate-900">1. Authenticate</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Log in securely using designated Admin, Teacher, or Student role credentials.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center space-y-3 relative">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl flex items-center justify-center font-extrabold text-xl mx-auto font-heading">
                                2
                            </div>
                            <h3 className="text-base font-bold text-slate-900">2. Configure</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Set up academic classes, sections, subject curricula, and faculty assignments.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center space-y-3 relative">
                            <div className="w-14 h-14 bg-purple-50 text-purple-600 border border-purple-100 rounded-2xl flex items-center justify-center font-extrabold text-xl mx-auto font-heading">
                                3
                            </div>
                            <h3 className="text-base font-bold text-slate-900">3. Track</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Mark daily class attendance, schedule exams, and manage weekly period timetables.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="text-center space-y-3 relative">
                            <div className="w-14 h-14 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl flex items-center justify-center font-extrabold text-xl mx-auto font-heading">
                                4
                            </div>
                            <h3 className="text-base font-bold text-slate-900">4. Analyze</h3>
                            <p className="text-slate-600 text-xs font-medium leading-relaxed">
                                Review real-time student performance, attendance statistics, and grade transcripts.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* 7. STRONG CTA SECTION */}
            <section className="py-20 bg-gradient-to-tr from-blue-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
                    <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
                        Ready to Simplify School Management?
                    </h2>
                    <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto font-medium">
                        Join modern educational institutions leveraging EduPulse for streamlined administrative and academic operations.
                    </p>
                    <div className="pt-2">
                        <Link
                            to={isAuthenticated ? "/dashboard" : "/login"}
                            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 font-extrabold text-sm rounded-2xl shadow-xl active:scale-95 transition-all"
                        >
                            <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Now"}</span>
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 8. PROFESSIONAL FOOTER */}
            <footer className="bg-slate-950 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-md">
                                <GraduationCap size={20} />
                            </div>
                            <div>
                                <span className="font-extrabold text-lg text-white font-heading">EduPulse</span>
                                <span className="text-xs text-slate-500 block">Smart School Management System</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-xs font-semibold text-slate-400">
                            <a href="#features" className="hover:text-white transition-colors">Features</a>
                            <a href="#modules" className="hover:text-white transition-colors">Modules</a>
                            <a href="#roles" className="hover:text-white transition-colors">Portals</a>
                            <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
                        </div>
                    </div>

                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
                        <p>© {new Date().getFullYear()} EduPulse School Management System. All rights reserved.</p>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-slate-400 font-semibold">Backend API Online</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

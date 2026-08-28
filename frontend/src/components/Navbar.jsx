import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User, Bell, Search, ShieldCheck, GraduationCap, ChevronDown, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Navbar = ({ onMobileMenuToggle, isMobileOpen }) => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const profileRef = useRef(null);
    const notificationRef = useRef(null);

    // Mock/Live Notifications for System Dashboard
    const notifications = [
        {
            id: 1,
            title: 'Attendance Alert',
            description: 'Today\'s attendance overview is ready for review.',
            time: '10 mins ago',
            type: 'info',
            unread: true,
        },
        {
            id: 2,
            title: 'System Status',
            description: 'All backend APIs are connected and active.',
            time: '30 mins ago',
            type: 'success',
            unread: true,
        },
        {
            id: 3,
            title: 'Exam Schedule',
            description: 'Upcoming mid-term exams scheduled.',
            time: '2 hours ago',
            type: 'warning',
            unread: false,
        },
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    // Close dropdowns on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            navigate('/login');
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left: Mobile Toggle & Brand Logo */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={onMobileMenuToggle}
                            className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                            aria-label="Toggle Navigation Menu"
                        >
                            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>

                        <Link to="/dashboard" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                                <GraduationCap size={22} />
                            </div>
                            <div>
                                <span className="font-bold text-lg text-gray-900 leading-tight block">EduPulse</span>
                                <span className="text-xs text-gray-500 font-medium">School Management</span>
                            </div>
                        </Link>
                    </div>

                    {/* Middle: Global Quick Search Input */}
                    {isAuthenticated && (
                        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <Search size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Quick search (Students, Teachers, Classes)..."
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>
                    )}

                    {/* Right: Actions, Notifications & Profile Dropdown */}
                    <div className="flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {/* Notifications Popover */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors focus:outline-none"
                                        aria-label="View notifications"
                                    >
                                        <Bell size={20} />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
                                        )}
                                    </button>

                                    {showNotifications && (
                                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                                <h4 className="font-semibold text-gray-900 text-sm">Notifications</h4>
                                                <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                                                    {unreadCount} new
                                                </span>
                                            </div>

                                            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                                                {notifications.map((item) => (
                                                    <div key={item.id} className="p-4 hover:bg-gray-50/80 transition-colors flex gap-3">
                                                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                                                            item.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
                                                            item.type === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            {item.type === 'success' ? <CheckCircle2 size={16} /> :
                                                             item.type === 'warning' ? <AlertCircle size={16} /> : <Clock size={16} />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-semibold text-gray-900">{item.title}</p>
                                                                <span className="text-[10px] text-gray-400">{item.time}</span>
                                                            </div>
                                                            <p className="text-xs text-gray-600 mt-1 leading-relaxed">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="px-4 py-2 border-t border-gray-100 text-center">
                                                <button
                                                    onClick={() => setShowNotifications(false)}
                                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium py-1"
                                                >
                                                    Close Notifications
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="h-6 w-[1px] bg-gray-200 hidden sm:block"></div>

                                {/* User Profile Section / Dropdown */}
                                <div className="relative" ref={profileRef}>
                                    <button
                                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                                        className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
                                    >
                                        <div className="relative">
                                            {user?.avatar?.url ? (
                                                <img
                                                    src={user.avatar.url}
                                                    alt={user.name}
                                                    className="w-9 h-9 rounded-xl object-cover ring-2 ring-blue-500/20"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-sm">
                                                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                                        </div>

                                        <div className="text-left hidden sm:block">
                                            <div className="flex items-center gap-1.5">
                                                <p className="text-sm font-semibold text-gray-900 leading-none">{user?.name || 'User'}</p>
                                                <ChevronDown size={14} className="text-gray-400" />
                                            </div>
                                            <p className="text-[11px] font-medium text-gray-500 capitalize mt-1">
                                                {user?.role || 'Guest'}
                                            </p>
                                        </div>
                                    </button>

                                    {/* Profile Dropdown Menu */}
                                    {showProfileMenu && (
                                        <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                                            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                                                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Signed in as</p>
                                                <p className="text-sm font-bold text-gray-900 truncate mt-0.5">{user?.name}</p>
                                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md capitalize">
                                                        <ShieldCheck size={12} />
                                                        {user?.role}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-semibold rounded-md">
                                                        Active
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="py-1">
                                                <Link
                                                    to="/dashboard"
                                                    onClick={() => setShowProfileMenu(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                                                >
                                                    <User size={16} className="text-gray-400" />
                                                    <span>View Dashboard</span>
                                                </Link>
                                            </div>

                                            <div className="border-t border-gray-100 pt-1">
                                                <button
                                                    onClick={() => {
                                                        setShowProfileMenu(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                                                >
                                                    <LogOut size={16} />
                                                    <span>Log Out</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <Link
                                to="/login"
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-colors shadow-sm"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

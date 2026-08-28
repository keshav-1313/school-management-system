import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    ChevronDown,
    LayoutDashboard,
    Users,
    BookOpen,
    Calendar,
    ClipboardList,
    BarChart3,
    Clock,
    X,
    Sparkles,
    GraduationCap,
    UserCheck,
    Layers,
    BookMarked,
    FileCheck
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Sidebar = ({ isOpen, onClose }) => {
    const { isAdmin, isTeacher, isStudent } = useAuth();
    const location = useLocation();
    const [expandedMenus, setExpandedMenus] = useState({
        Management: true,
        Academy: true,
        Academics: true,
    });

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const isActive = (path) => location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));

    const menuItems = {
        admin: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', exact: true },
            {
                label: 'Management',
                icon: Users,
                submenu: [
                    { label: 'Students', href: '/students', icon: GraduationCap },
                    { label: 'Teachers', href: '/teachers', icon: UserCheck },
                ]
            },
            {
                label: 'Academy',
                icon: BookOpen,
                submenu: [
                    { label: 'Classes', href: '/classes', icon: Layers },
                    { label: 'Sections', href: '/sections', icon: BookMarked },
                    { label: 'Subjects', href: '/subjects', icon: BookOpen },
                ]
            },
            {
                label: 'Academics',
                icon: BarChart3,
                submenu: [
                    { label: 'Attendance', href: '/attendance', icon: ClipboardList },
                    { label: 'Exams', href: '/exams', icon: FileCheck },
                    { label: 'Results', href: '/results', icon: BarChart3 },
                ]
            },
            { label: 'Timetable', icon: Calendar, href: '/timetable' },
        ],
        teacher: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', exact: true },
            { label: 'Attendance', icon: ClipboardList, href: '/attendance' },
            { label: 'Exams', icon: BookOpen, href: '/exams' },
            { label: 'Results', icon: BarChart3, href: '/results' },
            { label: 'My Timetable', icon: Calendar, href: '/timetable' },
        ],
        student: [
            { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', exact: true },
            { label: 'My Attendance', icon: ClipboardList, href: '/attendance' },
            { label: 'My Results', icon: BarChart3, href: '/results' },
            { label: 'My Timetable', icon: Calendar, href: '/timetable' },
        ],
    };

    let items = [];
    if (isAdmin) items = menuItems.admin;
    else if (isTeacher) items = menuItems.teacher;
    else if (isStudent) items = menuItems.student;

    const sidebarContent = (
        <div className="flex flex-col h-full bg-white border-r border-gray-200">
            {/* Header with Close button on Mobile */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-sm shadow-blue-500/20">
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-base leading-tight">School Portal</h2>
                        <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            {isAdmin ? 'Admin Console' : isTeacher ? 'Teacher Portal' : 'Student Hub'}
                        </span>
                    </div>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="md:hidden p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {items.map((item, index) => {
                    const isMenuActive = item.exact
                        ? isActive(item.href) && location.pathname === item.href
                        : item.href && isActive(item.href);

                    const hasSubmenu = item.submenu && item.submenu.length > 0;
                    const Icon = item.icon;
                    const isExpanded = expandedMenus[item.label];

                    return (
                        <div key={index} className="py-0.5">
                            {hasSubmenu ? (
                                <>
                                    <button
                                        onClick={() => toggleMenu(item.label)}
                                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                            isExpanded
                                                ? 'text-gray-900 bg-gray-50/80'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                <Icon size={18} />
                                            </div>
                                            <span>{item.label}</span>
                                        </div>
                                        <ChevronDown
                                            size={16}
                                            className={`text-gray-400 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-180 text-blue-600' : ''
                                            }`}
                                        />
                                    </button>

                                    {isExpanded && (
                                        <div className="ml-5 pl-4 mt-1 border-l-2 border-gray-100 space-y-1">
                                            {item.submenu.map((subitem, subindex) => {
                                                const SubIcon = subitem.icon;
                                                const subActive = isActive(subitem.href);
                                                return (
                                                    <Link
                                                        key={subindex}
                                                        to={subitem.href}
                                                        onClick={() => onClose && onClose()}
                                                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                                                            subActive
                                                                ? 'bg-blue-50 text-blue-700 font-bold shadow-xs'
                                                                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {SubIcon && <SubIcon size={15} className={subActive ? 'text-blue-600' : 'text-gray-400'} />}
                                                        <span>{subitem.label}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.href}
                                    onClick={() => onClose && onClose()}
                                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                                        isMenuActive
                                            ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                                >
                                    <Icon size={18} className={isMenuActive ? 'text-white' : 'text-gray-500'} />
                                    <span>{item.label}</span>
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Sidebar Footer Widget */}
            <div className="p-4 border-t border-gray-100">
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-blue-100/80 rounded-2xl p-4">
                    <div className="flex items-center gap-2 text-blue-700 font-semibold text-xs mb-1">
                        <Sparkles size={14} />
                        <span>System Status</span>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                        Connected to backend live database.
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
                        <span className="text-[11px] font-bold text-gray-800">All APIs Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Persistent Sidebar */}
            <aside className="hidden md:block w-64 flex-shrink-0 min-h-[calc(100vh-4rem)]">
                {sidebarContent}
            </aside>

            {/* Mobile Drawer Backdrop & Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs transition-opacity"
                        onClick={onClose}
                    />

                    {/* Drawer Content */}
                    <div className="fixed inset-y-0 left-0 w-72 max-w-xs z-50 animate-in slide-in-from-left duration-200">
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    );
};

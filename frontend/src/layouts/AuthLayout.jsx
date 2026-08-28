import React from 'react';
import { GraduationCap, CheckCircle2, ShieldCheck, Sparkles, Layers, BookOpen, CalendarCheck, Clock } from 'lucide-react';

export const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans selection:bg-blue-600 selection:text-white">
            <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12">
                {/* LEFT SIDE: BRANDING & VISUAL PANEL (Hidden on Mobile, Visible on Tablet/Desktop) */}
                <div className="hidden md:flex lg:col-span-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white p-8 lg:p-14 flex-col justify-between relative overflow-hidden border-r border-slate-800">
                    {/* Background Subtle Ambient Glow */}
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Top Brand Header */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <GraduationCap size={24} />
                            </div>
                            <div>
                                <h1 className="font-extrabold text-2xl tracking-tight text-white font-heading">EduPulse</h1>
                                <p className="text-xs text-blue-200 font-medium">Smart School Management System</p>
                            </div>
                        </div>

                    </div>

                    {/* Middle Content & Feature Highlights */}
                    <div className="relative z-10 my-auto py-10 space-y-8">
                        <div className="space-y-3">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/15 border border-blue-400/20 rounded-full text-xs font-bold text-blue-300">
                                <Sparkles size={14} className="text-blue-400" />
                                <span>Next-Gen Education Portal</span>
                            </span>
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
                                Streamline Your School Operations in One Cloud Platform
                            </h2>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-md font-medium">
                                Access your administrative console, take attendance, schedule exams, publish grades, and oversee academic timetables with enterprise-grade security.
                            </p>
                        </div>

                        {/* 4 Feature Badges Grid */}
                        <div className="grid grid-cols-2 gap-3 max-w-md">
                            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
                                <GraduationCap size={16} className="text-blue-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-200">Student Directory</span>
                            </div>
                            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
                                <CalendarCheck size={16} className="text-emerald-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-200">Attendance Logs</span>
                            </div>
                            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
                                <BookOpen size={16} className="text-purple-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-200">Exams & Results</span>
                            </div>
                            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center gap-2.5">
                                <Clock size={16} className="text-amber-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-200">Weekly Timetable</span>
                            </div>
                        </div>
                    </div>

                    {/* Bottom System Status Badge */}
                    <div className="relative z-10 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span>Backend System Active & Encrypted</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">v2.4 Production</span>
                    </div>
                </div>

                {/* RIGHT SIDE: AUTH FORM CONTAINER */}
                <div className="lg:col-span-6 bg-white flex items-center justify-center p-6 sm:p-12 lg:p-16">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

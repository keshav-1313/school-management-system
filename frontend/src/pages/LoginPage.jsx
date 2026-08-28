import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../layouts/AuthLayout';
import { ErrorAlert } from '../components/Alert';
import { GraduationCap, Mail, Lock, Eye, EyeOff, ChevronDown, KeyRound, ShieldAlert } from 'lucide-react';

export const LoginPage = () => {
    const navigate = useNavigate();
    const { login, loading } = useAuth();
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [showDemoAccounts, setShowDemoAccounts] = useState(false);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');
    };

    const fillCredentials = (email, password) => {
        setFormData({ email, password });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Please fill in all fields');
            return;
        }

        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Authentication failed. Please check your credentials.');
        }
    };

    return (
        <AuthLayout>
            <div className="space-y-6">
                {/* Mobile / Tablet Header Logo */}
                <div className="md:hidden flex items-center gap-3 justify-center mb-6">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
                        <GraduationCap size={22} />
                    </div>
                    <div>
                        <h1 className="font-extrabold text-xl text-slate-900 leading-none font-heading">EduPulse</h1>
                        <span className="text-[11px] text-slate-500 font-medium">Smart School Management</span>
                    </div>
                </div>

                {/* Form Heading */}
                <div className="text-center md:text-left space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                        Welcome Back
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">
                        Sign in to your account to continue
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <ErrorAlert
                        message={error}
                        onClose={() => setError('')}
                        variant="error"
                    />
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700">
                            Email Address <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Mail size={16} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="name@school.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Input with Show/Hide Toggle */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold text-slate-700">
                                Password <span className="text-red-500">*</span>
                            </label>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                                <Lock size={16} />
                            </div>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                aria-label={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500/20"
                            />
                            <span className="text-xs font-semibold text-slate-600">Remember me</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        )}
                        <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
                    </button>
                </form>

                {/* Collapsible Demo Accounts Accordion */}
                <div className="pt-4 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                        className="w-full flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <KeyRound size={15} className="text-blue-600" />
                            <span>Quick-Fill Demo Accounts</span>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${showDemoAccounts ? 'rotate-180 text-blue-600' : ''}`} />
                    </button>

                    {showDemoAccounts && (
                        <div className="mt-3 space-y-2 animate-fade-in">
                            <button
                                type="button"
                                onClick={() => fillCredentials('admin@school.com', 'password')}
                                className="w-full text-left p-2.5 bg-blue-50/70 hover:bg-blue-100/80 border border-blue-100 rounded-xl transition-colors flex items-center justify-between text-xs"
                            >
                                <div>
                                    <span className="font-bold text-blue-900 block">Administrator</span>
                                    <span className="text-blue-700 text-[11px]">admin@school.com</span>
                                </div>
                                <span className="font-mono text-[10px] bg-blue-200/70 text-blue-900 px-2 py-0.5 rounded font-semibold">
                                    password
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillCredentials('teacher@school.com', 'password')}
                                className="w-full text-left p-2.5 bg-emerald-50/70 hover:bg-emerald-100/80 border border-emerald-100 rounded-xl transition-colors flex items-center justify-between text-xs"
                            >
                                <div>
                                    <span className="font-bold text-emerald-900 block">Faculty Teacher</span>
                                    <span className="text-emerald-700 text-[11px]">teacher@school.com</span>
                                </div>
                                <span className="font-mono text-[10px] bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-semibold">
                                    password
                                </span>
                            </button>

                            <button
                                type="button"
                                onClick={() => fillCredentials('student@school.com', 'password')}
                                className="w-full text-left p-2.5 bg-purple-50/70 hover:bg-purple-100/80 border border-purple-100 rounded-xl transition-colors flex items-center justify-between text-xs"
                            >
                                <div>
                                    <span className="font-bold text-purple-900 block">Student</span>
                                    <span className="text-purple-700 text-[11px]">student@school.com</span>
                                </div>
                                <span className="font-mono text-[10px] bg-purple-200/70 text-purple-900 px-2 py-0.5 rounded font-semibold">
                                    password
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AuthLayout>
    );
};

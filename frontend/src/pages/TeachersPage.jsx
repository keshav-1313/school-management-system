import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    UserCheck,
    Plus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    Award,
    Briefcase,
    DollarSign,
    Calendar,
    Phone,
    MapPin,
    Mail,
    Lock,
    User,
    CheckCircle2,
    Shield,
    BookOpen
} from 'lucide-react';
import userAPI from '../services/userAPI';

export const TeachersPage = () => {
    // Data States
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [genderFilter, setGenderFilter] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Teacher for Edit / View / Delete
    const [selectedTeacher, setSelectedTeacher] = useState(null);

    // Form Submitting & Message States
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Initial Form State
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        qualification: '',
        experience: 0,
        salary: 0,
        subjectSpecialization: '',
        phoneNumber: '',
        gender: 'male',
        address: '',
        joiningDate: new Date().toISOString().split('T')[0],
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch All Teachers
    const fetchTeachers = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await userAPI.getAllTeachers();
            setTeachers(res?.data?.teachers || []);
        } catch (err) {
            console.error('Error fetching teachers:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load teachers list.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTeachers();
    }, [fetchTeachers]);

    // Open Add Modal
    const openAddModal = () => {
        setFormData(initialFormState);
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (teacher) => {
        setSelectedTeacher(teacher);
        setFormData({
            name: teacher.user?.name || '',
            email: teacher.user?.email || '',
            password: '', // optional on edit
            qualification: teacher.qualification || '',
            experience: teacher.experience || 0,
            salary: teacher.salary || 0,
            subjectSpecialization: teacher.subjectSpecialization || '',
            phoneNumber: teacher.phoneNumber || '',
            gender: teacher.gender || 'male',
            address: teacher.address || '',
            joiningDate: teacher.joiningDate ? new Date(teacher.joiningDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });
        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);
    };

    // Open Details Modal
    const openDetailsModal = (teacher) => {
        setSelectedTeacher(teacher);
        setIsDetailsModalOpen(true);
    };

    // Open Delete Confirmation Modal
    const openDeleteModal = (teacher) => {
        setSelectedTeacher(teacher);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Form Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.name || !formData.email || !formData.password) {
            setFormError('Name, email, and password are required.');
            return;
        }

        if (formData.password.length < 6) {
            setFormError('Password must be at least 6 characters long.');
            return;
        }

        setFormSubmitting(true);
        try {
            const res = await userAPI.createTeacher(formData);
            if (res.data?.success) {
                setFormSuccess('Faculty member registered successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchTeachers(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create teacher.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Form Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedTeacher) return;

        setFormSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                qualification: formData.qualification,
                experience: Number(formData.experience),
                salary: Number(formData.salary),
                subjectSpecialization: formData.subjectSpecialization,
                phoneNumber: formData.phoneNumber,
                gender: formData.gender,
                address: formData.address,
                joiningDate: formData.joiningDate,
            };

            const res = await userAPI.updateTeacher(selectedTeacher._id, payload);
            if (res.data?.success) {
                setFormSuccess('Teacher updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchTeachers(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update teacher.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedTeacher) return;

        setFormSubmitting(true);
        try {
            const res = await userAPI.deleteTeacher(selectedTeacher._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchTeachers(true);
            }
        } catch (err) {
            console.error('Failed to delete teacher:', err);
            alert(err?.response?.data?.message || 'Failed to delete teacher.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Teachers based on Search Query and Gender Filter
    const filteredTeachers = teachers.filter(teacher => {
        const nameMatch = teacher.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = teacher.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const specMatch = teacher.subjectSpecialization?.toLowerCase().includes(searchQuery.toLowerCase());
        const qualMatch = teacher.qualification?.toLowerCase().includes(searchQuery.toLowerCase());
        const phoneMatch = teacher.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSearch = !searchQuery || nameMatch || emailMatch || specMatch || qualMatch || phoneMatch;
        const matchesGender = !genderFilter || teacher.gender === genderFilter;

        return matchesSearch && matchesGender;
    });

    // Stats calculations
    const maleCount = teachers.filter(t => t.gender === 'male').length;
    const femaleCount = teachers.filter(t => t.gender === 'female').length;
    const avgExperience = teachers.length > 0
        ? (teachers.reduce((acc, t) => acc + (t.experience || 0), 0) / teachers.length).toFixed(1)
        : 0;

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                            <UserCheck size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Teacher Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        View, add, edit, and manage faculty members and subject specializations.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchTeachers(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-emerald-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Add New Teacher</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Total Faculty</p>
                        <p className="text-xl font-bold text-gray-900">{teachers.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Male Faculty</p>
                        <p className="text-xl font-bold text-gray-900">{maleCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Female Faculty</p>
                        <p className="text-xl font-bold text-gray-900">{femaleCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Briefcase size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Avg Experience</p>
                        <p className="text-xl font-bold text-gray-900">{avgExperience} yrs</p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load teachers"
                    message={error}
                    onRetry={() => fetchTeachers()}
                />
            )}

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by teacher name, email, specialization, qualification..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* Gender Filter */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400 hidden sm:block" />
                            <select
                                value={genderFilter}
                                onChange={(e) => setGenderFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 p-2.5"
                            >
                                <option value="">All Genders</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>

                        {(genderFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setGenderFilter('');
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Table / Content Section */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-100">
                            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-6 bg-gray-200 rounded w-20"></div>
                        </div>
                    ))}
                </div>
            ) : filteredTeachers.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={UserCheck}
                        title={searchQuery || genderFilter ? 'No matching teachers found' : 'No Teachers Registered Yet'}
                        description={searchQuery || genderFilter ? 'Try clearing your search query or filter criteria.' : 'Add your first teacher to populate the faculty directory.'}
                        actionLabel="Add New Teacher"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing {filteredTeachers.length} of {teachers.length} Faculty Members
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Teacher Info</th>
                                    <th className="py-3.5 px-4">Specialization</th>
                                    <th className="py-3.5 px-4">Qualification</th>
                                    <th className="py-3.5 px-4">Experience & Salary</th>
                                    <th className="py-3.5 px-4">Joining Date</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredTeachers.map((teacher) => {
                                    const teacherName = teacher.user?.name || 'Unnamed Teacher';
                                    const teacherEmail = teacher.user?.email || 'No Email';

                                    return (
                                        <tr key={teacher._id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                                                        {teacherName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{teacherName}</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">{teacherEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg">
                                                    <BookOpen size={12} />
                                                    {teacher.subjectSpecialization || 'General'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 font-medium text-gray-800">
                                                {teacher.qualification || 'N/A'}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <p className="font-bold text-gray-900">{teacher.experience || 0} Yrs Exp</p>
                                                <p className="text-gray-500 text-[11px] mt-0.5">
                                                    {teacher.salary ? `$${teacher.salary.toLocaleString()}/mo` : 'N/A'}
                                                </p>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                                                {teacher.joiningDate
                                                    ? new Date(teacher.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openDetailsModal(teacher)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(teacher)}
                                                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        title="Edit Teacher"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(teacher)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete Teacher"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADD TEACHER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                                        <UserCheck size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add New Teacher</h3>
                                        <p className="text-xs text-gray-500">Register a new faculty member profile and account</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{formSuccess}</div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Account Credentials */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Faculty full name"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="teacher@school.com"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Password *</label>
                                        <input
                                            type="password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                                            placeholder="Min 6 characters"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Specialization</label>
                                        <input
                                            type="text"
                                            value={formData.subjectSpecialization}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectSpecialization: e.target.value }))}
                                            placeholder="e.g. Mathematics, Science"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Qualification</label>
                                        <input
                                            type="text"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                                            placeholder="e.g. M.Sc, Ph.D, B.Ed"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.experience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                            placeholder="Years of experience"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Salary ($ / Month)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.salary}
                                            onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                                            placeholder="Monthly compensation"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="Contact number"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Joining Date</label>
                                        <input
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
                                    <textarea
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Full address details..."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Registering...' : 'Register Teacher'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT TEACHER MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                                        <Edit2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Edit Teacher Profile</h3>
                                        <p className="text-xs text-gray-500">Update information for {selectedTeacher?.user?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{formSuccess}</div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Specialization</label>
                                        <input
                                            type="text"
                                            value={formData.subjectSpecialization}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectSpecialization: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Qualification</label>
                                        <input
                                            type="text"
                                            value={formData.qualification}
                                            onChange={(e) => setFormData(prev => ({ ...prev, qualification: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Experience (Years)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.experience}
                                            onChange={(e) => setFormData(prev => ({ ...prev, experience: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Salary ($ / Month)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={formData.salary}
                                            onChange={(e) => setFormData(prev => ({ ...prev, salary: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Joining Date</label>
                                        <input
                                            type="date"
                                            value={formData.joiningDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, joiningDate: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Residential Address</label>
                                    <textarea
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                    />
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Saving...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {isDetailsModalOpen && selectedTeacher && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsDetailsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-gray-100">
                            {/* Modal Header */}
                            <div className="p-6 bg-gradient-to-tr from-slate-900 via-emerald-950 to-teal-900 text-white relative">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <X size={18} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-emerald-500/30 border border-white/20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md">
                                        {selectedTeacher.user?.name ? selectedTeacher.user.name.charAt(0).toUpperCase() : 'T'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedTeacher.user?.name || 'Unnamed Teacher'}</h3>
                                        <p className="text-xs text-emerald-200 mt-0.5">{selectedTeacher.user?.email}</p>
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-emerald-500/30 text-emerald-200 text-[11px] font-semibold rounded-full border border-emerald-400/30">
                                            Faculty Member
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Details Grid */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic & Credentials</h4>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                                        <div>
                                            <p className="text-gray-500 font-semibold">Specialization</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedTeacher.subjectSpecialization || 'General'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Qualification</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedTeacher.qualification || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Experience</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedTeacher.experience || 0} Years</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Monthly Salary</p>
                                            <p className="font-bold text-gray-900 mt-0.5">
                                                {selectedTeacher.salary ? `$${selectedTeacher.salary.toLocaleString()}` : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Personal & Contact Info</h4>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                                        <div>
                                            <p className="text-gray-500 font-semibold">Phone Number</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedTeacher.phoneNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Gender</p>
                                            <p className="font-bold text-gray-900 capitalize mt-0.5">{selectedTeacher.gender || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Joining Date</p>
                                            <p className="font-bold text-gray-900 mt-0.5">
                                                {selectedTeacher.joiningDate
                                                    ? new Date(selectedTeacher.joiningDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedTeacher.address && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Address</h4>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs font-medium text-gray-700">
                                            {selectedTeacher.address}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex justify-end">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="px-5 py-2 bg-white border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-100"
                                >
                                    Close Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Teacher Record"
                message={`Are you sure you want to delete "${selectedTeacher?.user?.name || 'this teacher'}"? This action will remove their faculty profile and user credentials.`}
                confirmText="Yes, Delete Teacher"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

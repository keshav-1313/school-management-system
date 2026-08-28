import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    BookOpen,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    Layers,
    UserCheck,
    Calendar,
    CheckCircle2,
    FileText
} from 'lucide-react';
import classAPI from '../services/classAPI';
import userAPI from '../services/userAPI';
import subjectAPI from '../services/subjectAPI';

export const SubjectsPage = () => {
    const location = useLocation();

    // Data States
    const [subjects, setSubjects] = useState([]);
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Subject for Edit / Delete
    const [selectedSubject, setSelectedSubject] = useState(null);

    // Form Submitting & Message States
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Initial Form State
    const initialFormState = {
        subjectName: '',
        subjectCode: '',
        classId: '',
        teacherId: '',
        description: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // Extract classId query param from URL if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlClassId = params.get('classId');
        if (urlClassId) {
            setClassFilter(urlClassId);
        }
    }, [location.search]);

    // Fetch Subjects, Classes, and Teachers
    const fetchSubjectsData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [subjectsRes, classesRes, teachersRes] = await Promise.all([
                subjectAPI.getAllSubjects(),
                classAPI.getAllClasses(),
                userAPI.getAllTeachers(),
            ]);

            setSubjects(subjectsRes?.data?.subjects || []);
            setClasses(classesRes?.data?.classes || []);
            setTeachers(teachersRes?.data?.teachers || []);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load subjects.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjectsData();
    }, [fetchSubjectsData]);

    // Open Add Modal
    const openAddModal = () => {
        setFormData({
            ...initialFormState,
            classId: classFilter || (classes[0]?._id || ''),
        });
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (subject) => {
        setSelectedSubject(subject);
        setFormData({
            subjectName: subject.subjectName || '',
            subjectCode: subject.subjectCode || '',
            classId: subject.class?._id || subject.class || '',
            teacherId: subject.teacher?._id || subject.teacher || '',
            description: subject.description || '',
        });
        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (subject) => {
        setSelectedSubject(subject);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.subjectName || !formData.subjectCode || !formData.classId) {
            setFormError('Subject name, subject code, and class are required.');
            return;
        }

        setFormSubmitting(true);
        try {
            const res = await subjectAPI.createSubject(formData);
            if (res.data?.success) {
                setFormSuccess('Subject created successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchSubjectsData(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create subject.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedSubject) return;

        setFormSubmitting(true);
        try {
            const payload = {
                subjectName: formData.subjectName,
                subjectCode: formData.subjectCode,
                teacherId: formData.teacherId || null,
                description: formData.description,
            };

            const res = await subjectAPI.updateSubject(selectedSubject._id, payload);
            if (res.data?.success) {
                setFormSuccess('Subject updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchSubjectsData(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update subject.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedSubject) return;

        setFormSubmitting(true);
        try {
            const res = await subjectAPI.deleteSubject(selectedSubject._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchSubjectsData(true);
            }
        } catch (err) {
            console.error('Failed to delete subject:', err);
            alert(err?.response?.data?.message || 'Failed to delete subject.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Subjects
    const filteredSubjects = subjects.filter(sub => {
        const nameMatch = sub.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());
        const codeMatch = sub.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase());
        const classNameMatch = sub.class?.className?.toLowerCase().includes(searchQuery.toLowerCase());
        const teacherNameMatch = sub.teacher?.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSearch = !searchQuery || nameMatch || codeMatch || classNameMatch || teacherNameMatch;
        const subClassId = sub.class?._id || sub.class;
        const matchesClass = !classFilter || subClassId === classFilter;

        return matchesSearch && matchesClass;
    });

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
                            <BookOpen size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Subject Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Configure curriculum subjects, course codes, class assignments, and faculty teachers.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchSubjectsData(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-amber-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        disabled={classes.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Add New Subject</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load subjects"
                    message={error}
                    onRetry={() => fetchSubjectsData()}
                />
            )}

            {/* Search and Class Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <Search size={18} />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by subject name, code, class, or teacher..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
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

                    {/* Class Filter Dropdown */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400 hidden sm:block" />
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 p-2.5 min-w-[160px]"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.className}</option>
                                ))}
                            </select>
                        </div>

                        {(classFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setClassFilter('');
                                }}
                                className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content / Data Table */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    {[1, 2, 3, 4].map((i) => (
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
            ) : filteredSubjects.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={BookOpen}
                        title={searchQuery || classFilter ? 'No matching subjects found' : 'No Subjects Configured Yet'}
                        description={searchQuery || classFilter ? 'Try clearing your search query or class filter.' : 'Add your first subject and assign it to an academic class.'}
                        actionLabel="Add New Subject"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing {filteredSubjects.length} of {subjects.length} Subjects
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Subject Info</th>
                                    <th className="py-3.5 px-4">Subject Code</th>
                                    <th className="py-3.5 px-4">Assigned Class</th>
                                    <th className="py-3.5 px-4">Assigned Teacher</th>
                                    <th className="py-3.5 px-4">Created Date</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredSubjects.map((sub) => {
                                    const teacherName = sub.teacher?.user?.name || (sub.teacher ? 'Teacher Assigned' : 'Unassigned');

                                    return (
                                        <tr key={sub._id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                                                        <BookOpen size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{sub.subjectName}</p>
                                                        {sub.description && (
                                                            <p className="text-gray-500 text-xs mt-0.5 max-w-xs truncate">{sub.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 font-mono font-bold text-amber-700">
                                                <span className="px-2 py-0.5 bg-amber-50 rounded-md">
                                                    {sub.subjectCode}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[11px] rounded-lg">
                                                    <Layers size={12} />
                                                    {sub.class?.className || 'Class'}
                                                </span>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                {sub.teacher?.user?.name ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-semibold text-[11px] rounded-lg">
                                                        <UserCheck size={12} />
                                                        {sub.teacher.user.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 italic">Unassigned</span>
                                                )}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                                                {sub.createdAt
                                                    ? new Date(sub.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEditModal(sub)}
                                                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                                                        title="Edit Subject"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(sub)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete Subject"
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

            {/* ADD SUBJECT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                                        <BookOpen size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add New Subject</h3>
                                        <p className="text-xs text-gray-500">Configure subject code & class assignment</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{formSuccess}</div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subjectName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
                                            placeholder="e.g. Mathematics"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subjectCode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectCode: e.target.value }))}
                                            placeholder="e.g. MATH101"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Class *</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">-- Select Class --</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.className}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Teacher (Optional)</label>
                                        <select
                                            value={formData.teacherId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id}>
                                                    {t.user?.name || 'Teacher'} ({t.subjectSpecialization || 'General'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Course description or notes..."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Creating...' : 'Create Subject'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT SUBJECT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-amber-600 text-white rounded-xl">
                                        <Edit2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Edit Subject Details</h3>
                                        <p className="text-xs text-gray-500">Update subject for {selectedSubject?.subjectName}</p>
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
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subjectName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectName: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject Code *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.subjectCode}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectCode: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        />
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Assigned Teacher (Optional)</label>
                                        <select
                                            value={formData.teacherId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                        >
                                            <option value="">-- Unassigned --</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id}>
                                                    {t.user?.name || 'Teacher'} ({t.subjectSpecialization || 'General'})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Description (Optional)</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
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
                                        className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
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

            {/* DELETE CONFIRMATION MODAL */}
            <ConfirmModal
                isOpen={isDeleteModalOpen}
                title="Delete Subject"
                message={`Are you sure you want to delete Subject "${selectedSubject?.subjectName} (${selectedSubject?.subjectCode})"?`}
                confirmText="Yes, Delete Subject"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    Layers,
    Plus,
    Search,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    BookMarked,
    BookOpen,
    ArrowRight,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import classAPI from '../services/classAPI';

export const ClassesPage = () => {
    // Data States
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Class for Edit / Delete
    const [selectedClass, setSelectedClass] = useState(null);

    // Form Submitting & Message States
    const [classNameInput, setClassNameInput] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Fetch All Classes
    const fetchClasses = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await classAPI.getAllClasses();
            setClasses(res?.data?.classes || []);
        } catch (err) {
            console.error('Error fetching classes:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load classes.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    // Open Add Modal
    const openAddModal = () => {
        setClassNameInput('');
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (academicClass) => {
        setSelectedClass(academicClass);
        setClassNameInput(academicClass.className || '');
        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (academicClass) => {
        setSelectedClass(academicClass);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!classNameInput.trim()) {
            setFormError('Class name is required.');
            return;
        }

        setFormSubmitting(true);
        try {
            const res = await classAPI.createClass({ className: classNameInput.trim() });
            if (res.data?.success) {
                setFormSuccess('Class created successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchClasses(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create class.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedClass || !classNameInput.trim()) return;

        setFormSubmitting(true);
        try {
            const res = await classAPI.updateClass(selectedClass._id, { className: classNameInput.trim() });
            if (res.data?.success) {
                setFormSuccess('Class updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchClasses(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update class.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedClass) return;

        setFormSubmitting(true);
        try {
            const res = await classAPI.deleteClass(selectedClass._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchClasses(true);
            }
        } catch (err) {
            console.error('Failed to delete class:', err);
            alert(err?.response?.data?.message || 'Failed to delete class.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Classes
    const filteredClasses = classes.filter(c =>
        c.className?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-purple-600 text-white rounded-2xl shadow-md shadow-purple-500/20">
                            <Layers size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Class Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Configure academic grade levels and classes for student enrollment.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchClasses(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-purple-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-purple-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Create New Class</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load classes"
                    message={error}
                    onRetry={() => fetchClasses()}
                />
            )}

            {/* Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <Search size={18} />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search class by name (e.g. Class 10, Grade 1)..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
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
            </div>

            {/* Main Table / Content Section */}
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
            ) : filteredClasses.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={Layers}
                        title={searchQuery ? 'No matching classes found' : 'No Classes Configured Yet'}
                        description={searchQuery ? 'Try clearing your search query.' : 'Create your first academic class to start adding sections and subjects.'}
                        actionLabel="Create New Class"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map((ac) => (
                        <div key={ac._id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs hover:shadow-md transition-all group relative overflow-hidden flex flex-col justify-between">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

                            <div>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                        <Layers size={24} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(ac)}
                                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-colors"
                                            title="Edit Class"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => openDeleteModal(ac)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                            title="Delete Class"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-xl font-bold text-gray-900">{ac.className}</h3>
                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                    <Calendar size={13} /> Created {new Date(ac.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </p>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                                <Link
                                    to={`/sections?classId=${ac._id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold rounded-xl transition-colors"
                                >
                                    <BookMarked size={14} /> View Sections
                                </Link>
                                <Link
                                    to={`/subjects?classId=${ac._id}`}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold rounded-xl transition-colors"
                                >
                                    <BookOpen size={14} /> View Subjects
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ADD CLASS MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                                        <Layers size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Create Academic Class</h3>
                                        <p className="text-xs text-gray-500">Configure new grade level</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{formSuccess}</div>}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Class Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={classNameInput}
                                        onChange={(e) => setClassNameInput(e.target.value)}
                                        placeholder="e.g. Class 10, Grade 1"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Creating...' : 'Create Class'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT CLASS MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                                        <Edit2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Edit Class Name</h3>
                                        <p className="text-xs text-gray-500">Update name for {selectedClass?.className}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl">{formError}</div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl">{formSuccess}</div>}

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Class Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={classNameInput}
                                        onChange={(e) => setClassNameInput(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
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
                                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-purple-500/20 flex items-center gap-2 disabled:opacity-50"
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
                title="Delete Academic Class"
                message={`Are you sure you want to delete "${selectedClass?.className}"? This may affect sections and students linked to this grade.`}
                confirmText="Yes, Delete Class"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    BookMarked,
    Plus,
    Search,
    Filter,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    Layers,
    Calendar,
    CheckCircle2
} from 'lucide-react';
import classAPI from '../services/classAPI';
import sectionAPI from '../services/sectionAPI';

export const SectionsPage = () => {
    const location = useLocation();

    // Data States
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Selected Parent Class Filter
    const [selectedClassId, setSelectedClassId] = useState('');

    // Search Query
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Section for Edit / Delete
    const [selectedSection, setSelectedSection] = useState(null);

    // Form Submitting & Message States
    const [formClassId, setFormClassId] = useState('');
    const [sectionNameInput, setSectionNameInput] = useState('');
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Extract classId query param from URL if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlClassId = params.get('classId');
        if (urlClassId) {
            setSelectedClassId(urlClassId);
        }
    }, [location.search]);

    // Fetch Classes & Sections
    const fetchSectionsData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const classesRes = await classAPI.getAllClasses();
            const classList = classesRes?.data?.classes || [];
            setClasses(classList);

            // Fetch sections
            if (classList.length > 0) {
                const targetClassId = selectedClassId || classList[0]._id;
                if (!selectedClassId) setSelectedClassId(targetClassId);

                const sectionsRes = await sectionAPI.getSectionsByClass(targetClassId);
                setSections(sectionsRes?.data?.sections || []);
            } else {
                setSections([]);
            }
        } catch (err) {
            console.error('Error fetching sections:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load sections.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedClassId]);

    useEffect(() => {
        fetchSectionsData();
    }, [fetchSectionsData]);

    // Handle Class Selection Change
    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        if (!classId) return;
        setLoading(true);
        try {
            const res = await sectionAPI.getSectionsByClass(classId);
            setSections(res?.data?.sections || []);
        } catch (err) {
            setSections([]);
        } finally {
            setLoading(false);
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        setFormClassId(selectedClassId || (classes[0]?._id || ''));
        setSectionNameInput('');
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (section) => {
        setSelectedSection(section);
        setSectionNameInput(section.sectionName || '');
        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (section) => {
        setSelectedSection(section);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formClassId || !sectionNameInput.trim()) {
            setFormError('Class and section name are required.');
            return;
        }

        setFormSubmitting(true);
        try {
            const res = await sectionAPI.createSection({
                sectionName: sectionNameInput.trim(),
                classId: formClassId,
            });
            if (res.data?.success) {
                setFormSuccess('Section created successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchSectionsData(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create section.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedSection || !sectionNameInput.trim()) return;

        setFormSubmitting(true);
        try {
            const res = await sectionAPI.updateSection(selectedSection._id, {
                sectionName: sectionNameInput.trim(),
            });
            if (res.data?.success) {
                setFormSuccess('Section updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchSectionsData(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update section.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedSection) return;

        setFormSubmitting(true);
        try {
            const res = await sectionAPI.deleteSection(selectedSection._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchSectionsData(true);
            }
        } catch (err) {
            console.error('Failed to delete section:', err);
            alert(err?.response?.data?.message || 'Failed to delete section.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Sections
    const filteredSections = sections.filter(sec =>
        sec.sectionName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Active Parent Class object
    const activeClassObj = classes.find(c => c._id === selectedClassId);

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                            <BookMarked size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Section Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Configure sections (e.g. Section A, Section B) under each academic class.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchSectionsData(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        disabled={classes.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Add New Section</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load sections"
                    message={error}
                    onRetry={() => fetchSectionsData()}
                />
            )}

            {/* Class Selector Bar & Search */}
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
                            placeholder="Search section by name (e.g. A, B, North)..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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

                    {/* Class Selector Dropdown */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-600 whitespace-nowrap">Filter Class:</span>
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 min-w-[160px]"
                        >
                            {classes.length === 0 ? (
                                <option value="">No classes found</option>
                            ) : (
                                classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.className}</option>
                                ))
                            )}
                        </select>
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
            ) : filteredSections.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={BookMarked}
                        title={searchQuery ? 'No matching sections found' : `No Sections for ${activeClassObj?.className || 'Class'}`}
                        description={searchQuery ? 'Try clearing your search query.' : 'Add a section (e.g. A, B) under this class.'}
                        actionLabel="Add New Section"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing {filteredSections.length} Sections for {activeClassObj?.className || 'Selected Class'}
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Section Name</th>
                                    <th className="py-3.5 px-4">Parent Class</th>
                                    <th className="py-3.5 px-4">Created Date</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredSections.map((sec) => (
                                    <tr key={sec._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                                    <BookMarked size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">Section {sec.sectionName}</p>
                                                    <p className="text-gray-400 text-[11px]">ID: {sec._id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[11px] rounded-lg">
                                                <Layers size={12} />
                                                {sec.class?.className || activeClassObj?.className || 'Class'}
                                            </span>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                                            {sec.createdAt
                                                ? new Date(sec.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '-'}
                                        </td>

                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => openEditModal(sec)}
                                                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                    title="Edit Section"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(sec)}
                                                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Section"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ADD SECTION MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <BookMarked size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add New Section</h3>
                                        <p className="text-xs text-gray-500">Configure section under class</p>
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
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Parent Class *</label>
                                    <select
                                        required
                                        value={formClassId}
                                        onChange={(e) => setFormClassId(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Class --</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.className}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={sectionNameInput}
                                        onChange={(e) => setSectionNameInput(e.target.value)}
                                        placeholder="e.g. A, B, Red, North"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Creating...' : 'Create Section'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT SECTION MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <Edit2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Edit Section Name</h3>
                                        <p className="text-xs text-gray-500">Update section name</p>
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
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Section Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={sectionNameInput}
                                        onChange={(e) => setSectionNameInput(e.target.value)}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-50"
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
                title="Delete Section"
                message={`Are you sure you want to delete Section "${selectedSection?.sectionName}"?`}
                confirmText="Yes, Delete Section"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

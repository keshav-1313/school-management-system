import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    FileCheck2,
    Plus,
    Search,
    Filter,
    Trash2,
    RefreshCw,
    X,
    Layers,
    BookMarked,
    BookOpen,
    Calendar,
    Award,
    CheckCircle2,
    ArrowRight,
    FileText
} from 'lucide-react';
import classAPI from '../services/classAPI';
import sectionAPI from '../services/sectionAPI';
import subjectAPI from '../services/subjectAPI';
import examAPI from '../services/examAPI';

export const ExamsPage = () => {
    const navigate = useNavigate();

    // Data States
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedExam, setSelectedExam] = useState(null);

    // Form Submitting & Message States
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Form State
    const initialFormState = {
        examName: '',
        classId: '',
        sectionId: '',
        subjectId: '',
        examDate: new Date().toISOString().split('T')[0],
        totalMarks: 100,
        passingMarks: 40,
        description: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch All Exams and Metadata
    const fetchExamsData = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [examsRes, classesRes, subjectsRes] = await Promise.all([
                examAPI.getAllExams(),
                classAPI.getAllClasses(),
                subjectAPI.getAllSubjects(),
            ]);

            setExams(examsRes?.data?.exams || []);
            setClasses(classesRes?.data?.classes || []);
            setSubjects(subjectsRes?.data?.subjects || []);
        } catch (err) {
            console.error('Error fetching exams:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load exams.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchExamsData();
    }, [fetchExamsData]);

    // Handle Class Change in Add Form to fetch sections and filter subjects
    const handleFormClassChange = async (classId) => {
        setFormData(prev => ({ ...prev, classId, sectionId: '', subjectId: '' }));
        setSections([]);

        if (!classId) return;

        try {
            const res = await sectionAPI.getSectionsByClass(classId);
            const secList = res?.data?.sections || [];
            setSections(secList);
            if (secList.length > 0) {
                setFormData(prev => ({ ...prev, sectionId: secList[0]._id }));
            }

            const classSubjects = subjects.filter(s => (s.class?._id || s.class) === classId);
            if (classSubjects.length > 0) {
                setFormData(prev => ({ ...prev, subjectId: classSubjects[0]._id }));
            }
        } catch (err) {
            console.error('Error fetching sections for class:', err);
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        const defaultClassId = classFilter || (classes[0]?._id || '');
        setFormData({
            ...initialFormState,
            classId: defaultClassId,
        });
        if (defaultClassId) {
            handleFormClassChange(defaultClassId);
        }
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (exam) => {
        setSelectedExam(exam);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.examName || !formData.classId || !formData.sectionId || !formData.subjectId || !formData.examDate) {
            setFormError('Exam name, class, section, subject, and date are required.');
            return;
        }

        if (Number(formData.passingMarks) > Number(formData.totalMarks)) {
            setFormError('Passing marks cannot exceed total marks.');
            return;
        }

        setFormSubmitting(true);
        try {
            const payload = {
                examName: formData.examName,
                classId: formData.classId,
                sectionId: formData.sectionId,
                subjectId: formData.subjectId,
                examDate: formData.examDate,
                totalMarks: Number(formData.totalMarks),
                passingMarks: Number(formData.passingMarks),
                description: formData.description,
            };

            const res = await examAPI.createExam(payload);
            if (res.data?.success) {
                setFormSuccess('Exam created successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchExamsData(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create exam.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedExam) return;

        setFormSubmitting(true);
        try {
            const res = await examAPI.deleteExam(selectedExam._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchExamsData(true);
            }
        } catch (err) {
            console.error('Failed to delete exam:', err);
            alert(err?.response?.data?.message || 'Failed to delete exam.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Exams
    const filteredExams = exams.filter(ex => {
        const nameMatch = ex.examName?.toLowerCase().includes(searchQuery.toLowerCase());
        const subjectMatch = ex.subject?.subjectName?.toLowerCase().includes(searchQuery.toLowerCase());
        const classNameMatch = ex.class?.className?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSearch = !searchQuery || nameMatch || subjectMatch || classNameMatch;
        const exClassId = ex.class?._id || ex.class;
        const matchesClass = !classFilter || exClassId === classFilter;

        return matchesSearch && matchesClass;
    });

    const filteredSubjectsForFormClass = subjects.filter(s => (s.class?._id || s.class) === formData.classId);

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-md shadow-indigo-500/20">
                            <FileCheck2 size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Exam Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Schedule examinations, set passing marks, and manage course evaluations.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchExamsData(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        disabled={classes.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Schedule New Exam</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load exams"
                    message={error}
                    onRetry={() => fetchExamsData()}
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
                            placeholder="Search by exam name, subject, or class..."
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
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
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 p-2.5 min-w-[160px]"
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

            {/* Main Content / Table */}
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
            ) : filteredExams.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={FileCheck2}
                        title={searchQuery || classFilter ? 'No matching exams found' : 'No Exams Scheduled Yet'}
                        description={searchQuery || classFilter ? 'Try clearing your search query or class filter.' : 'Schedule your first examination for students.'}
                        actionLabel="Schedule New Exam"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing {filteredExams.length} of {exams.length} Scheduled Examinations
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Exam Info</th>
                                    <th className="py-3.5 px-4">Class & Section</th>
                                    <th className="py-3.5 px-4">Subject</th>
                                    <th className="py-3.5 px-4">Exam Date</th>
                                    <th className="py-3.5 px-4">Marks (Total / Passing)</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredExams.map((ex) => (
                                    <tr key={ex._id} className="hover:bg-gray-50/70 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                                    <FileCheck2 size={18} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm leading-tight">{ex.examName}</p>
                                                    {ex.description && (
                                                        <p className="text-gray-500 text-xs mt-0.5 max-w-xs truncate">{ex.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 font-bold text-[11px] rounded-lg">
                                                    <Layers size={12} />
                                                    {ex.class?.className || 'Class'}
                                                </span>
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-lg">
                                                    Sec {ex.section?.sectionName || '-'}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap font-bold text-amber-700">
                                            {ex.subject?.subjectName || 'Subject'}
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap text-gray-700 font-medium">
                                            {ex.examDate
                                                ? new Date(ex.examDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '-'}
                                        </td>

                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <span className="font-bold text-gray-900">{ex.totalMarks} Marks</span>
                                            <span className="text-gray-400 text-[11px] block">Pass: {ex.passingMarks}</span>
                                        </td>

                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => navigate(`/results?examId=${ex._id}`)}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors"
                                                >
                                                    <Award size={14} /> Enter Results
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(ex)}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                    title="Delete Exam"
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

            {/* ADD EXAM MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-600 text-white rounded-xl">
                                        <FileCheck2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Schedule Examination</h3>
                                        <p className="text-xs text-gray-500">Create new evaluation test</p>
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
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Exam Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.examName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, examName: e.target.value }))}
                                        placeholder="e.g. Mid-Term Examination 2026"
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Class *</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => handleFormClassChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="">-- Select --</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.className}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Section *</label>
                                        <select
                                            required
                                            value={formData.sectionId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="">-- Select --</option>
                                            {sections.map(s => (
                                                <option key={s._id} value={s._id}>Section {s.sectionName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                                        <select
                                            required
                                            value={formData.subjectId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        >
                                            <option value="">-- Select --</option>
                                            {filteredSubjectsForFormClass.map(sub => (
                                                <option key={sub._id} value={sub._id}>{sub.subjectName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Exam Date *</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.examDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, examDate: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Total Marks *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.totalMarks}
                                            onChange={(e) => setFormData(prev => ({ ...prev, totalMarks: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Passing Marks *</label>
                                        <input
                                            type="number"
                                            min="0"
                                            required
                                            value={formData.passingMarks}
                                            onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Description / Syllabus Notes</label>
                                    <textarea
                                        rows={2}
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        placeholder="Optional exam instructions..."
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Creating...' : 'Schedule Exam'}</span>
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
                title="Delete Examination"
                message={`Are you sure you want to delete "${selectedExam?.examName}"? Associated student results will also be affected.`}
                confirmText="Yes, Delete Exam"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

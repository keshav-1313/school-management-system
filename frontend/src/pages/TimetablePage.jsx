import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    Clock,
    Plus,
    Filter,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    Layers,
    BookMarked,
    BookOpen,
    UserCheck,
    Calendar,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';
import classAPI from '../services/classAPI';
import sectionAPI from '../services/sectionAPI';
import subjectAPI from '../services/subjectAPI';
import timetableAPI from '../services/timetableAPI';

const DAYS_OF_WEEK = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

export const TimetablePage = () => {
    // Data States
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [timetableSlots, setTimetableSlots] = useState([]);

    // Selector States
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    // UI Loading & Message States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);

    // Form Submitting & Error States
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Form Initial State
    const initialFormState = {
        classId: '',
        sectionId: '',
        day: 'Monday',
        periodNumber: 1,
        startTime: '08:00',
        endTime: '08:50',
        subjectId: '',
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch Metadata (Classes & Subjects)
    const fetchMetadata = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [classesRes, subjectsRes] = await Promise.all([
                classAPI.getAllClasses(),
                subjectAPI.getAllSubjects(),
            ]);

            const classList = classesRes?.data?.classes || [];
            const subjectList = subjectsRes?.data?.subjects || [];

            setClasses(classList);
            setSubjects(subjectList);

            if (classList.length > 0) {
                const initialClassId = classList[0]._id;
                setSelectedClassId(initialClassId);

                // Fetch sections for default class
                const sectionsRes = await sectionAPI.getSectionsByClass(initialClassId);
                const sectionList = sectionsRes?.data?.sections || [];
                setSections(sectionList);
                if (sectionList.length > 0) {
                    setSelectedSectionId(sectionList[0]._id);
                }
            }
        } catch (err) {
            console.error('Error fetching timetable metadata:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load timetable options.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    // Fetch Class Timetable Slots
    const fetchClassTimetable = useCallback(async (classId, sectionId, isRefresh = false) => {
        if (!classId || !sectionId) {
            setTimetableSlots([]);
            return;
        }

        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const res = await timetableAPI.getClassTimetable(classId, sectionId);
            setTimetableSlots(res?.data?.timetable || []);
        } catch (err) {
            console.error('Error fetching class timetable:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load timetable for selected class.');
            setTimetableSlots([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClassId && selectedSectionId) {
            fetchClassTimetable(selectedClassId, selectedSectionId);
        }
    }, [selectedClassId, selectedSectionId, fetchClassTimetable]);

    // Handle Class Selection Change
    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        setSelectedSectionId('');
        setSections([]);

        if (!classId) return;

        try {
            const res = await sectionAPI.getSectionsByClass(classId);
            const secList = res?.data?.sections || [];
            setSections(secList);
            if (secList.length > 0) {
                setSelectedSectionId(secList[0]._id);
            }
        } catch (err) {
            console.error('Error fetching sections for class:', err);
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        const classSubjects = subjects.filter(s => (s.class?._id || s.class) === selectedClassId);
        setFormData({
            classId: selectedClassId,
            sectionId: selectedSectionId,
            day: 'Monday',
            periodNumber: (timetableSlots.length % 6) + 1,
            startTime: '08:00',
            endTime: '08:50',
            subjectId: classSubjects[0]?._id || '',
        });
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = (slot) => {
        setSelectedSlot(slot);
        setFormData({
            classId: slot.class?._id || slot.class || selectedClassId,
            sectionId: slot.section?._id || slot.section || selectedSectionId,
            day: slot.day || 'Monday',
            periodNumber: slot.periodNumber || 1,
            startTime: slot.startTime || '08:00',
            endTime: slot.endTime || '08:50',
            subjectId: slot.subject?._id || slot.subject || '',
        });
        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);
    };

    // Open Delete Modal
    const openDeleteModal = (slot) => {
        setSelectedSlot(slot);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Form Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.classId || !formData.sectionId || !formData.day || !formData.periodNumber || !formData.startTime || !formData.endTime || !formData.subjectId) {
            setFormError('All fields are required.');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            setFormError('Start time must be before end time.');
            return;
        }

        setFormSubmitting(true);
        try {
            const payload = {
                classId: formData.classId,
                sectionId: formData.sectionId,
                day: formData.day,
                periodNumber: Number(formData.periodNumber),
                startTime: formData.startTime,
                endTime: formData.endTime,
                subjectId: formData.subjectId,
            };

            const res = await timetableAPI.createTimetableSlot(payload);
            if (res.data?.success) {
                setFormSuccess('Timetable slot created successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchClassTimetable(selectedClassId, selectedSectionId, true);
                }, 800);
            }
        } catch (err) {
            console.error('Failed to create timetable slot:', err);
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create timetable slot.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Form Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedSlot) return;

        if (formData.startTime >= formData.endTime) {
            setFormError('Start time must be before end time.');
            return;
        }

        setFormSubmitting(true);
        try {
            const payload = {
                day: formData.day,
                periodNumber: Number(formData.periodNumber),
                startTime: formData.startTime,
                endTime: formData.endTime,
                subject: formData.subjectId,
            };

            const res = await timetableAPI.updateTimetableSlot(selectedSlot._id, payload);
            if (res.data?.success) {
                setFormSuccess('Timetable slot updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchClassTimetable(selectedClassId, selectedSectionId, true);
                }, 800);
            }
        } catch (err) {
            console.error('Failed to update timetable slot:', err);
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update timetable slot.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedSlot) return;

        setFormSubmitting(true);
        try {
            const res = await timetableAPI.deleteTimetableSlot(selectedSlot._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchClassTimetable(selectedClassId, selectedSectionId, true);
            }
        } catch (err) {
            console.error('Failed to delete timetable slot:', err);
            alert(err?.response?.data?.message || 'Failed to delete timetable slot.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Group timetable slots by day
    const slotsByDay = DAYS_OF_WEEK.reduce((acc, day) => {
        acc[day] = timetableSlots
            .filter(slot => slot.day === day)
            .sort((a, b) => (a.periodNumber || 0) - (b.periodNumber || 0));
        return acc;
    }, {});

    const activeClassObj = classes.find(c => c._id === selectedClassId);
    const activeSectionObj = sections.find(s => s._id === selectedSectionId);

    const filteredSubjectsForClass = subjects.filter(s => (s.class?._id || s.class) === (formData.classId || selectedClassId));

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                            <Clock size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Timetable Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Configure weekly class period schedules, timing slots, and subject faculty assignments.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchClassTimetable(selectedClassId, selectedSectionId, true)}
                        disabled={refreshing || loading || !selectedClassId || !selectedSectionId}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh schedule"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        disabled={!selectedClassId || !selectedSectionId}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                        <span>Add Period Slot</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Timetable Notification"
                    message={error}
                    onRetry={() => fetchClassTimetable(selectedClassId, selectedSectionId)}
                />
            )}

            {/* Class & Section Selector Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Class Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Class:</span>
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 min-w-[150px]"
                        >
                            {classes.map(c => (
                                <option key={c._id} value={c._id}>{c.className}</option>
                            ))}
                        </select>
                    </div>

                    {/* Section Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Section:</span>
                        <select
                            value={selectedSectionId}
                            onChange={(e) => setSelectedSectionId(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-bold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5 min-w-[150px]"
                        >
                            {sections.length === 0 ? (
                                <option value="">No sections</option>
                            ) : (
                                sections.map(s => (
                                    <option key={s._id} value={s._id}>Section {s.sectionName}</option>
                                ))
                            )}
                        </select>
                    </div>
                </div>

                {activeClassObj && activeSectionObj && (
                    <div className="text-xs font-semibold text-gray-500 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Viewing Schedule for <strong className="text-gray-900">{activeClassObj.className} - Sec {activeSectionObj.sectionName}</strong>
                    </div>
                )}
            </div>

            {/* Weekly Timetable Schedule Matrix */}
            {loading ? (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            ) : timetableSlots.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={Clock}
                        title={`No Timetable Slots for ${activeClassObj?.className || 'Class'} ${activeSectionObj ? `(Sec ${activeSectionObj.sectionName})` : ''}`}
                        description="Add period slots to configure the weekly academic timetable."
                        actionLabel="Add Period Slot"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {DAYS_OF_WEEK.map((day) => {
                        const daySlots = slotsByDay[day] || [];

                        return (
                            <div key={day} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
                                {/* Day Header */}
                                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                                    <h3 className="font-bold text-gray-900 text-xs uppercase tracking-wider">{day}</h3>
                                    <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                        {daySlots.length} Slots
                                    </span>
                                </div>

                                {/* Period Slot Cards */}
                                <div className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[600px]">
                                    {daySlots.length === 0 ? (
                                        <p className="text-[11px] text-gray-400 italic text-center py-6">No classes</p>
                                    ) : (
                                        daySlots.map((slot) => (
                                            <div
                                                key={slot._id}
                                                className="p-3 bg-gray-50 hover:bg-blue-50/50 border border-gray-200/70 hover:border-blue-200 rounded-xl transition-all relative group"
                                            >
                                                {/* Header & Badges */}
                                                <div className="flex items-center justify-between gap-1 mb-2">
                                                    <span className="px-2 py-0.5 bg-blue-600 text-white font-mono font-bold text-[10px] rounded-md shadow-2xs">
                                                        Period {slot.periodNumber}
                                                    </span>

                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(slot)}
                                                            className="p-1 text-gray-400 hover:text-blue-600 rounded-md"
                                                            title="Edit Slot"
                                                        >
                                                            <Edit2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteModal(slot)}
                                                            className="p-1 text-gray-400 hover:text-red-600 rounded-md"
                                                            title="Delete Slot"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Subject Info */}
                                                <p className="font-bold text-gray-900 text-xs leading-tight">
                                                    {slot.subject?.subjectName || 'Subject'}
                                                </p>

                                                {slot.subject?.subjectCode && (
                                                    <p className="text-[10px] font-mono text-amber-700 font-semibold mt-0.5">
                                                        {slot.subject.subjectCode}
                                                    </p>
                                                )}

                                                {/* Time Range */}
                                                <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] text-gray-500">
                                                    <span className="font-medium flex items-center gap-1">
                                                        <Clock size={11} className="text-gray-400" />
                                                        {slot.startTime} - {slot.endTime}
                                                    </span>
                                                </div>

                                                {/* Teacher Info */}
                                                {slot.teacher?.user?.name && (
                                                    <p className="text-[10px] text-emerald-700 font-semibold mt-1 flex items-center gap-1 truncate">
                                                        <UserCheck size={11} /> {slot.teacher.user.name}
                                                    </p>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ADD PERIOD SLOT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Add Timetable Slot</h3>
                                        <p className="text-xs text-gray-500">Configure period schedule</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsAddModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2"><AlertCircle size={16} /><span>{formError}</span></div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"><CheckCircle2 size={16} /><span>{formSuccess}</span></div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Day of Week *</label>
                                        <select
                                            required
                                            value={formData.day}
                                            onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {DAYS_OF_WEEK.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Period Number *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.periodNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, periodNumber: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Start Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">End Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                                    <select
                                        required
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Subject --</option>
                                        {filteredSubjectsForClass.map(sub => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.subjectName} ({sub.subjectCode}) — {sub.teacher?.user?.name ? `Teacher: ${sub.teacher.user.name}` : 'Unassigned'}
                                            </option>
                                        ))}
                                    </select>
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
                                        <span>{formSubmitting ? 'Creating...' : 'Create Slot'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT PERIOD SLOT MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsEditModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-gray-100">
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <Edit2 size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Edit Timetable Slot</h3>
                                        <p className="text-xs text-gray-500">Update period details</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                {formError && <div className="p-3.5 bg-red-50 text-red-700 text-xs font-semibold rounded-xl flex items-center gap-2"><AlertCircle size={16} /><span>{formError}</span></div>}
                                {formSuccess && <div className="p-3.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-xl flex items-center gap-2"><CheckCircle2 size={16} /><span>{formSuccess}</span></div>}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Day of Week *</label>
                                        <select
                                            required
                                            value={formData.day}
                                            onChange={(e) => setFormData(prev => ({ ...prev, day: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            {DAYS_OF_WEEK.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Period Number *</label>
                                        <input
                                            type="number"
                                            min="1"
                                            required
                                            value={formData.periodNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, periodNumber: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Start Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.startTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">End Time *</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.endTime}
                                            onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Subject *</label>
                                    <select
                                        required
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, subjectId: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                    >
                                        <option value="">-- Select Subject --</option>
                                        {filteredSubjectsForClass.map(sub => (
                                            <option key={sub._id} value={sub._id}>
                                                {sub.subjectName} ({sub.subjectCode}) — {sub.teacher?.user?.name ? `Teacher: ${sub.teacher.user.name}` : 'Unassigned'}
                                            </option>
                                        ))}
                                    </select>
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
                title="Delete Timetable Slot"
                message={`Are you sure you want to delete Period ${selectedSlot?.periodNumber} (${selectedSlot?.day})?`}
                confirmText="Yes, Delete Slot"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

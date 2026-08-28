import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    CalendarCheck,
    CheckCircle2,
    XCircle,
    Clock,
    RefreshCw,
    Search,
    Filter,
    BookOpen,
    Layers,
    BookMarked,
    UserCheck,
    BarChart3,
    ListFilter,
    Calendar,
    Send,
    User,
    Check,
    AlertCircle
} from 'lucide-react';
import classAPI from '../services/classAPI';
import sectionAPI from '../services/sectionAPI';
import subjectAPI from '../services/subjectAPI';
import userAPI from '../services/userAPI';
import attendanceAPI from '../services/attendanceAPI';

export const AttendancePage = () => {
    // Mode Tab: 'mark' | 'records' | 'stats'
    const [activeTab, setActiveTab] = useState('mark');

    // General Resource Data
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Selectors State
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    // Roster state for Mark Attendance Tab: Map of studentProfileId -> { status: 'present'|'absent'|'late', remarks: '' }
    const [rosterStatus, setRosterStatus] = useState({});

    // Attendance Records Log Tab state
    const [recordsClassId, setRecordsClassId] = useState('');
    const [recordsData, setRecordsData] = useState([]);
    const [recordsSearchQuery, setRecordsSearchQuery] = useState('');

    // Student Stats Tab state
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentStats, setStudentStats] = useState(null);
    const [studentHistory, setStudentHistory] = useState([]);

    // UI Loading & Message States
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    // Fetch initial baseline metadata (Classes, Subjects, Students)
    const fetchMetadata = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [classesRes, subjectsRes, studentsRes] = await Promise.all([
                classAPI.getAllClasses(),
                subjectAPI.getAllSubjects(),
                userAPI.getAllStudents(),
            ]);

            const classList = classesRes?.data?.classes || [];
            const subjectList = subjectsRes?.data?.subjects || [];
            const studentList = studentsRes?.data?.students || [];

            setClasses(classList);
            setSubjects(subjectList);
            setAllStudents(studentList);

            if (classList.length > 0) {
                const initialClassId = classList[0]._id;
                setSelectedClassId(initialClassId);
                setRecordsClassId(initialClassId);

                // Fetch sections for default class
                const sectionsRes = await sectionAPI.getSectionsByClass(initialClassId);
                const sectionList = sectionsRes?.data?.sections || [];
                setSections(sectionList);
                if (sectionList.length > 0) {
                    setSelectedSectionId(sectionList[0]._id);
                }

                // Filter default subject for class
                const classSubjects = subjectList.filter(s => (s.class?._id || s.class) === initialClassId);
                if (classSubjects.length > 0) {
                    setSelectedSubjectId(classSubjects[0]._id);
                }
            }

            if (studentList.length > 0) {
                setSelectedStudentId(studentList[0]._id);
            }
        } catch (err) {
            console.error('Error loading metadata for attendance:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load attendance options.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    // Update Sections & Subjects when selectedClassId changes in Mark Tab
    const handleClassChange = async (classId) => {
        setSelectedClassId(classId);
        setSelectedSectionId('');
        setSelectedSubjectId('');
        setSections([]);

        if (!classId) return;

        try {
            const sectionsRes = await sectionAPI.getSectionsByClass(classId);
            const secList = sectionsRes?.data?.sections || [];
            setSections(secList);
            if (secList.length > 0) {
                setSelectedSectionId(secList[0]._id);
            }

            const classSubjects = subjects.filter(s => (s.class?._id || s.class) === classId);
            if (classSubjects.length > 0) {
                setSelectedSubjectId(classSubjects[0]._id);
            }
        } catch (err) {
            console.error('Error fetching sections for class:', err);
        }
    };

    // Filter students belonging to selected class & section
    const currentRosterStudents = allStudents.filter(student => {
        const studentClassId = student.class?._id || student.class;
        const studentSectionId = student.section?._id || student.section;
        const matchesClass = !selectedClassId || studentClassId === selectedClassId;
        const matchesSection = !selectedSectionId || studentSectionId === selectedSectionId;
        return matchesClass && matchesSection;
    });

    // Initialize roster status map whenever currentRosterStudents changes
    useEffect(() => {
        const initialStatus = {};
        currentRosterStudents.forEach(st => {
            initialStatus[st._id] = {
                status: 'present',
                remarks: '',
            };
        });
        setRosterStatus(initialStatus);
    }, [selectedClassId, selectedSectionId, allStudents]);

    // Handle Status Change for individual student
    const handleStudentStatusChange = (studentId, status) => {
        setRosterStatus(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                status,
            },
        }));
    };

    // Handle Remarks Change for individual student
    const handleStudentRemarksChange = (studentId, remarks) => {
        setRosterStatus(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                remarks,
            },
        }));
    };

    // Batch Action: Mark All Present
    const markAllPresent = () => {
        setRosterStatus(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(id => {
                updated[id] = { ...updated[id], status: 'present' };
            });
            return updated;
        });
    };

    // Batch Action: Mark All Absent
    const markAllAbsent = () => {
        setRosterStatus(prev => {
            const updated = { ...prev };
            Object.keys(updated).forEach(id => {
                updated[id] = { ...updated[id], status: 'absent' };
            });
            return updated;
        });
    };

    // Submit Attendance Batch
    const handleMarkAttendanceSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        if (!selectedClassId || !selectedSectionId || !selectedSubjectId) {
            setSubmitError('Please select Class, Section, and Subject before marking attendance.');
            return;
        }

        if (currentRosterStudents.length === 0) {
            setSubmitError('No students found in the selected class and section roster.');
            return;
        }

        setSubmitLoading(true);

        const attendanceData = currentRosterStudents.map(st => ({
            studentId: st._id,
            status: rosterStatus[st._id]?.status || 'present',
            remarks: rosterStatus[st._id]?.remarks || '',
        }));

        try {
            const payload = {
                classId: selectedClassId,
                sectionId: selectedSectionId,
                subjectId: selectedSubjectId,
                attendanceData,
            };

            const res = await attendanceAPI.markAttendance(payload);
            if (res.data?.success) {
                setSubmitSuccess('Attendance marked successfully!');
                setTimeout(() => setSubmitSuccess(''), 4000);
            }
        } catch (err) {
            console.error('Failed to mark attendance:', err);
            setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit attendance.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Fetch Class Attendance Records for Records Log Tab
    const fetchClassRecords = useCallback(async (classId) => {
        if (!classId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await attendanceAPI.getAttendanceByClass(classId);
            setRecordsData(res?.data?.attendance || []);
        } catch (err) {
            console.error('Error loading class attendance records:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load attendance records.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'records' && recordsClassId) {
            fetchClassRecords(recordsClassId);
        }
    }, [activeTab, recordsClassId, fetchClassRecords]);

    // Fetch Student Stats for Stats Tab
    const fetchStudentStatsData = useCallback(async (studentId) => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        try {
            const [statsRes, historyRes] = await Promise.all([
                attendanceAPI.getAttendanceStats(studentId),
                attendanceAPI.getStudentAttendance(studentId),
            ]);

            setStudentStats(statsRes?.data || null);
            setStudentHistory(historyRes?.data?.attendance || []);
        } catch (err) {
            console.error('Error loading student attendance stats:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load student statistics.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'stats' && selectedStudentId) {
            fetchStudentStatsData(selectedStudentId);
        }
    }, [activeTab, selectedStudentId, fetchStudentStatsData]);

    // Filtered Records Log
    const filteredRecords = recordsData.filter(rec => {
        const studentName = rec.student?.user?.name?.toLowerCase() || '';
        const subjectName = rec.subject?.subjectName?.toLowerCase() || '';
        const search = recordsSearchQuery.toLowerCase();
        return studentName.includes(search) || subjectName.includes(search);
    });

    // Available subjects for selected class in Mark Tab
    const filteredSubjectsForClass = subjects.filter(s => (s.class?._id || s.class) === selectedClassId);

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-2xl shadow-md shadow-emerald-500/20">
                            <CalendarCheck size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Attendance Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Mark daily class attendance, inspect attendance logs, and track student attendance percentages.
                    </p>
                </div>

                {/* Tab Navigation Pill Buttons */}
                <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/80">
                    <button
                        onClick={() => setActiveTab('mark')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'mark'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <UserCheck size={16} />
                        <span>Mark Attendance</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('records')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'records'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <ListFilter size={16} />
                        <span>Attendance Logs</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('stats')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'stats'
                                ? 'bg-white text-emerald-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <BarChart3 size={16} />
                        <span>Student Reports</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Attendance System Notification"
                    message={error}
                    onRetry={fetchMetadata}
                />
            )}

            {/* TAB 1: MARK ATTENDANCE */}
            {activeTab === 'mark' && (
                <div className="space-y-6">
                    {/* Selectors Bar */}
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Class Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <Layers size={14} className="text-purple-600" /> Class *
                                </label>
                                <select
                                    value={selectedClassId}
                                    onChange={(e) => handleClassChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Select Class --</option>
                                    {classes.map(c => (
                                        <option key={c._id} value={c._id}>{c.className}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Section Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <BookMarked size={14} className="text-blue-600" /> Section *
                                </label>
                                <select
                                    value={selectedSectionId}
                                    onChange={(e) => setSelectedSectionId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Select Section --</option>
                                    {sections.map(s => (
                                        <option key={s._id} value={s._id}>Section {s.sectionName}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Subject Selector */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <BookOpen size={14} className="text-amber-600" /> Subject *
                                </label>
                                <select
                                    value={selectedSubjectId}
                                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                >
                                    <option value="">-- Select Subject --</option>
                                    {filteredSubjectsForClass.map(sub => (
                                        <option key={sub._id} value={sub._id}>{sub.subjectName} ({sub.subjectCode})</option>
                                    ))}
                                </select>
                            </div>

                            {/* Attendance Date */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                                    <Calendar size={14} className="text-emerald-600" /> Attendance Date
                                </label>
                                <input
                                    type="date"
                                    value={attendanceDate}
                                    onChange={(e) => setAttendanceDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Messages */}
                    {submitError && (
                        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                            <AlertCircle size={16} />
                            <span>{submitError}</span>
                        </div>
                    )}

                    {submitSuccess && (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
                            <CheckCircle2 size={16} />
                            <span>{submitSuccess}</span>
                        </div>
                    )}

                    {/* Student Roster Table */}
                    {currentRosterStudents.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                            <EmptyState
                                icon={UserCheck}
                                title="No Students Found in Roster"
                                description="Select a class and section that contains registered students to mark attendance."
                            />
                        </div>
                    ) : (
                        <form onSubmit={handleMarkAttendanceSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            {/* Roster Header Actions */}
                            <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                                <div>
                                    <p className="text-xs font-extrabold text-gray-900">
                                        Class Roster ({currentRosterStudents.length} Students)
                                    </p>
                                    <p className="text-[11px] text-gray-500">Toggle student status and submit batch attendance.</p>
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={markAllPresent}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Mark All Present
                                    </button>
                                    <button
                                        type="button"
                                        onClick={markAllAbsent}
                                        className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Mark All Absent
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-6">Student Info</th>
                                            <th className="py-3.5 px-4">Roll Number</th>
                                            <th className="py-3.5 px-4">Attendance Status</th>
                                            <th className="py-3.5 px-6">Remarks / Note</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {currentRosterStudents.map((st) => {
                                            const studentName = st.user?.name || 'Unnamed Student';
                                            const currentStatus = rosterStatus[st._id]?.status || 'present';

                                            return (
                                                <tr key={st._id} className="hover:bg-gray-50/70 transition-colors">
                                                    <td className="py-3.5 px-6">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white font-bold rounded-xl flex items-center justify-center text-xs shadow-xs">
                                                                {studentName.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="font-bold text-gray-900 text-sm leading-tight">{studentName}</p>
                                                                <p className="text-gray-500 text-[11px]">{st.user?.email || 'No email'}</p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-4 font-mono font-bold text-gray-700">
                                                        {st.rollNumber || 'N/A'}
                                                    </td>

                                                    <td className="py-3.5 px-4 whitespace-nowrap">
                                                        <div className="inline-flex items-center p-1 bg-gray-100 rounded-xl border border-gray-200/80 gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleStudentStatusChange(st._id, 'present')}
                                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                                                    currentStatus === 'present'
                                                                        ? 'bg-emerald-600 text-white shadow-xs'
                                                                        : 'text-gray-600 hover:text-emerald-700'
                                                                }`}
                                                            >
                                                                <CheckCircle2 size={13} /> Present
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleStudentStatusChange(st._id, 'absent')}
                                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                                                    currentStatus === 'absent'
                                                                        ? 'bg-red-600 text-white shadow-xs'
                                                                        : 'text-gray-600 hover:text-red-700'
                                                                }`}
                                                            >
                                                                <XCircle size={13} /> Absent
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleStudentStatusChange(st._id, 'late')}
                                                                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                                                                    currentStatus === 'late'
                                                                        ? 'bg-amber-500 text-white shadow-xs'
                                                                        : 'text-gray-600 hover:text-amber-700'
                                                                }`}
                                                            >
                                                                <Clock size={13} /> Late
                                                            </button>
                                                        </div>
                                                    </td>

                                                    <td className="py-3.5 px-6">
                                                        <input
                                                            type="text"
                                                            value={rosterStatus[st._id]?.remarks || ''}
                                                            onChange={(e) => handleStudentRemarksChange(st._id, e.target.value)}
                                                            placeholder="Optional remarks..."
                                                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                                                        />
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Submit Footer */}
                            <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-end">
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                >
                                    {submitLoading ? (
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <Send size={16} />
                                    )}
                                    <span>{submitLoading ? 'Saving Attendance...' : 'Submit Attendance Batch'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* TAB 2: ATTENDANCE LOGS */}
            {activeTab === 'records' && (
                <div className="space-y-6">
                    {/* Search & Class Filter */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                value={recordsSearchQuery}
                                onChange={(e) => setRecordsSearchQuery(e.target.value)}
                                placeholder="Filter records by student name or subject..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-600">Select Class:</span>
                            <select
                                value={recordsClassId}
                                onChange={(e) => setRecordsClassId(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl p-2.5 min-w-[160px]"
                            >
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.className}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Records Table */}
                    {loading ? (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : filteredRecords.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                            <EmptyState
                                icon={CalendarCheck}
                                title="No Attendance Logs Found"
                                description="No attendance records logged for the selected class yet."
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Showing {filteredRecords.length} Attendance Entries
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-6">Student</th>
                                            <th className="py-3.5 px-4">Subject</th>
                                            <th className="py-3.5 px-4">Section</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4">Remarks</th>
                                            <th className="py-3.5 px-6">Recorded Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {filteredRecords.map((rec) => (
                                            <tr key={rec._id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {rec.student?.user?.name || 'Student'}
                                                </td>

                                                <td className="py-4 px-4 font-semibold text-amber-700">
                                                    {rec.subject?.subjectName || 'Subject'}
                                                </td>

                                                <td className="py-4 px-4 font-semibold text-blue-700">
                                                    Section {rec.section?.sectionName || '-'}
                                                </td>

                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {rec.status === 'present' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg">
                                                            <CheckCircle2 size={13} /> Present
                                                        </span>
                                                    )}
                                                    {rec.status === 'absent' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[11px] rounded-lg">
                                                            <XCircle size={13} /> Absent
                                                        </span>
                                                    )}
                                                    {rec.status === 'late' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[11px] rounded-lg">
                                                            <Clock size={13} /> Late
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-4 text-gray-600 italic">
                                                    {rec.remarks || '-'}
                                                </td>

                                                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                                                    {rec.attendanceDate
                                                        ? new Date(rec.attendanceDate).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                                                        : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB 3: STUDENT STATISTICS & REPORTS */}
            {activeTab === 'stats' && (
                <div className="space-y-6">
                    {/* Select Student Selector */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Select Student to Inspect:</span>
                            <select
                                value={selectedStudentId}
                                onChange={(e) => setSelectedStudentId(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl p-2.5 min-w-[240px]"
                            >
                                {allStudents.map(s => (
                                    <option key={s._id} value={s._id}>
                                        {s.user?.name || 'Student'} (Roll: {s.rollNumber || 'N/A'})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Student Stats Cards */}
                    {studentStats && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                    <Calendar size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Total Classes</p>
                                    <p className="text-xl font-bold text-gray-900">{studentStats.totalAttendance || 0}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <CheckCircle2 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Days Present</p>
                                    <p className="text-xl font-bold text-emerald-700">{studentStats.presentAttendance || 0}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                    <XCircle size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Days Absent</p>
                                    <p className="text-xl font-bold text-red-700">{studentStats.absentAttendance || 0}</p>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold">Attendance Rate</p>
                                    <p className="text-xl font-bold text-blue-700">{studentStats.percentage || 0}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student History Table */}
                    {studentHistory.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Student Attendance History ({studentHistory.length} Entries)
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-6">Subject</th>
                                            <th className="py-3.5 px-4">Class & Section</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-6">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {studentHistory.map((h) => (
                                            <tr key={h._id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {h.subject?.subjectName || 'Subject'}
                                                </td>

                                                <td className="py-4 px-4 text-gray-600">
                                                    {h.class?.className || 'Class'} - Sec {h.section?.sectionName || ''}
                                                </td>

                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {h.status === 'present' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg">
                                                            <CheckCircle2 size={13} /> Present
                                                        </span>
                                                    )}
                                                    {h.status === 'absent' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[11px] rounded-lg">
                                                            <XCircle size={13} /> Absent
                                                        </span>
                                                    )}
                                                    {h.status === 'late' && (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[11px] rounded-lg">
                                                            <Clock size={13} /> Late
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                                                    {h.attendanceDate
                                                        ? new Date(h.attendanceDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                        : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </DashboardLayout>
    );
};

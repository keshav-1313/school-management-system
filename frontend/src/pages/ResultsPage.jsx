import React, { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    Award,
    FileCheck2,
    CheckCircle2,
    XCircle,
    BarChart3,
    Search,
    BookOpen,
    Layers,
    User,
    Calendar,
    Send,
    Plus,
    FileText,
    AlertCircle
} from 'lucide-react';
import examAPI from '../services/examAPI';
import userAPI from '../services/userAPI';
import resultAPI from '../services/resultAPI';

export const ResultsPage = () => {
    const location = useLocation();

    // Mode Tab: 'publish' | 'reportCard'
    const [activeTab, setActiveTab] = useState('publish');

    // Baseline Data
    const [exams, setExams] = useState([]);
    const [allStudents, setAllStudents] = useState([]);

    // Tab 1: Publish Form State
    const [selectedExamId, setSelectedExamId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [obtainedMarksInput, setObtainedMarksInput] = useState('');
    const [remarksInput, setRemarksInput] = useState('');

    // Tab 2: Report Card State
    const [reportStudentId, setReportStudentId] = useState('');
    const [studentResults, setStudentResults] = useState([]);

    // UI Loading & Message States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [submitSuccess, setSubmitSuccess] = useState('');

    // Extract examId query param if present
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const urlExamId = params.get('examId');
        if (urlExamId) {
            setSelectedExamId(urlExamId);
            setActiveTab('publish');
        }
    }, [location.search]);

    // Fetch Exams and Students Metadata
    const fetchMetadata = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [examsRes, studentsRes] = await Promise.all([
                examAPI.getAllExams(),
                userAPI.getAllStudents(),
            ]);

            const examList = examsRes?.data?.exams || [];
            const studentList = studentsRes?.data?.students || [];

            setExams(examList);
            setAllStudents(studentList);

            if (examList.length > 0 && !selectedExamId) {
                setSelectedExamId(examList[0]._id);
            }

            if (studentList.length > 0) {
                setReportStudentId(studentList[0]._id);
            }
        } catch (err) {
            console.error('Error fetching results metadata:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load examination results metadata.');
        } finally {
            setLoading(false);
        }
    }, [selectedExamId]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    // Active selected Exam object
    const selectedExamObj = exams.find(e => e._id === selectedExamId);

    // Filter students for the selected exam's class & section
    const eligibleStudents = allStudents.filter(s => {
        if (!selectedExamObj) return true;
        const examClassId = selectedExamObj.class?._id || selectedExamObj.class;
        const examSectionId = selectedExamObj.section?._id || selectedExamObj.section;

        const studentClassId = s.class?._id || s.class;
        const studentSectionId = s.section?._id || s.section;

        return (!examClassId || studentClassId === examClassId) && (!examSectionId || studentSectionId === examSectionId);
    });

    // Automatically set default student when eligibleStudents changes
    useEffect(() => {
        if (eligibleStudents.length > 0) {
            setSelectedStudentId(eligibleStudents[0]._id);
        } else {
            setSelectedStudentId('');
        }
    }, [selectedExamId, allStudents]);

    // Calculate projected percentage, grade, and status on live input
    const projectedPercentage = (selectedExamObj?.totalMarks && obtainedMarksInput !== '')
        ? ((Number(obtainedMarksInput) / selectedExamObj.totalMarks) * 100).toFixed(2)
        : null;

    let projectedGrade = 'F';
    if (projectedPercentage !== null) {
        const perc = Number(projectedPercentage);
        if (perc >= 90) projectedGrade = 'A+';
        else if (perc >= 80) projectedGrade = 'A';
        else if (perc >= 70) projectedGrade = 'B';
        else if (perc >= 60) projectedGrade = 'C';
        else if (perc >= 50) projectedGrade = 'D';
    }

    const projectedStatus = (selectedExamObj && obtainedMarksInput !== '')
        ? (Number(obtainedMarksInput) >= selectedExamObj.passingMarks ? 'pass' : 'fail')
        : null;

    // Handle Publish Result Submit
    const handleAddResultSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setSubmitSuccess('');

        if (!selectedExamId || !selectedStudentId || obtainedMarksInput === '') {
            setSubmitError('Please select Exam, Student, and enter Obtained Marks.');
            return;
        }

        if (Number(obtainedMarksInput) < 0) {
            setSubmitError('Obtained marks cannot be negative.');
            return;
        }

        if (selectedExamObj && Number(obtainedMarksInput) > selectedExamObj.totalMarks) {
            setSubmitError(`Obtained marks cannot exceed maximum total marks (${selectedExamObj.totalMarks}).`);
            return;
        }

        setSubmitLoading(true);
        try {
            const payload = {
                examId: selectedExamId,
                studentId: selectedStudentId,
                obtainedMarks: Number(obtainedMarksInput),
                remarks: remarksInput,
            };

            const res = await resultAPI.addResult(payload);
            if (res.data?.success) {
                setSubmitSuccess('Exam result published successfully!');
                setObtainedMarksInput('');
                setRemarksInput('');
                setTimeout(() => setSubmitSuccess(''), 4000);
            }
        } catch (err) {
            console.error('Error adding result:', err);
            setSubmitError(err?.response?.data?.message || err?.message || 'Failed to submit exam result.');
        } finally {
            setSubmitLoading(false);
        }
    };

    // Fetch Student Results for Report Card Tab
    const fetchStudentReportCard = useCallback(async (studentId) => {
        if (!studentId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await resultAPI.getStudentResults(studentId);
            setStudentResults(res?.data?.results || []);
        } catch (err) {
            console.error('Error fetching student results:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load student report card.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (activeTab === 'reportCard' && reportStudentId) {
            fetchStudentReportCard(reportStudentId);
        }
    }, [activeTab, reportStudentId, fetchStudentReportCard]);

    // Active student for report card
    const activeReportStudent = allStudents.find(s => s._id === reportStudentId);

    // Compute Overall Report Card Stats
    const totalExamsTaken = studentResults.length;
    const passedExamsCount = studentResults.filter(r => r.status === 'pass').length;
    const failedExamsCount = studentResults.filter(r => r.status === 'fail').length;
    const overallAvgPercentage = totalExamsTaken > 0
        ? (studentResults.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalExamsTaken).toFixed(2)
        : 0;

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-amber-600 text-white rounded-2xl shadow-md shadow-amber-500/20">
                            <Award size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Result Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        Publish exam evaluation scores, compute letter grades, and view student report cards.
                    </p>
                </div>

                {/* Tab Navigation Pill Buttons */}
                <div className="flex items-center bg-gray-100 p-1.5 rounded-2xl border border-gray-200/80">
                    <button
                        onClick={() => setActiveTab('publish')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'publish'
                                ? 'bg-white text-amber-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <Plus size={16} />
                        <span>Publish Result</span>
                    </button>

                    <button
                        onClick={() => setActiveTab('reportCard')}
                        className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                            activeTab === 'reportCard'
                                ? 'bg-white text-amber-700 shadow-xs'
                                : 'text-gray-600 hover:text-gray-900'
                        }`}
                    >
                        <BarChart3 size={16} />
                        <span>Student Report Cards</span>
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Result System Notification"
                    message={error}
                    onRetry={fetchMetadata}
                />
            )}

            {/* TAB 1: PUBLISH EXAM RESULT */}
            {activeTab === 'publish' && (
                <div className="max-w-3xl mx-auto space-y-6">
                    {/* Exam Selector Banner */}
                    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
                        <h2 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                            <FileCheck2 size={20} className="text-indigo-600" />
                            <span>1. Select Examination</span>
                        </h2>

                        <select
                            value={selectedExamId}
                            onChange={(e) => setSelectedExamId(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                        >
                            {exams.length === 0 ? (
                                <option value="">No scheduled exams found</option>
                            ) : (
                                exams.map(e => (
                                    <option key={e._id} value={e._id}>
                                        {e.examName} — {e.subject?.subjectName} ({e.class?.className} Sec {e.section?.sectionName}) [Max Marks: {e.totalMarks}]
                                    </option>
                                ))
                            )}
                        </select>

                        {selectedExamObj && (
                            <div className="mt-4 p-4 bg-amber-50/60 rounded-2xl border border-amber-100/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div>
                                    <p className="text-amber-900 font-bold">{selectedExamObj.examName}</p>
                                    <p className="text-amber-700 text-[11px] mt-0.5">
                                        Subject: {selectedExamObj.subject?.subjectName} | Class: {selectedExamObj.class?.className} (Sec {selectedExamObj.section?.sectionName})
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 font-mono">
                                    <span className="px-2.5 py-1 bg-amber-200/60 text-amber-900 rounded-lg font-bold">
                                        Total: {selectedExamObj.totalMarks}
                                    </span>
                                    <span className="px-2.5 py-1 bg-emerald-200/60 text-emerald-900 rounded-lg font-bold">
                                        Pass: {selectedExamObj.passingMarks}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Result Entry Form */}
                    <form onSubmit={handleAddResultSubmit} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-6">
                        <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                            <User size={20} className="text-blue-600" />
                            <span>2. Student Score & Evaluation</span>
                        </h2>

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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Student Dropdown */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Select Student *</label>
                                <select
                                    required
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                >
                                    {eligibleStudents.length === 0 ? (
                                        <option value="">No students in this class/section</option>
                                    ) : (
                                        eligibleStudents.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.user?.name || 'Student'} (Roll: {s.rollNumber || 'N/A'})
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>

                            {/* Obtained Marks */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Obtained Marks *</label>
                                <input
                                    type="number"
                                    min="0"
                                    max={selectedExamObj?.totalMarks || 100}
                                    required
                                    value={obtainedMarksInput}
                                    onChange={(e) => setObtainedMarksInput(e.target.value)}
                                    placeholder={`Out of ${selectedExamObj?.totalMarks || 100}`}
                                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Teacher Remarks / Notes</label>
                            <textarea
                                rows={2}
                                value={remarksInput}
                                onChange={(e) => setRemarksInput(e.target.value)}
                                placeholder="Optional feedback on student performance..."
                                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                            />
                        </div>

                        {/* Live Score Projection Widget */}
                        {projectedPercentage !== null && (
                            <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] text-indigo-300 font-semibold uppercase tracking-wider">Projected Evaluation</p>
                                    <p className="text-xl font-extrabold mt-0.5">{projectedPercentage}% Score</p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="px-3 py-1 bg-white/10 text-white font-mono text-sm font-bold rounded-xl border border-white/20">
                                        Grade: {projectedGrade}
                                    </span>
                                    <span className={`px-3 py-1 font-extrabold text-xs rounded-xl uppercase tracking-wider ${
                                        projectedStatus === 'pass'
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-red-500 text-white'
                                    }`}>
                                        {projectedStatus}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
                            <button
                                type="submit"
                                disabled={submitLoading || eligibleStudents.length === 0}
                                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 flex items-center gap-2 disabled:opacity-50"
                            >
                                {submitLoading ? (
                                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                    <Send size={16} />
                                )}
                                <span>{submitLoading ? 'Publishing Result...' : 'Publish Result'}</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB 2: STUDENT REPORT CARD */}
            {activeTab === 'reportCard' && (
                <div className="space-y-6">
                    {/* Student Selector Bar */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">Select Student Report Card:</span>
                            <select
                                value={reportStudentId}
                                onChange={(e) => setReportStudentId(e.target.value)}
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

                    {/* Report Card Profile Banner */}
                    {activeReportStudent && (
                        <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md">
                                    {activeReportStudent.user?.name ? activeReportStudent.user.name.charAt(0).toUpperCase() : 'S'}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{activeReportStudent.user?.name || 'Unnamed Student'}</h3>
                                    <p className="text-xs text-indigo-200 mt-0.5">{activeReportStudent.user?.email}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="px-2.5 py-0.5 bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold rounded-full border border-indigo-400/30">
                                            Roll No: {activeReportStudent.rollNumber || 'N/A'}
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-purple-500/30 text-purple-200 text-[11px] font-semibold rounded-full border border-purple-400/30">
                                            {activeReportStudent.class?.className} - Sec {activeReportStudent.section?.sectionName}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Overall Summary Pills */}
                            <div className="flex items-center gap-3">
                                <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10 text-center min-w-[80px]">
                                    <p className="text-[10px] text-indigo-200 font-bold uppercase">Exams</p>
                                    <p className="text-lg font-extrabold">{totalExamsTaken}</p>
                                </div>
                                <div className="bg-emerald-500/20 backdrop-blur-xs p-3 rounded-2xl border border-emerald-400/20 text-center min-w-[80px]">
                                    <p className="text-[10px] text-emerald-200 font-bold uppercase">Passed</p>
                                    <p className="text-lg font-extrabold text-emerald-300">{passedExamsCount}</p>
                                </div>
                                <div className="bg-amber-500/20 backdrop-blur-xs p-3 rounded-2xl border border-amber-400/20 text-center min-w-[90px]">
                                    <p className="text-[10px] text-amber-200 font-bold uppercase">Avg Score</p>
                                    <p className="text-lg font-extrabold text-amber-300">{overallAvgPercentage}%</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results Table */}
                    {loading ? (
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="h-10 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    ) : studentResults.length === 0 ? (
                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                            <EmptyState
                                icon={Award}
                                title="No Evaluation Results Recorded"
                                description="No exam score results logged for this student yet."
                            />
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Academic Transcript & Examination Scores
                                </p>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                            <th className="py-3.5 px-6">Examination</th>
                                            <th className="py-3.5 px-4">Subject</th>
                                            <th className="py-3.5 px-4">Score</th>
                                            <th className="py-3.5 px-4">Percentage</th>
                                            <th className="py-3.5 px-4">Grade</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-6">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 text-xs">
                                        {studentResults.map((r) => (
                                            <tr key={r._id} className="hover:bg-gray-50/70 transition-colors">
                                                <td className="py-4 px-6 font-bold text-gray-900">
                                                    {r.exam?.examName || 'Exam'}
                                                </td>

                                                <td className="py-4 px-4 font-semibold text-amber-700">
                                                    {r.exam?.subject?.subjectName || 'Subject'}
                                                </td>

                                                <td className="py-4 px-4 font-bold text-gray-900">
                                                    {r.obtainedMarks} <span className="text-gray-400 text-[11px] font-normal">/ {r.exam?.totalMarks || 100}</span>
                                                </td>

                                                <td className="py-4 px-4 font-extrabold text-indigo-700">
                                                    {r.percentage}%
                                                </td>

                                                <td className="py-4 px-4">
                                                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-extrabold text-[11px] rounded-lg">
                                                        {r.grade}
                                                    </span>
                                                </td>

                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {r.status === 'pass' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-[11px] rounded-lg uppercase">
                                                            <CheckCircle2 size={13} /> Pass
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 font-bold text-[11px] rounded-lg uppercase">
                                                            <XCircle size={13} /> Fail
                                                        </span>
                                                    )}
                                                </td>

                                                <td className="py-4 px-6 text-gray-500 italic">
                                                    {r.remarks || '-'}
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

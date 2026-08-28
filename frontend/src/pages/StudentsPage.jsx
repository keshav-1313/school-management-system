import React, { useEffect, useState, useCallback } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import {
    GraduationCap,
    Plus,
    Search,
    Filter,
    Eye,
    Edit2,
    Trash2,
    RefreshCw,
    X,
    UserCheck,
    Calendar,
    Phone,
    MapPin,
    Users,
    Layers,
    BookMarked,
    Mail,
    Lock,
    User,
    CheckCircle2,
    Shield
} from 'lucide-react';
import userAPI from '../services/userAPI';
import classAPI from '../services/classAPI';
import sectionAPI from '../services/sectionAPI';

export const StudentsPage = () => {
    // Data States
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(null);

    // Search & Filter States
    const [searchQuery, setSearchQuery] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [genderFilter, setGenderFilter] = useState('');

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Selected Student for Edit / View / Delete
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Dynamic Sections for Forms
    const [formSections, setFormSections] = useState([]);
    const [formSectionsLoading, setFormSectionsLoading] = useState(false);

    // Form Submitting & Message States
    const [formSubmitting, setFormSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // Initial Form State
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        classId: '',
        sectionId: '',
        rollNumber: '',
        fatherName: '',
        motherName: '',
        phoneNumber: '',
        gender: 'male',
        dateOfBirth: '',
        address: '',
        admissionDate: new Date().toISOString().split('T')[0],
    };

    const [formData, setFormData] = useState(initialFormState);

    // Fetch All Students and Classes
    const fetchStudentsAndClasses = useCallback(async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [studentsRes, classesRes] = await Promise.all([
                userAPI.getAllStudents(),
                classAPI.getAllClasses(),
            ]);

            setStudents(studentsRes?.data?.students || []);
            setClasses(classesRes?.data?.classes || []);
        } catch (err) {
            console.error('Error fetching students:', err);
            setError(err?.response?.data?.message || err?.message || 'Failed to load students list.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchStudentsAndClasses();
    }, [fetchStudentsAndClasses]);

    // Fetch Sections when Class changes in Add/Edit Form
    const handleClassSelectChange = async (classId) => {
        setFormData(prev => ({ ...prev, classId, sectionId: '' }));
        if (!classId) {
            setFormSections([]);
            return;
        }
        setFormSectionsLoading(true);
        try {
            const res = await sectionAPI.getSectionsByClass(classId);
            setFormSections(res?.data?.sections || []);
        } catch (err) {
            console.error('Error fetching sections:', err);
            setFormSections([]);
        } finally {
            setFormSectionsLoading(false);
        }
    };

    // Open Add Modal
    const openAddModal = () => {
        setFormData(initialFormState);
        setFormSections([]);
        setFormError('');
        setFormSuccess('');
        setIsAddModalOpen(true);
    };

    // Open Edit Modal
    const openEditModal = async (student) => {
        setSelectedStudent(student);
        const classId = student.class?._id || student.class || '';
        const sectionId = student.section?._id || student.section || '';

        setFormData({
            name: student.user?.name || '',
            email: student.user?.email || '',
            password: '', // leave empty unless updating
            classId: classId,
            sectionId: sectionId,
            rollNumber: student.rollNumber || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            phoneNumber: student.phoneNumber || '',
            gender: student.gender || 'male',
            dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '',
            address: student.address || '',
            admissionDate: student.admissionDate ? new Date(student.admissionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        });

        setFormError('');
        setFormSuccess('');
        setIsEditModalOpen(true);

        if (classId) {
            setFormSectionsLoading(true);
            try {
                const res = await sectionAPI.getSectionsByClass(classId);
                setFormSections(res?.data?.sections || []);
            } catch (err) {
                setFormSections([]);
            } finally {
                setFormSectionsLoading(false);
            }
        }
    };

    // Open Details Modal
    const openDetailsModal = (student) => {
        setSelectedStudent(student);
        setIsDetailsModalOpen(true);
    };

    // Open Delete Confirmation Modal
    const openDeleteModal = (student) => {
        setSelectedStudent(student);
        setIsDeleteModalOpen(true);
    };

    // Handle Add Form Submit
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!formData.name || !formData.email || !formData.password || !formData.classId || !formData.sectionId) {
            setFormError('Name, email, password, class, and section are required.');
            return;
        }

        setFormSubmitting(true);
        try {
            const res = await userAPI.createStudent(formData);
            if (res.data?.success) {
                setFormSuccess('Student enrolled successfully!');
                setTimeout(() => {
                    setIsAddModalOpen(false);
                    fetchStudentsAndClasses(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to create student.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Edit Form Submit
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!selectedStudent) return;

        setFormSubmitting(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                class: formData.classId,
                section: formData.sectionId,
                rollNumber: formData.rollNumber,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                phoneNumber: formData.phoneNumber,
                gender: formData.gender,
                dateOfBirth: formData.dateOfBirth,
                address: formData.address,
                admissionDate: formData.admissionDate,
            };

            const res = await userAPI.updateStudent(selectedStudent._id, payload);
            if (res.data?.success) {
                setFormSuccess('Student updated successfully!');
                setTimeout(() => {
                    setIsEditModalOpen(false);
                    fetchStudentsAndClasses(true);
                }, 800);
            }
        } catch (err) {
            setFormError(err?.response?.data?.message || err?.message || 'Failed to update student.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Handle Delete Confirm
    const handleDeleteConfirm = async () => {
        if (!selectedStudent) return;

        setFormSubmitting(true);
        try {
            const res = await userAPI.deleteStudent(selectedStudent._id);
            if (res.data?.success) {
                setIsDeleteModalOpen(false);
                fetchStudentsAndClasses(true);
            }
        } catch (err) {
            console.error('Failed to delete student:', err);
            alert(err?.response?.data?.message || 'Failed to delete student.');
        } finally {
            setFormSubmitting(false);
        }
    };

    // Filter Students based on Search Query, Class Filter, and Gender Filter
    const filteredStudents = students.filter(student => {
        const nameMatch = student.user?.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const emailMatch = student.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const rollMatch = student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
        const fatherMatch = student.fatherName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSearch = !searchQuery || nameMatch || emailMatch || rollMatch || fatherMatch;

        const studentClassId = student.class?._id || student.class;
        const matchesClass = !classFilter || studentClassId === classFilter;
        const matchesGender = !genderFilter || student.gender === genderFilter;

        return matchesSearch && matchesClass && matchesGender;
    });

    // Counts for stats
    const maleCount = students.filter(s => s.gender === 'male').length;
    const femaleCount = students.filter(s => s.gender === 'female').length;

    return (
        <DashboardLayout>
            {/* Header Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20">
                            <GraduationCap size={22} />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Student Management</h1>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                        View, enroll, filter, and manage all student profiles across classes.
                    </p>
                </div>

                {/* Actions Header */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchStudentsAndClasses(true)}
                        disabled={refreshing || loading}
                        className="p-2.5 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl transition-colors shadow-xs flex items-center justify-center disabled:opacity-50"
                        title="Refresh list"
                    >
                        <RefreshCw size={18} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                    </button>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95"
                    >
                        <Plus size={18} />
                        <span>Enroll New Student</span>
                    </button>
                </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                        <Users size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Total Students</p>
                        <p className="text-xl font-bold text-gray-900">{students.length}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Male Students</p>
                        <p className="text-xl font-bold text-gray-900">{maleCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                        <UserCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Female Students</p>
                        <p className="text-xl font-bold text-gray-900">{femaleCount}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-xs flex items-center gap-3">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                        <Layers size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold">Classes Covered</p>
                        <p className="text-xl font-bold text-gray-900">{classes.length}</p>
                    </div>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <ErrorBanner
                    title="Failed to load students"
                    message={error}
                    onRetry={() => fetchStudentsAndClasses()}
                />
            )}

            {/* Filter and Search Bar */}
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
                            placeholder="Search by student name, email, roll number..."
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

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Filter size={16} className="text-gray-400 hidden sm:block" />
                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5"
                            >
                                <option value="">All Classes</option>
                                {classes.map(c => (
                                    <option key={c._id} value={c._id}>{c.className}</option>
                                ))}
                            </select>
                        </div>

                        <select
                            value={genderFilter}
                            onChange={(e) => setGenderFilter(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-900 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 p-2.5"
                        >
                            <option value="">All Genders</option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>

                        {(classFilter || genderFilter || searchQuery) && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setClassFilter('');
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
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs">
                    <EmptyState
                        icon={GraduationCap}
                        title={searchQuery || classFilter || genderFilter ? 'No matching students found' : 'No Students Enrolled Yet'}
                        description={searchQuery || classFilter || genderFilter ? 'Try clearing your search query or filter criteria.' : 'Enroll your first student to populate the system database.'}
                        actionLabel="Enroll New Student"
                        onAction={openAddModal}
                    />
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Showing {filteredStudents.length} of {students.length} Students
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                    <th className="py-3.5 px-6">Student Info</th>
                                    <th className="py-3.5 px-4">Roll Number</th>
                                    <th className="py-3.5 px-4">Class & Section</th>
                                    <th className="py-3.5 px-4">Gender & Contact</th>
                                    <th className="py-3.5 px-4">Admission Date</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-xs">
                                {filteredStudents.map((student) => {
                                    const studentName = student.user?.name || 'Unnamed Student';
                                    const studentEmail = student.user?.email || 'No Email';
                                    const className = student.class?.className || 'Unassigned';
                                    const sectionName = student.section?.sectionName || 'N/A';

                                    return (
                                        <tr key={student._id} className="hover:bg-gray-50/70 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold rounded-xl flex items-center justify-center text-sm shadow-xs flex-shrink-0">
                                                        {studentName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm leading-tight">{studentName}</p>
                                                        <p className="text-gray-500 text-xs mt-0.5">{studentEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 font-mono font-semibold text-gray-700">
                                                {student.rollNumber ? `#${student.rollNumber}` : '-'}
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="inline-flex items-center px-2.5 py-1 bg-blue-50 text-blue-700 font-bold text-[11px] rounded-lg">
                                                        {className}
                                                    </span>
                                                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 font-semibold text-[11px] rounded-lg">
                                                        Sec {sectionName}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <p className="font-semibold text-gray-800 capitalize">{student.gender || 'N/A'}</p>
                                                <p className="text-gray-500 text-[11px] mt-0.5">{student.phoneNumber || 'No Phone'}</p>
                                            </td>

                                            <td className="py-4 px-4 whitespace-nowrap text-gray-600">
                                                {student.admissionDate
                                                    ? new Date(student.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </td>

                                            <td className="py-4 px-6 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openDetailsModal(student)}
                                                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(student)}
                                                        className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
                                                        title="Edit Student"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteModal(student)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                                        title="Delete Student"
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

            {/* ADD STUDENT MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsAddModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-2xl border border-gray-100">
                            {/* Modal Header */}
                            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                                        <GraduationCap size={20} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">Enroll New Student</h3>
                                        <p className="text-xs text-gray-500">Add student profile and account credentials</p>
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
                                    {/* Account Info */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Student full name"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            placeholder="student@school.com"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Roll Number</label>
                                        <input
                                            type="text"
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                                            placeholder="e.g. 101"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Class & Section selection */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Class *</label>
                                        <select
                                            required
                                            value={formData.classId}
                                            onChange={(e) => handleClassSelectChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">-- Select Class --</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.className}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Section *</label>
                                        <select
                                            required
                                            disabled={!formData.classId || formSectionsLoading}
                                            value={formData.sectionId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                                        >
                                            <option value="">{formSectionsLoading ? 'Loading sections...' : '-- Select Section --'}</option>
                                            {formSections.map(sec => (
                                                <option key={sec._id} value={sec._id}>Section {sec.sectionName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Guardian Info */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Father's Name</label>
                                        <input
                                            type="text"
                                            value={formData.fatherName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                                            placeholder="Father's name"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Mother's Name</label>
                                        <input
                                            type="text"
                                            value={formData.motherName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                                            placeholder="Mother's name"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    {/* Contact & Personal Info */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            placeholder="Contact phone"
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Admission Date</label>
                                        <input
                                            type="date"
                                            value={formData.admissionDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, admissionDate: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                                    <textarea
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                        placeholder="Full address details..."
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
                                        <span>{formSubmitting ? 'Enrolling...' : 'Enroll Student'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* EDIT STUDENT MODAL */}
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
                                        <h3 className="text-lg font-bold text-gray-900">Edit Student Details</h3>
                                        <p className="text-xs text-gray-500">Update information for {selectedStudent?.user?.name}</p>
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
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Roll Number</label>
                                        <input
                                            type="text"
                                            value={formData.rollNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Class</label>
                                        <select
                                            value={formData.classId}
                                            onChange={(e) => handleClassSelectChange(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="">-- Select Class --</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.className}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Section</label>
                                        <select
                                            disabled={!formData.classId || formSectionsLoading}
                                            value={formData.sectionId}
                                            onChange={(e) => setFormData(prev => ({ ...prev, sectionId: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
                                        >
                                            <option value="">{formSectionsLoading ? 'Loading sections...' : '-- Select Section --'}</option>
                                            {formSections.map(sec => (
                                                <option key={sec._id} value={sec._id}>Section {sec.sectionName}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Father's Name</label>
                                        <input
                                            type="text"
                                            value={formData.fatherName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, fatherName: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Mother's Name</label>
                                        <input
                                            type="text"
                                            value={formData.motherName}
                                            onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                                        <input
                                            type="text"
                                            value={formData.phoneNumber}
                                            onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Gender</label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={formData.dateOfBirth}
                                            onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Admission Date</label>
                                        <input
                                            type="date"
                                            value={formData.admissionDate}
                                            onChange={(e) => setFormData(prev => ({ ...prev, admissionDate: e.target.value }))}
                                            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                                    <textarea
                                        rows={2}
                                        value={formData.address}
                                        onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
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
                                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                                    >
                                        {formSubmitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                                        <span>{formSubmitting ? 'Saving Changes...' : 'Save Changes'}</span>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* VIEW DETAILS MODAL */}
            {isDetailsModalOpen && selectedStudent && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-xs" onClick={() => setIsDetailsModalOpen(false)} />
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="relative transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-gray-100">
                            {/* Modal Header */}
                            <div className="p-6 bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white relative">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
                                >
                                    <X size={18} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-blue-500/30 border border-white/20 rounded-2xl flex items-center justify-center font-bold text-2xl text-white shadow-md">
                                        {selectedStudent.user?.name ? selectedStudent.user.name.charAt(0).toUpperCase() : 'S'}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">{selectedStudent.user?.name || 'Unnamed Student'}</h3>
                                        <p className="text-xs text-blue-200 mt-0.5">{selectedStudent.user?.email}</p>
                                        <span className="inline-flex items-center gap-1 mt-2 px-2.5 py-0.5 bg-blue-500/30 text-blue-200 text-[11px] font-semibold rounded-full border border-blue-400/30">
                                            Student Role
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Details Grid */}
                            <div className="p-6 space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Academic Information</h4>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                                        <div>
                                            <p className="text-gray-500 font-semibold">Class Grade</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedStudent.class?.className || 'Unassigned'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Section</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedStudent.section?.sectionName ? `Section ${selectedStudent.section.sectionName}` : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Roll Number</p>
                                            <p className="font-bold font-mono text-gray-900 mt-0.5">{selectedStudent.rollNumber ? `#${selectedStudent.rollNumber}` : '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Admission Date</p>
                                            <p className="font-bold text-gray-900 mt-0.5">
                                                {selectedStudent.admissionDate
                                                    ? new Date(selectedStudent.admissionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Guardian & Personal Info</h4>
                                    <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs">
                                        <div>
                                            <p className="text-gray-500 font-semibold">Father's Name</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedStudent.fatherName || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Mother's Name</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedStudent.motherName || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Phone Number</p>
                                            <p className="font-bold text-gray-900 mt-0.5">{selectedStudent.phoneNumber || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Gender</p>
                                            <p className="font-bold text-gray-900 capitalize mt-0.5">{selectedStudent.gender || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 font-semibold">Date of Birth</p>
                                            <p className="font-bold text-gray-900 mt-0.5">
                                                {selectedStudent.dateOfBirth
                                                    ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                    : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedStudent.address && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Residential Address</h4>
                                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 text-xs font-medium text-gray-700">
                                            {selectedStudent.address}
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
                title="Delete Student Record"
                message={`Are you sure you want to delete "${selectedStudent?.user?.name || 'this student'}"? This action will permanently remove their profile and login account.`}
                confirmText="Yes, Delete Student"
                confirmVariant="danger"
                loading={formSubmitting}
                onConfirm={handleDeleteConfirm}
                onClose={() => setIsDeleteModalOpen(false)}
            />
        </DashboardLayout>
    );
};

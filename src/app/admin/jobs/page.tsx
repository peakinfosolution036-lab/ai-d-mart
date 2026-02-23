'use client';

import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, Filter,
    MoreHorizontal, CheckCircle, XCircle, Clock,
    Globe, Home, Briefcase, ChevronRight, X, Save,
    AlertCircle, ExternalLink
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface Job {
    id: string;
    title: string;
    company: string;
    location: string;
    salaryRange: string;
    type: string;
    description: string;
    shortDescription: string;
    source: 'internal' | 'external';
    status: 'published' | 'pending' | 'draft' | 'closed';
    applicationsCount: number;
    createdAt: string;
    updatedAt: string;
}

export default function AdminJobsPage() {
    const { user } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState<Partial<Job> | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/jobs?admin=true');
            const json = await res.json();
            if (json.success) setJobs(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJob?.title || !editingJob?.company) return;

        setSaving(true);
        try {
            const method = editingJob.id ? 'PUT' : 'POST';
            const payload = {
                ...editingJob,
                postedBy: user?.id,
                source: editingJob.source || 'internal',
                status: editingJob.status || 'published'
            };

            const res = await fetch('/api/jobs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                setShowModal(false);
                setEditingJob(null);
                fetchJobs();
            } else {
                alert(json.error || 'Failed to save job');
            }
        } catch (e) {
            alert('Error saving job');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job?')) return;
        try {
            const res = await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
            const json = await res.json();
            if (json.success) fetchJobs();
        } catch (e) {
            alert('Error deleting job');
        }
    };

    const openCreateModal = () => {
        setEditingJob({
            title: '',
            company: 'AI D-Mart',
            location: '',
            salaryRange: '',
            type: 'Full-time',
            source: 'internal',
            status: 'published',
            description: '',
            shortDescription: ''
        });
        setShowModal(true);
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Job Management</h1>
                        <p className="text-gray-500 text-sm">Post, edit, and manage career opportunities</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-[#00703C] text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={20} /> Post New Job
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Jobs', value: jobs.filter(j => j.status === 'published').length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        { label: 'Total Applicants', value: jobs.reduce((acc, j) => acc + (j.applicationsCount || 0), 0), icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                        { label: 'Internal Jobs', value: jobs.filter(j => j.source === 'internal').length, icon: Home, color: 'text-purple-600', bg: 'bg-purple-50' },
                        { label: 'External Partners', value: jobs.filter(j => j.source === 'external').length, icon: Globe, color: 'text-orange-600', bg: 'bg-orange-50' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
                            <div className={`p-3 ${stat.bg} ${stat.color} rounded-2xl`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters & Table */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search by title or company..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Showing {filteredJobs.length} Results</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Job Details</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Type / Source</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Applications</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                            <div className="flex justify-center mb-2">
                                                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                            </div>
                                            <p className="text-sm font-bold">Loading jobs...</p>
                                        </td>
                                    </tr>
                                ) : filteredJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-400 border-t border-gray-50">
                                            <AlertCircle className="mx-auto mb-2 opacity-20" size={40} />
                                            <p className="text-sm font-bold">No jobs found.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobs.map(job => (
                                        <tr key={job.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="font-black text-gray-800 line-clamp-1">{job.title}</p>
                                                    <p className="text-xs text-gray-500 font-bold">{job.company} • {job.location}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-black uppercase tracking-tight">{job.type}</span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${job.source === 'internal' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                                                        }`}>
                                                        {job.source}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-2 text-gray-900 font-black">
                                                    <Briefcase size={14} className="text-gray-300" />
                                                    {job.applicationsCount || 0}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${job.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                                                        job.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                                                            'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${job.status === 'published' ? 'bg-emerald-500' :
                                                            job.status === 'draft' ? 'bg-gray-400' :
                                                                'bg-yellow-500'
                                                        }`} />
                                                    {job.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => { setEditingJob(job); setShowModal(true); }}
                                                        className="p-2 text-gray-400 hover:bg-white hover:text-blue-600 hover:shadow-sm rounded-xl transition-all"
                                                        title="Edit Job"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(job.id)}
                                                        className="p-2 text-gray-400 hover:bg-white hover:text-red-600 hover:shadow-sm rounded-xl transition-all"
                                                        title="Delete Job"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {showModal && editingJob && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                                    <Plus size={24} />
                                </div>
                                {editingJob.id ? 'Edit Job Posting' : 'Create New Job Posting'}
                            </h2>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Job Title</label>
                                        <input
                                            required
                                            value={editingJob.title}
                                            onChange={e => setEditingJob(j => ({ ...j, title: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Company Name</label>
                                        <input
                                            required
                                            value={editingJob.company}
                                            onChange={e => setEditingJob(j => ({ ...j, company: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Location</label>
                                        <input
                                            value={editingJob.location}
                                            onChange={e => setEditingJob(j => ({ ...j, location: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                                            placeholder="Mumbai, Maharashtra"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Salary Range</label>
                                        <input
                                            value={editingJob.salaryRange}
                                            onChange={e => setEditingJob(j => ({ ...j, salaryRange: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                                            placeholder="₹50k - ₹80k / Mo"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Job Type</label>
                                        <select
                                            value={editingJob.type}
                                            onChange={e => setEditingJob(j => ({ ...j, type: e.target.value }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm appearance-none"
                                        >
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                            <option>Temporary</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Source</label>
                                        <div className="flex bg-gray-100 p-1 rounded-xl">
                                            <button
                                                type="button"
                                                onClick={() => setEditingJob(j => ({ ...j, source: 'internal' }))}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${editingJob.source === 'internal' ? 'bg-white text-emerald-700 shadow-sm' : 'text-gray-400'
                                                    }`}
                                            >
                                                Internal
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setEditingJob(j => ({ ...j, source: 'external' }))}
                                                className={`flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${editingJob.source === 'external' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-400'
                                                    }`}
                                            >
                                                External
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Status</label>
                                        <select
                                            value={editingJob.status}
                                            onChange={e => setEditingJob(j => ({ ...j, status: e.target.value as any }))}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-bold text-sm"
                                        >
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-gray-500 uppercase tracking-widest ml-1">Job Description</label>
                                    <textarea
                                        rows={4}
                                        value={editingJob.description}
                                        onChange={e => setEditingJob(j => ({ ...j, description: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium text-sm"
                                        placeholder="Detailed job description, responsibilities, etc."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 py-4 rounded-2xl font-black text-gray-500 hover:bg-gray-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] bg-[#00703C] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {saving ? <><Clock className="animate-spin" size={20} /> Saving...</> : <><Save size={20} /> Save Job Posting</>}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Building2, Clock, Search, Filter,
    ArrowRight, Globe, Home, ChevronRight, X, AlertCircle
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import JobApplicationForm from './JobApplicationForm';

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
    responsibilities?: string[];
    benefits?: string[];
    requirements?: string[];
    createdAt: string;
}

export default function JobsListing() {
    const { isLoggedIn } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'internal' | 'external'>('internal');
    const [search, setSearch] = useState('');
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [applyingJob, setApplyingJob] = useState<Job | null>(null);

    useEffect(() => {
        fetchJobs();
    }, [source]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/jobs?source=${source}`);
            const json = await res.json();
            if (json.success) setJobs(json.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(search.toLowerCase()) ||
        j.location.toLowerCase().includes(search.toLowerCase()) ||
        j.company.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">
            {/* Header & Toggle */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Explore Opportunities</h1>
                    <p className="text-gray-500">Find your next role at AI D-Mart or our partner companies</p>
                </div>

                <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                    <button
                        onClick={() => setSource('internal')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${source === 'internal'
                                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Home size={18} /> Internal Jobs
                    </button>
                    <button
                        onClick={() => setSource('external')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm transition-all ${source === 'external'
                                ? 'bg-white text-emerald-700 shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Globe size={18} /> External Jobs
                    </button>
                </div>
            </div>

            {/* Search & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <div className="md:col-span-3 relative group">
                    <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by title, company, or location..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                    />
                </div>
                <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-2xl p-4">
                    <Briefcase className="text-emerald-600" size={20} />
                    <span className="font-black text-emerald-800 text-xl">{filteredJobs.length}</span>
                    <span className="text-emerald-600 text-sm font-bold uppercase tracking-wider">Jobs Found</span>
                </div>
            </div>

            {/* Jobs Grid */}
            {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-gray-400">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold">Fetching latest opportunities...</p>
                </div>
            ) : filteredJobs.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
                    <AlertCircle className="mx-auto mb-4 text-gray-300" size={48} />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No jobs matched your search</h3>
                    <p className="text-gray-500">Try adjusting your filters or checking back later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                        <div key={job.id} className="group bg-white rounded-3xl border border-gray-200 p-6 hover:shadow-2xl hover:shadow-emerald-100/50 transition-all hover:-translate-y-1 flex flex-col h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 bg-gray-50 rounded-2xl border border-gray-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors">
                                    <Building2 className="text-gray-400 group-hover:text-emerald-500 transition-colors" size={24} />
                                </div>
                                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{job.type}</span>
                            </div>

                            <h3 className="text-lg font-black text-gray-800 group-hover:text-emerald-700 transition-colors mb-1">{job.title}</h3>
                            <p className="text-sm font-bold text-gray-400 mb-4">{job.company}</p>

                            <div className="space-y-2 mb-6 flex-1">
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                    <MapPin size={16} /> {job.location}
                                </div>
                                <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold">
                                    <Clock size={16} /> {job.salaryRange}
                                </div>
                                <p className="text-xs text-gray-500 leading-relaxed mt-4 line-clamp-3">
                                    {job.shortDescription || job.description}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-gray-50">
                                <button
                                    onClick={() => setSelectedJob(job)}
                                    className="flex-1 px-4 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-all border border-gray-200 text-sm"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => setApplyingJob(job)}
                                    className="flex-1 px-4 py-2.5 bg-[#00703C] text-white rounded-xl font-black text-sm shadow-md hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center justify-center gap-2 group/btn"
                                >
                                    Apply <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Job Details Modal */}
            {selectedJob && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
                        <button
                            onClick={() => setSelectedJob(null)}
                            className="absolute right-6 top-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all z-10"
                        >
                            <X size={20} />
                        </button>

                        <div className="p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <Building2 className="text-emerald-600" size={32} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900">{selectedJob.title}</h2>
                                    <p className="text-emerald-600 font-bold">{selectedJob.company} • {selectedJob.location}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">{selectedJob.type}</span>
                                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">{selectedJob.salaryRange}</span>
                                <span className="bg-gray-50 text-gray-600 px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider">{selectedJob.source} Job</span>
                            </div>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Description
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">{selectedJob.description}</p>
                                </div>

                                {selectedJob.responsibilities && selectedJob.responsibilities.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Responsibilities
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                            {selectedJob.responsibilities.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <ChevronRight size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Requirements
                                        </h3>
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                                            {selectedJob.requirements.map((r, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                                                    <ChevronRight size={16} className="text-emerald-500 shrink-0 mt-0.5" /> {r}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <div className="w-1 h-4 bg-emerald-500 rounded-full" /> Benefits
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.benefits.map((b, i) => (
                                                <span key={i} className="bg-gray-50 text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border border-gray-100">
                                                    {b}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => { setSelectedJob(null); setApplyingJob(selectedJob); }}
                                className="w-full mt-10 bg-[#00703C] text-white py-4 rounded-2xl font-black shadow-xl shadow-emerald-100 hover:shadow-emerald-200 transition-all flex items-center justify-center gap-3 group"
                            >
                                Apply Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Application Form Modal */}
            {applyingJob && (
                <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                    <div className="w-full max-w-2xl my-8">
                        <JobApplicationForm
                            job={applyingJob}
                            onCancel={() => setApplyingJob(null)}
                            onSuccess={() => setApplyingJob(null)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

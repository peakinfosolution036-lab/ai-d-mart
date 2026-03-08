'use client';

import React, { useState, useEffect } from 'react';
import {
    Briefcase, MapPin, Building2, Clock, Search, Filter,
    ArrowRight, Globe, Home, ChevronRight, X, AlertCircle, Star
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
    experience?: string;
    createdAt: string;
}

export default function JobsListing() {
    const { isLoggedIn } = useAuth();
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<'internal' | 'external'>('internal');
    const [search, setSearch] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterSalary, setFilterSalary] = useState('');
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

    const filteredJobs = jobs.filter(j => {
        const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
            j.company.toLowerCase().includes(search.toLowerCase());
        const matchesLocation = filterLocation ? j.location.toLowerCase().includes(filterLocation.toLowerCase()) : true;
        const matchesType = filterType ? j.type.toLowerCase().includes(filterType.toLowerCase()) : true;
        const matchesSalary = filterSalary ? j.salaryRange.includes(filterSalary) : true;
        return matchesSearch && matchesLocation && matchesType && matchesSalary;
    });

    const uniqueLocations = Array.from(new Set(jobs.map(j => j.location))).filter(Boolean);
    const uniqueTypes = Array.from(new Set(jobs.map(j => j.type))).filter(Boolean);
    const uniqueSalaries = Array.from(new Set(jobs.map(j => j.salaryRange))).filter(Boolean);

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

            {/* Search & Filters */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-10 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by job title or company..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                        />
                    </div>
                    <div className="md:w-1/4 relative">
                        <select
                            value={filterLocation} onChange={e => setFilterLocation(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none text-gray-600"
                        >
                            <option value="">All Locations</option>
                            {uniqueLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                        </select>
                        <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <select
                            value={filterType} onChange={e => setFilterType(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none text-gray-600"
                        >
                            <option value="">All Job Types</option>
                            {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                        </select>
                        <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="flex-1 relative">
                        <select
                            value={filterSalary} onChange={e => setFilterSalary(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium appearance-none text-gray-600"
                        >
                            <option value="">Any Salary Range</option>
                            {uniqueSalaries.map(sal => <option key={sal} value={sal}>{sal}</option>)}
                        </select>
                        <Filter size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="md:w-[200px] flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                        <span className="font-black text-emerald-800 text-lg">{filteredJobs.length}</span>
                        <span className="text-emerald-600 text-xs font-bold uppercase tracking-wider">Jobs Found</span>
                    </div>
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
                        <div key={job.id} className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:border-[#00703C]/30 transition-all hover:-translate-y-1 flex flex-col h-full">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#00703C] transition-colors mb-1">{job.title}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-6">{job.company}</p>

                            <div className="space-y-3 mb-8 flex-1">
                                <div className="flex items-center gap-3 text-gray-700 text-sm">
                                    <span className="text-lg">📍</span>
                                    <span className="font-medium">{job.location}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 text-sm">
                                    <span className="text-lg">💼</span>
                                    <span className="font-medium">{job.type}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 text-sm">
                                    <span className="text-lg">💰</span>
                                    <span className="font-medium">{job.salaryRange}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700 text-sm">
                                    <span className="text-lg">📅</span>
                                    <span className="font-medium">{job.experience || 'Not specified'}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setApplyingJob(job)}
                                className="w-full py-3 bg-[#00703C] text-white rounded-xl font-bold hover:bg-[#005c30] transition-colors shadow-md"
                            >
                                Apply Now
                            </button>
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

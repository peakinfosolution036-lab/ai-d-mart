'use client'

import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Mail, Phone, Clock, CheckCircle, XCircle, Users, BarChart3, FileText, ChevronDown, RefreshCw } from 'lucide-react';

interface Enquiry {
    id: string;
    name: string;
    mobile: string;
    email: string;
    eventDate: string | null;
    eventType: string;
    services: string[];
    notes: string;
    status: string;
    assignedTo: string | null;
    createdAt: string;
}

interface Analytics {
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    cancelled: number;
    byService: Record<string, number>;
}

export default function AdminEventEnquiry() {
    const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);

    useEffect(() => { fetchEnquiries(); }, [statusFilter, searchQuery]);

    const fetchEnquiries = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (statusFilter) params.set('status', statusFilter);
            if (searchQuery) params.set('search', searchQuery);
            const res = await fetch(`/api/event-enquiry?${params.toString()}`);
            const data = await res.json();
            if (data.success) {
                setEnquiries(data.data.enquiries);
                setAnalytics(data.data.analytics);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const updateStatus = async (enquiryId: string, status: string) => {
        const res = await fetch('/api/event-enquiry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_status', enquiryId, status })
        });
        const data = await res.json();
        if (data.success) { fetchEnquiries(); setSelectedEnquiry(null); }
        else alert(data.error);
    };

    const statusColors: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700',
        IN_PROGRESS: 'bg-blue-100 text-blue-700',
        COMPLETED: 'bg-green-100 text-green-700',
        CANCELLED: 'bg-red-100 text-red-700',
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800">Event Enquiries</h1>
                        <p className="text-sm text-gray-500">Manage event enquiries and services</p>
                    </div>
                    <button onClick={fetchEnquiries} className="bg-white border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Analytics Cards */}
                {analytics && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {[
                            { label: 'Total', value: analytics.total, color: 'bg-gray-600', icon: <FileText className="w-4 h-4" /> },
                            { label: 'Pending', value: analytics.pending, color: 'bg-yellow-500', icon: <Clock className="w-4 h-4" /> },
                            { label: 'In Progress', value: analytics.inProgress, color: 'bg-blue-500', icon: <Users className="w-4 h-4" /> },
                            { label: 'Completed', value: analytics.completed, color: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> },
                            { label: 'Cancelled', value: analytics.cancelled, color: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> },
                        ].map((stat, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <div className={`w-6 h-6 ${stat.color} text-white rounded-md flex items-center justify-center`}>{stat.icon}</div>
                                    <span className="text-xs font-medium">{stat.label}</span>
                                </div>
                                <p className="text-2xl font-black text-gray-800">{stat.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Filters */}
                <div className="flex gap-3 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, mobile..."
                            className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-sm focus:border-blue-500 outline-none" />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 border rounded-lg text-sm bg-white font-medium">
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                    </select>
                </div>

                {/* Enquiries Table */}
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-gray-400">Loading...</div>
                    ) : enquiries.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">No enquiries found</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Name</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Contact</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Event</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Services</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Date</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {enquiries.map((enq) => (
                                        <tr key={enq.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-800">{enq.name}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-col text-xs text-gray-500">
                                                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{enq.mobile}</span>
                                                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{enq.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-700">{enq.eventType}</p>
                                                {enq.eventDate && <p className="text-xs text-gray-400">{enq.eventDate}</p>}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex flex-wrap gap-1">
                                                    {enq.services.slice(0, 2).map(s => (
                                                        <span key={s} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded">{s}</span>
                                                    ))}
                                                    {enq.services.length > 2 && <span className="text-xs text-gray-400">+{enq.services.length - 2}</span>}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[enq.status] || 'bg-gray-100 text-gray-600'}`}>
                                                    {enq.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-400">
                                                {new Date(enq.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => setSelectedEnquiry(enq)}
                                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium">
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Detail Modal */}
                {selectedEnquiry && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b flex items-center justify-between">
                                <h3 className="font-bold text-lg">Enquiry Details</h3>
                                <button onClick={() => setSelectedEnquiry(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><p className="text-xs text-gray-500">Name</p><p className="font-bold">{selectedEnquiry.name}</p></div>
                                    <div><p className="text-xs text-gray-500">Mobile</p><p className="font-bold">{selectedEnquiry.mobile}</p></div>
                                    <div><p className="text-xs text-gray-500">Email</p><p className="font-bold">{selectedEnquiry.email}</p></div>
                                    <div><p className="text-xs text-gray-500">Event Type</p><p className="font-bold">{selectedEnquiry.eventType}</p></div>
                                    <div><p className="text-xs text-gray-500">Event Date</p><p className="font-bold">{selectedEnquiry.eventDate || 'Not specified'}</p></div>
                                    <div><p className="text-xs text-gray-500">Status</p>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusColors[selectedEnquiry.status]}`}>{selectedEnquiry.status}</span>
                                    </div>
                                </div>
                                {selectedEnquiry.services.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 mb-2">Selected Services</p>
                                        <div className="flex flex-wrap gap-1">
                                            {selectedEnquiry.services.map(s => (
                                                <span key={s} className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1 rounded-full font-medium">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedEnquiry.notes && (
                                    <div><p className="text-xs text-gray-500 mb-1">Notes</p><p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedEnquiry.notes}</p></div>
                                )}
                                <hr />
                                <div>
                                    <p className="text-xs text-gray-500 mb-2">Update Status</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(s => (
                                            <button key={s} onClick={() => updateStatus(selectedEnquiry.id, s)}
                                                disabled={selectedEnquiry.status === s}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-30 ${statusColors[s]} hover:opacity-80`}>
                                                {s.replace('_', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    FileText, User, Mail, Phone, MapPin, Camera,
    Upload, CheckCircle, Shield, AlertCircle, Loader2
} from 'lucide-react';

interface JobApplicationFormProps {
    job: {
        id: string;
        title: string;
        company: string;
    } | null;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function JobApplicationForm({ job, onSuccess, onCancel }: JobApplicationFormProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        mobile: (user as any)?.mobile || '',
        employmentType: 'Full-time',
        acceptedRules: false,
    });

    const [files, setFiles] = useState<{ [key: string]: File | null }>({
        addressProof: null,
        identityProof: null,
        educationCertificate: null,
        selfie: null
    });

    const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.error('Location access denied', err)
            );
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
        if (e.target.files && e.target.files[0]) {
            setFiles(prev => ({ ...prev, [key]: e.target.files![0] }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!job) return;
        if (!formData.acceptedRules) {
            setError('Please accept the company rules and regulations.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // In a real app, we would upload files to S3 first
            // Here we simulate document URLs
            const mockDocUrls = {
                addressProof: 'https://cdn-placeholder.com/docs/address.pdf',
                identityProof: 'https://cdn-placeholder.com/docs/id.pdf',
                educationCertificate: 'https://cdn-placeholder.com/docs/edu.pdf',
                selfie: 'https://cdn-placeholder.com/docs/selfie.jpg'
            };

            const payload = {
                jobId: job.id,
                jobTitle: job.title,
                companyName: job.company,
                applicantId: user?.id,
                ...formData,
                documents: mockDocUrls,
                locationData: location,
                jobType: formData.employmentType
            };

            const res = await fetch('/api/jobs/applications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const json = await res.json();
            if (json.success) {
                setSubmitted(true);
                if (onSuccess) setTimeout(onSuccess, 3000);
            } else {
                setError(json.error || 'Failed to submit application');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-white rounded-2xl p-8 text-center shadow-xl max-w-lg mx-auto border border-emerald-100">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="text-emerald-600 w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-gray-800 mb-2">Application Received!</h2>
                <p className="text-gray-500 mb-6">
                    Your application for <span className="font-bold text-emerald-700">{job?.title}</span> has been received and is under review.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500 mb-8">
                    We'll notify you via email or mobile once there's an update.
                </div>
                <button
                    onClick={onCancel}
                    className="w-full bg-[#00703C] text-white py-3.5 rounded-xl font-black shadow-lg hover:shadow-emerald-200/50 transition-all"
                >
                    Back to Jobs
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-2xl mx-auto border border-gray-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00703C] to-emerald-700 p-6 text-white">
                <h2 className="text-xl font-black">Job Application</h2>
                <p className="text-emerald-100 text-sm">{job?.title} at {job?.company}</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                {error && (
                    <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                        <AlertCircle size={18} /> {error}
                    </div>
                )}

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Full Name</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                                placeholder="Aditya Nayak"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Mobile Number</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                required
                                value={formData.mobile}
                                onChange={e => setFormData(f => ({ ...f, mobile: e.target.value }))}
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                                placeholder="+91 9876543210"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                    <div className="relative">
                        <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                            className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all font-medium"
                            placeholder="aditya@example.com"
                        />
                    </div>
                </div>

                {/* Employment Type */}
                <div className="space-y-3">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Type of Employment</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['Full-time', 'Part-time', 'Contract', 'Temporary'].map(type => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setFormData(f => ({ ...f, employmentType: type }))}
                                className={`py-2.5 rounded-xl border text-sm font-bold transition-all ${formData.employmentType === type
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 ring-2 ring-emerald-500/20'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                    }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Document Uploads */}
                <div className="space-y-4">
                    <label className="text-xs font-black text-gray-500 uppercase tracking-wider ml-1">Documents Upload</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { id: 'addressProof', label: 'Address Proof', icon: MapPin },
                            { id: 'identityProof', label: 'Identity Proof', icon: Shield },
                            { id: 'educationCertificate', label: 'Education Certificate', icon: FileText },
                            { id: 'selfie', label: 'Live Selfie', icon: Camera },
                        ].map(doc => (
                            <div key={doc.id} className="relative">
                                <input
                                    type="file"
                                    id={doc.id}
                                    className="hidden"
                                    onChange={e => handleFileChange(e, doc.id)}
                                    required
                                />
                                <label
                                    htmlFor={doc.id}
                                    className={`flex items-center gap-3 p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all ${files[doc.id]
                                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                                            : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${files[doc.id] ? 'bg-emerald-100' : 'bg-white'}`}>
                                        <doc.icon size={16} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-black uppercase tracking-tight">{doc.label}</p>
                                        <p className="text-[10px] truncate opacity-60">
                                            {files[doc.id] ? (files[doc.id] as any).name : 'Click to upload'}
                                        </p>
                                    </div>
                                    {files[doc.id] && <CheckCircle size={16} className="text-emerald-500" />}
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Terms */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                    <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-1">
                            <input
                                type="checkbox"
                                checked={formData.acceptedRules}
                                onChange={e => setFormData(f => ({ ...f, acceptedRules: e.target.checked }))}
                                className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded-md checked:bg-emerald-600 checked:border-emerald-600 transition-all cursor-pointer"
                            />
                            <CheckCircle size={12} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-all" />
                        </div>
                        <span className="text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                            I accept the <strong>Company Rules & Regulations</strong> and confirm that all submitted information and documents are original and true.
                        </span>
                    </label>
                </div>

                {/* Footer Actions */}
                <div className="flex flex-col md:flex-row gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] bg-[#00703C] text-white py-3.5 rounded-xl font-black shadow-lg hover:shadow-emerald-200/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-70"
                    >
                        {loading ? (
                            <><Loader2 className="animate-spin" size={20} /> Processing...</>
                        ) : (
                            <>Submit Application <CheckCircle size={20} className="group-hover:scale-110 transition-transform" /></>
                        )}
                    </button>
                </div>
            </form>

            <div className="bg-orange-50 p-4 flex items-start gap-3 border-t border-orange-100">
                <AlertCircle className="text-orange-500 shrink-0" size={18} />
                <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                    Your live location and IP address will be captured during submission for security and verification purposes.
                </p>
            </div>
        </div>
    );
}

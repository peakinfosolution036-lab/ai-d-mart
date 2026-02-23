'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, Phone, Mail, FileText, Send, CheckCircle, Camera, X, Sparkles } from 'lucide-react';

export default function EventEnquiryPage() {
    const [services, setServices] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [enquiryId, setEnquiryId] = useState('');

    // Form state
    const [name, setName] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventType, setEventType] = useState('');
    const [selectedServices, setSelectedServices] = useState<string[]>([]);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const res = await fetch('/api/event-enquiry?action=services');
            const data = await res.json();
            if (data.success) setServices(data.data.services);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const toggleService = (service: string) => {
        setSelectedServices(prev =>
            prev.includes(service)
                ? prev.filter(s => s !== service)
                : [...prev, service]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !mobile || !email) {
            alert('Please fill in all required fields');
            return;
        }
        if (!/^[6-9]\d{9}$/.test(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Please enter a valid email address');
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch('/api/event-enquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'submit_enquiry',
                    name, mobile, email, eventDate, eventType,
                    services: selectedServices, notes
                })
            });
            const data = await res.json();
            if (data.success) {
                setSubmitted(true);
                setEnquiryId(data.data.enquiryId);
            } else {
                alert(data.error || 'Failed to submit enquiry');
            }
        } catch (e) { alert('Something went wrong. Please try again.'); }
        finally { setSubmitting(false); }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-800 mb-2">Thank You! 🎉</h2>
                    <p className="text-gray-600 mb-6">Your event enquiry has been submitted successfully. Our team will contact you within 24 hours.</p>
                    <div className="bg-gray-50 rounded-xl p-4 mb-6">
                        <p className="text-xs text-gray-500">Enquiry Reference</p>
                        <p className="text-lg font-bold text-[#00703C]">{enquiryId.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">A confirmation email has been sent to <strong>{email}</strong></p>
                    <button onClick={() => { setSubmitted(false); setName(''); setMobile(''); setEmail(''); setEventDate(''); setEventType(''); setSelectedServices([]); setNotes(''); }}
                        className="bg-[#00703C] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005c30] transition-colors w-full">
                        Submit Another Enquiry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00703C] to-emerald-600 text-white py-12 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-sm font-medium">No Login Required</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">Plan Your Perfect Event ✨</h1>
                    <p className="text-emerald-100 text-lg">Tell us about your event and we&apos;ll handle the rest</p>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto px-4 -mt-8">
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 md:p-10">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#00703C]" />
                        Event Enquiry Form
                    </h2>

                    {/* Contact Details */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Full Name *</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00703C] outline-none transition-colors"
                                placeholder="Enter your name" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Mobile Number *</label>
                            <div className="flex">
                                <span className="bg-gray-100 px-3 py-3 border-2 border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm flex items-center">+91</span>
                                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))} required
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-r-xl focus:border-[#00703C] outline-none transition-colors"
                                    placeholder="9876543210" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Email *</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00703C] outline-none transition-colors"
                                placeholder="your@email.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Event Date</label>
                            <input type="date" value={eventDate} onChange={e => setEventDate(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00703C] outline-none transition-colors" />
                        </div>
                    </div>

                    {/* Event Type */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Event Type</label>
                        <div className="flex flex-wrap gap-2">
                            {['Wedding', 'Birthday', 'Corporate', 'Conference', 'Social Gathering', 'Anniversary', 'Cultural', 'Other'].map(type => (
                                <button key={type} type="button" onClick={() => setEventType(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition-all ${eventType === type ? 'bg-[#00703C] text-white border-[#00703C]' : 'bg-white text-gray-700 border-gray-200 hover:border-[#00703C]'}`}>
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Services */}
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Select Services</label>
                        {loading ? (
                            <div className="text-gray-400 text-sm">Loading services...</div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {services.map(service => (
                                    <button key={service} type="button" onClick={() => toggleService(service)}
                                        className={`px-3 py-2.5 rounded-xl text-sm font-medium border-2 transition-all text-left ${selectedServices.includes(service) ? 'bg-emerald-50 text-[#00703C] border-[#00703C]' : 'bg-white text-gray-600 border-gray-200 hover:border-emerald-300'}`}>
                                        {selectedServices.includes(service) ? '✓ ' : ''}{service}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Additional Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00703C] outline-none transition-colors resize-none"
                            placeholder="Tell us more about your event requirements..." />
                    </div>

                    {/* Submit */}
                    <button type="submit" disabled={submitting}
                        className="w-full py-4 bg-gradient-to-r from-[#00703C] to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 text-lg shadow-lg">
                        {submitting ? (
                            <><div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> Submitting...</>
                        ) : (
                            <><Send className="w-5 h-5" /> Submit Enquiry</>
                        )}
                    </button>
                </form>

                <p className="text-center text-gray-400 text-sm mt-6 pb-10">
                    No account needed • Our team will respond within 24 hours
                </p>
            </div>
        </div>
    );
}

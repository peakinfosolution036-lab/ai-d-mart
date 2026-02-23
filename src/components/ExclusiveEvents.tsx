'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Download, Clock, User, Phone, CreditCard, AlertCircle } from 'lucide-react';

interface ExclusiveEvent {
    id: string;
    name: string;
    description: string;
    date: string;
    location: string;
    canAccess: boolean;
    message?: string;
}

interface EventPass {
    passId: string;
    eventName: string;
    eventDate: string;
    status: string;
    createdAt: string;
}

const ExclusiveEvents = ({ userId }: { userId: string }) => {
    const [events, setEvents] = useState<ExclusiveEvent[]>([]);
    const [passes, setPasses] = useState<EventPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPassForm, setShowPassForm] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<ExclusiveEvent | null>(null);
    const [formData, setFormData] = useState({
        eventDate: '',
        timeSlot: '',
        idProof: '',
        emergencyContact: '',
        city: '',
        notes: ''
    });

    useEffect(() => {
        fetchEvents();
        fetchPasses();
    }, [userId]);

    const fetchEvents = async () => {
        try {
            const response = await fetch(`/api/events/exclusive?userId=${userId}`);
            const data = await response.json();
            if (data.success) {
                setEvents(data.events);
            }
        } catch (error) {
            console.error('Error fetching events:', error);
        }
    };

    const fetchPasses = async () => {
        try {
            const response = await fetch(`/api/events/passes?userId=${userId}`);
            const data = await response.json();
            if (data.success) {
                setPasses(data.passes);
            }
        } catch (error) {
            console.error('Error fetching passes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePass = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedEvent) return;

        try {
            const response = await fetch('/api/events/passes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    eventId: selectedEvent.id,
                    ...formData
                })
            });

            const data = await response.json();
            if (data.success) {
                setShowPassForm(false);
                setSelectedEvent(null);
                setFormData({
                    eventDate: '',
                    timeSlot: '',
                    idProof: '',
                    emergencyContact: '',
                    city: '',
                    notes: ''
                });
                fetchPasses();
            } else {
                alert(data.error);
            }
        } catch (error) {
            console.error('Error generating pass:', error);
        }
    };

    const downloadPass = async (passId: string) => {
        try {
            const response = await fetch('/api/events/passes', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ passId })
            });

            const data = await response.json();
            if (data.success) {
                const link = document.createElement('a');
                link.href = `data:application/pdf;base64,${data.pdf}`;
                link.download = data.filename;
                link.click();
            }
        } catch (error) {
            console.error('Error downloading pass:', error);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Exclusive Events */}
            <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-6">🎫 Exclusive Events</h3>
                <div className="grid gap-6">
                    {events.map(event => (
                        <div key={event.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">{event.name}</h4>
                                    <p className="text-slate-600 mb-4">{event.description}</p>
                                    <div className="flex gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={16} /> {new Date(event.date).toLocaleDateString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={16} /> {event.location}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    {event.canAccess ? (
                                        <button
                                            onClick={() => {
                                                setSelectedEvent(event);
                                                setShowPassForm(true);
                                            }}
                                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                        >
                                            Get Event Pass
                                        </button>
                                    ) : (
                                        <div className="text-center">
                                            <div className="px-4 py-2 bg-amber-50 text-amber-600 rounded-xl text-sm font-medium mb-2 flex items-center gap-2">
                                                <AlertCircle size={16} />
                                                {event.message}
                                            </div>
                                            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                                                Subscribe Now
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* My Event Passes */}
            {passes.length > 0 && (
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">📋 My Event Passes</h3>
                    <div className="grid gap-4">
                        {passes.map(pass => (
                            <div key={pass.passId} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex justify-between items-center">
                                <div>
                                    <h4 className="font-bold text-slate-900">{pass.eventName}</h4>
                                    <p className="text-slate-500 text-sm">Date: {pass.eventDate}</p>
                                    <p className="text-slate-500 text-sm">Pass ID: {pass.passId}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                        pass.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                    }`}>
                                        {pass.status}
                                    </span>
                                    <button
                                        onClick={() => downloadPass(pass.passId)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                    >
                                        <Download size={16} /> Download
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pass Generation Form Modal */}
            {showPassForm && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6">Generate Event Pass</h3>
                        <p className="text-slate-600 mb-6">Event: {selectedEvent.name}</p>
                        
                        <form onSubmit={handleGeneratePass} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Event Date</label>
                                <input
                                    type="date"
                                    required
                                    value={formData.eventDate}
                                    onChange={e => setFormData({...formData, eventDate: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time Slot</label>
                                <select
                                    required
                                    value={formData.timeSlot}
                                    onChange={e => setFormData({...formData, timeSlot: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                >
                                    <option value="">Select Time</option>
                                    <option value="9:00 AM - 12:00 PM">9:00 AM - 12:00 PM</option>
                                    <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM</option>
                                    <option value="5:00 PM - 8:00 PM">5:00 PM - 8:00 PM</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">ID Proof Number</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Aadhaar/PAN/Driving License"
                                    value={formData.idProof}
                                    onChange={e => setFormData({...formData, idProof: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Emergency Contact</label>
                                <input
                                    type="tel"
                                    required
                                    placeholder="+91 9876543210"
                                    value={formData.emergencyContact}
                                    onChange={e => setFormData({...formData, emergencyContact: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">City</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Your City"
                                    value={formData.city}
                                    onChange={e => setFormData({...formData, city: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                                <textarea
                                    placeholder="Any special requirements..."
                                    value={formData.notes}
                                    onChange={e => setFormData({...formData, notes: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-20 resize-none"
                                />
                            </div>
                            
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowPassForm(false)}
                                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                                >
                                    Generate Pass
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExclusiveEvents;
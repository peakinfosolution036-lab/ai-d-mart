'use client'

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Download, Clock, User, Phone, CreditCard, AlertCircle, Camera, Video, Utensils, Sparkles, Music, Building, Scissors, Mail, Car, Home, X } from 'lucide-react';

const services = [
    { id: 'photography', name: 'Photography', icon: Camera, images: ['/services/photography/1.jpg', '/services/photography/2.jpg', '/services/photography/3.jpg'] },
    { id: 'videography', name: 'Videography', icon: Video, images: ['/services/videography/1.jpg', '/services/videography/2.jpg', '/services/videography/3.jpg'] },
    { id: 'catering', name: 'Catering', icon: Utensils, images: ['/services/catering/1.jpg', '/services/catering/2.jpg', '/services/catering/3.jpg'] },
    { id: 'decoration', name: 'Decoration', icon: Sparkles, images: ['/services/decoration/1.jpg', '/services/decoration/2.jpg', '/services/decoration/3.jpg'] },
    { id: 'music', name: 'DJ & Music', icon: Music, images: ['/services/djmusic/1.jpg', '/services/djmusic/2.jpg', '/services/djmusic/3.jpg'] },
    { id: 'venue', name: 'Venue Booking', icon: Building, images: ['/services/venuebooking/1.jpg', '/services/venuebooking/2.jpg', '/services/venuebooking/3.jpg'] },
    { id: 'makeup', name: 'Makeup & Styling', icon: Scissors, images: ['/services/makeupstyling/1.jpg', '/services/makeupstyling/2.jpg', '/services/makeupstyling/3.jpg'] },
    { id: 'invitation', name: 'Invitation Cards', icon: Mail, images: ['/services/invitationcards/1.jpg', '/services/invitationcards/2.jpg', '/services/invitationcards/3.jpg'] },
    { id: 'transportation', name: 'Transportation', icon: Car, images: ['/services/transportation/1.jpg', '/services/transportation/2.jpg', '/services/transportation/3.jpg'] },
    { id: 'accommodation', name: 'Accommodation', icon: Home, images: ['/services/accommodation/1.jpg', '/services/accommodation/2.jpg', '/services/accommodation/3.jpg'] }
];

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
    const [selectedService, setSelectedService] = useState<{ name: string; images: string[] } | null>(null);
    const [passes, setPasses] = useState<EventPass[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPassForm, setShowPassForm] = useState(false);
    const [showServicesDropdown, setShowServicesDropdown] = useState(false);
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
        <div className="space-y-12">
            {/* Our Services - Dropdown Style */}
            <div className="relative z-20">
                <button
                    onClick={() => setShowServicesDropdown(!showServicesDropdown)}
                    className="w-full flex items-center justify-between bg-white border border-[#00703C]/30 shadow-md rounded-2xl p-5 hover:bg-green-50 transition-colors"
                >
                    <span className="text-xl font-bold text-[#004D2C] flex items-center gap-2">
                        <Sparkles className="text-[#FFD700]" /> Select Services
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[#00703C]/10 flex items-center justify-center text-[#00703C]">
                        {showServicesDropdown ? <X size={20} /> : <span className="font-bold">+</span>}
                    </div>
                </button>

                {showServicesDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 max-h-96 overflow-y-auto z-30 animate-in fade-in slide-in-from-top-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {services.map(service => (
                                <button
                                    key={service.id}
                                    onClick={() => {
                                        setSelectedService({ name: service.name, images: service.images });
                                        setShowServicesDropdown(false);
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-green-50 text-left border border-transparent hover:border-green-100 transition-colors w-full group"
                                >
                                    <div className="w-12 h-12 rounded-full bg-green-100 text-[#00703C] flex items-center justify-center group-hover:bg-[#00703C] group-hover:text-white transition-colors shrink-0">
                                        <service.icon size={20} />
                                    </div>
                                    <span className="font-bold text-gray-800 flex-1">{service.name}</span>
                                    <span className="text-xs font-semibold text-[#00703C] opacity-0 group-hover:opacity-100 transition-opacity">
                                        View Gallery &rarr;
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Inline Service Gallery */}
            {selectedService && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 animate-in fade-in duration-300 mt-6 !mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-[#004D2C] flex items-center gap-2">
                            <Sparkles className="text-[#FFD700]" size={20} /> {selectedService.name} Examples
                        </h3>
                        <button
                            onClick={() => setSelectedService(null)}
                            className="bg-gray-100 text-gray-500 p-1.5 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {selectedService.images.slice(0, 3).map((img: string, idx: number) => (
                            <div key={idx} className="relative aspect-video sm:aspect-square md:aspect-video rounded-xl overflow-hidden group shadow border border-[#00703C]/10 bg-gray-100">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={img}
                                    alt={`${selectedService.name} Example ${idx + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${pass.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
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
                                    onChange={e => setFormData({ ...formData, eventDate: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Preferred Time Slot</label>
                                <select
                                    required
                                    value={formData.timeSlot}
                                    onChange={e => setFormData({ ...formData, timeSlot: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, idProof: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
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
                                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Additional Notes (Optional)</label>
                                <textarea
                                    placeholder="Any special requirements..."
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
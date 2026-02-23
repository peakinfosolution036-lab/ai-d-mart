'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Eye, X, CheckCircle, XCircle, Clock, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ExclusiveEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  maxAttendees: number;
  currentAttendees: number;
  status: 'active' | 'inactive' | 'completed';
  createdAt: string;
}

interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
}

export default function ExclusiveEventsAdmin() {
  const router = useRouter();
  const { isLoggedIn, isLoading, userRole } = useAuth();
  const [events, setEvents] = useState<ExclusiveEvent[]>([]);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRegistrationsModal, setShowRegistrationsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ExclusiveEvent | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    image: '',
    maxAttendees: 50
  });

  // Redirect if not admin
  useEffect(() => {
    if (!isLoading) {
      if (!isLoggedIn) {
        router.push('/login');
      } else if (userRole !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [isLoggedIn, isLoading, userRole, router]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/events/exclusive');
      const data = await response.json();
      if (data.success) {
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async (eventId: string) => {
    try {
      const response = await fetch(`/api/events/exclusive/${eventId}/registrations`);
      const data = await response.json();
      if (data.success) {
        setRegistrations(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn && userRole === 'ADMIN') {
      fetchEvents();
    }
  }, [isLoggedIn, userRole]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewEvent({ ...newEvent, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEditing ? `/api/events/exclusive/${selectedEvent?.id}` : '/api/events/exclusive';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newEvent.title,
          description: newEvent.description,
          date: newEvent.date,
          location: newEvent.location,
          createdBy: 'admin'
        })
      });

      const data = await response.json();
      if (data.success) {
        fetchEvents();
        setShowAddModal(false);
        setIsEditing(false);
        setSelectedEvent(null);
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          location: '',
          image: '',
          maxAttendees: 50
        });
      }
    } catch (error) {
      console.error('Failed to save event:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: ExclusiveEvent) => {
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      image: event.image,
      maxAttendees: event.maxAttendees
    });
    setSelectedEvent(event);
    setIsEditing(true);
    setShowAddModal(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/events/exclusive/${eventId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to delete event:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateEventStatus = async (eventId: string, status: 'active' | 'inactive' | 'completed') => {
    setLoading(true);
    try {
      const response = await fetch(`/api/events/exclusive/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const data = await response.json();
      if (data.success) {
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to update event status:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewRegistrations = (event: ExclusiveEvent) => {
    setSelectedEvent(event);
    fetchRegistrations(event.id);
    setShowRegistrationsModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/dashboard" className="p-2 hover:bg-white rounded-xl transition-colors">
              <ArrowLeft size={24} className="text-slate-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-black text-slate-900">🎯 Exclusive Events</h1>
              <p className="text-slate-500">Manage subscriber-only premium events</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
          >
            <Plus size={20} /> Create Event
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                <Calendar size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{events.length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Events</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                <CheckCircle size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{events.filter(e => e.status === 'active').length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Events</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{events.reduce((sum, e) => sum + e.currentAttendees, 0)}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                <Star size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-900">{events.filter(e => e.status === 'completed').length}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Events</p>
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden group">
              <div className="h-48 relative overflow-hidden">
                {event.image ? (
                  <Image 
                    src={event.image} 
                    alt={event.title} 
                    width={400} 
                    height={300} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                    <Calendar size={48} className="text-purple-300" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest text-white ${
                    event.status === 'active' ? 'bg-green-500' : 
                    event.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'
                  }`}>
                    {event.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-xl text-slate-900 mb-2">{event.title}</h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={14} className="text-purple-500" />
                    {event.date} at {event.time}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-red-500" />
                    {event.location}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users size={14} className="text-blue-500" />
                    {event.currentAttendees} / {event.maxAttendees} registered
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewRegistrations(event)}
                    className="flex-1 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all"
                  >
                    <Eye size={14} className="inline mr-1" /> View
                  </button>
                  <button
                    onClick={() => handleEdit(event)}
                    className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
                  >
                    <Edit size={14} className="inline mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => updateEventStatus(event.id, event.status === 'active' ? 'inactive' : 'active')}
                    className={`p-2 rounded-xl transition-all ${
                      event.status === 'active' 
                        ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {event.status === 'active' ? <XCircle size={16} /> : <CheckCircle size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(event.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="col-span-full bg-white rounded-3xl p-12 border border-slate-100 text-center">
              <Calendar size={48} className="mx-auto text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No exclusive events yet</h3>
              <p className="text-slate-500 mb-6">Create your first subscriber-only event to get started.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Create First Event
              </button>
            </div>
          )}
        </div>

        {/* Add/Edit Event Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-slate-900">
                  {isEditing ? 'Edit Event' : 'Create New Event'}
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setIsEditing(false);
                    setSelectedEvent(null);
                    setNewEvent({
                      title: '',
                      description: '',
                      date: '',
                      time: '',
                      location: '',
                      image: '',
                      maxAttendees: 50
                    });
                  }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Event Title</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                    placeholder="Enter event title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors resize-none"
                    rows={4}
                    placeholder="Describe your exclusive event"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Time</label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                      className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                    placeholder="Event location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Max Attendees</label>
                  <input
                    type="number"
                    value={newEvent.maxAttendees}
                    onChange={(e) => setNewEvent({ ...newEvent, maxAttendees: parseInt(e.target.value) || 50 })}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                    min="1"
                    max="1000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Event Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full p-4 border border-slate-200 rounded-xl focus:border-purple-500 outline-none transition-colors"
                  />
                  {newEvent.image && (
                    <div className="mt-4">
                      <Image 
                        src={newEvent.image} 
                        alt="Preview" 
                        width={200} 
                        height={150} 
                        className="rounded-xl object-cover" 
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setIsEditing(false);
                      setSelectedEvent(null);
                      setNewEvent({
                        title: '',
                        description: '',
                        date: '',
                        time: '',
                        location: '',
                        image: '',
                        maxAttendees: 50
                      });
                    }}
                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Registrations Modal */}
        {showRegistrationsModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Event Registrations</h3>
                  <p className="text-slate-500">{selectedEvent.title}</p>
                </div>
                <button
                  onClick={() => setShowRegistrationsModal(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="p-6">
                {registrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Users size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">No registrations yet for this event.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((registration) => (
                      <div key={registration.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                        <div>
                          <p className="font-bold text-slate-900">{registration.userName}</p>
                          <p className="text-sm text-slate-500">{registration.userEmail}</p>
                          <p className="text-xs text-slate-400">
                            Registered: {new Date(registration.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          registration.status === 'registered' ? 'bg-blue-100 text-blue-700' :
                          registration.status === 'attended' ? 'bg-green-100 text-green-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {registration.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
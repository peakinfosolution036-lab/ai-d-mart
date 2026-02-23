'use client'

import { useState, useEffect } from 'react';
import { Calendar, Plus, Save, Trash2, Clock } from 'lucide-react';

interface Season {
    id: string;
    name: string;
    type: string;
    startDate: string;
    endDate: string;
    duration: number;
    status: string;
}

export default function AdminSeasonsPage() {
    const [seasons, setSeasons] = useState<Season[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        type: 'daily',
        startDate: '',
        endDate: '',
        duration: 30
    });

    useEffect(() => {
        fetchSeasons();
    }, []);

    const fetchSeasons = async () => {
        try {
            const response = await fetch('/api/admin/seasons');
            const data = await response.json();
            setSeasons(data.data || []);
        } catch (error) {
            console.error('Error fetching seasons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSeason = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    duration: Number(formData.duration)
                })
            });

            if (response.ok) {
                fetchSeasons();
                setShowForm(false);
                setFormData({ name: '', type: 'daily', startDate: '', endDate: '', duration: 30 });
            } else {
                alert('Failed to create season');
            }
        } catch (error) {
            console.error('Error creating season:', error);
        }
    };

    const handleDeleteSeason = async (id: string) => {
        if (!confirm('Are you sure? This might affect active products.')) return;
        try {
            await fetch(`/api/admin/seasons?id=${id}`, { method: 'DELETE' });
            fetchSeasons();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Calendar className="text-yellow-500" /> Season Management
                    </h1>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-yellow-400"
                    >
                        <Plus size={20} /> New Season
                    </button>
                </div>

                {/* Create Form */}
                {showForm && (
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-8 animate-in fade-in slide-in-from-top-4">
                        <h2 className="text-xl font-bold mb-4">Create New Season</h2>
                        <form onSubmit={handleCreateSeason} className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Season Name</label>
                                <input
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                    placeholder="e.g. Summer Bonanza 2024"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Type</label>
                                <select
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                >
                                    <option value="daily">Daily Draws</option>
                                    <option value="weekly">Weekly Draws</option>
                                    <option value="monthly">Monthly Draws</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">Start Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                    value={formData.startDate}
                                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-400 text-sm mb-1">End Date</label>
                                <input
                                    type="date"
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white"
                                    value={formData.endDate}
                                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="col-span-2 flex justify-end gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-4 py-2 rounded text-gray-400 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="bg-yellow-500 text-black px-6 py-2 rounded font-bold hover:bg-yellow-400"
                                >
                                    Create Season
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Seasons List */}
                <div className="grid gap-4">
                    {loading ? <p>Loading...</p> : seasons.map(season => (
                        <div key={season.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center group">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h3 className="text-xl font-bold text-white">{season.name}</h3>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${season.status === 'active' ? 'bg-green-900 text-green-400' : 'bg-gray-700 text-gray-400'
                                        }`}>
                                        {season.status || 'Planned'}
                                    </span>
                                    <span className="bg-blue-900 text-blue-400 px-2 py-0.5 rounded text-xs font-bold uppercase">
                                        {season.type}
                                    </span>
                                </div>
                                <div className="flex items-center gap-6 text-sm text-gray-400">
                                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(season.startDate).toDateString()} - {new Date(season.endDate).toDateString()}</span>
                                    <span className="flex items-center gap-1"><Clock size={14} /> Duration: {season.duration} days</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDeleteSeason(season.id)}
                                    className="p-2 hover:bg-red-900/50 rounded text-red-500 transition-colors"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && seasons.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
                            No seasons found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

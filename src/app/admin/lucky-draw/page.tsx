'use client'

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Users, Trophy, Gift, Search, X, Check, Dices, Calendar, Clock, Play, Pause } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    description: string;
    pricePerNumber: number;
    totalNumbers: number;
    image: string;
    status: string;
    seasonId?: string;
    drawType: string;
    isJackpot?: boolean;
    isSurpriseGift?: boolean;
}

interface Season {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: string;
}

interface ReportData {
    totalTickets: number;
    totalRevenue: number;
    freeTickets: number;
    paidRevenue: number;
    bookingsCount: number;
}

interface Booking {
    id: string;
    userName: string;
    numbers: number[];
    paymentStatus: string;
    bookedAt: string;
}

interface Winner {
    id: string;
    userId: string;
    productName: string;
    winningNumber: number;
    gift: string;
    status: string;
    drawDate: string;
}

export default function AdminLuckyDrawPage() {
    const [activeTab, setActiveTab] = useState('products');
    const [products, setProducts] = useState<Product[]>([]);
    const [seasons, setSeasons] = useState<Season[]>([]); // New State

    // ... (Keep existing state for bookings/winners)
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [selectedProductForBookings, setSelectedProductForBookings] = useState<string | null>(null);
    const [showProductForm, setShowProductForm] = useState(false);
    const [loading, setLoading] = useState(true);

    // Draw Schedule State
    const [scheduleData, setScheduleData] = useState({
        drawDate: '', drawTime: '20:00', drawDay: 'THURSDAY',
        drawTimeZone: 'IST', isActive: true, title: '', description: ''
    });
    const [scheduleLoading, setScheduleLoading] = useState(false);
    const [scheduleSaved, setScheduleSaved] = useState(false);

    const [reports, setReports] = useState<ReportData | null>(null);
    const [showSeasonForm, setShowSeasonForm] = useState(false);
    const [seasonFormData, setSeasonFormData] = useState({
        name: '', startDate: '', endDate: '', status: 'active'
    });

    // Form Data Extended
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        pricePerNumber: '',
        totalNumbers: '',
        image: '',
        seasonId: '',
        drawType: 'daily',
        isJackpot: false,
        jackpotConfig: { prizeAmount: 0, profitGoal: 0 },
        isSurpriseGift: false,
        autoWinner: false
    });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const uploadData = new FormData();
        uploadData.append('image', file);
        uploadData.append('folder', 'lucky-draw');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json();
            if (data.success) {
                setFormData(prev => ({ ...prev, image: data.url }));
            } else {
                alert(data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
        fetchSeasons();
        fetchSchedule();
    }, []);

    // Fetch current draw schedule
    const fetchSchedule = async () => {
        try {
            const res = await fetch('/api/lucky-draw/schedule');
            const data = await res.json();
            if (data.success) {
                const d = data.data;
                const dt = new Date(d.drawDate);
                setScheduleData({
                    drawDate: dt.toISOString().split('T')[0],
                    drawTime: d.drawTime || '20:00',
                    drawDay: d.drawDay || 'THURSDAY',
                    drawTimeZone: d.drawTimeZone || 'IST',
                    isActive: d.isActive ?? true,
                    title: d.title || '',
                    description: d.description || ''
                });
            }
        } catch (e) { console.error(e); }
    };

    // Save draw schedule
    const handleSaveSchedule = async () => {
        if (!scheduleData.drawDate) { alert('Please select a draw date'); return; }
        setScheduleLoading(true);
        try {
            const [hours, mins] = scheduleData.drawTime.split(':').map(Number);
            const drawDateTime = new Date(scheduleData.drawDate + 'T' + scheduleData.drawTime + ':00');

            const res = await fetch('/api/lucky-draw/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    drawDate: drawDateTime.toISOString(),
                    drawDay: drawDateTime.toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase(),
                    drawTime: scheduleData.drawTime,
                    drawTimeZone: scheduleData.drawTimeZone,
                    isActive: scheduleData.isActive,
                    title: scheduleData.title,
                    description: scheduleData.description
                })
            });
            const data = await res.json();
            if (data.success) {
                setScheduleSaved(true);
                setTimeout(() => setScheduleSaved(false), 3000);
                fetchSchedule();
            } else { alert(data.error); }
        } catch (e) { alert('Failed to save schedule'); }
        finally { setScheduleLoading(false); }
    };

    const fetchSeasons = async () => {
        try {
            const res = await fetch('/api/lucky-draw/seasons');
            const data = await res.json();
            setSeasons(data.data || []);
        } catch (e) {
            console.error(e);
        }
    }

    const fetchReports = async () => {
        try {
            const res = await fetch('/api/lucky-draw/reports?type=revenue');
            const data = await res.json();
            setReports(data.data || null);
        } catch (e) {
            console.error(e);
        }
    }

    const handleCreateSeason = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/lucky-draw/seasons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seasonFormData)
            });
            if (res.ok) {
                fetchSeasons();
                setShowSeasonForm(false);
                setSeasonFormData({ name: '', startDate: '', endDate: '', status: 'active' });
            }
        } catch (e) { console.error(e); }
    };

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/lucky-draw?type=products');
            const data = await response.json();
            setProducts(data.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching products:', error);
            setLoading(false);
        }
    };

    // ... (fetchBookings, fetchWinners logic remains similar, can copy or keep)
    const fetchBookings = async (productId: string) => {
        setSelectedProductForBookings(productId);
        try {
            const response = await fetch(`/api/admin/lucky-draw?type=bookings&productId=${productId}`);
            const data = await response.json();
            setBookings(data.data || []);
            setActiveTab('bookings');
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const fetchWinners = async () => {
        try {
            const response = await fetch('/api/admin/lucky-draw?type=winners');
            const data = await response.json();
            setWinners(data.data || []);
            setActiveTab('winners');
        } catch (error) {
            console.error('Error fetching winners:', error);
        }
    };

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/admin/lucky-draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'create-product',
                    ...formData,
                    pricePerNumber: Number(formData.pricePerNumber),
                    totalNumbers: Number(formData.totalNumbers)
                })
            });

            if (response.ok) {
                fetchProducts();
                setShowProductForm(false);
                setFormData({
                    name: '', description: '', pricePerNumber: '', totalNumbers: '', image: '',
                    seasonId: '', drawType: 'daily', isJackpot: false,
                    jackpotConfig: { prizeAmount: 0, profitGoal: 0 },
                    isSurpriseGift: false, autoWinner: false
                });
            } else {
                alert('Failed to create product');
            }
        } catch (error) {
            console.error('Error creating product:', error);
        }
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await fetch('/api/admin/lucky-draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete-product', id })
            });
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // ... (Winner selection logic - keep as is or update if needed)

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-gray-800">Lucky Draw Admin</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('products')}
                            className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            Products
                        </button>
                        <button
                            onClick={() => { setActiveTab('seasons'); fetchSeasons(); }}
                            className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'seasons' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            Seasons
                        </button>
                        <button
                            onClick={fetchWinners}
                            className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'winners' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            Winners
                        </button>
                        <button
                            onClick={() => { setActiveTab('reports'); fetchReports(); }}
                            className={`px-4 py-2 rounded-lg font-bold ${activeTab === 'reports' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            Reports
                        </button>
                        <button
                            onClick={() => { setActiveTab('schedule'); fetchSchedule(); }}
                            className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 ${activeTab === 'schedule' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600'}`}
                        >
                            <Calendar size={16} /> Schedule
                        </button>
                    </div>
                </header>

                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setShowProductForm(!showProductForm)}
                            className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg"
                        >
                            <Plus size={20} /> Add New Draw Product
                        </button>

                        {showProductForm && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-top-4">
                                <h2 className="text-xl font-bold mb-6 text-gray-800">Create New Product</h2>
                                <form onSubmit={handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-blue-500 focus:outline-none transition-colors"
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Season</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={formData.seasonId}
                                            onChange={e => setFormData({ ...formData, seasonId: e.target.value })}
                                            required
                                        >
                                            <option value="">Select Season</option>
                                            {seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Draw Type</label>
                                        <select
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={formData.drawType}
                                            onChange={e => setFormData({ ...formData, drawType: e.target.value })}
                                        >
                                            <option value="daily">Daily</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Numbers</label>
                                        <input
                                            type="number"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={formData.totalNumbers}
                                            onChange={e => setFormData({ ...formData, totalNumbers: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Price per Number (₹)</label>
                                        <input
                                            type="number"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={formData.pricePerNumber}
                                            onChange={e => setFormData({ ...formData, pricePerNumber: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                                        <div className="flex gap-4 items-start">
                                            <div className="flex-1 space-y-2">
                                                <div className="relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={handleImageUpload}
                                                        className="w-full border-2 border-gray-200 rounded-xl p-3 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                        disabled={uploading}
                                                    />
                                                    {uploading && (
                                                        <div className="absolute right-3 top-3">
                                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    className="w-full border-2 border-gray-200 rounded-xl p-3 text-sm text-gray-500 bg-gray-50"
                                                    value={formData.image}
                                                    readOnly
                                                    placeholder="Image URL will appear here after upload"
                                                />
                                            </div>
                                            {formData.image && (
                                                <div className="w-24 h-24 rounded-lg border border-gray-200 overflow-hidden bg-gray-50">
                                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="md:col-span-2 flex gap-6">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isJackpot}
                                                onChange={e => setFormData({ ...formData, isJackpot: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="font-bold text-gray-700">Is Jackpot?</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={formData.isSurpriseGift}
                                                onChange={e => setFormData({ ...formData, isSurpriseGift: e.target.checked })}
                                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                                            />
                                            <span className="font-bold text-gray-700">Is Surprise Gift?</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                                        <textarea
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 min-h-[100px]"
                                            value={formData.description}
                                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <button
                                            type="button"
                                            onClick={() => setShowProductForm(false)}
                                            className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200"
                                        >
                                            Create Product
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="h-48 bg-gray-100 relative">
                                        <img src={product.image || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover" />
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            {product.isJackpot && <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full">Jackpot</span>}
                                            <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full capitalize">{product.drawType}</span>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-lg text-gray-800 mb-1">{product.name}</h3>
                                                <p className="text-gray-500 text-sm">Season: {seasons.find(s => s.id === product.seasonId)?.name || 'N/A'}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-black text-xl text-blue-600">₹{product.pricePerNumber}</div>
                                                <div className="text-xs text-gray-500">per entry</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-100">
                                                <div className="text-2xl font-bold text-gray-800">{product.totalNumbers}</div>
                                                <div className="text-xs text-gray-500 font-bold uppercase">Total Spots</div>
                                            </div>
                                            <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-100">
                                                <div className="text-2xl font-bold text-blue-600">Active</div>
                                                <div className="text-xs text-blue-400 font-bold uppercase">Status</div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => fetchBookings(product.id)}
                                                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Users size={16} /> View Bookings
                                            </button>
                                            <button
                                                onClick={() => handleDeleteProduct(product.id)}
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Bookings View */}
                {activeTab === 'bookings' && (
                    <div>
                        <button onClick={() => setActiveTab('products')} className="mb-4 text-blue-600 font-bold">← Back to Products</button>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="p-4 text-sm font-bold text-gray-600">User</th>
                                        <th className="p-4 text-sm font-bold text-gray-600">Numbers</th>
                                        <th className="p-4 text-sm font-bold text-gray-600">Status</th>
                                        <th className="p-4 text-sm font-bold text-gray-600">Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map(booking => (
                                        <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="p-4 font-bold">{booking.userName}</td>
                                            <td className="p-4">
                                                <div className="flex gap-1 flex-wrap">
                                                    {booking.numbers.map(n => (
                                                        <span key={n} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono font-bold">#{n}</span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${booking.paymentStatus === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                                    }`}>
                                                    {booking.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="p-4 text-sm text-gray-500">{new Date(booking.bookedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bookings.length === 0 && <p className="p-8 text-center text-gray-500">No bookings yet.</p>}
                        </div>
                    </div>
                )}

                {/* Winners View */}
                {activeTab === 'winners' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="p-4 text-sm font-bold text-gray-600">Draw Product</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Winner</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Number</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Prize</th>
                                    <th className="p-4 text-sm font-bold text-gray-600">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {winners.map(winner => (
                                    <tr key={winner.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="p-4 font-bold text-blue-600">{winner.productName}</td>
                                        <td className="p-4 text-gray-800">{winner.userId}</td>
                                        <td className="p-4"><span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold">#{winner.winningNumber}</span></td>
                                        <td className="p-4 font-bold">{winner.gift}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(winner.drawDate).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Seasons View */}
                {activeTab === 'seasons' && (
                    <div className="space-y-6">
                        <button
                            onClick={() => setShowSeasonForm(!showSeasonForm)}
                            className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 shadow-lg"
                        >
                            <Plus size={20} /> Create New Season
                        </button>

                        {showSeasonForm && (
                            <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 animate-in slide-in-from-top-4">
                                <h2 className="text-xl font-bold mb-6 text-gray-800">New Season</h2>
                                <form onSubmit={handleCreateSeason} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Season Name</label>
                                        <input
                                            className="w-full border-2 border-gray-200 rounded-xl p-3 focus:border-purple-500 focus:outline-none"
                                            value={seasonFormData.name}
                                            onChange={e => setSeasonFormData({ ...seasonFormData, name: e.target.value })}
                                            placeholder="e.g. Summer Bonanza 2026"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={seasonFormData.startDate}
                                            onChange={e => setSeasonFormData({ ...seasonFormData, startDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            className="w-full border-2 border-gray-200 rounded-xl p-3"
                                            value={seasonFormData.endDate}
                                            onChange={e => setSeasonFormData({ ...seasonFormData, endDate: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                        <button type="button" onClick={() => setShowSeasonForm(false)} className="px-6 py-3 rounded-xl font-bold text-gray-500">Cancel</button>
                                        <button type="submit" className="bg-purple-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200">Create Season</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {seasons.map(season => (
                                <div key={season.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-black text-gray-800">{season.name}</h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${season.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                            {season.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm text-gray-500 font-bold">
                                        <div className="flex justify-between"><span>START:</span> <span className="text-gray-800">{new Date(season.startDate).toLocaleDateString()}</span></div>
                                        <div className="flex justify-between"><span>END:</span> <span className="text-gray-800">{new Date(season.endDate).toLocaleDateString()}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Reports View */}
                {activeTab === 'reports' && reports && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Revenue</p>
                                <p className="text-3xl font-black text-green-600">₹{reports.totalRevenue.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Tickets</p>
                                <p className="text-3xl font-black text-blue-600">{reports.totalTickets.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Free Entries</p>
                                <p className="text-3xl font-black text-purple-600">{reports.freeTickets}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Total Bookings</p>
                                <p className="text-3xl font-black text-gray-800">{reports.bookingsCount}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm text-center">
                            <h3 className="text-lg font-bold text-gray-400 mb-2">Revenue Breakdown</h3>
                            <p className="text-gray-500">Charts and detailed per-draw analytics will be available here soon.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
'use client'

import { useState, useEffect } from 'react';
import { BarChart3, Users, Ticket, TrendingUp, DollarSign } from 'lucide-react';

interface ReportData {
    totalRevenue: number;
    totalTickets: number;
    activeUsers: number;
    productPerformance: { name: string, revenue: number, tickets: number }[];
    recentSales: { id: string, user: string, product: string, amount: number, date: string }[];
}

export default function AdminReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch('/api/admin/reports');
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-white">Loading reports...</div>;

    if (!data) return <div className="p-8 text-center text-red-500">Failed to load reports.</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <header className="flex items-center gap-3 mb-8">
                    <BarChart3 className="w-8 h-8 text-yellow-500" />
                    <h1 className="text-3xl font-bold">Lucky Draw Reports</h1>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
                                <h2 className="text-3xl font-black text-green-400 mt-1">₹{data.totalRevenue.toLocaleString()}</h2>
                            </div>
                            <div className="bg-green-900/30 p-3 rounded-xl">
                                <DollarSign className="w-6 h-6 text-green-400" />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">Gross revenue from all bookings</div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Active Participants</p>
                                <h2 className="text-3xl font-black text-blue-400 mt-1">{data.activeUsers.toLocaleString()}</h2>
                            </div>
                            <div className="bg-blue-900/30 p-3 rounded-xl">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">Unique users who booked tickets</div>
                    </div>

                    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Tickets Sold</p>
                                <h2 className="text-3xl font-black text-purple-400 mt-1">{data.totalTickets.toLocaleString()}</h2>
                            </div>
                            <div className="bg-purple-900/30 p-3 rounded-xl">
                                <Ticket className="w-6 h-6 text-purple-400" />
                            </div>
                        </div>
                        <div className="text-xs text-gray-500">Including free tickets</div>
                    </div>
                </div>

                {/* Charts Area (Performance) */}
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-gray-800 rounded-2xl border border-gray-700 p-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-yellow-500" /> Top Performing Draws
                        </h3>
                        <div className="space-y-4">
                            {data.productPerformance.slice(0, 5).map((prod, idx) => (
                                <div key={idx} className="bg-gray-900 p-4 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center font-bold text-gray-500">
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div className="font-bold">{prod.name}</div>
                                            <div className="text-xs text-gray-400">{prod.tickets} tickets sold</div>
                                        </div>
                                    </div>
                                    <div className="font-bold text-green-400">₹{prod.revenue.toLocaleString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
                        <h3 className="text-xl font-bold mb-6">Recent Activity</h3>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {data.recentSales.map((sale, idx) => (
                                <div key={idx} className="border-b border-gray-700 pb-3 mb-3 last:border-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <span className="font-bold text-sm truncate max-w-[120px]">{sale.user}</span>
                                        <span className="text-green-400 font-mono font-bold">₹{sale.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <span className="truncate max-w-[150px]">{sale.product}</span>
                                        <span>{new Date(sale.date).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

'use client'

import React, { useState, useEffect } from 'react';
import { Award, Crown, Users, Trophy, Search, RefreshCw, ChevronDown, Gift, TrendingUp, BarChart3 } from 'lucide-react';

interface RankDistribution {
    [rank: string]: number;
}

interface Reward {
    SK: string;
    userId: string;
    rank: string;
    reward: string;
    status: string;
    createdAt: string;
}

const RANK_COLORS: Record<string, string> = {
    'Customer': 'bg-gray-100 text-gray-700',
    'Promoter': 'bg-blue-100 text-blue-700',
    'Partner': 'bg-indigo-100 text-indigo-700',
    'Distributor': 'bg-purple-100 text-purple-700',
    'Prime Distributor': 'bg-pink-100 text-pink-700',
    'Director': 'bg-orange-100 text-orange-700',
    'Prime Director': 'bg-red-100 text-red-700',
    'Advisor': 'bg-emerald-100 text-emerald-700',
    'Prime Advisor': 'bg-teal-100 text-teal-700',
    'Executive': 'bg-yellow-100 text-yellow-700',
};

export default function AdminAwards() {
    const [rankDistribution, setRankDistribution] = useState<RankDistribution>({});
    const [totalUsers, setTotalUsers] = useState(0);
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);
    const [promoteUserId, setPromoteUserId] = useState('');
    const [promoteRank, setPromoteRank] = useState('Promoter');

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/awards?action=admin_reports');
            const data = await res.json();
            if (data.success) {
                setRankDistribution(data.data.rankDistribution);
                setTotalUsers(data.data.totalUsers);
                setRewards(data.data.rewards);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handlePromote = async () => {
        if (!promoteUserId) { alert('Enter a user ID'); return; }
        const res = await fetch('/api/awards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'manual_promote', userId: promoteUserId, newRank: promoteRank })
        });
        const data = await res.json();
        if (data.success) { alert(data.message); setPromoteUserId(''); fetchData(); }
        else alert(data.error);
    };

    const handleDistributeReward = async (rewardSK: string, userId: string) => {
        const res = await fetch('/api/awards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'distribute_reward', rewardId: rewardSK, userId })
        });
        const data = await res.json();
        if (data.success) { alert(data.message); fetchData(); }
        else alert(data.error);
    };

    const ranks = ['Customer', 'Promoter', 'Partner', 'Distributor', 'Prime Distributor', 'Director', 'Prime Director', 'Advisor', 'Prime Advisor', 'Executive'];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
                            <Award className="w-6 h-6 text-purple-500" /> Awards & Rewards Management
                        </h1>
                        <p className="text-sm text-gray-500">Manage rank hierarchy and reward distribution</p>
                    </div>
                    <button onClick={fetchData} className="bg-white border px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50">
                        <RefreshCw className="w-4 h-4" /> Refresh
                    </button>
                </div>

                {/* Rank Distribution */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-purple-500" /> Rank Distribution ({totalUsers} total users)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {ranks.map(rank => (
                            <div key={rank} className={`p-3 rounded-xl text-center ${RANK_COLORS[rank]}`}>
                                <p className="text-2xl font-black">{rankDistribution[rank] || 0}</p>
                                <p className="text-xs font-bold mt-1">{rank}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Manual Promote */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" /> Manual Promotion
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">User ID</label>
                                <input type="text" value={promoteUserId} onChange={e => setPromoteUserId(e.target.value)}
                                    placeholder="Enter user ID"
                                    className="w-full px-4 py-2.5 border rounded-lg text-sm focus:border-blue-500 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">Promote to Rank</label>
                                <select value={promoteRank} onChange={e => setPromoteRank(e.target.value)}
                                    className="w-full px-4 py-2.5 border rounded-lg text-sm bg-white font-medium">
                                    {ranks.slice(1).map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <button onClick={handlePromote}
                                className="w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                Promote User
                            </button>
                        </div>
                    </div>

                    {/* Pending Rewards */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                            <Gift className="w-5 h-5 text-yellow-500" /> Pending Rewards ({rewards.filter(r => r.status === 'PENDING').length})
                        </h3>
                        {rewards.filter(r => r.status === 'PENDING').length === 0 ? (
                            <div className="text-center text-gray-400 py-8">
                                <Gift className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No pending rewards</p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {rewards.filter(r => r.status === 'PENDING').map((r, i) => (
                                    <div key={i} className="flex items-center justify-between bg-yellow-50 rounded-lg p-3 border border-yellow-100">
                                        <div>
                                            <p className="font-bold text-sm text-gray-800">🎁 {r.reward}</p>
                                            <p className="text-xs text-gray-500">User: {r.userId.slice(0, 8)}... • {r.rank}</p>
                                        </div>
                                        <button onClick={() => handleDistributeReward(r.SK, r.userId)}
                                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700">
                                            Distribute
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* All Rewards History */}
                <div className="bg-white rounded-xl shadow-sm border p-6 mt-6">
                    <h3 className="font-bold text-lg text-gray-800 mb-4">All Rewards History</h3>
                    {rewards.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">No rewards yet</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">User</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Rank</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Reward</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Status</th>
                                        <th className="text-left px-4 py-3 font-bold text-gray-600">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {rewards.map((r, i) => (
                                        <tr key={i} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium">{r.userId.slice(0, 12)}...</td>
                                            <td className="px-4 py-3"><span className={`text-xs font-bold px-2 py-1 rounded-full ${RANK_COLORS[r.rank]}`}>{r.rank}</span></td>
                                            <td className="px-4 py-3 font-medium">{r.reward}</td>
                                            <td className="px-4 py-3">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${r.status === 'DISTRIBUTED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {r.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

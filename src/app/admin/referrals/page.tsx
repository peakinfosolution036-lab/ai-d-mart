'use client'

import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, Award, Settings, CheckCircle, XCircle, Download, Wallet, Crown, BarChart3, RefreshCw, Save, DollarSign, Percent, ToggleLeft, ToggleRight, Gift } from 'lucide-react';

interface ReferralStats {
    totalReferrals: number;
    pendingReferrals: number;
    approvedReferrals: number;
    totalPointsAwarded: number;
    walletValueGenerated: number;
}

interface ReferralRecord {
    id: string;
    referrerId: string;
    referredUserId: string;
    referralCode: string;
    status: string;
    createdAt: string;
    pointsEarned: number;
    approvedAt?: string;
    rejectedAt?: string;
}

interface ReferralSettings {
    pointsPerReferral: number;
    approvalMode: string;
    systemEnabled: boolean;
    primeOnly: boolean;
    primeCommission: number;
    primeCommissionPercent: number;
    pointsToWalletRate: number;
    primePrice: number;
    primeOriginalPrice: number;
    distribution: {
        referralIncome: { amount: number; percent: number };
        shoppingWallet: { amount: number; percent: number };
        eventPool: { amount: number; percent: number };
        awardsRewards: { amount: number; percent: number };
        platformCharge: { amount: number; percent: number };
        companyProfit: { amount: number; percent: number };
        gst: { amount: number; percent: number };
    };
}

export default function AdminReferrals() {
    const [activeTab, setActiveTab] = useState('overview');
    const [stats, setStats] = useState<ReferralStats>({
        totalReferrals: 0, pendingReferrals: 0, approvedReferrals: 0,
        totalPointsAwarded: 0, walletValueGenerated: 0
    });
    const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState<ReferralSettings>({
        pointsPerReferral: 25, approvalMode: 'manual', systemEnabled: true,
        primeOnly: false, primeCommission: 500, primeCommissionPercent: 25,
        pointsToWalletRate: 100, primePrice: 2000, primeOriginalPrice: 5000,
        distribution: {
            referralIncome: { amount: 500, percent: 25 },
            shoppingWallet: { amount: 100, percent: 5 },
            eventPool: { amount: 140, percent: 7 },
            awardsRewards: { amount: 300, percent: 15 },
            platformCharge: { amount: 100, percent: 5 },
            companyProfit: { amount: 500, percent: 25 },
            gst: { amount: 360, percent: 18 },
        }
    });
    const [settingsSaved, setSettingsSaved] = useState(false);
    const [savingSettings, setSavingSettings] = useState(false);

    useEffect(() => { fetchAll(); }, []);

    const fetchAll = async () => {
        setLoading(true);
        await Promise.all([fetchStats(), fetchReferrals(), fetchSettings()]);
        setLoading(false);
    };

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/referrals?type=stats');
            const data = await res.json();
            if (data.success) setStats(data.data.stats);
        } catch (e) { console.error('Stats fetch error:', e); }
    };

    const fetchReferrals = async () => {
        try {
            const res = await fetch('/api/referrals?type=admin_list');
            const data = await res.json();
            if (data.success) setReferrals(data.data.referrals || []);
        } catch (e) { console.error('Referrals fetch error:', e); }
    };

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/referrals/settings');
            const data = await res.json();
            if (data.success) setSettings(data.data);
        } catch (e) { console.error('Settings fetch error:', e); }
    };

    const saveSettings = async () => {
        setSavingSettings(true);
        try {
            const res = await fetch('/api/admin/referrals/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            const data = await res.json();
            if (data.success) {
                setSettingsSaved(true);
                setTimeout(() => setSettingsSaved(false), 3000);
            } else { alert(data.error); }
        } catch (e) { alert('Failed to save settings'); }
        finally { setSavingSettings(false); }
    };

    const approveReferral = async (referralId: string) => {
        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'approve_referral', referralId })
            });
            if (res.ok) fetchAll();
        } catch (e) { console.error('Error approving:', e); }
    };

    const rejectReferral = async (referralId: string) => {
        if (!confirm('Reject this referral?')) return;
        try {
            const res = await fetch('/api/referrals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reject_referral', referralId })
            });
            if (res.ok) fetchAll();
        } catch (e) { console.error('Error rejecting:', e); }
    };

    const exportCSV = () => {
        const rows = [
            ['Referrer ID', 'Referred User', 'Code', 'Status', 'Date', 'Points', 'Wallet Value (₹)'],
            ...referrals.map(r => [
                r.referrerId, r.referredUserId, r.referralCode, r.status,
                new Date(r.createdAt).toLocaleDateString(),
                r.pointsEarned.toString(),
                (r.pointsEarned / (settings.pointsToWalletRate || 100)).toFixed(2)
            ])
        ];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
        a.click(); URL.revokeObjectURL(url);
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'referrals', label: 'Referrals', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'income', label: 'Income Plan', icon: Crown },
    ];

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-28 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Referral Management</h1>
                        <p className="text-gray-500 mt-1">Manage referrals, settings, and income distribution</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={fetchAll} className="bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm font-medium">
                            <RefreshCw size={16} /> Refresh
                        </button>
                        <button onClick={exportCSV} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm font-bold">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm border">
                    {tabs.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            <tab.icon size={16} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* === OVERVIEW TAB === */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* System Status Banner */}
                        <div className={`rounded-xl p-4 flex items-center justify-between ${settings.systemEnabled ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                            <div className="flex items-center gap-3">
                                {settings.systemEnabled
                                    ? <ToggleRight className="w-8 h-8 text-green-600" />
                                    : <ToggleLeft className="w-8 h-8 text-red-500" />
                                }
                                <span className={`font-bold ${settings.systemEnabled ? 'text-green-700' : 'text-red-700'}`}>
                                    Referral System: {settings.systemEnabled ? 'ACTIVE' : 'DISABLED'}
                                </span>
                            </div>
                            <span className="text-sm text-gray-500">
                                Mode: {settings.approvalMode === 'auto' ? '✅ Auto Approval' : '⏳ Manual Approval'} • {settings.pointsPerReferral} pts/referral
                            </span>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: 'Total Referrals', value: stats.totalReferrals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Pending', value: stats.pendingReferrals, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                { label: 'Approved', value: stats.approvedReferrals, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Points Awarded', value: stats.totalPointsAwarded, icon: Award, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Wallet Value (₹)', value: `₹${stats.walletValueGenerated?.toFixed(2) || '0'}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                            ].map((card, i) => (
                                <div key={i} className="bg-white rounded-xl p-5 shadow-sm border">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center`}>
                                            <card.icon className={`w-5 h-5 ${card.color}`} />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-gray-800">{card.value}</p>
                                    <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Referrals Preview */}
                        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                            <div className="p-5 border-b flex items-center justify-between">
                                <h3 className="font-bold text-gray-800">Recent Referrals</h3>
                                <button onClick={() => setActiveTab('referrals')} className="text-blue-600 text-sm font-bold hover:underline">View All →</button>
                            </div>
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Referrer</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Referred</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Code</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Status</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.slice(0, 5).map(r => (
                                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3 px-5 font-mono text-sm">{r.referrerId?.slice(0, 12)}...</td>
                                            <td className="py-3 px-5 font-mono text-sm">{r.referredUserId?.slice(0, 12)}...</td>
                                            <td className="py-3 px-5 text-blue-600 font-bold text-sm">{r.referralCode}</td>
                                            <td className="py-3 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>{r.status}</span>
                                            </td>
                                            <td className="py-3 px-5 font-bold text-green-600">{r.pointsEarned > 0 ? `+${r.pointsEarned}` : '-'}</td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr><td colSpan={5} className="py-8 text-center text-gray-400">No referrals yet</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === REFERRALS TAB === */}
                {activeTab === 'referrals' && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-5 border-b">
                            <h3 className="font-bold text-gray-800">All Referrals ({referrals.length})</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Referrer ID</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Referred User</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Code</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Date</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Status</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Points</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Wallet (₹)</th>
                                        <th className="text-left py-3 px-5 font-medium text-gray-600 text-sm">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {referrals.map(r => (
                                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                                            <td className="py-3.5 px-5 font-mono text-sm">{r.referrerId}</td>
                                            <td className="py-3.5 px-5 font-mono text-sm">{r.referredUserId}</td>
                                            <td className="py-3.5 px-5 text-blue-600 font-bold text-sm">{r.referralCode}</td>
                                            <td className="py-3.5 px-5 text-sm text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3.5 px-5">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${r.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                    r.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
                                                    }`}>{r.status}</span>
                                            </td>
                                            <td className="py-3.5 px-5 font-bold text-green-600">{r.pointsEarned > 0 ? `+${r.pointsEarned}` : '-'}</td>
                                            <td className="py-3.5 px-5 font-bold">₹{(r.pointsEarned / (settings.pointsToWalletRate || 100)).toFixed(2)}</td>
                                            <td className="py-3.5 px-5">
                                                {r.status === 'pending' && (
                                                    <div className="flex gap-2">
                                                        <button onClick={() => approveReferral(r.id)}
                                                            className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-700 flex items-center gap-1">
                                                            <CheckCircle size={12} /> Approve
                                                        </button>
                                                        <button onClick={() => rejectReferral(r.id)}
                                                            className="bg-red-100 text-red-600 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1">
                                                            <XCircle size={12} /> Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {referrals.length === 0 && (
                                        <tr><td colSpan={8} className="py-12 text-center text-gray-400">No referrals found</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* === SETTINGS TAB === */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        {/* Referral Settings */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Settings size={20} className="text-blue-500" /> Referral Settings
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Points per Referral</label>
                                    <input type="number" value={settings.pointsPerReferral}
                                        onChange={e => setSettings(s => ({ ...s, pointsPerReferral: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-bold text-lg" />
                                    <p className="text-xs text-gray-400 mt-1">= ₹{(settings.pointsPerReferral / (settings.pointsToWalletRate || 100)).toFixed(2)} wallet value</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Approval Mode</label>
                                    <select value={settings.approvalMode}
                                        onChange={e => setSettings(s => ({ ...s, approvalMode: e.target.value }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-white font-medium">
                                        <option value="manual">⏳ Manual Approval</option>
                                        <option value="auto">✅ Auto Approval</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">System Status</label>
                                    <select value={settings.systemEnabled ? 'enabled' : 'disabled'}
                                        onChange={e => setSettings(s => ({ ...s, systemEnabled: e.target.value === 'enabled' }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-white font-medium">
                                        <option value="enabled">🟢 Enabled</option>
                                        <option value="disabled">🔴 Disabled</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Points to Wallet Rate</label>
                                    <div className="flex items-center gap-2">
                                        <input type="number" value={settings.pointsToWalletRate}
                                            onChange={e => setSettings(s => ({ ...s, pointsToWalletRate: Number(e.target.value) }))}
                                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-bold" />
                                        <span className="text-gray-500 font-bold whitespace-nowrap">pts = ₹1</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Prime Commission (₹)</label>
                                    <input type="number" value={settings.primeCommission}
                                        onChange={e => setSettings(s => ({ ...s, primeCommission: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-bold" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Prime Income Only</label>
                                    <select value={settings.primeOnly ? 'yes' : 'no'}
                                        onChange={e => setSettings(s => ({ ...s, primeOnly: e.target.value === 'yes' }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none bg-white font-medium">
                                        <option value="no">🌍 All Users</option>
                                        <option value="yes">👑 Prime Members Only</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mt-6">
                                <button onClick={saveSettings} disabled={savingSettings}
                                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg">
                                    {savingSettings ? (
                                        <><div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div> Saving...</>
                                    ) : (<><Save size={16} /> Save Settings</>)}
                                </button>
                                {settingsSaved && (
                                    <span className="text-green-600 font-bold text-sm flex items-center gap-1 animate-pulse">
                                        <CheckCircle size={16} /> Settings saved!
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Prime Membership Config */}
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Crown size={20} className="text-yellow-500" /> Prime Membership Pricing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Original Price (MRP)</label>
                                    <input type="number" value={settings.primeOriginalPrice}
                                        onChange={e => setSettings(s => ({ ...s, primeOriginalPrice: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Discounted Price</label>
                                    <input type="number" value={settings.primePrice}
                                        onChange={e => setSettings(s => ({ ...s, primePrice: Number(e.target.value) }))}
                                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none font-bold" />
                                </div>
                            </div>
                            <p className="text-sm text-gray-400 mt-3">
                                Discount: {settings.primeOriginalPrice > 0 ? Math.round((1 - settings.primePrice / settings.primeOriginalPrice) * 100) : 0}% OFF
                            </p>
                        </div>
                    </div>
                )}

                {/* === INCOME TAB === */}
                {activeTab === 'income' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <Crown size={20} className="text-yellow-500" /> Supe₹ Income Plan — ₹{settings.primePrice} Distribution
                            </h3>
                            <p className="text-gray-500 text-sm mb-6">How each Prime membership payment (₹{settings.primePrice}) is automatically distributed</p>

                            {/* Visual bar */}
                            <div className="h-5 rounded-full overflow-hidden flex mb-6">
                                <div className="bg-blue-500" style={{ width: `${settings.distribution.referralIncome.percent}%` }} title="Referral" />
                                <div className="bg-purple-500" style={{ width: `${settings.distribution.shoppingWallet.percent}%` }} title="Shopping" />
                                <div className="bg-orange-500" style={{ width: `${settings.distribution.eventPool.percent}%` }} title="Event" />
                                <div className="bg-yellow-500" style={{ width: `${settings.distribution.awardsRewards.percent}%` }} title="Awards" />
                                <div className="bg-gray-400" style={{ width: `${settings.distribution.platformCharge.percent}%` }} title="Platform" />
                                <div className="bg-red-500" style={{ width: `${settings.distribution.companyProfit.percent}%` }} title="Company" />
                                <div className="bg-indigo-500" style={{ width: `${settings.distribution.gst.percent}%` }} title="GST" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { key: 'referralIncome', label: 'Referral Income', color: 'bg-blue-500', icon: Gift },
                                    { key: 'shoppingWallet', label: 'Shopping Wallet', color: 'bg-purple-500', icon: Wallet },
                                    { key: 'eventPool', label: 'Event Pool', color: 'bg-orange-500', icon: TrendingUp },
                                    { key: 'awardsRewards', label: 'Awards & Rewards', color: 'bg-yellow-500', icon: Award },
                                    { key: 'platformCharge', label: 'Platform Charge', color: 'bg-gray-400', icon: DollarSign },
                                    { key: 'companyProfit', label: 'Company Profit', color: 'bg-red-500', icon: DollarSign },
                                    { key: 'gst', label: 'GST (Included)', color: 'bg-indigo-500', icon: Percent },
                                ].map(item => {
                                    const dist = (settings.distribution as any)[item.key];
                                    return (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 ${item.color} rounded-lg flex items-center justify-center text-white`}>
                                                    <item.icon className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-700 text-sm">{item.label}</p>
                                                    <p className="text-xs text-gray-400">{dist?.percent || 0}%</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <input type="number" value={dist?.amount || 0}
                                                    onChange={e => {
                                                        const val = Number(e.target.value);
                                                        const pct = settings.primePrice > 0 ? Math.round((val / settings.primePrice) * 100) : 0;
                                                        setSettings(s => ({
                                                            ...s,
                                                            distribution: {
                                                                ...s.distribution,
                                                                [item.key]: { amount: val, percent: pct }
                                                            }
                                                        }));
                                                    }}
                                                    className="w-24 px-3 py-2 border-2 border-gray-200 rounded-lg text-right font-bold focus:border-blue-500 outline-none"
                                                />
                                                <span className="text-gray-500 font-bold">₹</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Total */}
                            <div className="mt-4 bg-gradient-to-r from-[#00703C] to-emerald-600 rounded-xl p-5 text-white flex items-center justify-between">
                                <span className="text-xl font-black">Grand Total</span>
                                <div className="text-right">
                                    <p className="text-3xl font-black">
                                        ₹{Object.values(settings.distribution).reduce((sum: number, d: any) => sum + (d.amount || 0), 0).toLocaleString()}
                                    </p>
                                    <p className="text-emerald-200 text-sm">
                                        {Object.values(settings.distribution).reduce((sum: number, d: any) => sum + (d.percent || 0), 0)}%
                                    </p>
                                </div>
                            </div>

                            <button onClick={saveSettings} disabled={savingSettings}
                                className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
                                {savingSettings ? 'Saving...' : <><Save size={16} /> Save Distribution</>}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Wallet, ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Award, Gift, CreditCard, History, ChevronRight, Coins, Star, ShieldCheck } from 'lucide-react';

interface WalletData {
    main: { balance: number; totalEarned: number; totalSpent: number };
    referral: { balance: number; totalEarned: number };
    shopping: { balance: number; totalEarned: number };
    event: { balance: number; totalEarned: number };
}

interface PointsData {
    totalPoints: number;
    availablePoints: number;
    usedPoints: number;
    convertedPoints: number;
}

interface Transaction {
    transactionId: string;
    type: string;
    amount: number;
    description: string;
    walletType: string;
    status: string;
    createdAt: string;
}

export default function WalletPage() {
    const { isLoggedIn, user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [wallets, setWallets] = useState<WalletData | null>(null);
    const [points, setPoints] = useState<PointsData | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [totalBalance, setTotalBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const [convertAmount, setConvertAmount] = useState('');
    const [converting, setConverting] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'convert'>('overview');

    useEffect(() => {
        if (!authLoading && !isLoggedIn) {
            router.push('/login');
            return;
        }
        if (user?.id) fetchWalletData();
    }, [isLoggedIn, authLoading, user]);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/wallet?userId=${user?.id}`);
            const data = await res.json();
            if (data.success) {
                setWallets(data.data.wallets);
                setPoints(data.data.points);
                setTotalBalance(data.data.totalBalance);
                setTransactions(data.data.transactions);
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleConvertPoints = async () => {
        const pts = parseInt(convertAmount);
        if (!pts || pts < 100) {
            alert('Minimum 100 points required');
            return;
        }
        setConverting(true);
        try {
            const res = await fetch('/api/wallet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'convert_points', userId: user?.id, points: pts })
            });
            const data = await res.json();
            if (data.success) {
                alert(data.data.message);
                setConvertAmount('');
                fetchWalletData();
            } else {
                alert(data.error);
            }
        } catch (e) { alert('Failed to convert points'); }
        finally { setConverting(false); }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'CASHBACK': return <Gift className="w-4 h-4 text-purple-500" />;
            case 'COMMISSION': return <TrendingUp className="w-4 h-4 text-blue-500" />;
            case 'POINTS_CONVERSION': return <Coins className="w-4 h-4 text-yellow-500" />;
            case 'ADD_MONEY': return <ArrowDownLeft className="w-4 h-4 text-green-500" />;
            case 'SPEND': return <ArrowUpRight className="w-4 h-4 text-red-500" />;
            case 'WITHDRAWAL': return <CreditCard className="w-4 h-4 text-orange-500" />;
            default: return <History className="w-4 h-4 text-gray-500" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#00703C] to-emerald-600 text-white">
                <div className="max-w-6xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-4">
                        <Wallet className="w-8 h-8" />
                        <h1 className="text-3xl font-black">My Wallet</h1>
                    </div>

                    {/* Total Balance Card */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mt-4">
                        <p className="text-emerald-100 text-sm font-medium">Total Balance</p>
                        <p className="text-4xl font-black mt-1">₹ {totalBalance.toFixed(2)}</p>
                        <div className="flex gap-6 mt-4">
                            <div>
                                <p className="text-emerald-200 text-xs">Points Available</p>
                                <p className="text-lg font-bold flex items-center gap-1">
                                    <Star className="w-4 h-4 text-yellow-300" />
                                    {points?.availablePoints || 0}
                                </p>
                            </div>
                            <div>
                                <p className="text-emerald-200 text-xs">Points Value</p>
                                <p className="text-lg font-bold">₹ {((points?.availablePoints || 0) / 100).toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Wallet Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 -mt-6">
                    {[
                        { label: 'Main Wallet', balance: wallets?.main?.balance || 0, color: 'from-emerald-500 to-green-600', icon: <Wallet className="w-5 h-5" /> },
                        { label: 'Referral Income', balance: wallets?.referral?.balance || 0, color: 'from-blue-500 to-indigo-600', icon: <TrendingUp className="w-5 h-5" /> },
                        { label: 'Shopping Cashback', balance: wallets?.shopping?.balance || 0, color: 'from-purple-500 to-pink-600', icon: <Gift className="w-5 h-5" /> },
                        { label: 'Event Commission', balance: wallets?.event?.balance || 0, color: 'from-orange-500 to-red-600', icon: <Award className="w-5 h-5" /> },
                    ].map((w, i) => (
                        <div key={i} className={`bg-gradient-to-br ${w.color} text-white rounded-xl p-4 shadow-lg`}>
                            <div className="flex items-center gap-2 mb-2 opacity-80">{w.icon}<span className="text-xs font-medium">{w.label}</span></div>
                            <p className="text-xl font-black">₹ {w.balance.toFixed(2)}</p>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm">
                    {(['overview', 'transactions', 'convert'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-2.5 rounded-lg font-bold text-sm capitalize transition-all ${activeTab === tab ? 'bg-[#00703C] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'}`}
                        >
                            {tab === 'convert' ? 'Convert Points' : tab}
                        </button>
                    ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Points Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Total Earned</p>
                                    <p className="text-xl font-black text-emerald-600">{points?.totalPoints || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Available</p>
                                    <p className="text-xl font-black text-blue-600">{points?.availablePoints || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Used</p>
                                    <p className="text-xl font-black text-gray-600">{points?.usedPoints || 0}</p>
                                </div>
                                <div className="bg-gray-50 rounded-lg p-3 text-center">
                                    <p className="text-xs text-gray-500">Converted</p>
                                    <p className="text-xl font-black text-purple-600">{points?.convertedPoints || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border">
                            <h3 className="font-bold text-lg text-gray-800 mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <button onClick={() => setActiveTab('convert')} className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors">
                                    <Coins className="w-6 h-6 text-yellow-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-gray-800">Convert Points</p>
                                        <p className="text-xs text-gray-500">100 pts = ₹1</p>
                                    </div>
                                </button>
                                <button onClick={() => router.push('/referral')} className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
                                    <TrendingUp className="w-6 h-6 text-blue-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-gray-800">Earn Referrals</p>
                                        <p className="text-xs text-gray-500">Invite & earn</p>
                                    </div>
                                </button>
                                <button onClick={() => router.push('/prime')} className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 hover:bg-emerald-100 transition-colors">
                                    <ShieldCheck className="w-6 h-6 text-emerald-500" />
                                    <div className="text-left">
                                        <p className="font-bold text-sm text-gray-800">Go Prime</p>
                                        <p className="text-xs text-gray-500">Unlock income</p>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 border-b">
                            <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
                        </div>
                        {transactions.length === 0 ? (
                            <div className="p-12 text-center text-gray-400">
                                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No transactions yet</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {transactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                                {getTypeIcon(tx.type)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm text-gray-800">{tx.description}</p>
                                                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleString()} • {tx.walletType}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-bold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                                {tx.amount >= 0 ? '+' : ''}₹{Math.abs(tx.amount).toFixed(2)}
                                            </p>
                                            <p className={`text-xs font-medium ${tx.status === 'COMPLETED' ? 'text-green-500' : 'text-orange-500'}`}>
                                                {tx.status}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Convert Points Tab */}
                {activeTab === 'convert' && (
                    <div className="bg-white rounded-xl p-6 shadow-sm border">
                        <h3 className="font-bold text-lg text-gray-800 mb-2">Convert Points to Wallet</h3>
                        <p className="text-sm text-gray-500 mb-6">Exchange rate: <strong>100 points = ₹1</strong></p>

                        <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-4 border border-yellow-200 mb-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-600">Available Points</p>
                                    <p className="text-2xl font-black text-yellow-600">{points?.availablePoints || 0}</p>
                                </div>
                                <ChevronRight className="w-6 h-6 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-600">Max Convertible</p>
                                    <p className="text-2xl font-black text-emerald-600">₹ {(Math.floor((points?.availablePoints || 0) / 100)).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Points to Convert</label>
                                <input
                                    type="number"
                                    value={convertAmount}
                                    onChange={(e) => setConvertAmount(e.target.value)}
                                    placeholder="Enter points (min 100)"
                                    min="100"
                                    step="100"
                                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-0 outline-none text-lg font-bold"
                                />
                                {convertAmount && parseInt(convertAmount) >= 100 && (
                                    <p className="text-sm text-emerald-600 font-medium mt-1">
                                        You will receive ₹{(Math.floor(parseInt(convertAmount) / 100)).toFixed(2)} in your Main Wallet
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={handleConvertPoints}
                                disabled={converting || !convertAmount || parseInt(convertAmount) < 100}
                                className="w-full py-3 bg-gradient-to-r from-[#00703C] to-emerald-600 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                                {converting ? 'Converting...' : 'Convert Points'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

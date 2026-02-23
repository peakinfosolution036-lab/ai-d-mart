'use client'

import React, { useState, useEffect } from 'react';
import { Crown, Wallet, Users, Gift, Award, TrendingUp, Download, Copy, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface PrimeDashboardProps {
    className?: string;
}

const PrimeDashboard: React.FC<PrimeDashboardProps> = ({ className = '' }) => {
    const { user, isLoggedIn } = useAuth();
    const [primeData, setPrimeData] = useState<Record<string, any> | null>(null);
    const [wallets, setWallets] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [showReferralCode, setShowReferralCode] = useState(false);

    useEffect(() => {
        if (isLoggedIn && user?.id) {
            fetchPrimeData();
        }
    }, [isLoggedIn, user?.id]);

    const fetchPrimeData = async () => {
        try {
            const response = await fetch(`/api/prime/membership?userId=${user?.id}`);
            const result = await response.json();
            
            if (result.success && result.data.isPrimeMember) {
                setPrimeData(result.data.membership);
                setWallets(result.data.wallets);
            }
        } catch (error) {
            console.error('Error fetching Prime data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralCode = () => {
        if (primeData?.primeCode) {
            navigator.clipboard.writeText(primeData.primeCode);
            alert('Referral code copied to clipboard!');
        }
    };

    const enterLuckyDraw = async () => {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const response = await fetch('/api/prime/lucky-draw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'enter_draw',
                    userId: user?.id,
                    month: currentMonth
                })
            });

            const result = await response.json();
            if (result.success) {
                alert('Successfully entered in this month\'s lucky draw!');
            } else {
                alert(result.error || 'Failed to enter lucky draw');
            }
        } catch (error) {
            console.error('Error entering lucky draw:', error);
            alert('Failed to enter lucky draw');
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-2xl shadow-lg p-8 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-4"></div>
                    <div className="h-32 bg-gray-200 rounded mb-4"></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                        <div className="h-24 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (!primeData) {
        return null; // Don't show dashboard if not a Prime member
    }

    const totalEarnings = (wallets?.referral?.totalEarned || 0) + 
                         (wallets?.shopping?.totalEarned || 0) + 
                         (wallets?.event?.totalEarned || 0);

    const totalBalance = (wallets?.referral?.balance || 0) + 
                        (wallets?.shopping?.balance || 0) + 
                        (wallets?.event?.balance || 0);

    return (
        <div className={`bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl shadow-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Crown size={32} />
                        <div>
                            <h2 className="text-2xl font-bold">Prime Dashboard</h2>
                            <p className="text-yellow-100">Member since {new Date(primeData.purchaseDate).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-yellow-100">Total Earnings</div>
                        <div className="text-3xl font-bold">₹{totalEarnings.toLocaleString()}</div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white border-b">
                <div className="flex">
                    {[
                        { id: 'overview', label: 'Overview', icon: TrendingUp },
                        { id: 'wallets', label: 'Wallets', icon: Wallet },
                        { id: 'referrals', label: 'Referrals', icon: Users },
                        { id: 'rewards', label: 'Rewards', icon: Gift }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                                activeTab === tab.id
                                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="p-6">
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center">
                                        <Wallet size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Total Balance</div>
                                        <div className="text-xl font-bold text-gray-900">₹{totalBalance}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Referrals</div>
                                        <div className="text-xl font-bold text-gray-900">0</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center">
                                        <Award size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Cashback</div>
                                        <div className="text-xl font-bold text-gray-900">₹{wallets?.shopping?.totalEarned || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl p-4 border border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center">
                                        <Gift size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-600">Commission</div>
                                        <div className="text-xl font-bold text-gray-900">₹{wallets?.event?.totalEarned || 0}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Referral Code */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Referral Code</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 bg-gray-50 rounded-lg p-4 font-mono text-lg">
                                    {showReferralCode ? primeData.primeCode : '••••••••'}
                                </div>
                                <button
                                    onClick={() => setShowReferralCode(!showReferralCode)}
                                    className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    {showReferralCode ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                                <button
                                    onClick={copyReferralCode}
                                    className="flex items-center gap-2 bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    <Copy size={20} />
                                    Copy
                                </button>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Share this code to earn ₹500 for each successful Prime membership purchase
                            </p>
                        </div>

                        {/* Lucky Draw */}
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900">Monthly Lucky Draw</h3>
                                <button
                                    onClick={enterLuckyDraw}
                                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all"
                                >
                                    Enter This Month
                                </button>
                            </div>
                            <p className="text-gray-600">
                                Participate in our monthly lucky draw to win cash prizes, event passes, and exclusive rewards!
                            </p>
                        </div>
                    </div>
                )}

                {activeTab === 'wallets' && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Referral Wallet */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Referral Wallet</h3>
                                        <p className="text-sm text-gray-600">Earn ₹500 per referral</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Balance:</span>
                                        <span className="font-bold text-2xl text-green-600">₹{wallets?.referral?.balance || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Earned:</span>
                                        <span className="font-medium">₹{wallets?.referral?.totalEarned || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Withdrawn:</span>
                                        <span className="font-medium">₹{wallets?.referral?.totalWithdrawn || 0}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                                    Withdraw
                                </button>
                            </div>

                            {/* Shopping Wallet */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                        <Wallet size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Shopping Wallet</h3>
                                        <p className="text-sm text-gray-600">5% cashback on purchases</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Balance:</span>
                                        <span className="font-bold text-2xl text-blue-600">₹{wallets?.shopping?.balance || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Earned:</span>
                                        <span className="font-medium">₹{wallets?.shopping?.totalEarned || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Spent:</span>
                                        <span className="font-medium">₹{wallets?.shopping?.totalSpent || 0}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Use for Purchase
                                </button>
                            </div>

                            {/* Event Wallet */}
                            <div className="bg-white rounded-xl p-6 border border-gray-200">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900">Event Wallet</h3>
                                        <p className="text-sm text-gray-600">7% commission on events</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Balance:</span>
                                        <span className="font-bold text-2xl text-purple-600">₹{wallets?.event?.balance || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Total Earned:</span>
                                        <span className="font-medium">₹{wallets?.event?.totalEarned || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Withdrawn:</span>
                                        <span className="font-medium">₹{wallets?.event?.totalWithdrawn || 0}</span>
                                    </div>
                                </div>
                                <button className="w-full mt-4 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                                    Withdraw
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'referrals' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Referral Performance</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-blue-600">0</div>
                                    <div className="text-sm text-gray-600">Total Referrals</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600">0</div>
                                    <div className="text-sm text-gray-600">Successful Conversions</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">₹0</div>
                                    <div className="text-sm text-gray-600">Total Earnings</div>
                                </div>
                            </div>
                            <div className="text-center text-gray-500">
                                No referrals yet. Start sharing your referral code to earn ₹500 per successful referral!
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'rewards' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Available Rewards</h3>
                            
                            {/* Mega Event Pass */}
                            <div className="border border-gray-200 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                            <Gift size={24} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900">Mega Event Pass</h4>
                                            <p className="text-sm text-gray-600">One-time free pass to our mega event</p>
                                        </div>
                                    </div>
                                    <button className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            </div>

                            <div className="text-center text-gray-500 py-8">
                                More exclusive rewards coming soon!
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrimeDashboard;
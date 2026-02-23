'use client'

import React, { useState, useEffect } from 'react';
import { Copy, Share2, Gift, Users, TrendingUp, Award, ExternalLink } from 'lucide-react';

interface ReferralData {
    points: {
        userId: string;
        totalPoints: number;
        availablePoints: number;
        usedPoints: number;
    };
    referrals: Array<{
        id: string;
        referredUserId: string;
        status: string;
        createdAt: string;
        pointsEarned: number;
    }>;
    transactions: Array<{
        id: string;
        type: string;
        points: number;
        description: string;
        createdAt: string;
    }>;
}

interface ReferralDashboardProps {
    userId: string;
    referralCode: string;
}

const ReferralDashboard: React.FC<ReferralDashboardProps> = ({ userId, referralCode }) => {
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    const [referralLink, setReferralLink] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setReferralLink(`${window.location.origin}/register?ref=${referralCode}`);
        }
    }, [referralCode]);

    useEffect(() => {
        fetchReferralData();
    }, [userId]);

    const fetchReferralData = async () => {
        try {
            const response = await fetch(`/api/referrals?userId=${userId}`);
            const result = await response.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
        } finally {
            setLoading(false);
        }
    };

    const copyReferralLink = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    const shareWhatsApp = () => {
        const message = `🎉 Join me on this amazing platform and get exclusive benefits! Use my referral code: ${referralCode}\n\n${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="max-w-6xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Referral Dashboard</h1>
                    <p className="text-gray-600">Earn points by referring friends and family</p>
                </div>

                {/* Points Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Points</p>
                                <p className="text-3xl font-bold">{data?.points.totalPoints || 0}</p>
                            </div>
                            <Award className="w-12 h-12 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Available Points</p>
                                <p className="text-3xl font-bold">{data?.points.availablePoints || 0}</p>
                            </div>
                            <Gift className="w-12 h-12 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Referrals</p>
                                <p className="text-3xl font-bold">{data?.referrals.length || 0}</p>
                            </div>
                            <Users className="w-12 h-12 text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Referral Tools */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Your Referral Tools</h2>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Code</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 font-mono text-lg font-bold text-blue-600">
                                    {referralCode}
                                </div>
                                <button
                                    onClick={copyReferralLink}
                                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Copy size={18} />
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Your Referral Link</label>
                            <div className="flex items-center gap-3">
                                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-600 truncate">
                                    {referralLink}
                                </div>
                                <button
                                    onClick={shareWhatsApp}
                                    className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                                >
                                    <Share2 size={18} />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Referral History */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Referral History</h2>
                    
                    {data?.referrals.length === 0 ? (
                        <div className="text-center py-8">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No referrals yet. Start sharing your referral code!</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">User ID</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                                        <th className="text-left py-3 px-4 font-medium text-gray-700">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.referrals.map((referral) => (
                                        <tr key={referral.id} className="border-b border-gray-100">
                                            <td className="py-3 px-4 font-mono text-sm">{referral.referredUserId.slice(0, 8)}...</td>
                                            <td className="py-3 px-4 text-sm">{new Date(referral.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                    referral.status === 'approved' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {referral.status}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 font-bold text-green-600">+{referral.pointsEarned}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Points Usage */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Redeem Points</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="text-center">
                                <div className="text-2xl mb-2">💰</div>
                                <h3 className="font-semibold mb-1">₹500 Discount</h3>
                                <p className="text-sm text-gray-600 mb-3">100 Points Required</p>
                                <button 
                                    disabled={!data || data.points.availablePoints < 100}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🎲</div>
                                <h3 className="font-semibold mb-1">Lucky Draw Entry</h3>
                                <p className="text-sm text-gray-600 mb-3">200 Points Required</p>
                                <button 
                                    disabled={!data || data.points.availablePoints < 200}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🎁</div>
                                <h3 className="font-semibold mb-1">Free Subscription</h3>
                                <p className="text-sm text-gray-600 mb-3">300 Points Required</p>
                                <button 
                                    disabled={!data || data.points.availablePoints < 300}
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    Redeem
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReferralDashboard;
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
    Crown, Users, Wallet, Gift, Star, Copy, CheckCircle, TrendingUp, ShoppingCart,
    Calendar, Trophy, ArrowRight, Share2, ExternalLink, Zap, Lock, Sparkles
} from 'lucide-react';

interface ReferralData {
    points: { totalPoints: number; availablePoints: number; convertedPoints: number };
    referrals: any[];
    isPrimeMember: boolean;
    wallets: Record<string, number>;
    totalWalletBalance: number;
    walletConversion: { rate: number; walletValue: number };
    stats: {
        totalReferrals: number;
        approvedReferrals: number;
        pendingReferrals: number;
        totalPointsEarned: number;
        totalEarnings: number;
        pendingEarnings: number;
        cashbackEarned: number;
        eventCommission: number;
        referralIncome: number;
    };
}

export default function ReferralPage() {
    const { user, isLoggedIn } = useAuth();
    const router = useRouter();
    const [data, setData] = useState<ReferralData | null>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showPayment, setShowPayment] = useState(false);
    const [purchasingPrime, setPurchasingPrime] = useState(false);

    const referralCode = (user as any)?.referralCode || (user as any)?.primeCode || '';
    const referralLink = typeof window !== 'undefined'
        ? `${window.location.origin}/register?ref=${referralCode}`
        : '';

    useEffect(() => {
        if (isLoggedIn && user?.id) fetchData();
    }, [isLoggedIn, user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/referrals?userId=${user?.id}`);
            const json = await res.json();
            if (json.success) setData(json.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(referralLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareWhatsApp = () => {
        const msg = `🌟 Join AI D-Mart with my referral code *${referralCode}* and get exclusive benefits! ${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
    };

    const shareEmail = () => {
        const subject = 'Join AI D-Mart — Exclusive Prime Benefits!';
        const body = `Hi!\n\nJoin AI D-Mart with my referral code: ${referralCode}\n\nSign up here: ${referralLink}\n\nGet lifetime Prime Membership benefits including cashback, lucky draw eligibility, and more!`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const purchasePrime = async () => {
        if (!isLoggedIn) { router.push('/login'); return; }
        setPurchasingPrime(true);
        try {
            const res = await fetch('/api/prime/membership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user?.id, referralCode: '', paymentMethod: 'wallet' })
            });
            const json = await res.json();
            if (json.success) {
                alert('🎉 Prime Membership Activated Successfully!');
                setShowPayment(false);
                fetchData();
            } else { alert(json.error || 'Failed to purchase'); }
        } catch (e) { alert('Error processing purchase'); }
        finally { setPurchasingPrime(false); }
    };

    const incomeItems = [
        { label: 'Referral Income', amount: 500, percent: 25, color: 'from-blue-500 to-blue-600', icon: Gift },
        { label: 'Shopping Wallet', amount: 100, percent: 5, color: 'from-purple-500 to-purple-600', icon: ShoppingCart },
        { label: 'Event Pool', amount: 140, percent: 7, color: 'from-orange-500 to-orange-600', icon: Calendar },
        { label: 'Awards & Rewards', amount: 300, percent: 15, color: 'from-yellow-500 to-amber-600', icon: Trophy },
        { label: 'Platform Charge', amount: 100, percent: 5, color: 'from-gray-400 to-gray-500', icon: Zap },
        { label: 'Company Profit', amount: 500, percent: 25, color: 'from-red-500 to-red-600', icon: TrendingUp },
        { label: 'GST (Included)', amount: 360, percent: 18, color: 'from-indigo-500 to-indigo-600', icon: Star },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#00703C] via-emerald-700 to-green-900 text-white overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-300 rounded-full blur-3xl"></div>
                </div>
                <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/15 px-4 py-1.5 rounded-full text-sm font-medium mb-6 backdrop-blur-sm">
                        <Crown size={16} className="text-yellow-400" /> Lifetime Prime Membership
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                        Supe₹ Income Plan
                    </h1>
                    <p className="text-emerald-100 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
                        Refer friends, earn ₹500 per referral, plus cashback, event commissions, lucky draw eligibility and more!
                    </p>

                    {/* Pricing */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-md mx-auto">
                        <div className="flex items-center justify-center gap-4">
                            <span className="text-gray-300 line-through text-2xl">₹5,000</span>
                            <span className="text-5xl font-black">₹2,000</span>
                            <span className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-sm font-black">60% OFF</span>
                        </div>
                        <p className="text-emerald-200 text-sm mt-2">One-time lifetime payment • Includes Mega Event Pass</p>
                        {data?.isPrimeMember ? (
                            <div className="mt-4 bg-yellow-400/20 text-yellow-300 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                                <Crown size={18} /> You are a Prime Member ✓
                            </div>
                        ) : (
                            <button onClick={() => isLoggedIn ? setShowPayment(true) : router.push('/login')}
                                className="mt-4 w-full bg-yellow-400 text-gray-900 px-8 py-3.5 rounded-xl font-black text-lg hover:bg-yellow-300 transition-all shadow-lg">
                                Get Lifetime Prime — ₹2,000
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
                {/* Prime Benefits Grid */}
                <div>
                    <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">Prime Membership Benefits</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { icon: Gift, label: 'Referral Income', desc: '₹500 per referral', color: 'text-blue-600', bg: 'bg-blue-50' },
                            { icon: ShoppingCart, label: 'Cashback', desc: 'On every transaction', color: 'text-purple-600', bg: 'bg-purple-50' },
                            { icon: Calendar, label: 'Event Commission', desc: 'Booking commissions', color: 'text-orange-600', bg: 'bg-orange-50' },
                            { icon: Trophy, label: 'Lucky Draw', desc: 'Monthly eligibility', color: 'text-red-600', bg: 'bg-red-50' },
                            { icon: Star, label: 'Awards & Rewards', desc: 'Exclusive benefits', color: 'text-yellow-600', bg: 'bg-yellow-50' },
                            { icon: Sparkles, label: 'Special Offers', desc: 'Prime-only access', color: 'text-emerald-600', bg: 'bg-emerald-50' },
                        ].map((b, i) => (
                            <div key={i} className="bg-white rounded-xl p-5 shadow-sm border hover:shadow-md transition-shadow">
                                <div className={`w-12 h-12 ${b.bg} rounded-xl flex items-center justify-center mb-3`}>
                                    <b.icon className={`w-6 h-6 ${b.color}`} />
                                </div>
                                <h3 className="font-bold text-gray-800">{b.label}</h3>
                                <p className="text-sm text-gray-500">{b.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Income Plan Breakdown */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-2">₹2,000 Income Distribution</h2>
                    <p className="text-gray-500 mb-6">How your Prime membership payment is structured</p>

                    {/* Visual bar */}
                    <div className="h-4 rounded-full overflow-hidden flex mb-6">
                        {incomeItems.map((item, i) => (
                            <div key={i} className={`bg-gradient-to-r ${item.color}`} style={{ width: `${item.percent}%` }}
                                title={`${item.label}: ₹${item.amount} (${item.percent}%)`} />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {incomeItems.map((item, i) => (
                            <div key={i} className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center text-white`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-700">{item.label}</p>
                                        <p className="text-xs text-gray-400">{item.percent}%</p>
                                    </div>
                                </div>
                                <span className="font-black text-gray-800">₹{item.amount}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 bg-gradient-to-r from-[#00703C] to-emerald-600 rounded-xl p-4 flex items-center justify-between text-white">
                        <span className="font-black text-lg">Grand Total</span>
                        <span className="text-3xl font-black">₹2,000</span>
                    </div>
                </div>

                {/* ==== LOGGED-IN USER DASHBOARD ==== */}
                {isLoggedIn && data && (
                    <>
                        {/* Stats Cards */}
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 mb-4">Your Referral Dashboard</h2>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {[
                                    { label: 'Total Referrals', value: data.stats.totalReferrals, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
                                    { label: 'Approved', value: data.stats.approvedReferrals, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                                    { label: 'Pending', value: data.stats.pendingReferrals, icon: TrendingUp, color: 'text-yellow-600', bg: 'bg-yellow-50' },
                                    { label: 'Points Earned', value: data.stats.totalPointsEarned, icon: Star, color: 'text-purple-600', bg: 'bg-purple-50' },
                                    { label: 'Wallet Balance', value: `₹${data.totalWalletBalance.toFixed(2)}`, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                                ].map((c, i) => (
                                    <div key={i} className="bg-white rounded-xl p-4 shadow-sm border">
                                        <div className={`w-10 h-10 ${c.bg} rounded-lg flex items-center justify-center mb-2`}>
                                            <c.icon className={`w-5 h-5 ${c.color}`} />
                                        </div>
                                        <p className="text-xl font-black text-gray-800">{c.value}</p>
                                        <p className="text-xs text-gray-500">{c.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Income Summary */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Income Summary</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Referral Income', value: `₹${data.stats.referralIncome.toFixed(2)}`, icon: Gift, color: 'text-blue-600' },
                                    { label: 'Cashback Earned', value: `₹${data.stats.cashbackEarned.toFixed(2)}`, icon: ShoppingCart, color: 'text-purple-600' },
                                    { label: 'Event Commission', value: `₹${data.stats.eventCommission.toFixed(2)}`, icon: Calendar, color: 'text-orange-600' },
                                    { label: 'Lucky Draw', value: data.isPrimeMember ? '✅ Eligible' : '❌ Not Eligible', icon: Trophy, color: 'text-red-600' },
                                ].map((item, i) => (
                                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                                        <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                                        <p className="text-lg font-black text-gray-800">{item.value}</p>
                                        <p className="text-xs text-gray-500">{item.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Prime Status */}
                            <div className={`mt-4 rounded-xl p-4 flex items-center justify-between ${data.isPrimeMember ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200'}`}>
                                <div className="flex items-center gap-3">
                                    <Crown className={`w-6 h-6 ${data.isPrimeMember ? 'text-yellow-600' : 'text-gray-400'}`} />
                                    <div>
                                        <p className="font-bold text-gray-800">Prime Membership</p>
                                        <p className="text-xs text-gray-500">{data.isPrimeMember ? 'Active — Lifetime' : 'Not a Prime Member'}</p>
                                    </div>
                                </div>
                                {data.isPrimeMember
                                    ? <span className="bg-yellow-400 text-gray-900 px-4 py-1.5 rounded-full text-xs font-black">ACTIVE</span>
                                    : <button onClick={() => setShowPayment(true)} className="bg-[#00703C] text-white px-4 py-1.5 rounded-full text-xs font-black hover:bg-green-700">Upgrade</button>
                                }
                            </div>
                        </div>

                        {/* Referral Code & Sharing */}
                        <div className="bg-white rounded-2xl shadow-sm border p-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                <Share2 size={18} /> Share & Earn
                            </h3>

                            {referralCode ? (
                                <div className="space-y-4">
                                    {/* Code Display */}
                                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-emerald-600 font-medium">Your Referral Code</p>
                                            <p className="text-2xl font-black text-emerald-800 tracking-wider">{referralCode}</p>
                                        </div>
                                        <button onClick={copyCode}
                                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-emerald-700 flex items-center gap-2">
                                            {copied ? <><CheckCircle size={16} /> Copied!</> : <><Copy size={16} /> Copy</>}
                                        </button>
                                    </div>

                                    {/* Share Buttons */}
                                    <div className="flex flex-wrap gap-3">
                                        <button onClick={shareWhatsApp}
                                            className="flex-1 bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 flex items-center justify-center gap-2 min-w-[140px]">
                                            <ExternalLink size={16} /> WhatsApp
                                        </button>
                                        <button onClick={shareEmail}
                                            className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-bold hover:bg-blue-600 flex items-center justify-center gap-2 min-w-[140px]">
                                            <ExternalLink size={16} /> Email
                                        </button>
                                        <button onClick={copyLink}
                                            className="flex-1 bg-gray-800 text-white py-3 rounded-xl font-bold hover:bg-gray-900 flex items-center justify-center gap-2 min-w-[140px]">
                                            <Copy size={16} /> Copy Link
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 text-gray-400">
                                    <Lock size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="font-medium">Activate Prime Membership to get your referral code</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Not Logged In CTA */}
                {!isLoggedIn && (
                    <div className="bg-white rounded-2xl shadow-sm border p-8 text-center">
                        <Lock size={40} className="mx-auto mb-4 text-gray-300" />
                        <h3 className="text-xl font-black text-gray-800 mb-2">Login to Access Your Dashboard</h3>
                        <p className="text-gray-500 mb-6">Track referrals, earnings, wallet balance, and more</p>
                        <div className="flex justify-center gap-4">
                            <button onClick={() => router.push('/login')}
                                className="bg-[#00703C] text-white px-8 py-3 rounded-xl font-bold hover:bg-green-700">
                                Login
                            </button>
                            <button onClick={() => router.push('/register')}
                                className="bg-gray-100 text-gray-800 px-8 py-3 rounded-xl font-bold hover:bg-gray-200">
                                Register
                            </button>
                        </div>
                    </div>
                )}

                {/* How It Works */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8">
                    <h2 className="text-2xl font-black text-gray-800 mb-6 text-center">How It Works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {[
                            { step: '01', title: 'Get Prime', desc: 'Purchase Lifetime Prime Membership for ₹2,000', color: 'bg-emerald-500' },
                            { step: '02', title: 'Share Code', desc: 'Share your referral code with friends & family', color: 'bg-blue-500' },
                            { step: '03', title: 'They Join', desc: 'When they purchase Prime using your code', color: 'bg-purple-500' },
                            { step: '04', title: 'You Earn', desc: '₹500 referral income credited to your wallet', color: 'bg-yellow-500' },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <div className={`w-14 h-14 ${s.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-3 text-xl font-black`}>
                                    {s.step}
                                </div>
                                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                                <p className="text-sm text-gray-500">{s.desc}</p>
                                {i < 3 && <ArrowRight className="hidden md:block mx-auto mt-3 text-gray-300" />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="text-xl font-black text-gray-800 mb-2">Activate Prime Membership</h3>
                        <p className="text-gray-500 mb-6">One-time lifetime payment</p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-500">Original Price</span><span className="line-through text-gray-400">₹5,000</span></div>
                            <div className="flex justify-between"><span className="text-gray-500">Discount (60%)</span><span className="text-green-600 font-bold">-₹3,000</span></div>
                            <div className="border-t pt-2 flex justify-between"><span className="font-bold">Total</span><span className="text-2xl font-black text-emerald-700">₹2,000</span></div>
                            <p className="text-xs text-gray-400">Inclusive of 18% GST (₹360)</p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowPayment(false)} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200">Cancel</button>
                            <button onClick={purchasePrime} disabled={purchasingPrime}
                                className="flex-1 bg-[#00703C] text-white py-3 rounded-xl font-black hover:bg-green-700 disabled:opacity-50">
                                {purchasingPrime ? 'Processing...' : 'Pay ₹2,000'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
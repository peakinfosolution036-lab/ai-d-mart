'use client'

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import PrimeMembership from '@/components/PrimeMembership';
import PrimeDashboard from '@/components/PrimeDashboard';
import { Crown, Star, Users, Wallet, Award, Gift, Zap, TrendingUp } from 'lucide-react';

const PrimePage = () => {
    const { user, isLoggedIn } = useAuth();
    const [isPrimeMember, setIsPrimeMember] = useState(false);
    const [showPurchaseModal, setShowPurchaseModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoggedIn && user?.id) {
            checkPrimeMembership();
        } else {
            setLoading(false);
        }
    }, [isLoggedIn, user?.id]);

    const checkPrimeMembership = async () => {
        try {
            const response = await fetch(`/api/prime/membership?userId=${user?.id}`);
            const result = await response.json();
            
            if (result.success) {
                setIsPrimeMember(result.data.isPrimeMember);
            }
        } catch (error) {
            console.error('Error checking Prime membership:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <Crown size={64} className="text-orange-500 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Prime Membership</h1>
                    <p className="text-gray-600 mb-8">Please login to access Prime membership benefits</p>
                    <a
                        href="/login"
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all"
                    >
                        Login to Continue
                    </a>
                </div>
            </div>
        );
    }

    if (isPrimeMember) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <PrimeDashboard />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-orange-500/15 to-red-500/15 rounded-full blur-3xl animate-bounce"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-6">
                            <Crown size={24} />
                            <span className="font-bold text-lg">Prime Membership</span>
                        </div>
                        <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent">
                            Start Earning
                        </h1>
                        <p className="text-2xl text-gray-700 max-w-3xl mx-auto mb-8">
                            Join our exclusive Prime community and unlock multiple income streams
                        </p>
                        
                        {/* Pricing */}
                        <div className="bg-white rounded-3xl p-8 max-w-md mx-auto shadow-2xl border-4 border-yellow-200 mb-8">
                            <div className="text-center">
                                <div className="mb-4">
                                    <span className="text-gray-500 line-through text-2xl">₹5,000</span>
                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold ml-3">
                                        60% OFF
                                    </span>
                                </div>
                                <div className="text-6xl font-bold text-gray-900 mb-2">₹2,000</div>
                                <div className="text-gray-600 mb-4">Lifetime Membership</div>
                                <div className="text-sm text-gray-500 mb-6">
                                    One-time payment • GST Included • No recurring charges
                                </div>
                                <button
                                    onClick={() => setShowPurchaseModal(true)}
                                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all transform hover:-translate-y-1"
                                >
                                    Become Prime Member
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Benefits Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                        {[
                            {
                                icon: Users,
                                title: 'Referral Income',
                                description: 'Earn ₹500 for each successful Prime membership referral',
                                amount: '₹500 per referral',
                                color: 'from-green-500 to-emerald-500',
                                bgColor: 'bg-green-50'
                            },
                            {
                                icon: Wallet,
                                title: 'Shopping Cashback',
                                description: 'Get 5% cashback on all your purchases and bookings',
                                amount: '5% cashback',
                                color: 'from-blue-500 to-cyan-500',
                                bgColor: 'bg-blue-50'
                            },
                            {
                                icon: Award,
                                title: 'Event Commission',
                                description: 'Earn 7% commission on event bookings and services',
                                amount: '7% commission',
                                color: 'from-purple-500 to-indigo-500',
                                bgColor: 'bg-purple-50'
                            },
                            {
                                icon: Gift,
                                title: 'Monthly Lucky Draw',
                                description: 'Exclusive entry to monthly lucky draws with cash prizes',
                                amount: 'Monthly prizes',
                                color: 'from-pink-500 to-rose-500',
                                bgColor: 'bg-pink-50'
                            },
                            {
                                icon: Star,
                                title: 'Awards & Rewards',
                                description: 'Special recognition and exclusive reward campaigns',
                                amount: 'Exclusive rewards',
                                color: 'from-yellow-500 to-amber-500',
                                bgColor: 'bg-yellow-50'
                            },
                            {
                                icon: Zap,
                                title: 'Mega Event Pass',
                                description: 'One-time free pass to our exclusive mega events',
                                amount: 'Free pass',
                                color: 'from-red-500 to-orange-500',
                                bgColor: 'bg-red-50'
                            }
                        ].map((benefit, index) => (
                            <div key={index} className={`${benefit.bgColor} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/50`}>
                                <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                                    <benefit.icon size={28} className="text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                                <p className="text-gray-600 mb-4 leading-relaxed">{benefit.description}</p>
                                <div className={`inline-block bg-gradient-to-r ${benefit.color} text-white px-4 py-2 rounded-full text-sm font-semibold`}>
                                    {benefit.amount}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Income Breakdown */}
                    <div className="bg-white rounded-3xl p-8 shadow-2xl mb-16">
                        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
                            Transparent Payment Distribution
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { label: 'Referral Pool', amount: 500, percentage: 25, color: 'text-green-600' },
                                { label: 'Cashback Pool', amount: 100, percentage: 5, color: 'text-blue-600' },
                                { label: 'Event Commission', amount: 140, percentage: 7, color: 'text-purple-600' },
                                { label: 'Awards & Rewards', amount: 300, percentage: 15, color: 'text-orange-600' },
                                { label: 'Platform Charges', amount: 100, percentage: 5, color: 'text-gray-600' },
                                { label: 'Company Profit', amount: 500, percentage: 25, color: 'text-gray-600' },
                                { label: 'GST (18%)', amount: 360, percentage: 18, color: 'text-red-600' }
                            ].map((item, index) => (
                                <div key={index} className="text-center p-4 bg-gray-50 rounded-xl">
                                    <div className={`text-2xl font-bold ${item.color}`}>₹{item.amount}</div>
                                    <div className="text-sm text-gray-600 mb-1">{item.label}</div>
                                    <div className="text-xs text-gray-500">{item.percentage}%</div>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-6 p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-xl">
                            <div className="text-3xl font-bold text-gray-900">₹2,000</div>
                            <div className="text-gray-600">Total Investment</div>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-12">How Prime Membership Works</h2>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            {[
                                {
                                    step: '1',
                                    title: 'Purchase Membership',
                                    description: 'Pay ₹2,000 one-time for lifetime Prime membership',
                                    icon: Crown
                                },
                                {
                                    step: '2',
                                    title: 'Get Your Code',
                                    description: 'Receive unique referral code and activate all benefits',
                                    icon: Star
                                },
                                {
                                    step: '3',
                                    title: 'Start Earning',
                                    description: 'Share referral code, shop, book events and earn money',
                                    icon: TrendingUp
                                },
                                {
                                    step: '4',
                                    title: 'Withdraw Earnings',
                                    description: 'Withdraw your earnings anytime with admin approval',
                                    icon: Wallet
                                }
                            ].map((step, index) => (
                                <div key={index} className="relative">
                                    <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                                        <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                                            {step.step}
                                        </div>
                                        <step.icon size={32} className="text-orange-500 mx-auto mb-4" />
                                        <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                        <p className="text-gray-600">{step.description}</p>
                                    </div>
                                    {index < 3 && (
                                        <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-yellow-500 to-orange-500"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="text-center bg-gradient-to-r from-yellow-500 to-orange-500 rounded-3xl p-12 text-white">
                        <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
                        <p className="text-xl mb-8 text-yellow-100">
                            Join thousands of Prime members who are already earning with us
                        </p>
                        <button
                            onClick={() => setShowPurchaseModal(true)}
                            className="bg-white text-orange-600 px-12 py-4 rounded-xl font-bold text-xl hover:shadow-lg transition-all transform hover:-translate-y-1"
                        >
                            Become Prime Member - ₹2,000
                        </button>
                        <div className="mt-4 text-sm text-yellow-100">
                            ✓ Lifetime membership ✓ No hidden charges ✓ Start earning immediately
                        </div>
                    </div>
                </div>
            </div>

            {/* Purchase Modal */}
            <PrimeMembership
                isOpen={showPurchaseModal}
                onClose={() => {
                    setShowPurchaseModal(false);
                    // Refresh membership status after purchase
                    if (isLoggedIn && user?.id) {
                        checkPrimeMembership();
                    }
                }}
            />
        </div>
    );
};

export default PrimePage;
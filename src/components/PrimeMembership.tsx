'use client'

import React, { useState, useEffect } from 'react';
import { Crown, Star, Gift, Wallet, Users, Award, Zap, CheckCircle, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import UpiPayment from '@/components/UpiPayment';

interface PrimeMembershipProps {
    isOpen: boolean;
    onClose: () => void;
    referralCode?: string;
}

const PrimeMembership: React.FC<PrimeMembershipProps> = ({ isOpen, onClose, referralCode = '' }) => {
    const { user, isLoggedIn } = useAuth();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        referralCode: referralCode,
        paymentMethod: 'wallet',
        agreeTerms: false
    });
    const [purchaseSuccess, setPurchaseSuccess] = useState(false);
    const [membershipData, setMembershipData] = useState<{ primeCode?: string } | null>(null);

    const primeConfig = {
        originalPrice: 5000,
        discountPrice: 2000,
        discount: 60,
        gst: 360,
        distribution: {
            referralIncome: 500,
            shoppingCashback: 100,
            eventCommission: 140,
            awardsRewards: 300,
            platformCharges: 100,
            companyProfit: 500
        }
    };

    const benefits = [
        {
            icon: Users,
            title: 'Referral Income',
            description: 'Earn ₹500 for each successful referral',
            amount: '₹500 per referral',
            color: 'text-green-600 bg-green-50'
        },
        {
            icon: Wallet,
            title: 'Shopping Cashback',
            description: '5% cashback on all purchases',
            amount: '5% cashback',
            color: 'text-blue-600 bg-blue-50'
        },
        {
            icon: Award,
            title: 'Event Commission',
            description: '7% commission on event bookings',
            amount: '7% commission',
            color: 'text-purple-600 bg-purple-50'
        },
        {
            icon: Gift,
            title: 'Monthly Lucky Draw',
            description: 'Exclusive entry to monthly prizes',
            amount: 'Monthly entry',
            color: 'text-orange-600 bg-orange-50'
        },
        {
            icon: Star,
            title: 'Awards & Rewards',
            description: 'Special rewards and recognition',
            amount: 'Exclusive rewards',
            color: 'text-yellow-600 bg-yellow-50'
        },
        {
            icon: Zap,
            title: 'Mega Event Pass',
            description: 'One-time free mega event pass',
            amount: 'Free pass',
            color: 'text-red-600 bg-red-50'
        }
    ];

    const handlePurchase = async (utrNumber?: string, screenshotUrl?: string) => {
        if (!isLoggedIn || !user?.id) {
            alert('Please login to purchase Prime membership');
            return;
        }

        if (!formData.agreeTerms) {
            alert('Please agree to terms and conditions');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/prime/membership', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    referralCode: formData.referralCode,
                    paymentMethod: formData.paymentMethod,
                    utrNumber,
                    paymentScreenshot: screenshotUrl,
                    paymentStatus: 'pending_verification'
                })
            });

            const result = await response.json();

            if (result.success) {
                setMembershipData(result.data);
                setPurchaseSuccess(true);
                setStep(3);
            } else {
                alert(`Purchase failed: ${result.error}`);
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpiSuccess = (data: { utrNumber: string; screenshotUrl: string }) => {
        handlePurchase(data.utrNumber, data.screenshotUrl);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
                >
                    <X size={24} className="text-gray-400" />
                </button>

                {step === 1 && (
                    <div className="p-8">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full mb-4">
                                <Crown size={24} />
                                <span className="font-bold text-lg">Prime Membership</span>
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">
                                Unlock Premium Benefits
                            </h2>
                            <p className="text-xl text-gray-600">
                                Join our exclusive Prime community and start earning
                            </p>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-8 mb-8 text-center border-2 border-yellow-200">
                            <div className="mb-4">
                                <span className="text-gray-500 line-through text-2xl">₹{primeConfig.originalPrice}</span>
                                <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold ml-3">
                                    {primeConfig.discount}% OFF
                                </span>
                            </div>
                            <div className="text-5xl font-bold text-gray-900 mb-2">
                                ₹{primeConfig.discountPrice}
                            </div>
                            <div className="text-gray-600 mb-4">
                                Lifetime Membership • GST Included
                            </div>
                            <div className="text-sm text-gray-500">
                                One-time payment • No recurring charges
                            </div>
                        </div>

                        {/* Benefits Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {benefits.map((benefit, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow">
                                    <div className={`w-12 h-12 rounded-xl ${benefit.color} flex items-center justify-center mb-4`}>
                                        <benefit.icon size={24} />
                                    </div>
                                    <h3 className="font-bold text-lg text-gray-900 mb-2">{benefit.title}</h3>
                                    <p className="text-gray-600 mb-3">{benefit.description}</p>
                                    <div className="text-sm font-semibold text-blue-600">{benefit.amount}</div>
                                </div>
                            ))}
                        </div>

                        {/* Payment Distribution */}
                        <div className="bg-gray-50 rounded-xl p-6 mb-8">
                            <h3 className="font-bold text-lg text-gray-900 mb-4">Payment Distribution (₹2000)</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span>Referral Pool:</span>
                                    <span className="font-semibold">₹{primeConfig.distribution.referralIncome}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Cashback Pool:</span>
                                    <span className="font-semibold">₹{primeConfig.distribution.shoppingCashback}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Event Commission:</span>
                                    <span className="font-semibold">₹{primeConfig.distribution.eventCommission}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Awards & Rewards:</span>
                                    <span className="font-semibold">₹{primeConfig.distribution.awardsRewards}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Platform Charges:</span>
                                    <span className="font-semibold">₹{primeConfig.distribution.platformCharges}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>GST (18%):</span>
                                    <span className="font-semibold">₹{primeConfig.gst}</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                        >
                            Continue to Purchase
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Your Purchase</h2>
                            <p className="text-gray-600">Review details and confirm your Prime membership</p>
                        </div>

                        <div className="space-y-6">
                            {/* Referral Code */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Referral Code (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={formData.referralCode}
                                    onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    placeholder="Enter referral code to give ₹500 to referrer"
                                />
                            </div>

                            {/* Order Summary */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-lg text-gray-900 mb-4">Order Summary</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span>Prime Membership (Lifetime)</span>
                                        <span className="line-through text-gray-500">₹{primeConfig.originalPrice}</span>
                                    </div>
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount ({primeConfig.discount}%)</span>
                                        <span>-₹{primeConfig.originalPrice - primeConfig.discountPrice}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>GST (18%)</span>
                                        <span>₹{primeConfig.gst}</span>
                                    </div>
                                    <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                        <span>Total Amount</span>
                                        <span>₹{primeConfig.discountPrice}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Terms */}
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.agreeTerms}
                                    onChange={(e) => setFormData({...formData, agreeTerms: e.target.checked})}
                                    className="mt-1"
                                />
                                <label htmlFor="terms" className="text-sm text-gray-600">
                                    I agree to the{' '}
                                    <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                        Terms &amp; Conditions
                                    </a>{' '}
                                    and{' '}
                                    <a href="/terms#refund" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                                        Refund Policy
                                    </a>
                                    . I understand that this is a lifetime membership with no refunds.
                                </label>
                            </div>

                            {formData.agreeTerms ? (
                                <UpiPayment
                                    amount={primeConfig.discountPrice}
                                    description="Prime Membership - AI D Mart"
                                    onSuccess={handleUpiSuccess}
                                    onCancel={() => setStep(1)}
                                    isLoading={loading}
                                />
                            ) : (
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Back
                                    </button>
                                    <button
                                        disabled
                                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-3 rounded-lg font-bold opacity-50 cursor-not-allowed"
                                    >
                                        Accept Terms to Continue
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {step === 3 && purchaseSuccess && (
                    <div className="p-8 text-center">
                        <div className="w-24 h-24 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">
                            Welcome to Prime! 🎉
                        </h2>
                        <p className="text-xl text-gray-600 mb-6">
                            Your Prime membership is now active
                        </p>
                        
                        {membershipData && (
                            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 mb-6 border-2 border-yellow-200">
                                <div className="text-lg font-bold text-gray-900 mb-2">
                                    Your Prime Code: {membershipData.primeCode}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Share this code to earn ₹500 per referral
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">₹0</div>
                                <div className="text-sm text-gray-600">Referral Wallet</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">₹0</div>
                                <div className="text-sm text-gray-600">Shopping Wallet</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">₹0</div>
                                <div className="text-sm text-gray-600">Event Wallet</div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg transition-all"
                        >
                            Start Earning Now!
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrimeMembership;
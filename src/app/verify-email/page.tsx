'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email, setEmail] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Get email from URL params if available
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleVerification = async () => {
        if (!email) {
            setError('Please enter your email address');
            return;
        }

        if (!verificationCode) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Verify with Cognito via our API
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    code: verificationCode.trim(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login?verified=true');
                }, 2000);
            } else {
                setError(result.error || 'Verification failed. Please check the code and try again.');
            }
        } catch (err: unknown) {
            console.error('Verification error:', err);
            setError('Verification failed. Please check the code and try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendCode = async () => {
        if (!email) {
            setError('Please enter your email address first');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });

            const result = await response.json();

            if (result.success) {
                setError(''); // Clear any previous errors
                alert(result.data?.message || 'Verification code resent! Please check your email.');
            } else {
                setError(result.error || 'Failed to resend code');
            }
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Email Verified!</h2>
                    <p className="text-slate-500 mb-6">
                        Your email has been successfully verified. You can now login to your account.
                    </p>
                    <Link
                        href="/login"
                        className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
                    >
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                    <Link href="/login" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4">
                        <ArrowLeft size={20} />
                        Back to Login
                    </Link>
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Mail className="w-10 h-10 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Verify Your Email</h1>
                    <p className="text-slate-500">
                        Enter your email and the 6-digit verification code sent to your inbox
                    </p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Verification Code
                            </label>
                            <input
                                type="text"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                placeholder="Enter 6-digit code"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-center text-lg font-mono"
                                maxLength={6}
                            />
                        </div>

                        <button
                            onClick={handleVerification}
                            disabled={isLoading || !email || !verificationCode}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="inline animate-spin mr-2" size={20} />
                                    Verifying...
                                </>
                            ) : (
                                'Verify Email'
                            )}
                        </button>

                        <button
                            onClick={handleResendCode}
                            disabled={isLoading || !email}
                            className="w-full text-blue-600 hover:text-blue-700 font-medium py-2 transition-colors disabled:opacity-50"
                        >
                            Resend Code
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <p className="text-sm text-slate-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="text-blue-600 font-medium hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function LoadingFallback() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Loading...</p>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<LoadingFallback />}>
            <VerifyEmailContent />
        </Suspense>
    );
}
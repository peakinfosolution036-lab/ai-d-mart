'use client'

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { REGISTRATION_FEE } from '@/constants';
import {
    Camera, MapPin, CheckCircle, ChevronRight, ChevronLeft,
    AlertCircle, Shield, ArrowLeft, User, Mail, Phone,
    Calendar, Home, Lock, Users, Loader2, Plus
} from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import UpiPayment from '@/components/UpiPayment';

const steps = [
    { id: 1, title: 'Personal Info', icon: User },
    { id: 2, title: 'Contact Details', icon: Phone },
    { id: 3, title: 'Verification', icon: Camera },
    { id: 4, title: 'Bank Details', icon: Home },
    { id: 5, title: 'Payment', icon: Lock },
];

export default function RegisterPage() {
    const router = useRouter();
    const { register, login, isLoggedIn, isLoading: authLoading } = useAuth();
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [registeredId, setRegisteredId] = useState('');
    const [showVerification, setShowVerification] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [registeredEmail, setRegisteredEmail] = useState('');
    const [paymentData, setPaymentData] = useState<{ utrNumber: string; screenshotUrl: string } | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        dob: '',
        mobile: '',
        email: '',
        aadhaarPan: '',
        address: '',
        pinCode: '',
        inviteCode: '',
        password: '',
        confirmPassword: '',
        selfieImage: '',
        location: null as { lat: number; lng: number } | null,
        bankAccountNumber: '',
        ifscCode: '',
        branchName: '',
    });

    const [cameraActive, setCameraActive] = useState(false);
    const [locationCaptured, setLocationCaptured] = useState(false);

    // Redirect if logged in
    useEffect(() => {
        if (isLoggedIn && !authLoading) {
            router.push('/dashboard');
        }
    }, [isLoggedIn, authLoading, router]);

    const mediaStreamRef = useRef<MediaStream | null>(null);

    // Stop camera stream when component unmounts or camera is deactivated
    useEffect(() => {
        return () => {
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach((track: MediaStreamTrack) => track.stop());
                mediaStreamRef.current = null;
            }
        };
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const validateStep = () => {
        setError('');
        switch (currentStep) {
            case 1:
                if (!formData.fullName || !formData.dob) {
                    setError('Please fill in all required fields');
                    return false;
                }
                break;
            case 2:
                if (!formData.mobile || !formData.email || !formData.password) {
                    setError('Please fill in all required fields');
                    return false;
                }
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match');
                    return false;
                }
                if (formData.password.length < 8) {
                    setError('Password must be at least 8 characters');
                    return false;
                }
                break;
            case 3:
                if (!formData.selfieImage) {
                    setError('Please capture your selfie');
                    return false;
                }
                break;
            case 4:
                if (!formData.bankAccountNumber || !formData.ifscCode || !formData.branchName) {
                    setError('Please fill in all bank details');
                    return false;
                }
                break;
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep()) {
            setCurrentStep(prev => Math.min(prev + 1, 5));
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    // Camera functions
    const startCamera = async () => {
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            mediaStreamRef.current = stream; // Keep track of the stream
            setCameraActive(true);

            // Give it a moment to render the video element
            setTimeout(() => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                } else {
                    // Try one more time if ref isn't ready
                    setTimeout(() => {
                        if (videoRef.current) videoRef.current.srcObject = stream;
                    }, 100);
                }
            }, 100);
        } catch (err: any) {
            console.error('Camera error:', err);
            setError(`Unable to access camera: ${err.message || 'Please grant permission'}`);
        }
    };

    const captureSelfie = () => {
        if (videoRef.current && canvasRef.current) {
            const context = canvasRef.current.getContext('2d');
            if (!context) return;

            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            context.drawImage(videoRef.current, 0, 0);
            const imageData = canvasRef.current.toDataURL('image/jpeg');

            setFormData(prev => ({ ...prev, selfieImage: imageData }));

            // Stop camera
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
            setCameraActive(false);
        }
    };

    // Location function
    const captureLocation = () => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setError('');
        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData(prev => ({
                    ...prev,
                    location: { lat: position.coords.latitude, lng: position.coords.longitude }
                }));
                setLocationCaptured(true);
                setIsLoading(false);
            },
            (error) => {
                setIsLoading(false);
                let msg = 'Unable to get location.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = 'Location permission denied. Please allow location access in your browser settings.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = 'Location information unavailable. This often happens on desktop browsers. You can try on a mobile phone or proceed without it.';
                        break;
                    case error.TIMEOUT:
                        msg = 'Location request timed out. Please check your internet connection.';
                        break;
                }
                setError(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    // Handle UPI payment confirmation — triggers actual registration
    const handlePaymentSuccess = async (data: { utrNumber: string; screenshotUrl: string }) => {
        setPaymentData(data);
        await handleRegistration(data);
    };

    // Handle registration
    const handleRegistration = async (payment?: { utrNumber: string; screenshotUrl: string }) => {
        if (!validateStep()) return;

        setIsLoading(true);
        setError('');

        try {
            const result = await register({ ...formData, ...(payment ? { utrNumber: payment.utrNumber, paymentScreenshot: payment.screenshotUrl } : {}) });

            if (result.success && result.userId) {
                setRegisteredId(result.userId);
                setRegisteredEmail(formData.email);
                if (result.requiresVerification) {
                    setShowVerification(true);
                } else {
                    // Automatically login and redirect
                    const loginResult = await login(formData.email, formData.password, 'CUSTOMER');
                    if (loginResult.success) {
                        router.push('/dashboard');
                    } else {
                        setSuccess(true); // Fallback to success screen
                    }
                }
            } else {
                setError(result.error || 'Registration failed. Please try again.');
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during registration');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle email verification
    const handleVerification = async () => {
        if (!verificationCode) {
            setError('Please enter the verification code');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: registeredEmail,
                    code: verificationCode
                })
            });

            const result = await response.json();

            if (result.success) {
                // Show success and redirect to login
                setSuccess(true);
                setTimeout(() => {
                    router.push('/login?verified=true');
                }, 2000);
            } else {
                setError(result.error || 'Verification failed');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend verification code
    const resendCode = async () => {
        setError('');
        setIsLoading(true);

        try {
            // In a real app, you'd call a resend API endpoint
            // For now, just show a message
            setError('Verification code resent! Please check your email.');
        } catch (err) {
            setError('Failed to resend code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    // Email verification screen
    if (showVerification) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Mail className="w-10 h-10 text-blue-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Verify Your Email</h2>
                        <p className="text-slate-500">
                            We&apos;ve sent a verification code to<br />
                            <span className="font-medium text-slate-700">{registeredEmail}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="mb-6">
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
                        disabled={isLoading || !verificationCode}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors disabled:opacity-50 mb-4"
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

                    <p className="text-center text-sm text-slate-500">
                        Didn&apos;t receive the code?{' '}
                        <button
                            onClick={resendCode}
                            disabled={isLoading}
                            className="text-blue-600 font-medium hover:underline disabled:opacity-50"
                        >
                            Resend Code
                        </button>
                    </p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Registration Successful!</h2>
                    <p className="text-slate-500 mb-6">Your partner ID is:</p>
                    <div className="bg-slate-100 rounded-xl p-4 mb-6">
                        <p className="text-3xl font-bold text-blue-600">{registeredId}</p>
                    </div>
                    <p className="text-sm text-slate-500 mb-6">
                        Email verified! Your account is pending admin approval. You can now login.
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
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-blue-600 mb-4">
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Partner Registration</h1>
                    <p className="text-slate-500">Join us and start your digital journey</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center">
                        {steps.map((step, i) => (
                            <React.Fragment key={step.id}>
                                <div className="flex flex-col items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${currentStep >= step.id
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-200 text-slate-500'
                                        }`}>
                                        {currentStep > step.id ? <CheckCircle size={24} /> : <step.icon size={20} />}
                                    </div>
                                    <span className="text-xs mt-2 text-slate-600 hidden sm:block">{step.title}</span>
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-16 h-1 mx-2 ${currentStep > step.id ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-xl p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Step 1: Personal Info */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Personal Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInput}
                                        placeholder="Enter your full name"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <DatePicker
                                        label="Date of Birth *"
                                        value={formData.dob}
                                        onChange={(date) => setFormData(prev => ({ ...prev, dob: date }))}
                                        placeholder="Select your birth date"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Aadhaar / PAN</label>
                                    <input
                                        type="text"
                                        name="aadhaarPan"
                                        value={formData.aadhaarPan}
                                        onChange={handleInput}
                                        placeholder="Enter Aadhaar or PAN number"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Invite Code</label>
                                    <input
                                        type="text"
                                        name="inviteCode"
                                        value={formData.inviteCode}
                                        onChange={handleInput}
                                        placeholder="Enter referral code (optional)"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Contact Details */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Contact Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInput}
                                        placeholder="10-digit mobile number"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInput}
                                        placeholder="your@email.com"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInput}
                                        placeholder="Enter your full address"
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">PIN Code</label>
                                    <input
                                        type="text"
                                        name="pinCode"
                                        value={formData.pinCode}
                                        onChange={handleInput}
                                        placeholder="6-digit PIN code"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div></div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInput}
                                        placeholder="Create a password"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm Password *</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleInput}
                                        placeholder="Confirm your password"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Verification */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Verification</h2>

                            {/* Selfie Capture */}
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <Camera size={20} /> Capture Selfie
                                </h3>

                                {formData.selfieImage ? (
                                    <div className="text-center">
                                        <Image
                                            src={formData.selfieImage}
                                            alt="Selfie"
                                            width={192}
                                            height={192}
                                            unoptimized
                                            className="w-48 h-48 object-cover rounded-xl mx-auto mb-4"
                                        />
                                        <button
                                            onClick={() => setFormData({ ...formData, selfieImage: '' })}
                                            className="text-blue-600 font-medium"
                                        >
                                            Retake Photo
                                        </button>
                                    </div>
                                ) : cameraActive ? (
                                    <div className="text-center">
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            playsInline
                                            className="w-full max-w-sm mx-auto rounded-xl mb-4"
                                        />
                                        <button
                                            onClick={captureSelfie}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
                                        >
                                            Capture
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={startCamera}
                                        disabled={isLoading}
                                        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 interactive"
                                    >
                                        <Camera className="mx-auto mb-2" size={32} />
                                        Click to start camera
                                    </button>
                                )}
                                <canvas ref={canvasRef} className="hidden" />
                            </div>

                            {/* Location */}
                            <div className="bg-slate-50 rounded-2xl p-6">
                                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <MapPin size={20} /> Location
                                </h3>
                                {locationCaptured ? (
                                    <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-xl border border-green-100">
                                        <CheckCircle size={24} />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">Location captured!</span>
                                            <span className="text-xs opacity-80">Ready for registration</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <button
                                            onClick={captureLocation}
                                            disabled={isLoading}
                                            className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 interactive"
                                        >
                                            <MapPin className="mx-auto mb-2" size={32} />
                                            {isLoading ? 'Getting location...' : 'Click to capture location'}
                                        </button>
                                        {error && error.includes('unavailable') && (
                                            <button
                                                onClick={() => { setLocationCaptured(true); setError(''); }}
                                                className="w-full text-sm text-slate-500 hover:text-blue-600 font-medium transition-colors"
                                            >
                                                Skip and proceed anyway
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}



                    {/* Step 4: Bank Details */}
                    {currentStep === 4 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-slate-900 mb-6">Bank Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">My Account Number *</label>
                                    <input
                                        type="text"
                                        name="bankAccountNumber"
                                        value={formData.bankAccountNumber || ''}
                                        onChange={handleInput}
                                        placeholder="Enter account number"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">IFSC Code *</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={formData.ifscCode || ''}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ifscCode: e.target.value?.toUpperCase() }))}
                                        placeholder="Enter IFSC code"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none uppercase"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Branch Name *</label>
                                    <input
                                        type="text"
                                        name="branchName"
                                        value={formData.branchName || ''}
                                        onChange={handleInput}
                                        placeholder="Enter branch name"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Step 5: Payment */}
                    {currentStep === 5 && (
                        <div>
                            <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Fee Payment</h2>
                            <p className="text-slate-500 text-sm mb-6">Pay ₹2,000 to complete your registration</p>
                            <UpiPayment
                                amount={2000}
                                description="Partner Registration"
                                onSuccess={handlePaymentSuccess}
                                onCancel={prevStep}
                                isLoading={isLoading}
                            />
                        </div>
                    )}

                    {/* Navigation Buttons (steps 1–4 only; step 5 has its own buttons inside UpiPayment) */}
                    {currentStep < 5 && (
                        <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
                            {currentStep > 1 ? (
                                <button
                                    onClick={prevStep}
                                    className="flex items-center gap-2 px-6 py-3 text-slate-600 hover:text-slate-900 font-medium"
                                >
                                    <ChevronLeft size={20} />
                                    Previous
                                </button>
                            ) : (
                                <div></div>
                            )}

                            <button
                                onClick={nextStep}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                            >
                                Next
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Login Link */}
                <p className="text-center mt-6 text-slate-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-blue-600 font-bold hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

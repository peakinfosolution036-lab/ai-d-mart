'use client'

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, CheckCircle, Copy, AlertCircle, Loader2, X } from 'lucide-react';

const UPI_ID = '9353724256-3@ybl';
const MERCHANT_NAME = 'Devaramane Events';

interface UpiPaymentProps {
    amount: number;
    description: string;
    onSuccess: (data: { utrNumber: string; screenshotUrl: string }) => void;
    onCancel?: () => void;
    isLoading?: boolean;
}

export default function UpiPayment({ amount, description, onSuccess, onCancel, isLoading = false }: UpiPaymentProps) {
    const [utrNumber, setUtrNumber] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState('');
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const copyUpiId = () => {
        navigator.clipboard.writeText(UPI_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }
        setScreenshot(file);
        setScreenshotPreview(URL.createObjectURL(file));
        setError('');
    };

    const handleSubmit = async () => {
        setError('');

        if (!utrNumber.trim()) {
            setError('Please enter your UTR / transaction reference number');
            return;
        }
        if (utrNumber.trim().length < 10) {
            setError('UTR number must be at least 10 characters');
            return;
        }
        if (!screenshot) {
            setError('Please upload your payment screenshot');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', screenshot);

            const uploadRes = await fetch('/api/upload/payment-screenshot', {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                setError(uploadData.detail || uploadData.error || 'Failed to upload screenshot. Please try again.');
                return;
            }

            onSuccess({ utrNumber: utrNumber.trim(), screenshotUrl: uploadData.url });
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR&tn=${encodeURIComponent(description)}`;

    return (
        <div className="space-y-6">
            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl p-5 text-center">
                <p className="text-sm opacity-80 mb-1">Amount to Pay</p>
                <p className="text-4xl font-bold">₹{amount.toLocaleString()}</p>
                <p className="text-sm opacity-80 mt-1">{description}</p>
            </div>

            {/* QR + UPI ID */}
            <div className="border-2 border-purple-100 rounded-2xl p-5 bg-purple-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-52 h-52 rounded-xl overflow-hidden shadow-md">
                        <Image
                            src="/phonepe-qr.jpeg"
                            alt="PhonePe QR Code"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-gray-500 mb-1">Scan with any UPI app (PhonePe, GPay, Paytm, etc.)</p>
                        <div className="flex items-center gap-2 bg-white border border-purple-200 rounded-xl px-4 py-2">
                            <span className="font-mono font-semibold text-gray-800">{UPI_ID}</span>
                            <button
                                onClick={copyUpiId}
                                className="text-purple-600 hover:text-purple-800 transition-colors"
                                title="Copy UPI ID"
                            >
                                {copied ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                            </button>
                        </div>
                        {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
                    </div>
                    <a
                        href={upiDeepLink}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white text-center py-3 rounded-xl font-semibold transition-colors text-sm"
                    >
                        Open UPI App to Pay ₹{amount.toLocaleString()}
                    </a>
                </div>
            </div>

            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 space-y-1">
                <p className="font-semibold">Steps to complete payment:</p>
                <ol className="list-decimal list-inside space-y-1 text-amber-700">
                    <li>Pay ₹{amount.toLocaleString()} to <strong>{UPI_ID}</strong></li>
                    <li>Note the <strong>UTR / Transaction ID</strong> from your UPI app</li>
                    <li>Take a screenshot of the payment success screen</li>
                    <li>Enter UTR and upload screenshot below</li>
                </ol>
            </div>

            {/* UTR Input */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    UTR / Transaction Reference Number *
                </label>
                <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    placeholder="e.g. 425612345678"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none font-mono"
                    maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-1">Found in your UPI app under payment history</p>
            </div>

            {/* Screenshot Upload */}
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Payment Screenshot *
                </label>
                {screenshotPreview ? (
                    <div className="relative">
                        <Image
                            src={screenshotPreview}
                            alt="Payment screenshot"
                            width={400}
                            height={200}
                            className="w-full max-h-48 object-contain rounded-xl border border-gray-200"
                        />
                        <button
                            onClick={() => { setScreenshot(null); setScreenshotPreview(''); }}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                            <X size={14} />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-8 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-colors flex flex-col items-center gap-2"
                    >
                        <Upload size={28} />
                        <span className="text-sm font-medium">Click to upload screenshot</span>
                        <span className="text-xs">JPG, PNG (max 5MB)</span>
                    </button>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleScreenshot}
                    className="hidden"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    {error}
                </div>
            )}

            {/* Submit */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={uploading || isLoading}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {uploading || isLoading ? (
                        <>
                            <Loader2 size={18} className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={18} />
                            Confirm Payment
                        </>
                    )}
                </button>
            </div>

            <p className="text-xs text-center text-gray-400">
                Your payment will be verified by admin within 24 hours. Account will be activated after verification.{' '}
                By paying you agree to our{' '}
                <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Terms &amp; Conditions
                </a>{' '}and{' '}
                <a href="/terms#refund" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    Refund Policy
                </a>.
            </p>
        </div>
    );
}

import React, { useState } from 'react';
import { X, CreditCard, Loader2 } from 'lucide-react';
import { ToastType } from '@/components/ui/Toast';

interface WithdrawWalletModalProps {
    isOpen: boolean;
    onClose: () => void;
    walletBalance: number;
    userId: string;
    onSuccess: (message: string) => void;
    onError: (message: string) => void;
}

const WithdrawWalletModal: React.FC<WithdrawWalletModalProps> = ({ isOpen, onClose, walletBalance, userId, onSuccess, onError }) => {
    const [amount, setAmount] = useState('');
    const [upiId, setUpiId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    if (!isOpen) return null;

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();

        const withdrawAmount = parseFloat(amount);
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            onError('Please enter a valid amount');
            return;
        }

        if (withdrawAmount > walletBalance) {
            onError('Insufficient wallet balance');
            return;
        }

        if (!upiId.trim()) {
            onError('Please enter your UPI ID or Bank Details');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/wallet/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    amount: withdrawAmount,
                    payoutDetails: upiId
                })
            });

            const data = await res.json();
            if (data.success) {
                onSuccess('Withdrawal request submitted successfully. Awaiting admin approval.');
                setAmount('');
                setUpiId('');
                onClose();
            } else {
                onError(data.error || 'Failed to submit withdrawal request');
            }
        } catch (error) {
            console.error('Withdrawal error:', error);
            onError('An unexpected error occurred');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isProcessing && onClose()}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    disabled={isProcessing}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                >
                    <X size={20} className="text-slate-400" />
                </button>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                        <CreditCard size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">Withdraw Balance</h3>
                    <p className="text-slate-500">Transfer wallet funds to your bank</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-sm uppercase tracking-widest">Available Balance</span>
                    <span className="font-black text-blue-600 text-xl">₹{walletBalance}</span>
                </div>

                <form onSubmit={handleWithdraw} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Amount (₹)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount to withdraw"
                            max={walletBalance}
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl text-xl font-bold text-slate-900 outline-none transition-all"
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">UPI ID / Bank Details</label>
                        <input
                            type="text"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            placeholder="e.g. yourname@upi or Account #, IFSC"
                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl text-lg font-medium text-slate-900 outline-none transition-all"
                            disabled={isProcessing}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isProcessing || !amount || parseFloat(amount) <= 0 || parseFloat(amount) > walletBalance || !upiId.trim()}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="animate-spin" size={24} />
                                Processing...
                            </>
                        ) : (
                            <>Submit Request</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default WithdrawWalletModal;

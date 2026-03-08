import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, DollarSign, Wallet, CreditCard, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { exportToCSV, exportToExcel, exportToJSON, ExportData } from '@/lib/exportUtils';

export default function AdminFinancialReports() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    const fetchFinancials = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/financial-reports');
            const result = await res.json();
            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch financial reports', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFinancials();
    }, []);

    const exportData = (type: 'transactions' | 'memberships' | 'withdrawals', format: 'csv' | 'excel' | 'json') => {
        if (!data) return;

        let exportPayload: ExportData | null = null;
        const timestamp = new Date().toISOString().split('T')[0];

        if (type === 'transactions') {
            const txData = data.recentWalletTransactions.map((tx: any) => ({
                'Transaction ID': tx.SK.replace('TRANSACTION#', ''),
                'User ID': tx.PK.replace('USER#', ''),
                'Type': tx.type,
                'Amount': tx.amount,
                'Status': tx.status,
                'Description': tx.description,
                'Date': new Date(tx.createdAt).toLocaleString()
            }));

            exportPayload = {
                title: 'Recent Wallet Transactions',
                filename: `wallet-transactions-${timestamp}`,
                data: txData
            };
        } else if (type === 'memberships') {
            const memData = data.memberships.list.map((m: any) => ({
                'Membership ID': m.id,
                'User ID': m.userId,
                'Prime Code': m.primeCode,
                'Status': m.status,
                'Start Date': new Date(m.startDate).toLocaleDateString(),
                'End Date': new Date(m.endDate).toLocaleDateString()
            }));

            exportPayload = {
                title: 'Prime Membership Sales',
                filename: `prime-memberships-${timestamp}`,
                data: memData
            };
        } else if (type === 'withdrawals') {
            const withData = data.withdrawals.executedList.map((w: any) => ({
                'Withdrawal ID': w.SK,
                'User ID': w.userId,
                'Amount': w.amount,
                'Method': w.payoutMethod,
                'Details': w.payoutDetails,
                'Status': w.status,
                'Date': new Date(w.createdAt).toLocaleString()
            }));

            exportPayload = {
                title: 'Executed Withdrawals',
                filename: `executed-withdrawals-${timestamp}`,
                data: withData
            };
        }

        if (exportPayload) {
            if (format === 'csv') exportToCSV(exportPayload);
            else if (format === 'excel') exportToExcel(exportPayload);
            else if (format === 'json') exportToJSON(exportPayload);
            setShowExportDropdown(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <RefreshCw className="animate-spin text-blue-600 w-8 h-8" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center py-12 text-slate-500">Failed to load financial data.</div>;
    }

    return (
        <div className="space-y-8 mt-12 pt-12 border-t border-slate-200">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-1">Financial Overview</h3>
                    <p className="text-slate-500 font-medium">Income, Wallet Flow, and Memberships</p>
                </div>
            </div>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Platform Income</p>
                    <h4 className="text-3xl font-black text-slate-900">₹{data.income.totalPlatformRevenue.toLocaleString()}</h4>
                    <p className="text-xs text-green-600 font-bold mt-2">From Prime Sales</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><CreditCard size={24} /></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Prime Memberships</p>
                    <h4 className="text-3xl font-black text-slate-900">{data.memberships.totalPrimeMembers}</h4>
                    <p className="text-xs text-indigo-600 font-bold mt-2">Active Members</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Wallet size={24} /></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Wallet Liabilities</p>
                    <h4 className="text-3xl font-black text-slate-900">₹{data.walletLiabilities.toLocaleString()}</h4>
                    <p className="text-xs text-amber-600 font-bold mt-2">User Balances in System</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowUpRight size={24} /></div>
                    </div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Executed Withdrawals</p>
                    <h4 className="text-3xl font-black text-slate-900">₹{data.withdrawals.totalWithdrawn.toLocaleString()}</h4>
                    <p className="text-xs text-emerald-600 font-bold mt-2">Payouts successful</p>
                </div>
            </div>

            {/* Reports Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Export Options */}
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                    <h4 className="font-bold text-lg mb-4 text-slate-800">Export Financial Data</h4>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <span className="font-semibold text-slate-700">Recent Wallet Transactions</span>
                            <button onClick={() => exportData('transactions', 'csv')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition">
                                <Download size={16} /> CSV
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <span className="font-semibold text-slate-700">Prime Membership Sales</span>
                            <button onClick={() => exportData('memberships', 'csv')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition">
                                <Download size={16} /> CSV
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                            <span className="font-semibold text-slate-700">Executed Withdrawals</span>
                            <button onClick={() => exportData('withdrawals', 'csv')} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-sm font-bold transition">
                                <Download size={16} /> CSV
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 overflow-hidden flex flex-col h-80">
                    <h4 className="font-bold text-lg mb-4 text-slate-800">Recent Wallet Transactions</h4>
                    <div className="overflow-y-auto pr-2 custom-scrollbar flex-1 space-y-3">
                        {data.recentWalletTransactions.length > 0 ? data.recentWalletTransactions.map((tx: any, i: number) => {
                            const isCredit = tx.type === 'CREDIT';
                            return (
                                <div key={i} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                            {isCredit ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-slate-800">{tx.description || tx.type}</p>
                                            <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                                            {isCredit ? '+' : '-'}₹{tx.amount}
                                        </p>
                                        <p className="text-[10px] font-bold uppercase text-slate-400">{tx.status}</p>
                                    </div>
                                </div>
                            )
                        }) : (
                            <p className="text-slate-500 text-sm italic">No recent transactions.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

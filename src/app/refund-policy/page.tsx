import React from 'react';
import { Footer } from '@/components/Footer';

export default function RefundPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-black text-[#00703C] mb-8 border-b border-slate-100 pb-4">Refund Policy</h1>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
                        <p>There are two types of refund policies:</p>
                        <ol className="list-decimal pl-5 space-y-1 font-bold">
                            <li>Refund</li>
                            <li>No Refund</li>
                        </ol>

                        <h2 className="text-xl font-bold text-[#00703C] mt-6">REFUNDABLE</h2>
                        <p>
                            If the money paid by you to get the product of our company including company services is credited to the bank account of the company and if the service or product is not received by you from our company, then within 24 hours from the time of payment the complaint should be registered through mail or customer care of the company including WhatsApp during the office hours and related to the payment transaction. Number and Receipt shall be provided by the Company on request and the matter shall be resolved within 24 hours from the time of your complaint, excluding Company Holidays in this regard, otherwise the amount paid by you shall be refunded directly to your bank account within seven days from the date of your complaint.
                        </p>

                        <h2 className="text-xl font-bold text-red-600 mt-6">NON REFUNDABLE</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>We hereby clarify that the fee paid for registering and obtaining Permanent ID with our company DEVARAMANE EVENTS AND INDUSTRIES is non-refundable for any reason whatsoever.</li>
                            <li>You understand and agree that the amount paid by you to avail other services of the Company through subscription is non-refundable.</li>
                            <li>If the money you paid for other services including subscription to get a permanent ID in the company is paid directly to the bank account of the company, if you have conducted other activities beyond the rules and regulations of the company and violated the rules of the company, such ID will be permanently blocked. And you agree that we have made it clear to you that you will be kicked out of the company and any money paid by you will not be refunded.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

import React from 'react';
import { Footer } from '@/components/Footer';

export default function PaymentPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-black text-[#00703C] mb-8 border-b border-slate-100 pb-4">Payment Policy</h1>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
                        <p>
                            DEVARAMANE EVENTS AND INDUSTRIES (DEVARAMANE) should register through the company's website and mobile application and obtain a permanent customer ID. To get permanent customer ID, registration fee should be paid through online payment (UPI & QR, Net Banking, GooglePay, PhonePe, Debit Card, Credit Card) etc.
                        </p>

                        <ul className="list-disc pl-5 space-y-2">
                            <li>We do not accept any money directly in our company name</li>
                            <li>Any person can cheat you by using our company name for money, do not give money directly for any reason</li>
                            <li>Receipt by direct deposit to our company bank account is preferred.</li>
                            <li>The money paid to get Permanent Customer ID is non-refundable for any reason</li>
                            <li>Any person committing fraud using our company name will be prosecuted and expelled from the company</li>
                        </ul>

                        <p className="font-bold text-red-600 border border-red-100 bg-red-50 p-4 rounded-xl">
                            It is clarified that our company does not take any responsibility in case of cheating or fraud by giving cash or transferring money to any company or person other than our company.
                        </p>

                        <h2 className="text-xl font-bold text-slate-900 mt-6 md:text-2xl text-[#00703C]">Payment</h2>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Customers who register with our company and get a permanent ID can easily access online services including mobile recharge by depositing money in wallet on DEVARAMANE website or mobile app.</li>
                            <li>Incentive payment including dividend or commission paid by the company to the staff and customers working on full time part time contract basis in DEVARAMANE EVENTS AND INDUSTRIES company or by subscription is directly credited to the concerned person's bank account on daily, weekly, monthly basis.</li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

import React from 'react';
import { Footer } from '@/components/Footer';

export default function ShippingPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <h1 className="text-3xl md:text-4xl font-black text-[#00703C] mb-8 border-b border-slate-100 pb-4">Shipping Policy</h1>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-sm md:text-base">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Last Updated: 20-03-2024</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-6">Definition and Definitions</h2>
                        <p>
                            Words with the initial letter capitalized have meanings defined under the following clauses. The following definitions have the same meaning regardless of whether they appear in the singular or plural.
                        </p>

                        <h3 className="text-lg font-bold text-slate-900 mt-4">Definitions</h3>
                        <p>For purposes of this disclaimer:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>"DEVARAMANE EVENTS AND INDUSTRIES"</strong> (referred to as "Company", "we", "us" or "our" in this disclaimer) refers to DEVARAMANE EVENTS AND INDUSTRIES INFORMATION.</li>
                            <li><strong>"Goods"</strong> refers to items offered for sale on the Service.</li>
                            <li><strong>"Orders"</strong> means a request by you to purchase goods from us.</li>
                            <li><strong>"www.devaramane.com"</strong> refers to the website.</li>
                            <li><strong>"DEVARAMANE"</strong> refers to DEVARAMANE EVENTS AND INDUSTRIES accessible from https://devaramane.com.</li>
                            <li><strong>"You"</strong> means the person accessing the Service or the company or other legal entity on behalf of such person accessing or using the Service as applicable.</li>
                        </ul>

                        <p>Thank you for visiting and shopping at www.devaramane.com. The following terms and conditions constitute your shipping policy.</p>

                        <h2 className="text-xl font-bold text-slate-900 mt-6 md:text-2xl text-[#00703C]">Domestic Shipping Policy</h2>

                        <h3 className="text-lg font-bold text-slate-900 mt-4">Shipping Processing Time</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>All orders are processed within 5-10 business days. Orders cannot be shipped or delivered on weekends or holidays.</li>
                            <li>If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow extra days in transit for delivery. If there is a significant delay in the shipment of your order, we will contact you by email or telephone.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-slate-900 mt-4">Shipping Rates and Delivery Estimates</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Shipping charges are calculated for your orders and displayed at checkout.</li>
                            <li><strong>Shipping Method:</strong> By Courier</li>
                            <li><strong>Shipping Cost:</strong> You have to pay based on the order placed</li>
                            <li><strong>Estimated Delivery Time:</strong> 5-10 business days</li>
                            <li>Delivery delays may occasionally occur.</li>
                            <li>www.devaramane.com only ships to addresses within the states of Karnataka state of India.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-slate-900 mt-4">Shipment Confirmation and Order Tracking</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>You will receive a shipment confirmation email after your order ships that includes your tracking number(s). Tracking number will be active within 24 hours.</li>
                            <li>Delivery will be made during office hours only, excluding holidays.</li>
                        </ul>

                        <h3 className="text-lg font-bold text-slate-900 mt-4">Customs, Duties and Taxes</h3>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>www.devaramane.com is not responsible for any customs and taxes applied to your order. All charges incurred during or after shipping are the customer's responsibility (duties, taxes).</li>
                            <li><strong>Shipping system is available in Karnataka state only.</strong></li>
                        </ul>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

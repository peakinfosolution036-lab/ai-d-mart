import React from 'react';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

export default function DigitalMarketingJobPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100">
                    <div className="inline-block bg-[#00703C] text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-6">Open Position</div>
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 mb-6">Digital Marketing Specialist</h1>

                    <div className="flex items-center gap-4 text-sm font-bold text-slate-500 mb-8 pb-8 border-b border-slate-100">
                        <span className="flex items-center gap-2">📍 Karnataka, India</span>
                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                        <span className="flex items-center gap-2">💼 Full Time / Part Time</span>
                    </div>

                    <div className="space-y-6 text-slate-600 leading-relaxed text-lg">
                        <p>
                            A digital marketer's primary goal is to create effective long-term campaigns and short-term advertisements that support the business' overarching goals.
                        </p>
                        <p>
                            <strong>Digital marketer. Primary duties:</strong> A digital marketer specializes in overseeing and executing marketing campaigns online. In this role, professionals plan and execute strategies to reach audiences, build brand awareness, and drive sales.
                        </p>
                        <div className="bg-[#f0f9f4] p-6 rounded-2xl border border-[#00703C]/10 text-[#004D2C]">
                            <p className="font-bold">
                                Digital marketing has become an essential part of almost any successful business strategy and offers a range of career opportunities.
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <p className="mb-4 font-bold text-slate-900">Interested in joining our team?</p>
                            <a href="mailto:devrmane@gmail.com" className="inline-block bg-[#00703C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#005c30] transition-colors shadow-lg shadow-[#00703C]/20">
                                Apply Now
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, Briefcase, FileText, Truck, RefreshCcw, CreditCard, Instagram, Linkedin, Twitter } from 'lucide-react';

const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        const currentRef = ref.current;
        if (currentRef) observer.observe(currentRef);
        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`reveal ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
};

export const Footer = () => (
    <footer className="bg-white pt-32 pb-10 px-6 md:px-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-dots opacity-20 pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto text-center relative z-10">
            <Reveal>
                <h2 className="text-[15vw] font-black leading-[0.8] tracking-tighter text-[#00703C] mb-10 interactive hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-[#00703C] hover:to-[#004D2C] transition-colors cursor-pointer select-none">
                    LET&apos;S TALK
                </h2>
            </Reveal>

            <div className="flex justify-center mb-20">
                <Link href="/register" className="interactive bg-[#D32F2F] text-white w-64 h-64 rounded-full flex items-center justify-center text-xl font-bold hover:scale-110 transition-transform duration-300 shadow-xl shadow-red-500/20">
                    Join Now
                </Link>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-end border-t border-slate-200 pt-10">
                <div className="text-left">
                    <h3 className="font-extrabold text-[#00703C] text-xl mb-2 italic">Devaramane Events and Industries</h3>
                    <p className="text-slate-600 max-w-sm font-medium">
                        Varthahara Bhavana, Jannapura Village Road,<br />
                        Mudigere, Chikmagalur, Karnataka 577132
                    </p>
                    <p className="text-[#00703C] mt-2 font-black">devaramane@gmail.com | +91-9008385588</p>
                </div>
                <div className="flex gap-4 mt-6 md:mt-0 items-center">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="interactive text-[#00703C] hover:text-[#004D2C] transition-colors"><Instagram size={22} /></a>
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="interactive text-[#00703C] hover:text-[#004D2C] transition-colors"><Linkedin size={22} /></a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="interactive text-[#00703C] hover:text-[#004D2C] transition-colors"><Twitter size={22} /></a>
                </div>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-4 mt-6 pt-6 border-t border-slate-100 text-sm font-medium text-slate-500">
                <Link href="/about" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><Shield size={16} /> Vision & Mission</Link>
                <Link href="/careers" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><Briefcase size={16} /> Careers</Link>
                <Link href="/terms" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><FileText size={16} /> Terms & Conditions</Link>
                <Link href="/privacy-policy" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><Shield size={16} /> Privacy Policy</Link>
                <Link href="/shipping-policy" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><Truck size={16} /> Shipping Policy</Link>
                <Link href="/refund-policy" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><RefreshCcw size={16} /> Refund Policy</Link>
                <Link href="/payment-policy" className="flex items-center gap-2 hover:text-[#00703C] transition-colors"><CreditCard size={16} /> Payment Policy</Link>
                <span className="w-full md:w-auto text-center mt-2 md:mt-0 text-slate-400">© 2026 Devaramane Events and Industries</span>
                <span className="w-full text-center mt-1 text-slate-400 text-xs">
                    Designed &amp; Developed by{' '}
                    <a href="https://peakinfosolution.com" target="_blank" rel="noopener noreferrer" className="text-[#00703C] hover:underline font-semibold">
                        Peakinfosolution.com
                    </a>
                </span>
            </div>
        </div>
    </footer>
);

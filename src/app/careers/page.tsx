'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    ArrowRight, ArrowLeft, TrendingUp, Globe, Megaphone,
    BarChart2, Mail, Search, Share2, Play, CheckCircle,
    Zap, Users, Star, ChevronRight, Briefcase
} from 'lucide-react';

// Reusable scroll-reveal wrapper (same as LandingPage)
const Reveal = ({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) => {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) entry.target.classList.add('active'); },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );
        const el = ref.current;
        if (el) observer.observe(el);
        return () => { if (el) observer.unobserve(el); };
    }, []);
    return (
        <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
            {children}
        </div>
    );
};

const roles = [
    {
        icon: Search,
        title: 'SEO Specialist',
        type: 'Full-time / Part-time',
        desc: 'Optimise website rankings, drive organic traffic, and build keyword strategies that connect rural India to digital services.',
        skills: ['Keyword Research', 'On-page SEO', 'Google Search Console', 'Link Building'],
        color: 'from-amber-400 to-orange-500',
        bg: 'from-amber-500/10 to-orange-500/10',
    },
    {
        icon: Share2,
        title: 'Social Media Marketer',
        type: 'Full-time / Contract',
        desc: 'Create and manage campaigns across Instagram, Facebook, YouTube, and WhatsApp to grow the community.',
        skills: ['Content Creation', 'Meta Ads', 'Reels & Shorts', 'Analytics'],
        color: 'from-pink-400 to-purple-500',
        bg: 'from-pink-500/10 to-purple-500/10',
    },
    {
        icon: Megaphone,
        title: 'Performance Marketer',
        type: 'Full-time',
        desc: 'Run and optimise paid ads on Google, Meta, and YouTube. Drive conversions for events, shop, and registrations.',
        skills: ['Google Ads', 'Meta Ads Manager', 'A/B Testing', 'Conversion Tracking'],
        color: 'from-blue-400 to-cyan-500',
        bg: 'from-blue-500/10 to-cyan-500/10',
    },
    {
        icon: Mail,
        title: 'Email & WhatsApp Marketer',
        type: 'Part-time / Remote',
        desc: 'Build and execute email campaigns, WhatsApp broadcasts, and automated workflows to engage our growing customer base.',
        skills: ['Email Copywriting', 'WhatsApp Business API', 'Segmentation', 'Automation'],
        color: 'from-green-400 to-teal-500',
        bg: 'from-green-500/10 to-teal-500/10',
    },
    {
        icon: BarChart2,
        title: 'Content & Analytics Lead',
        type: 'Full-time',
        desc: 'Create compelling content — blogs, videos, infographics — and track performance metrics to sharpen our digital presence.',
        skills: ['Copywriting', 'Google Analytics', 'Video Editing', 'Data Reporting'],
        color: 'from-violet-400 to-indigo-500',
        bg: 'from-violet-500/10 to-indigo-500/10',
    },
    {
        icon: Globe,
        title: 'Digital Marketing Intern',
        type: 'Internship',
        desc: 'Learn hands-on digital marketing in a fast-growing platform. Gain real experience running campaigns, creating content, and analysing results.',
        skills: ['Eagerness to Learn', 'Basic Social Media', 'Communication', 'Creativity'],
        color: 'from-orange-400 to-red-500',
        bg: 'from-orange-500/10 to-red-500/10',
    },
];

const benefits = [
    { icon: TrendingUp, title: 'Weekly Commission', desc: 'Earn weekly payouts on every campaign result — not just a fixed salary.' },
    { icon: Users, title: 'Referral Income', desc: 'Bring in new partners or customers and earn ₹500 per successful referral directly to your account.' },
    { icon: Star, title: 'Performance Bonuses', desc: 'Top performers receive exclusive bonuses, rewards, and recognition every month.' },
    { icon: Zap, title: 'Remote Friendly', desc: 'Work from anywhere in India. Full-time, part-time, and contract options available.' },
    { icon: Globe, title: 'Real Impact', desc: 'Help connect rural India to digital services — your work directly changes lives.' },
    { icon: Briefcase, title: 'Career Growth', desc: 'Fast-track your career in a company spanning events, e-commerce, fintech, and more.' },
];

export default function CareersPage() {
    const [activeRole, setActiveRole] = useState<number | null>(null);

    return (
        <div className="bg-black min-h-screen font-sans selection:bg-amber-500 selection:text-black">

            {/* Nav back */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-medium">
                        <ArrowLeft size={16} />
                        Back to Home
                    </Link>
                    <Link
                        href="/register"
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                    >
                        Apply Now
                    </Link>
                </div>
            </div>

            {/* Hero */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
                {/* Background blobs */}
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
                    <Reveal>
                        <span className="inline-block text-amber-500 font-semibold text-base mb-6 tracking-widest uppercase">
                            Join Our Team
                        </span>
                    </Reveal>

                    <Reveal delay={100}>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-white mb-6 leading-none tracking-tight">
                            Digital
                            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500">
                                Marketing
                            </span>
                            <span className="block text-3xl sm:text-4xl md:text-5xl font-light opacity-70 mt-2">
                                Careers
                            </span>
                        </h1>
                    </Reveal>

                    <Reveal delay={200}>
                        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
                            A digital marketer&apos;s primary goal is to create effective long-term campaigns and short-term advertisements
                            that power a business forward. Be part of a platform connecting rural India to the digital economy.
                        </p>
                    </Reveal>

                    <Reveal delay={300}>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="#roles"
                                className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white px-10 py-5 rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                View Open Roles
                                <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </a>
                            <a
                                href="#why"
                                className="group bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 rounded-full text-lg font-semibold hover:bg-white/20 transition-all duration-300"
                            >
                                <Play className="inline mr-2" size={18} />
                                Why Join Us
                            </a>
                        </div>
                    </Reveal>
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 text-xs animate-bounce">
                    <span>Scroll</span>
                    <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent"></div>
                </div>
            </section>

            {/* What is Digital Marketing */}
            <section className="py-32 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-amber-400/60 to-orange-500/60 rounded-full blur-xl animate-bounce opacity-80"></div>
                <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-purple-500/50 to-pink-600/50 rounded-full blur-2xl animate-pulse opacity-70"></div>

                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <span className="text-amber-600 font-semibold text-lg mb-4 block">What We Do</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                            Digital Marketing <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Has Become Essential</span>
                        </h2>
                    </Reveal>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12">
                        {[
                            {
                                title: 'Long-Term Campaigns',
                                desc: 'A digital marketer specialises in overseeing and executing marketing campaigns online. Professionals plan and build sustained brand presence across search, social, and email.',
                                gradient: 'from-amber-50 to-orange-50',
                                border: 'border-amber-100',
                                accent: 'text-amber-600',
                            },
                            {
                                title: 'Short-Term Advertisements',
                                desc: 'From flash sales to event promotions — digital marketers craft targeted ads that drive immediate results, maximising ROI on every rupee spent.',
                                gradient: 'from-blue-50 to-cyan-50',
                                border: 'border-blue-100',
                                accent: 'text-blue-600',
                            },
                            {
                                title: 'Career Opportunities',
                                desc: 'Digital marketing has become an essential part of almost any successful business strategy and offers a wide range of career opportunities — from SEO to social media to performance marketing.',
                                gradient: 'from-purple-50 to-pink-50',
                                border: 'border-purple-100',
                                accent: 'text-purple-600',
                            },
                        ].map((card, i) => (
                            <Reveal key={i} delay={i * 100}>
                                <div className={`bg-gradient-to-br ${card.gradient} border ${card.border} rounded-3xl p-8 h-full`}>
                                    <CheckCircle className={`${card.accent} mb-4`} size={32} />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{card.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Open Roles */}
            <section id="roles" className="py-32 px-6 bg-gradient-to-br from-black via-gray-900 to-orange-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-orange-400/30 to-amber-600/30 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-bounce"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Reveal className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">Open Roles</h2>
                        <p className="text-xl text-gray-300">Full-time, part-time, remote, and contract positions available across India</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {roles.map((role, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div
                                    className={`bg-gradient-to-br ${role.bg} border border-white/10 rounded-3xl p-7 cursor-pointer hover:border-white/30 hover:scale-[1.02] transition-all duration-300 group`}
                                    onClick={() => setActiveRole(activeRole === i ? null : i)}
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center mb-5 shadow-lg`}>
                                        <role.icon size={22} className="text-white" />
                                    </div>

                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <h3 className="text-xl font-bold text-white">{role.title}</h3>
                                        <ChevronRight
                                            size={18}
                                            className={`text-gray-400 flex-shrink-0 mt-1 transition-transform duration-300 ${activeRole === i ? 'rotate-90' : 'group-hover:translate-x-1'}`}
                                        />
                                    </div>

                                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r ${role.color} text-white mb-4`}>
                                        {role.type}
                                    </span>

                                    <p className="text-gray-300 text-sm leading-relaxed mb-4">{role.desc}</p>

                                    {activeRole === i && (
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Skills needed</p>
                                            <div className="flex flex-wrap gap-2">
                                                {role.skills.map(skill => (
                                                    <span key={skill} className="text-xs bg-white/10 text-white px-3 py-1 rounded-full border border-white/10">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                            <Link
                                                href="/register"
                                                className={`mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r ${role.color} text-white py-3 rounded-2xl font-semibold text-sm hover:shadow-lg transition-all`}
                                            >
                                                Apply for this Role
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Join */}
            <section id="why" className="py-32 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
                <div className="absolute top-20 right-20 w-48 h-48 bg-gradient-to-br from-amber-400/40 to-orange-500/40 rounded-full blur-2xl animate-bounce opacity-70"></div>
                <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse opacity-60"></div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <Reveal className="text-center mb-16">
                        <span className="text-amber-600 font-semibold text-lg mb-4 block">Why Join Us</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                            More Than a <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Job</span>
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Earn commissions, grow your career, and make a real difference in communities across India.
                        </p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {benefits.map((b, i) => (
                            <Reveal key={i} delay={i * 80}>
                                <div className="bg-white border border-gray-100 rounded-3xl p-8 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                                    <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                        <b.icon size={26} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{b.desc}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* Payout Structure */}
            <section className="py-32 px-6 bg-black relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute top-20 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-500/15 to-orange-600/15 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-bounce"></div>
                </div>

                <div className="max-w-4xl mx-auto relative z-10">
                    <Reveal className="text-center mb-16">
                        <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
                            How You <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Earn</span>
                        </h2>
                        <p className="text-xl text-gray-400">Multiple income streams — all credited directly to your bank account</p>
                    </Reveal>

                    <div className="space-y-4">
                        {[
                            { n: '01', label: 'Referral Income', schedule: 'Daily Payout', desc: 'Direct credit per successful referral', color: 'from-amber-400 to-orange-500' },
                            { n: '02', label: 'Transaction Commission', schedule: 'Weekly Payment', desc: 'Earn points on every transaction — convert to cash', color: 'from-blue-400 to-cyan-500' },
                            { n: '03', label: 'Recharge Commission', schedule: 'Wallet Settlement', desc: 'Wallet returns generate commission on time', color: 'from-purple-400 to-violet-500' },
                            { n: '04', label: 'Events Commission', schedule: 'Weekly Payment', desc: 'All types of event bookings earn commission', color: 'from-pink-400 to-rose-500' },
                            { n: '05', label: 'Shopping Commission', schedule: 'Weekly Payment', desc: 'Shopping points earned on every purchase', color: 'from-green-400 to-teal-500' },
                            { n: '06', label: 'Job Incentive', schedule: 'Monthly Payment', desc: 'Full-time & part-time role incentives', color: 'from-orange-400 to-red-500' },
                        ].map((item, i) => (
                            <Reveal key={i} delay={i * 60}>
                                <div className="flex items-center gap-6 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 group">
                                    <span className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${item.color} flex-shrink-0 w-12`}>
                                        {item.n}
                                    </span>
                                    <div className="flex-1">
                                        <h4 className="text-white font-bold text-lg">{item.label}</h4>
                                        <p className="text-gray-400 text-sm mt-0.5">{item.desc}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-gradient-to-r ${item.color} text-white flex-shrink-0`}>
                                        {item.schedule}
                                    </span>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal className="mt-8">
                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5 text-center text-amber-300 text-sm">
                            All points must be <strong>converted to cash</strong> before withdrawal to bank account.
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* CTA */}
            <section className="py-40 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden text-center">
                <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-br from-amber-400/50 to-orange-500/50 rounded-full blur-2xl animate-bounce opacity-70"></div>
                <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-500/40 to-pink-500/40 rounded-full blur-3xl animate-pulse opacity-60"></div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <Reveal>
                        <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
                            Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Start?</span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-10">
                            Register today, get your Permanent ID, and start earning through our digital marketing team.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="group bg-gradient-to-r from-amber-500 to-orange-600 text-white px-12 py-5 rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                Register & Apply
                                <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                            </Link>
                            <Link
                                href="/terms#payment"
                                className="border-2 border-gray-300 text-gray-700 px-12 py-5 rounded-full text-lg font-semibold hover:border-amber-500 hover:text-amber-600 transition-all duration-300"
                            >
                                View Payment Policy
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* Footer mini */}
            <footer className="py-10 px-6 bg-black border-t border-white/5 text-center text-gray-500 text-sm">
                <p>© {new Date().getFullYear()} Devaramane Events and Industries</p>
                <div className="flex justify-center gap-6 mt-3">
                    <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
                    <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms &amp; Conditions</Link>
                    <Link href="/terms#payment" className="hover:text-amber-400 transition-colors">Payment Policy</Link>
                    <Link href="/register" className="hover:text-amber-400 transition-colors">Register</Link>
                </div>
            </footer>
        </div>
    );
}

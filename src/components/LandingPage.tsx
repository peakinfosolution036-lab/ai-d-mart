'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    ArrowRight, Star, Heart, Award, Users,
    Mail, Phone, MapPin, Clock, Send, X, Play, Zap, Ticket, Trophy
} from 'lucide-react';
import Gallery from './Gallery';
import ShopShortcode from './ShopShortcode';
import LuckyDrawWinners from './LuckyDrawWinners';
import Testimonials from './Testimonials';
import { Footer } from './Footer';

// --- Interactive Components ---

// Enquiry Modal Component
const EnquiryModal = ({ isOpen, onClose, initialService = "" }: { isOpen: boolean; onClose: () => void; initialService?: string }) => {
    const [isSubmitted, setIsSubmitted] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitted(true);
        // Reset and close after 3 seconds
        setTimeout(() => {
            setIsSubmitted(false);
            onClose();
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-xl p-8 md:p-12 shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors interactive z-10"
                >
                    <X size={24} className="text-slate-400" />
                </button>

                {isSubmitted ? (
                    <div className="py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="w-24 h-24 bg-green-50 text-[#00703C] rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-bounce">
                            <Zap size={48} fill="currentColor" />
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-4">Success!</h3>
                        <p className="text-xl text-slate-500 font-medium">Thank you for reaching out.<br />We will contact you shortly.</p>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-10">
                            <h3 className="text-3xl font-black text-slate-900 mb-2">Get the best deal with our organisers</h3>
                            <p className="text-slate-500 italic">Answer a few simple questions to organise your event:</p>
                        </div>

                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Name *</label>
                                <input
                                    type="text"
                                    placeholder="Your Full Name"
                                    required
                                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:outline-none transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Mobile Number *</label>
                                <div className="flex gap-2">
                                    <div className="flex items-center gap-2 px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl min-w-[100px]">
                                        <Image src="https://flagcdn.com/w20/in.png" alt="India" width={20} height={15} unoptimized className="w-5 h-auto" />
                                        <span className="font-bold">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Mobile Number"
                                        required
                                        className="flex-1 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-[#00703C] focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-4">What service do you need?</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { id: "wedding", label: "Wedding planners", matches: ["Weddings", "Wedding Arrangements"] },
                                        { id: "personal", label: "Personal event organisers", matches: ["Resort & Homestay"] },
                                        { id: "corporate", label: "Corporate / Commercial event organisers", matches: ["B2B Events", "Event Products"] },
                                        { id: "birthday", label: "Birthday party planners", matches: ["Holiday Decor"] },
                                        { id: "music", label: "Live music and orchestra", matches: ["Music Parties", "Music Party Organisers"] },
                                        { id: "entertainment", label: "Entertainment shows and stalls", matches: ["Video Shooting"] }
                                    ].map((item) => (
                                        <label key={item.id} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                                                defaultChecked={item.matches.some(m => initialService?.includes(m)) || initialService === item.label}
                                            />
                                            <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-[#D32F2F] hover:bg-[#b71c1c] text-white font-black text-xl rounded-2xl shadow-lg shadow-red-200 transition-all transform hover:-translate-y-1 interactive"
                            >
                                Submit
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};
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

// --- Landing Page Sections ---

const Hero = () => {
    return (
        <div className="relative h-screen flex items-center justify-center overflow-hidden bg-black">
            {/* Cinematic Background Video */}
            <div className="absolute inset-0">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover opacity-40"
                >
                    <source src="/hero-video.mp4" type="video/mp4" />
                    {/* Fallback image if video fails to load */}
                    <div className="relative w-full h-full">
                        <Image
                            src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=2000"
                            alt="Luxury Event"
                            fill
                            className="object-cover opacity-40"
                            priority
                        />
                    </div>
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-br from-[#FFD700]/20 to-[#00703C]/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-[#00703C]/10 to-[#FFD700]/10 rounded-full blur-3xl animate-bounce"></div>

            {/* Content */}
            <div className="relative z-10 text-center px-4 sm:px-6 max-w-6xl">
                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white mb-6 sm:mb-8 leading-none tracking-tight">
                    Win Your
                    <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] via-white to-[#FFD700] animate-pulse">
                        Dream Prize
                    </span>
                    <span className="block text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light opacity-80">With Our Lucky Draw</span>
                </h1>

                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto font-light leading-relaxed px-4">
                    Join India&apos;s most transparent lucky draw system. Luxury events, massive jackpots, and life-changing prizes every week.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4">
                    <Link href="/lucky-draw" className="group bg-[#FFD700] text-[#00703C] px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-black hover:shadow-2xl hover:shadow-[#FFD700]/40 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center">
                        <Star className="mr-2 fill-current" size={24} />
                        PLAY NOW
                        <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                    </Link>
                    <Link href="/register" className="group bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-full text-base sm:text-lg font-bold hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                        <Users className="inline mr-2" size={20} />
                        Join The Club
                    </Link>
                </div>
            </div>
        </div>
    );
};

const AboutSection = () => (
    <section className="py-32 px-6 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        {/* Floating Bubbles */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-amber-400/60 to-orange-500/60 rounded-full blur-xl animate-bounce opacity-80"></div>
        <div className="absolute bottom-32 right-32 w-48 h-48 bg-gradient-to-br from-purple-500/50 to-pink-600/50 rounded-full blur-2xl animate-pulse opacity-70"></div>
        <div className="absolute top-1/2 left-10 w-20 h-20 bg-gradient-to-br from-blue-500/70 to-indigo-600/70 rounded-full blur-lg animate-ping opacity-60"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-green-500/65 to-emerald-600/65 rounded-full blur-lg animate-bounce opacity-75"></div>

        {/* Additional Left Side Bubbles */}
        <div className="absolute top-32 left-5 w-16 h-16 bg-gradient-to-br from-yellow-500/70 to-amber-600/70 rounded-full blur-md animate-pulse opacity-65"></div>
        <div className="absolute bottom-20 left-16 w-28 h-28 bg-gradient-to-br from-cyan-500/55 to-blue-600/55 rounded-full blur-lg animate-bounce opacity-60"></div>
        <div className="absolute top-2/3 left-2 w-12 h-12 bg-gradient-to-br from-rose-500/80 to-pink-600/80 rounded-full blur-sm animate-ping opacity-70"></div>

        {/* Additional Right Side Bubbles */}
        <div className="absolute top-16 right-8 w-18 h-18 bg-gradient-to-br from-violet-500/65 to-purple-600/65 rounded-full blur-md animate-pulse opacity-75"></div>
        <div className="absolute bottom-40 right-12 w-22 h-22 bg-gradient-to-br from-teal-500/60 to-emerald-600/60 rounded-full blur-lg animate-bounce opacity-70"></div>
        <div className="absolute top-3/4 right-4 w-14 h-14 bg-gradient-to-br from-orange-500/70 to-red-600/70 rounded-full blur-sm animate-ping opacity-65"></div>

        <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                {/* Left Side - Text */}
                <div className="relative z-10">
                    {/* Text area bubbles */}
                    <div className="absolute -top-8 -left-8 w-20 h-20 bg-gradient-to-br from-[#FFD700]/40 to-yellow-600/40 rounded-full blur-md animate-bounce opacity-80"></div>
                    <div className="absolute top-16 -left-4 w-12 h-12 bg-gradient-to-br from-[#00703C]/30 to-green-600/30 rounded-full blur-sm animate-pulse opacity-75"></div>

                    <span className="text-[#00703C] font-bold text-lg mb-4 block tracking-widest uppercase">Our Vision</span>
                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-tight">
                        Experience the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00703C] to-[#009951]">Thrills & Luxury</span> with us
                    </h2>
                    <div className="space-y-6 text-lg text-gray-700 leading-relaxed font-medium">
                        <p>
                            Our platform is not just a marketplace; it&apos;s a gateway to possibilities. Our presence has now become global as we have fulfilled the dreams of many individuals, corporate and families through our integrated events and lucky draw systems.
                        </p>
                        <p>
                            We specialize in offering complete service for weddings, seminars and events while providing a transparent platform for users to win life-changing prizes. Our team handles every detail so you can focus on the moment.
                        </p>
                    </div>
                </div>

                {/* Right Side - Image */}
                <div className="relative z-10">
                    <div className="relative">
                        <Image
                            src="/service_events.png"
                            alt="Event Services"
                            width={600}
                            height={500}
                            className="w-full h-auto rounded-3xl shadow-2xl"
                        />
                        {/* Image overlay bubbles */}
                        <div className="absolute -top-6 -right-6 w-16 h-16 bg-gradient-to-br from-amber-600/80 to-orange-700/80 rounded-full blur-sm animate-pulse"></div>
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-br from-purple-600/70 to-pink-700/70 rounded-full blur-sm animate-bounce"></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const LuxuryWeddingBanner = () => (
    <section className="w-full">
        <Image
            src="/luxury-wedding-banner.jpeg"
            alt="Luxury Wedding Events - Where dreams become reality"
            width={1400}
            height={600}
            className="w-full h-auto object-cover"
            priority
        />
    </section>
);

const TrustBar = () => (
    <section className="py-20 px-6 bg-gradient-to-br from-[#004D2C] via-[#00703C] to-[#004D2C] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
            <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-r from-[#FFD700]/10 to-[#FFD700]/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-[#FFD700]/5 to-white/5 rounded-full blur-3xl animate-bounce"></div>
        </div>
        <div className="max-w-6xl mx-auto relative z-10">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Why Choose Us</h2>
                <p className="text-xl text-[#FFD700] font-medium">Excellence in every detail, trust in every moment</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {[
                    {
                        icon: Award,
                        title: "Creative Concept Development",
                        desc: "Innovative ideas tailored to your vision",
                        color: "text-[#00703C]"
                    },
                    {
                        icon: Star,
                        title: "Transparent Pricing",
                        desc: "No hidden costs, clear budget planning",
                        color: "text-[#00703C]"
                    },
                    {
                        icon: Users,
                        title: "Dedicated Event Managers",
                        desc: "Personal attention from start to finish",
                        color: "text-[#00703C]"
                    },
                    {
                        icon: MapPin,
                        title: "Vendor Network Across Karnataka",
                        desc: "Extensive connections for best services",
                        color: "text-[#00703C]"
                    },
                    {
                        icon: Clock,
                        title: "On-Time Execution",
                        desc: "Punctual delivery of every promise",
                        color: "text-[#00703C]"
                    },
                    {
                        icon: Heart,
                        title: "Zero-Stress Planning",
                        desc: "We handle everything, you enjoy the moment",
                        color: "text-[#00703C]"
                    }
                ].map((item, i) => (
                    <div key={i} className="bg-white rounded-3xl p-8 text-center group hover:bg-[#FFD700] transition-all duration-700 hover:scale-105 shadow-xl cursor-pointer">
                        <div className={`w-20 h-20 mx-auto mb-6 ${item.color} bg-slate-50 rounded-2xl flex items-center justify-center transition-all duration-700 shadow-md group-hover:bg-white`}>
                            <item.icon size={32} />
                        </div>
                        <h3 className="font-bold text-2xl text-gray-900 mb-4 group-hover:text-[#00703C] transition-all duration-700">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed group-hover:text-[#004D2C] transition-colors duration-500">{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const Services = ({ onEnquire }: { onEnquire: (service?: string) => void }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 500);
        return () => clearTimeout(timer);
    }, []);

    const services = [
        {
            title: "Resort and Homestay",
            desc: "We will arrange bookings for you at our registered resorts and homestays.",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=600",
            gradient: "from-blue-500 to-cyan-500",
            icon: "🏨",
            particles: "☀️"
        },
        {
            title: "B2B Events Product & Services",
            desc: "We are leading name engaged in providing the best B2B events product and services to our clients.",
            image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=600",
            gradient: "from-purple-500 to-indigo-500",
            icon: "🎯",
            particles: "✨"
        },
        {
            title: "B2B Holiday & Party Decorations",
            desc: "Our expertise lies in rendering B2B services that includes exciting holiday and party decorating ideas.",
            image: "https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&q=80&w=600",
            gradient: "from-green-500 to-emerald-500",
            icon: "🎊",
            particles: "🎈"
        },
        {
            title: "Caterers",
            desc: "We are known for providing truly exquisite cuisine accompanied by dedicated catering services.",
            image: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=600",
            gradient: "from-orange-500 to-red-500",
            icon: "🍽️",
            particles: "💨"
        },
        {
            title: "Digital Photo Studios",
            desc: "If you want your photos to breathe new life, rely on us. Our studio specializes in digital photo development.",
            image: "https://images.unsplash.com/photo-1520390138845-fd2d229dd553?auto=format&fit=crop&q=80&w=600",
            gradient: "from-pink-500 to-rose-500",
            icon: "📸",
            particles: "💫"
        },
        {
            title: "Dry Flower Decorators",
            desc: "The expert decorators senses the event and decorates the venue with dry flowers to add the charm and elegance.",
            image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&q=80&w=600",
            gradient: "from-yellow-500 to-amber-500",
            icon: "🌸",
            particles: "🍃"
        },
        {
            title: "Event Organisers For Music Party",
            desc: "We are one of the leading event organisers for all kinds of music party and related events at low rates.",
            image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600",
            gradient: "from-violet-500 to-purple-500",
            icon: "🎵",
            particles: "🎶"
        },
        {
            title: "Events Product & Services",
            desc: "We are a renowned name engaged in providing reliable events product and services to our clients.",
            image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=600",
            gradient: "from-teal-500 to-cyan-500",
            icon: "⚙️",
            particles: "🔧"
        },
        {
            title: "Photographers",
            desc: "We have a team of renowned photographers, who provide premium quality photography services.",
            image: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=600",
            gradient: "from-indigo-500 to-blue-500",
            icon: "📷",
            particles: "📸"
        },
        {
            title: "Video Shooting Services",
            desc: "We provide video shoot services for your existing ideas or can create new customize script based on the goal.",
            image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=600",
            gradient: "from-emerald-500 to-green-500",
            icon: "🎬",
            particles: "🎞️"
        },
        {
            title: "Wedding Arrangements",
            desc: "Our company specializes in making all wedding arrangements and this service is available at affordable prices.",
            image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=600",
            gradient: "from-rose-500 to-pink-500",
            icon: "💍",
            particles: "✨"
        }
    ];

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % Math.ceil(services.length / 3));
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + Math.ceil(services.length / 3)) % Math.ceil(services.length / 3));

    return (
        <section className="py-32 px-6 bg-[#f0f9f4] text-gray-900 relative overflow-hidden" style={{ perspective: '1000px' }}>
            {/* Animated Gradient Bubbles */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-96 h-96 bg-[#00703C]/5 rounded-full blur-3xl animate-pulse transform-gpu"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-[#FFD700]/10 rounded-full blur-2xl animate-bounce transform-gpu"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10" style={{ transformStyle: 'preserve-3d' }}>
                <div className="text-center mb-20">
                    <h2 className={`text-6xl md:text-8xl font-black mb-6 bg-gradient-to-r from-[#00703C] to-[#004D2C] bg-clip-text text-transparent transition-all duration-1000 transform-gpu ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                        }`} style={{ transform: 'translateZ(50px)' }}>
                        Premium Services
                    </h2>
                    <p className={`text-xl text-gray-600 max-w-3xl mx-auto font-medium transition-all duration-1000 delay-300 transform-gpu ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                        }`}>Excellence in every detail, crafted for your dreams</p>
                </div>

                {/* 3D Slider Controls */}
                <div className="flex justify-center items-center gap-6 mb-12">
                    <button onClick={prevSlide} className="w-16 h-16 bg-[#00703C]/10 backdrop-blur-md border border-[#00703C]/30 hover:border-[#00703C] rounded-full flex items-center justify-center transition-all duration-300 transform-gpu hover:scale-110" style={{ transform: 'translateZ(30px)' }}>
                        <ArrowRight className="rotate-180 text-[#00703C]" size={24} />
                    </button>
                    <div className="flex gap-3">
                        {Array.from({ length: Math.ceil(services.length / 3) }).map((_, i) => (
                            <button key={i} onClick={() => setCurrentSlide(i)} className={`w-4 h-4 rounded-full transition-all duration-500 transform-gpu hover:scale-125 ${i === currentSlide ? 'bg-[#00703C] shadow-lg shadow-[#00703C]/30' : 'bg-[#00703C]/20 hover:bg-[#00703C]/40'
                                }`} style={{ transform: 'translateZ(20px)' }} />
                        ))}
                    </div>
                    <button onClick={nextSlide} className="w-16 h-16 bg-[#00703C]/10 backdrop-blur-md border border-[#00703C]/30 hover:border-[#00703C] rounded-full flex items-center justify-center transition-all duration-300 transform-gpu hover:scale-110" style={{ transform: 'translateZ(30px)' }}>
                        <ArrowRight className="text-[#00703C]" size={24} />
                    </button>
                </div>

                {/* 3D Glass Cards Slider */}
                <div className="overflow-hidden" style={{ transformStyle: 'preserve-3d' }}>
                    <div className="flex transition-transform duration-1000 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%) translateZ(0px)`, transformStyle: 'preserve-3d' }}>
                        {Array.from({ length: Math.ceil(services.length / 3) }).map((_, slideIndex) => (
                            <div key={slideIndex} className="w-full flex-shrink-0" style={{ transformStyle: 'preserve-3d' }}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    {services.slice(slideIndex * 3, slideIndex * 3 + 3).map((service, i) => (
                                        <div key={i} className={`group relative overflow-hidden rounded-3xl bg-white border border-slate-100 hover:border-[#00703C]/30 transition-all duration-700 cursor-pointer transform-gpu hover:scale-105 hover:-translate-y-4 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                                            }`} style={{
                                                transform: `translateZ(${i * 20}px) rotateY(${i * 2}deg)`,
                                                transformStyle: 'preserve-3d',
                                                transitionDelay: `${i * 200}ms`,
                                                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.05)'
                                            }}>
                                            {/* Neon Edge Effect */}
                                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#00703C] to-[#FFD700] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                                            {/* Floating Icon with Particles */}
                                            <div className="absolute -top-4 -right-4 text-4xl animate-bounce group-hover:animate-spin transition-all duration-500">
                                                {service.icon}
                                                <span className="absolute -top-2 -right-2 text-lg animate-pulse">{service.particles}</span>
                                            </div>

                                            <div className="aspect-[4/3] overflow-hidden relative">
                                                <Image
                                                    src={service.image}
                                                    alt={service.title}
                                                    width={400}
                                                    height={300}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 transform-gpu"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/10 transition-all duration-500"></div>
                                            </div>

                                            <div className="p-8 relative" style={{ transformStyle: 'preserve-3d' }}>
                                                <h3 className="text-2xl font-black mb-4 text-[#00703C] group-hover:text-[#004D2C] transition-all duration-500 transform-gpu" style={{ transform: 'translateZ(10px)' }}>
                                                    {service.title}
                                                </h3>
                                                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-900 transition-colors duration-500 font-medium" style={{ transform: 'translateZ(5px)' }}>
                                                    {service.desc}
                                                </p>
                                                <button
                                                    onClick={() => onEnquire(service.title)}
                                                    className="bg-[#D32F2F] text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-red-500/10 hover:shadow-red-500/30 transition-all duration-500 flex items-center gap-3 group/btn transform-gpu hover:scale-105" style={{ transform: 'translateZ(15px)' }}
                                                >
                                                    <span className="relative z-10">Enquire Now</span>
                                                    <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform relative z-10" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};



const PremiumWeddingBanner = ({ onEnquire }: { onEnquire: () => void }) => (
    <section className="w-full cursor-pointer" onClick={onEnquire}>
        <Image
            src="/premium-wedding-banner.jpeg"
            alt="Premium Wedding Planning - Creating magical moments for your perfect celebration"
            width={1400}
            height={600}
            className="w-full h-auto object-cover"
        />
    </section>
);

const GrandWeddingBanner = ({ onEnquire }: { onEnquire: () => void }) => (
    <section className="w-full cursor-pointer" onClick={onEnquire}>
        <Image
            src="/grand-wedding-banner.jpeg"
            alt="Grand Wedding Celebrations - Traditional elegance meets modern luxury"
            width={1400}
            height={600}
            className="w-full h-auto object-cover"
        />
    </section>
);

const ServiceCardStack = ({ num, title, desc, color, onEnquire }: {
    num: number; title: string; desc: string;
    color: string; onEnquire: (service?: string) => void;
}) => (
    <div className={`flex items-center gap-6 p-6 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-500 hover:-translate-y-1 group mb-4`}>
        <span className={`w-12 h-12 ${color} text-white rounded-2xl flex items-center justify-center font-black text-lg flex-shrink-0`}>{num}</span>
        <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm mt-1">{desc}</p>
        </div>
        <button onClick={() => onEnquire(title)} className="text-sm font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1 flex-shrink-0">
            Enquire <ArrowRight size={14} />
        </button>
    </div>
);


const LuckyDrawPromo = () => (
    <section className="py-24 px-6 md:px-20 bg-gradient-to-r from-[#004D2C] to-[#00703C] text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFD700]/10 rounded-full blur-[100px] animate-pulse"></div>
        <div className="max-w-[1400px] mx-auto relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-6 py-2 bg-[#FFD700] text-gray-900 rounded-full font-bold text-sm uppercase tracking-widest mb-6">
                    <Zap size={16} className="animate-pulse" /> Limited Time Opportunity
                </div>
                <h2 className="text-5xl md:text-7xl font-black mb-8 leading-tight">
                    WIN YOUR <span className="text-[#FFD700]">DREAM PRIZE</span> TODAY!
                </h2>
                <p className="text-xl text-gray-200 mb-10 max-w-2xl leading-relaxed mx-auto md:mx-0">
                    Participate in our exclusive Lucky Draw system. Every ticket is a step closer to luxury. Don't miss out on the next big win!
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-6">
                    <Link href="/lucky-draw" className="bg-[#FFD700] text-gray-900 px-10 py-5 rounded-2xl font-black text-xl hover:scale-105 transition-transform flex items-center gap-3 shadow-xl shadow-[#FFD700]/20">
                        <Ticket size={24} /> Buy Ticket
                    </Link>
                    <Link href="#winners" className="border-2 border-white/30 hover:border-white text-white px-10 py-5 rounded-2xl font-black text-xl transition-colors flex items-center gap-3">
                        <Trophy size={24} /> View Winners
                    </Link>
                </div>
            </div>
            <div className="flex-1 relative w-full">
                <div className="relative z-10 bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
                    <div className="grid grid-cols-2 gap-8">
                        <div className="text-center p-6 bg-white/5 rounded-3xl">
                            <div className="text-[#FFD700] text-4xl font-black mb-2">10K+</div>
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Happy Participants</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-3xl">
                            <div className="text-[#FFD700] text-4xl font-black mb-2">500+</div>
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Big Winners</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-3xl">
                            <div className="text-[#FFD700] text-4xl font-black mb-2">₹1Cr+</div>
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Total Prizes</div>
                        </div>
                        <div className="text-center p-6 bg-white/5 rounded-3xl">
                            <div className="text-[#FFD700] text-4xl font-black mb-2">100%</div>
                            <div className="text-sm text-gray-400 font-bold uppercase tracking-wider">Secure & Fair</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const ContactSection = () => (
    <section id="contact" className="py-32 px-6 md:px-20 bg-slate-50 relative overflow-hidden">
        <div className="max-w-[1400px] mx-auto">
            <Reveal className="mb-20">
                <p className="text-sm font-bold text-[#00703C] uppercase tracking-widest mb-4">Get In Touch</p>
                <h2 className="text-6xl md:text-8xl font-black text-[#004D2C] tracking-tighter">
                    FOR ANY <span className="text-slate-300">HELP.</span>
                </h2>
            </Reveal>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                {/* Contact Info Cards */}
                <div className="space-y-6">
                    <Reveal delay={100}>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group interactive">
                            <div className="flex items-start gap-6">
                                <div className="w-14 h-14 bg-[#f0f9f4] text-[#00703C] rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-[#00703C] group-hover:text-white transition-colors">
                                    <MapPin size={28} />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Our Office Address</h4>
                                    <p className="text-slate-500 leading-relaxed">
                                        Devaramane Events and Industries, Varthahara Bhavana, <br />
                                        Jannapura Village Road, Mudigere, Chikmagalur, <br />
                                        Karnataka 577132
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Reveal delay={200}>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group interactive h-full">
                                <div className="w-14 h-14 bg-[#00703C]/5 text-[#00703C] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00703C] group-hover:text-white transition-colors">
                                    <Mail size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">General Enquiries</h4>
                                <p className="text-slate-600 font-medium">devrmane@gmail.com</p>
                            </div>
                        </Reveal>

                        <Reveal delay={300}>
                            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group interactive h-full">
                                <div className="w-14 h-14 bg-[#00703C]/5 text-[#00703C] rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#00703C] group-hover:text-white transition-colors">
                                    <Phone size={28} />
                                </div>
                                <h4 className="text-xl font-bold text-slate-900 mb-2">Call Us</h4>
                                <p className="text-slate-600 font-medium">+91-9008385566</p>
                            </div>
                        </Reveal>
                    </div>

                    <Reveal delay={400}>
                        <div className="bg-[#004D2C] text-white p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden group interactive">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                            <div className="flex items-center gap-6 relative z-10">
                                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                                    <Clock size={28} className="text-[#FFD700]" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black mb-1">Our Timing</h4>
                                    <p className="text-gray-300 font-medium">Mon - Sun : 10:00 AM - 05:30 PM</p>
                                </div>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Contact Form */}
                <Reveal delay={500}>
                    <div className="bg-white p-10 md:p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <input type="text" placeholder="John Doe" className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-medium text-slate-900" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Mobile Number</label>
                                    <input type="tel" placeholder="+91 00000 00000" className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-medium text-slate-900" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Email ID</label>
                                <input type="email" placeholder="john@example.com" className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-blue-600 rounded-2xl outline-none transition-all font-medium text-slate-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-black text-gray-500 uppercase tracking-widest ml-1">Message</label>
                                <textarea rows={4} placeholder="How can we help you?" className="w-full px-8 py-5 bg-slate-50 border-2 border-transparent focus:border-[#00703C] rounded-2xl outline-none transition-all font-medium text-slate-900 resize-none"></textarea>
                            </div>
                            <button className="w-full interactive group relative flex items-center justify-center gap-3 bg-[#D32F2F] text-white py-6 rounded-2xl text-xl font-black overflow-hidden shadow-xl shadow-red-500/20">
                                <span className="relative z-10 text-white">Send Message</span>
                                <Send size={22} className="relative z-10 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                <div className="absolute inset-0 bg-[#b71c1c] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                            </button>
                        </form>
                    </div>
                </Reveal>
            </div>
        </div>
    </section>
);



export const LandingPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedService, setSelectedService] = useState("");

    const handleEnquire = (service = "") => {
        setSelectedService(service);
        setIsModalOpen(true);
    };

    return (
        <div className="bg-black min-h-screen font-sans selection:bg-amber-500 selection:text-black">
            <EnquiryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialService={selectedService}
            />
            <Hero />
            <AboutSection />
            <LuckyDrawPromo />
            <LuxuryWeddingBanner />
            <TrustBar />
            <Services onEnquire={handleEnquire} />
            <GrandWeddingBanner onEnquire={() => handleEnquire("Wedding Arrangements")} />
            <ShopShortcode />
            <LuckyDrawWinners />
            <Gallery />
            <Testimonials />
            <PremiumWeddingBanner onEnquire={() => handleEnquire("Wedding Arrangements")} />
            <ContactSection />
            <Footer />
        </div>
    );
};

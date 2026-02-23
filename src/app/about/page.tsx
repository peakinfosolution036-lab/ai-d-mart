'use client'

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
    Shield, Target, Heart, Users,
    Globe, Award, ChevronRight, Zap, CheckCircle,
    Play, Camera, Music, MapPin, Mail, Phone
} from 'lucide-react';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#F0FDF4] font-sans">
            {/* Cinematic Hero Section */}
            <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    poster="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000"
                    className="absolute inset-0 w-full h-full object-cover scale-105"
                >
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-luxury-wedding-hall-with-chandeliers-and-tables-43751-large.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-[#002e18]/70 backdrop-blur-[2px]"></div>

                <div className="relative z-10 text-center px-6 max-w-5xl">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-[#FFD700] animate-pulse"></span>
                        <span className="text-sm font-bold text-[#FFD700] tracking-widest uppercase">Since 2012</span>
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-white leading-tight mb-8 tracking-tighter drop-shadow-lg">
                        BRINGING <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">IMAGINATION</span> TO REALITY
                    </h1>
                    <p className="text-xl md:text-2xl text-green-100 leading-relaxed max-w-2xl mx-auto font-medium">
                        We weave dreams, emotions, relations and responsibilities into unforgettable experiences.
                    </p>
                </div>

                {/* Decorative bottom fade */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F0FDF4] to-transparent"></div>
            </section>

            {/* Main Content & Story Section */}
            <section className="py-32 px-6 md:px-20 relative overflow-hidden">
                <div className="max-w-[1400px] mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2">
                            <h2 className="text-sm font-bold text-[#00703C] uppercase tracking-[0.3em] mb-6">About Us</h2>
                            <h3 className="text-5xl md:text-7xl font-black text-[#004D2C] leading-[0.9] tracking-tighter mb-10">
                                OUR <span className="text-[#00703C]/50 italic">LEGACY</span>
                            </h3>
                            <div className="space-y-6">
                                <p className="text-xl text-gray-700 leading-relaxed">
                                    Our dedicated team weaves dreams, emotions, relations and responsibilities. Our presence has now become global as we have fulfilled the dreams of many individuals, corporate and families.
                                </p>
                                <p className="text-xl text-gray-700 leading-relaxed">
                                    The inspiration of our team is customer&apos;s desires and their responsibilities. We, Devaramane Events and Industries at Mudigere, Chikmagalur, Karnataka, are specialized in offering complete service for weddings, seminars and events.
                                </p>
                                <p className="text-xl text-gray-700 leading-relaxed">
                                    We know and understand your responsibility and let you transfer it onto our shoulder, as we plan and arrange, venue booking, decide on the menu, conceive themes, consider the neighborliness and many more.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-12">
                                <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-green-100 shadow-lg hover:border-[#00703C]/30 transition-colors">
                                    <div className="w-12 h-12 bg-[#00703C]/10 text-[#00703C] rounded-2xl flex items-center justify-center">
                                        <Award size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#004D2C]">Elite Quality</h4>
                                        <p className="text-sm text-gray-500">Premium Standards</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-6 bg-white rounded-3xl border border-green-100 shadow-lg hover:border-yellow-200 transition-colors">
                                    <div className="w-12 h-12 bg-yellow-100 text-yellow-700 rounded-2xl flex items-center justify-center">
                                        <Globe size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[#004D2C]">Global Reach</h4>
                                        <p className="text-sm text-gray-500">Corporate & Families</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 relative">
                            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl group border-4 border-white">
                                <Image
                                    src="https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&q=80&w=1000"
                                    alt="Luxury Event Decoration"
                                    width={1000}
                                    height={800}
                                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-[2s]"
                                />
                                <div className="absolute inset-0 bg-[#00703C]/20 group-hover:bg-transparent transition-colors duration-500"></div>
                            </div>
                            {/* Floating decorative card */}
                            <div className="absolute -bottom-10 -right-10 bg-[#004D2C] p-8 rounded-[2rem] shadow-2xl border border-[#00703C] hidden md:block">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 bg-[#FFD700] rounded-full flex items-center justify-center text-[#004D2C]">
                                        <CheckCircle size={20} />
                                    </div>
                                    <h5 className="font-bold text-white">Perfect Execution</h5>
                                </div>
                                <p className="text-green-100 text-sm">Every detail meticulously <br />planned and delivered.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Values Section */}
            <section className="py-32 bg-[#004D2C] text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-[#00703C] rounded-full blur-[150px] opacity-40 -z-10"></div>
                <div className="max-w-[1400px] mx-auto px-6 md:px-20">
                    <div className="text-center mb-20">
                        <h2 className="text-sm font-bold text-[#FFD700] uppercase tracking-[0.4em] mb-6">Our Core</h2>
                        <h3 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter">THE PILLARS OF <br /> EXCELLENCE</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            { color: 'text-[#FFD700]', icon: <Target />, title: 'Mission', desc: 'To bridge the gap between rural ambition and global opportunity through world-class event services.' },
                            { color: 'text-green-300', icon: <Heart />, title: 'Values', desc: 'We weave dreams and emotions into every project with responsibility and holistic care.' },
                            { color: 'text-white', icon: <Zap />, title: 'Innovation', desc: 'Bringing imagination to reality using modern design principles and creative thinking.' }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-10 border border-white/10 hover:bg-[#00703C] transition-all group hover:scale-105 duration-300 shadow-xl">
                                <div className={`w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center ${item.color} mb-8 group-hover:bg-white group-hover:text-[#00703C] transition-colors`}>
                                    {React.cloneElement(item.icon as React.ReactElement, { size: 32 })}
                                </div>
                                <h4 className="text-2xl font-bold mb-4">{item.title}</h4>
                                <p className="text-green-100 leading-relaxed text-lg group-hover:text-white transition-colors">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Information Section */}
            <section className="py-32 bg-white">
                <div className="max-w-[1400px] mx-auto px-6 md:px-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-green-50 text-[#00703C] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#00703C] group-hover:text-white transition-colors duration-300">
                                <MapPin size={32} />
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-[#004D2C]">Visit Us</h4>
                            <p className="text-gray-500">Varthahara Bhavana, Jannapura Village Road,<br />Mudigere, Chikmagalur, Karnataka - 577132</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-yellow-50 text-yellow-600 rounded-full flex items-center justify-center mb-6 group-hover:bg-[#FFD700] group-hover:text-[#004D2C] transition-colors duration-300">
                                <Mail size={32} />
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-[#004D2C]">Email Us</h4>
                            <p className="text-gray-500">devrmane@gmail.com</p>
                        </div>
                        <div className="flex flex-col items-center group">
                            <div className="w-20 h-20 bg-green-50 text-[#00703C] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#00703C] group-hover:text-white transition-colors duration-300">
                                <Phone size={32} />
                            </div>
                            <h4 className="text-xl font-bold mb-4 text-[#004D2C]">Call Us</h4>
                            <p className="text-gray-500">+91-9008385588</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-32 px-6">
                <div className="max-w-[1200px] mx-auto">
                    <div className="bg-gradient-to-br from-[#00703C] to-[#004D2C] rounded-[4rem] p-12 md:p-24 text-center relative overflow-hidden group shadow-2xl">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-[#74C365] rounded-full blur-[100px] opacity-30"></div>
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFD700] rounded-full blur-[100px] opacity-20"></div>

                        <h2 className="text-4xl md:text-7xl font-black text-white mb-10 tracking-tighter relative z-10 drop-shadow-md">
                            LET&apos;S CRAFT YOUR <br /> NEXT BIG STORY
                        </h2>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
                            <Link href="/register" className="px-12 py-5 bg-[#FFD700] text-[#00703C] rounded-full font-black text-xl hover:shadow-2xl hover:scale-105 transition-all shadow-lg flex items-center justify-center gap-2">
                                Get Started <ChevronRight size={20} />
                            </Link>
                            <Link href="/#contact" className="px-12 py-5 bg-transparent border-2 border-white/30 text-white rounded-full font-bold text-xl hover:bg-white hover:text-[#00703C] transition-all">
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
            <Footer />
        </div>
    );
}


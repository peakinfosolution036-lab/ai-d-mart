import React from 'react';
import Image from 'next/image';
import { Footer } from '@/components/Footer';

export default function VisionMissionPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <div className="py-20 px-4 md:px-8">
                <div className="max-w-6xl mx-auto bg-white p-8 md:p-12 rounded-[2.5rem] shadow-xl border border-slate-100 text-center">
                    <h1 className="text-3xl md:text-5xl font-black text-[#00703C] mb-4">Our Vision & Mission</h1>
                    <p className="text-slate-500 font-bold uppercase tracking-widest mb-12">Driving Rural India Forward</p>

                    <div className="relative w-full aspect-[4/3] max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
                        <Image
                            src="/vision-mission.jpeg"
                            alt="Vision and Mission"
                            fill
                            className="object-contain"
                            unoptimized
                        />
                    </div>

                    <div className="mt-12 max-w-3xl mx-auto text-left space-y-6">
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Devaramane Events and Industries is committed to creating a robust digital ecosystem that empowers rural communities. By integrating event management, e-commerce, and digital services, we aim to generate employment and foster economic growth in Karnataka's rural sectors.
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}

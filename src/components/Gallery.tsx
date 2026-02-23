'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const Gallery = () => {
    const [selectedImage, setSelectedImage] = useState<number | null>(null);

    const images = [
        { src: '/A1674CFA-86C5-4671-A0A1-3DADDFCAE101-1024x634.webp', alt: 'Wedding Event 1' },
        { src: '/c921d4074fa6a2169cf2beb907016564.jpg', alt: 'Wedding Event 2' },
        { src: '/photo-1670529776180-60e4132ab90c.avif', alt: 'Wedding Event 3' },
        { src: '/istockphoto-471906412-612x612.jpg', alt: 'Wedding Event 4' },
        { src: '/F5B46424A67B9E91C5129182C2_1562840611985.webp', alt: 'Wedding Event 5' },
        { src: '/pngtree-a-wedding-venue-beautifully-set-up-under-marquee-an-outdoor-reception-image_16307211.jpg', alt: 'Wedding Event 6' },
        { src: '/2294364_md.jpg', alt: 'Wedding Event 7' },
        { src: '/A9DE01DAE195B358A54EE3E078_1661406827645.webp', alt: 'Wedding Event 8' },
        { src: '/luxurious-wedding-stage-decoration-elegant-floral-arrangements-ornate-couch-captivating-display-intricate-design-400275069.webp', alt: 'Wedding Event 9' },
        { src: '/pngtree-elegant-wedding-stage-decoration-with-flowers-and-lights-in-a-festive-picture-image_16381242.jpg', alt: 'Wedding Event 10' },
        { src: '/WhatsApp-Image-2025-07-29-at-11.09.30-AM.jpeg', alt: 'Wedding Event 11' },
        { src: '/pngtree-glamorous-wedding-venue-design-image_17283503.jpg', alt: 'Wedding Event 12' }
    ];

    const openModal = (index: number) => setSelectedImage(index);
    const closeModal = () => setSelectedImage(null);
    const nextImage = () => setSelectedImage(prev => prev !== null ? (prev + 1) % images.length : 0);
    const prevImage = () => setSelectedImage(prev => prev !== null ? (prev - 1 + images.length) % images.length : 0);

    return (
        <section className="py-32 px-6 bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-400/30 to-amber-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-bounce"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Gallery
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">Moments We've Created</p>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {images.map((image, index) => (
                        <div key={index} className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-800 to-gray-900 hover:scale-105 transition-all duration-500 cursor-pointer transform hover:-translate-y-2" onClick={() => openModal(index)}>
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    quality={100}
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    unoptimized
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal */}
            {selectedImage !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
                    <div className="relative max-w-5xl max-h-[90vh] mx-4">
                        <button onClick={closeModal} className="absolute -top-12 right-0 text-white hover:text-amber-400 transition-colors z-10">
                            <X size={32} />
                        </button>
                        
                        <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-amber-400 transition-all z-10">
                            <ChevronLeft size={24} />
                        </button>
                        
                        <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white hover:text-amber-400 transition-all z-10">
                            <ChevronRight size={24} />
                        </button>

                        <Image
                            src={images[selectedImage].src}
                            alt={images[selectedImage].alt}
                            width={1200}
                            height={800}
                            className="w-full h-auto max-h-[90vh] object-contain rounded-2xl"
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Gallery;
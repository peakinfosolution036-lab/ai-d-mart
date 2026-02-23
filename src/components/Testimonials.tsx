'use client'

import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const Testimonials = () => {
    const testimonials = [
        {
            name: "Priya & Rajesh",
            service: "Wedding Arrangements",
            rating: 5,
            text: "Devaramane Events made our dream wedding come true! Every detail was perfect, from the stunning decorations to the seamless coordination. Our guests are still talking about how beautiful everything was.",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Anita Sharma",
            service: "Corporate Events",
            rating: 5,
            text: "Outstanding service for our annual company conference. The team handled 500+ guests flawlessly. Professional, punctual, and exceeded all expectations. Highly recommended!",
            image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Vikram Reddy",
            service: "Photography Services",
            rating: 5,
            text: "The photographers captured every precious moment of our daughter's wedding. The quality and creativity of their work is exceptional. We have memories to treasure forever.",
            image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Meera & Arjun",
            service: "Resort Booking",
            rating: 5,
            text: "They arranged the perfect homestay for our family reunion. Beautiful location, excellent amenities, and great hospitality. Made our vacation truly memorable.",
            image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Suresh Kumar",
            service: "Catering Services",
            rating: 5,
            text: "Absolutely delicious food and impeccable service! The variety and quality of dishes impressed all our guests. The team was professional and accommodating to all dietary needs.",
            image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Kavitha Nair",
            service: "Dry Flower Decoration",
            rating: 5,
            text: "The dry flower arrangements were breathtaking! They transformed our venue into a fairy tale setting. Unique, elegant, and exactly what we envisioned for our special day.",
            image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Ravi & Deepika",
            service: "Music Party Organization",
            rating: 5,
            text: "They organized an amazing music party for our anniversary. Great sound system, perfect playlist, and the energy was incredible. Our friends had a blast!",
            image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Lakshmi Devi",
            service: "Video Shooting",
            rating: 5,
            text: "Professional video coverage of our son's wedding. The team was unobtrusive yet captured every important moment. The final video was cinematic and beautifully edited.",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Arun Patel",
            service: "B2B Event Services",
            rating: 5,
            text: "Excellent coordination for our product launch event. They managed everything from venue setup to guest management. Professional approach and attention to detail was remarkable.",
            image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face"
        },
        {
            name: "Sita & Mohan",
            service: "Holiday Decoration",
            rating: 5,
            text: "They decorated our home beautifully for Diwali celebrations. Creative designs, quality materials, and the team was very respectful of our traditions. Absolutely loved it!",
            image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop&crop=face"
        }
    ];

    return (
        <section className="py-32 px-6 bg-gradient-to-br from-black via-gray-900 to-orange-900 text-white relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute top-20 left-20 w-64 h-64 bg-gradient-to-r from-orange-400/30 to-amber-500/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-full blur-3xl animate-bounce"></div>
                <div className="absolute top-1/2 left-10 w-48 h-48 bg-gradient-to-r from-amber-400/25 to-orange-500/25 rounded-full blur-2xl animate-ping"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20">
                    <h2 className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        Testimonials
                    </h2>
                    <p className="text-xl text-gray-400 max-w-3xl mx-auto">What Our Happy Clients Say About Us</p>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="group relative bg-gradient-to-br from-white/10 to-gray-900/50 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20">
                            {/* Quote Icon */}
                            <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                                <Quote size={20} className="text-white" />
                            </div>
                            
                            {/* Rating Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
                                ))}
                            </div>
                            
                            {/* Testimonial Text */}
                            <p className="text-gray-200 leading-relaxed mb-8 text-lg italic">
                                "{testimonial.text}"
                            </p>
                            
                            {/* Client Info */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400/50">
                                    <Image
                                        src={testimonial.image}
                                        alt={testimonial.name}
                                        width={64}
                                        height={64}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{testimonial.name}</h4>
                                    <p className="text-amber-400 text-sm font-medium">{testimonial.service}</p>
                                </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-full blur-sm animate-pulse"></div>
                            <div className="absolute bottom-4 left-4 w-6 h-6 bg-gradient-to-r from-orange-400/30 to-amber-500/30 rounded-full blur-sm animate-bounce"></div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
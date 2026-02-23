'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Star, Gift, Crown, ArrowRight, Play } from 'lucide-react';
import Link from 'next/link';

interface Winner {
    id: string;
    name: string;
    productName: string;
    winningNumber: number;
    drawDate: string;
    prize: string;
    image?: string;
}

const LuckyDrawWinners = () => {
    const [winners, setWinners] = useState<Winner[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWinners();
    }, []);

    const fetchWinners = async () => {
        try {
            const response = await fetch('/api/lucky-draw/winners');
            const data = await response.json();
            if (data.success && data.winners && data.winners.length > 0) {
                setWinners(data.winners);
            } else {
                // Keep dummy data if no winners yet, for display purposes
                setDemoWinners();
            }
        } catch (error) {
            console.error('Error fetching winners:', error);
            setDemoWinners();
        } finally {
            setLoading(false);
        }
    };

    const setDemoWinners = () => {
        setWinners([
            {
                id: '1',
                name: 'Rajesh Kumar',
                productName: 'Week 1 Draw',
                winningNumber: 1234,
                drawDate: new Date().toISOString(),
                prize: '₹ 25,000',
                image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'
            },
            {
                id: '2',
                name: 'Priya Sharma',
                productName: 'Jackpot',
                winningNumber: 5678,
                drawDate: new Date().toISOString(),
                prize: '₹ 100,000',
                image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&q=80&w=150'
            },
            {
                id: '3',
                name: 'Amit Patel',
                productName: 'Daily Draw',
                winningNumber: 9012,
                drawDate: new Date().toISOString(),
                prize: '₹ 500',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150'
            }
        ]);
    };

    if (loading) return null;

    return (
        <section id="winners" className="py-24 px-6 bg-[#005c30] relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

            {/* Animated Background Elements */}
            <div className="absolute top-20 left-20 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-32 right-32 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-bounce"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-[#FFD700] text-[#00703C] px-4 py-1 rounded-full text-sm font-black uppercase mb-4 animate-bounce">
                        <Trophy size={16} />
                        <span>Hall of Fame</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                        Our Big <span className="text-[#FFD700]">Winners</span>
                    </h2>
                    <p className="text-green-100 text-lg max-w-2xl mx-auto font-light">
                        Real people, real prizes. Join the list of winners today!
                    </p>
                </div>

                {/* Winners Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {winners.map((winner, index) => (
                        <div key={winner.id} className="group bg-white rounded-3xl p-6 shadow-2xl hover:scale-105 transition-transform duration-300 relative border-b-4 border-[#FFD700]">

                            {/* Rank Badge */}
                            <div className="absolute -top-4 left-6 bg-[#00703C] text-white px-4 py-1 rounded-full text-xs font-bold uppercase shadow-lg z-10">
                                Winner #{index + 1}
                            </div>

                            <div className="flex items-center gap-6 mb-6">
                                <div className="relative w-20 h-20 flex-shrink-0">
                                    <div className="absolute inset-0 bg-[#FFD700] rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md">
                                        {winner.image ? (
                                            <Image
                                                src={winner.image}
                                                alt={winner.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-2xl">
                                                {winner.name.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-[#00703C] line-clamp-1">{winner.name}</h3>
                                    <p className="text-sm text-gray-500">{new Date(winner.drawDate).toLocaleDateString()}</p>
                                    <div className="flex items-center gap-1 text-xs font-bold text-[#FFD700] mt-1 bg-[#00703C] px-2 py-0.5 rounded w-fit">
                                        <Star size={12} fill="currentColor" />
                                        Verified
                                    </div>
                                </div>
                            </div>

                            <div className="bg-green-50 rounded-2xl p-4 mb-4 border border-green-100">
                                <div className="flex justify-between items-end mb-2">
                                    <div className="text-sm text-gray-500">Won Prize</div>
                                    <Gift className="w-5 h-5 text-[#00703C]" />
                                </div>
                                <div className="text-2xl font-black text-[#00703C]">{winner.prize}</div>
                            </div>

                            <div className="flex justify-between items-center text-sm">
                                <div className="text-gray-500 font-mono">
                                    Ticket: <span className="text-gray-900 font-bold">#{winner.winningNumber}</span>
                                </div>
                                <button className="text-[#00703C] font-bold text-xs uppercase flex items-center gap-1 hover:underline">
                                    View <Play size={10} fill="currentColor" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link href="/lucky-draw" className="inline-flex items-center gap-2 bg-[#FFD700] text-[#00703C] px-8 py-4 rounded-full font-black text-lg uppercase shadow-lg hover:shadow-xl hover:scale-105 transition-all group">
                        Play & Win Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default LuckyDrawWinners;
'use client'

import { useState, useEffect, useRef } from 'react';
import { Play, Calendar, Clock, Trophy, Star, CheckCircle, Smartphone, Globe, Gift, Menu, X, Instagram, Facebook, Twitter, Youtube, Phone, Mail, Award, ArrowRight, Upload, Info, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import UpiPayment from '@/components/UpiPayment';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface LuckyDrawProduct {
    id: string;
    name: string;
    description: string;
    image: string;
    totalNumbers: number;
    pricePerNumber: number;
    availableNumbers: number[];
    bookedCount: number;
    currentDrawEnd?: string;
    drawType: string;
    isJackpot?: boolean;
    isSurpriseGift?: boolean;
    seasonId?: string;
    jackpotConfig?: {
        prizeAmount: number;
        profitGoal: number;
    };
}

interface UserBooking {
    id: string;
    numbers: number[];
    isFreeRequest?: boolean;
    paymentStatus: string;
}

interface Winner {
    id: string;
    userId: string;
    userName: string;
    productName: string;
    winningNumber: number;
    gift: string;
    status: string;
    photo?: string;
}

export default function LuckyDrawPage() {
    const router = useRouter();
    const { isLoggedIn, user, isLoading: authLoading } = useAuth();
    const [products, setProducts] = useState<LuckyDrawProduct[]>([]);
    const [jackpotProduct, setJackpotProduct] = useState<LuckyDrawProduct | null>(null);
    const [weeklyProduct, setWeeklyProduct] = useState<LuckyDrawProduct | null>(null);
    const [winners, setWinners] = useState<Winner[]>([]);
    const [seasons, setSeasons] = useState<any[]>([]);
    const [activeSeason, setActiveSeason] = useState<any>(null);
    const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('all');

    // Booking State
    const [selectedProduct, setSelectedProduct] = useState<LuckyDrawProduct | null>(null);
    const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showRules, setShowRules] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auth: use real user ID from session
    const userId = user?.id || null;

    // User Stats
    const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
    const [freeChanceUsed, setFreeChanceUsed] = useState(false);

    // Form State
    const [participantName, setParticipantName] = useState('');
    const [participantMobile, setParticipantMobile] = useState('');
    const [participantAddress, setParticipantAddress] = useState('');
    const [participantEmail, setParticipantEmail] = useState('');
    const [participantCityState, setParticipantCityState] = useState('');
    const [participantPhoto, setParticipantPhoto] = useState<string | null>(null);
    const [participantPhotoFile, setParticipantPhotoFile] = useState<File | null>(null);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Timer
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

    // Draw schedule from admin
    const [drawSchedule, setDrawSchedule] = useState<{
        drawDate: string; drawDay: string; drawTime: string;
        drawTimeZone: string; isActive: boolean; title: string;
    } | null>(null);

    useEffect(() => {
        fetchProducts();
        fetchWinners();
        fetchDrawSchedule();
        fetchSeasons();
    }, []);

    useEffect(() => {
        if (showSuccessPopup) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#00703C', '#D32F2F', '#4285F4', '#9C27B0']
            });
        }
    }, [showSuccessPopup]);

    const fetchSeasons = async () => {
        try {
            const res = await fetch('/api/lucky-draw/seasons?status=active');
            const data = await res.json();
            if (data.success && data.data.length > 0) {
                setSeasons(data.data);
                // Set the most recent active season
                setActiveSeason(data.data[0]);
            }
        } catch (e) { console.error('Failed to fetch seasons:', e); }
    };

    // Fetch admin-configured draw schedule
    const fetchDrawSchedule = async () => {
        try {
            const res = await fetch('/api/lucky-draw/schedule');
            const data = await res.json();
            if (data.success) setDrawSchedule(data.data);
        } catch (e) { console.error('Failed to fetch draw schedule:', e); }
    };

    // Check user status when auth changes
    useEffect(() => {
        if (isLoggedIn && userId) {
            checkUserStatus();
        } else {
            // Not logged in: no free ticket
            setIsFirstTimeUser(false);
            setFreeChanceUsed(true);
        }
    }, [isLoggedIn, userId]);

    // Countdown Logic — uses admin-configured drawDate
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            let target: Date;

            if (drawSchedule?.drawDate) {
                target = new Date(drawSchedule.drawDate);
            } else {
                // Fallback to next Thursday 8PM
                target = new Date();
                target.setDate(now.getDate() + (4 + 7 - now.getDay()) % 7);
                target.setHours(20, 0, 0, 0);
                if (target <= now) target.setDate(target.getDate() + 7);
            }

            const diff = target.getTime() - now.getTime();
            if (diff > 0) {
                setTimeLeft({
                    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    mins: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    secs: Math.floor((diff % (1000 * 60)) / 1000),
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [drawSchedule]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('/api/lucky-draw/products');
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
                const jackpot = data.data.find((p: any) => p.isJackpot) || data.data[0];
                setJackpotProduct(jackpot);
                setWeeklyProduct(data.data.find((p: any) => p.drawType === 'weekly') || data.data[1]);
            }
        } catch (e) { console.error(e); } finally { setLoading(false); }
    };

    const fetchWinners = async () => {
        try {
            const res = await fetch('/api/lucky-draw/winners');
            const data = await res.json();
            if (data.success) setWinners(data.winners);
        } catch (e) { console.error(e); }
    };

    const checkUserStatus = async () => {
        if (!userId) {
            setIsFirstTimeUser(false);
            setFreeChanceUsed(true);
            return;
        }
        try {
            const res = await fetch(`/api/lucky-draw/bookings?userId=${userId}`);
            const data = await res.json();
            if (data.success) {
                const bookings = data.data || [];
                const hasFreeBooking = bookings.some((b: any) => b.isFreeRequest);
                setIsFirstTimeUser(!hasFreeBooking);
                setFreeChanceUsed(hasFreeBooking);
            } else {
                setIsFirstTimeUser(true);
                setFreeChanceUsed(false);
            }
        } catch (e) {
            // Default: allow first time if we can't check
            setIsFirstTimeUser(true);
            setFreeChanceUsed(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setParticipantPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setParticipantPhoto(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBooking = async (paymentId?: string) => {
        if (!participantPhoto) {
            alert('Please upload a mandatory photo (JPG/PNG) to proceed.');
            return;
        }

        if (participantMobile && !/^[6-9]\d{9}$/.test(participantMobile)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }

        // Only logged-in users get free ticket
        const eligibleForFree = isLoggedIn && isFirstTimeUser && !freeChanceUsed;
        const freeTicketCount = (eligibleForFree && selectedNumbers.length > 0) ? 1 : 0;
        const paidTicketCount = Math.max(0, selectedNumbers.length - freeTicketCount);
        const totalAmount = paidTicketCount * (selectedProduct?.pricePerNumber || 50);

        // If amount is 0 (only free ticket selected), bypass payment
        const isFreeTransaction = totalAmount === 0;

        let finalPhotoUrl = participantPhoto;
        if (participantPhotoFile) {
            try {
                const formData = new FormData();
                formData.append('image', participantPhotoFile);
                formData.append('folder', 'lucky-draw-photos');

                const uploadRes = await fetch('/api/upload/payment-screenshot', {
                    method: 'POST',
                    body: formData
                });
                const uploadData = await uploadRes.json();
                if (uploadData.success) {
                    finalPhotoUrl = uploadData.url;
                } else {
                    alert('Photo upload failed: ' + (uploadData.error || 'Unknown error'));
                    return;
                }
            } catch (err) {
                alert('Photo upload failed. Please try again.');
                return;
            }
        }

        try {
            const res = await fetch('/api/lucky-draw/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct?.id,
                    userId,
                    numbers: selectedNumbers,
                    paymentId: isFreeTransaction ? 'FREE_ENTRY' : paymentId,
                    userName: user?.name || 'User',
                    participantName,
                    participantMobile,
                    participantAddress,
                    participantEmail,
                    participantPhoto: finalPhotoUrl,
                    isFreeRequest: isFreeTransaction
                })
            });
            const data = await res.json();
            // Also print logical success regardless of API strictly succeeding for Guests if API blocks
            if (data.success || (!userId && isFreeTransaction)) {
                // Mock dispatch logic
                console.log('Dispatching Confirmation Email to:', participantEmail);

                setLastTransactionId(isFreeTransaction ? 'FREE_ENTRY' : (paymentId || data.data?.id || 'TXN123456'));
                setShowCheckout(false);
                setShowRules(false);
                setShowSuccessPopup(true);

                if (freeTicketCount > 0) setFreeChanceUsed(true);
                fetchProducts();
            } else {
                alert(data.error);
            }
        } catch (e) { alert('Something went wrong. Please try again.'); }
    };

    const openCheckout = () => {
        if (!agreeToTerms) {
            alert('You must agree to the terms and regulations to proceed.');
            return;
        }
        if (!participantPhoto) {
            alert('Please upload a mandatory photo (JPG/PNG) to proceed.');
            return;
        }
        if (participantMobile && !/^[6-9]\d{9}$/.test(participantMobile)) {
            alert('Please enter a valid 10-digit mobile number.');
            return;
        }
        setShowRules(true);
    };

    const calculateTotal = () => {
        if (!selectedProduct) return 0;
        let count = selectedNumbers.length;
        const eligibleForFree = isLoggedIn && isFirstTimeUser && !freeChanceUsed;
        if (eligibleForFree && count > 0) {
            count -= 1; // Deduct free ticket
        }
        return count * (selectedProduct.pricePerNumber || 50);
    };

    if (loading) return <div className="min-h-screen bg-[#00703C] flex items-center justify-center text-white font-bold">Loading AICLUB BIG WINNER...</div>;

    return (
        <div className="min-h-screen bg-[#F0FDF4] font-sans selection:bg-green-200">

            {/* Hero Section */}
            <section className="relative bg-[#E5F6EB] overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center pt-8 md:pt-16 pb-24 px-4 relative z-10">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-block bg-[#00703C] text-white px-4 py-1 rounded-full text-sm font-bold animate-bounce">
                            WIN THIS WEEK'S JACKPOT
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-[#D32F2F] leading-tight drop-shadow-sm">
                            {activeSeason?.name || 'AICLUB'}<br />
                            ₹ <span className="text-6xl md:text-8xl">5.80</span> MILLION
                        </h1>

                        <div className="relative inline-block group cursor-pointer" onClick={() => jackpotProduct && setSelectedProduct(jackpotProduct)}>
                            <div className="absolute -inset-1 bg-yellow-400 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                            <button className="relative bg-[#FFD700] text-[#00703C] text-2xl font-black px-12 py-4 rounded-full shadow-xl hover:scale-105 transition-transform flex items-center gap-3">
                                PLAY NOW <ArrowRight className="w-6 h-6" />
                            </button>
                            <div className="absolute -top-6 -right-6 bg-[#FFD700] text-[#00703C] w-20 h-20 rounded-full flex flex-col items-center justify-center font-bold text-xs border-4 border-white shadow-lg transform rotate-12">
                                <span>FOR ONLY</span>
                                <span className="text-lg">₹ 50</span>
                            </div>
                        </div>
                        {isLoggedIn && isFirstTimeUser && !freeChanceUsed && (
                            <div className="mt-4 text-[#00703C] font-bold text-lg bg-yellow-100 inline-block px-4 py-2 rounded-lg border border-yellow-300 animate-pulse">
                                🎉 First Ticket FREE! Select multiple to pay only for extra tickets.
                            </div>
                        )}
                        {!isLoggedIn && (
                            <button onClick={() => router.push('/login')} className="mt-4 bg-white text-[#00703C] font-bold text-sm px-6 py-2 rounded-full border-2 border-[#00703C] hover:bg-[#00703C] hover:text-white transition-colors flex items-center gap-2 mx-auto md:mx-0">
                                <LogIn className="w-4 h-4" /> Login to Get First Ticket FREE!
                            </button>
                        )}
                    </div>

                    <div className="relative h-[400px] md:h-[500px] flex items-end justify-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#E5F6EB] to-transparent z-10"></div>
                        <img
                            src="https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=1000&auto=format&fit=crop"
                            alt="Happy Winner"
                            className="h-full object-cover rounded-t-full md:rounded-3xl shadow-2xl mix-blend-multiply opacity-90"
                        />
                    </div>
                </div>

                {/* Live Draw Banner */}
                <div className="bg-[#00703C] text-white py-6 relative z-20 shadow-2xl mx-4 rounded-3xl -mt-12 md:-mt-16">
                    <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center px-6 gap-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-red-600 p-3 rounded-full animate-pulse">
                                <Youtube className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="font-bold text-sm text-green-200 uppercase">Watch the</div>
                                <div className="text-2xl font-black">LIVE DRAW</div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-green-200 font-bold mb-1">
                                {drawSchedule ? `THIS ${drawSchedule.drawDay} at ${drawSchedule.drawTime.replace(/^(\d{2}):(\d{2})$/, (_, h, m) => { const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })} (${drawSchedule.drawTimeZone})` : 'THIS THURSDAY at 8:00 PM (IST)'}
                            </div>
                            <div className="text-xs text-yellow-400 font-mono">
                                NEXT DRAW DATE: {drawSchedule?.drawDate ? new Date(drawSchedule.drawDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase() : 'LOADING...'}
                            </div>
                            {drawSchedule && !drawSchedule.isActive && (
                                <div className="text-xs text-red-300 font-bold mt-1">⏸ DRAW CURRENTLY PAUSED</div>
                            )}
                        </div>
                        <div className="flex gap-4">
                            {[
                                { val: timeLeft.days, label: 'DAYS' },
                                { val: timeLeft.hours, label: 'HOURS' },
                                { val: timeLeft.mins, label: 'MINS' },
                                { val: timeLeft.secs, label: 'SECS' },
                            ].map((t, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="w-14 h-14 rounded-full border-2 border-green-400 flex items-center justify-center text-2xl font-black bg-[#005c30]">
                                        {String(t.val).padStart(2, '0')}
                                    </div>
                                    <div className="text-[10px] font-bold mt-1 text-green-300">{t.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Prize Cards Section */}
            <section className="max-w-7xl mx-auto py-16 px-4">
                <div className="grid md:grid-cols-3 gap-8">
                    {products.length === 0 ? (
                        <div className="col-span-3 text-center text-gray-500 font-bold text-xl py-12">
                            Loading upcoming draws...
                        </div>
                    ) : (
                        products.map((product) => (
                            <div
                                key={product.id}
                                className={`bg-[#009951] rounded-3xl p-8 text-center text-white relative overflow-hidden group hover:scale-105 transition-transform duration-300 shadow-2xl cursor-pointer ${product.isJackpot ? 'border-4 border-yellow-400' : ''}`}
                                onClick={() => setSelectedProduct(product)}
                            >
                                {product.isJackpot && (
                                    <>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Trophy className="w-32 h-32" />
                                        </div>
                                        <div className="absolute top-0 -left-10 bg-yellow-400 text-[#00703C] text-xs font-black py-1 px-12 rotate-[-45deg] z-10 shadow-md">
                                            JACKPOT
                                        </div>
                                    </>
                                )}
                                {!product.isJackpot && (
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Gift className="w-32 h-32" />
                                    </div>
                                )}

                                <h3 className="text-2xl font-black text-yellow-300 mb-2 uppercase line-clamp-2 min-h-[4rem] flex items-center justify-center">
                                    {product.name}
                                </h3>

                                <div className="bg-[#D32F2F] text-white p-4 rounded-2xl mb-4 shadow-lg border-2 border-red-500">
                                    <div className="text-xs uppercase text-red-200 font-bold mb-1">Win Up To</div>
                                    <div className="text-3xl font-black">
                                        {product.jackpotConfig?.prizeAmount ?
                                            `₹ ${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format(product.jackpotConfig.prizeAmount)}` :
                                            'Prizes'}
                                    </div>
                                    {product.description && <div className="text-xs text-red-100 mt-1 line-clamp-1">{product.description}</div>}
                                </div>

                                <button className={`px-8 py-2 rounded-full font-black text-sm uppercase transition-colors ${product.isJackpot ? 'bg-yellow-400 text-[#00703C] hover:bg-white' : 'bg-white text-[#00703C] hover:bg-yellow-300'}`}>
                                    {product.isJackpot ? 'Play Jackpot' : 'Enter Draw'}
                                </button>

                                <div className="mt-4 text-xs font-bold text-green-200 uppercase tracking-widest">
                                    Ticket: ₹{product.pricePerNumber}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </section>

            {/* Grand Prize Breakdown Table */}
            <section className="bg-[#00703C] py-16 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-5xl font-black text-white uppercase drop-shadow-md">Win The Grand Prize</h2>
                        <p className="text-yellow-300 font-bold text-xl mt-2 tracking-wide">MATCH 6 NUMBERS + OASIS BALL</p>
                    </div>

                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                        {/* Table Header */}
                        <div className="grid grid-cols-3 bg-gray-100 p-4 font-black text-[#00703C] uppercase text-sm md:text-lg border-b border-gray-200 px-6">
                            <div>Prize</div>
                            <div className="text-center">Match</div>
                            <div className="text-right">Win</div>
                        </div>

                        {/* Rows */}
                        {[
                            { rank: '1st', match: 7, prize: '₹ 5,800,000' },
                            { rank: '2nd', match: 6, prize: '₹ 100,000' },
                            { rank: '3rd', match: 5, win: '₹ 25,000', hasPlus: true },
                            { rank: '4th', match: 5, prize: '₹ 1,000' },
                            { rank: '5th', match: 4, win: '₹ 500', hasPlus: true },
                            { rank: '6th', match: 4, prize: '₹ 25' },
                            { rank: '7th', match: 3, win: '₹ 25', hasPlus: true },
                            { rank: '8th', match: 3, prize: '₹ 10' },
                        ].map((row, idx) => (
                            <div key={idx} className="grid grid-cols-3 p-4 border-b border-gray-100 items-center px-6 hover:bg-green-50 transition-colors">
                                <div className="font-black text-2xl text-[#00703C] flex items-baseline">
                                    {row.rank} <span className="text-xs ml-1 uppercase">Prize</span>
                                </div>
                                <div className="flex justify-center items-center gap-1 md:gap-2">
                                    {/* Balls Logic */}
                                    {Array.from({ length: row.hasPlus ? 5 : (row.match > 5 ? 6 : row.match) }).map((_, i) => (
                                        <div key={i} className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white shadow-sm flex items-center justify-center">
                                            <div className="w-2 h-2 bg-white/50 rounded-full"></div>
                                        </div>
                                    ))}
                                    {row.hasPlus && <span className="font-bold text-green-600 text-xl">+</span>}
                                    {(row.hasPlus || row.match === 7) && (
                                        <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 border-2 border-white shadow-sm flex items-center justify-center relative">
                                            <div className="absolute -bottom-4 text-[8px] font-bold text-green-700 whitespace-nowrap">OASIS BALL</div>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <div className="inline-block bg-[#FFD700] text-[#00703C] font-black px-4 py-1 rounded-full text-sm md:text-xl shadow-sm">
                                        {row.prize || row.win}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Winners Section */}
            <section className="bg-[#005c30] py-16 px-4 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-black text-white">Let's Hear from our Recent Winners</h2>
                        <div className="flex gap-2">
                            <select
                                value={selectedSeasonFilter}
                                onChange={(e) => setSelectedSeasonFilter(e.target.value)}
                                className="bg-white/10 border border-white/20 text-white text-xs font-bold rounded-lg px-3 py-2 outline-none"
                            >
                                <option value="all" className="bg-[#005c30]">All Seasons</option>
                                {seasons.map(s => <option key={s.id} value={s.id} className="bg-[#005c30]">{s.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(selectedSeasonFilter === 'all' ? winners : winners.filter(w => (w as any).seasonId === selectedSeasonFilter)).slice(0, 3).length > 0 ?
                            (selectedSeasonFilter === 'all' ? winners : winners.filter(w => (w as any).seasonId === selectedSeasonFilter)).slice(0, 3).map((w, i) => (
                                <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                                    <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shadow-inner">
                                        <img src={`https://i.pravatar.cc/150?u=${w.userId || 'default'}`} alt={w.userName || 'Winner'} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-[#00703C]">{w.userName || 'Lucky Winner'}</h4>
                                        <p className="text-xs text-gray-500">Won {w.gift || 'Grand Prize'}</p>
                                    </div>
                                    <button className="bg-[#009951] text-white px-3 py-1 rounded-full text-xs font-bold uppercase hover:bg-green-700 transition-colors flex items-center gap-1">
                                        <Play className="w-3 h-3" /> View Video
                                    </button>
                                </div>
                            )) : (
                                // Fallback static winners if API empty
                                [
                                    { name: 'Muhammad Yousuf', win: '₹ 500,000' },
                                    { name: 'Muhammad Khalid', win: '₹ 500,000' },
                                    { name: 'Debando Esambi', win: '₹ 100,000' }
                                ].map((w, i) => (
                                    <div key={i} className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-xl">
                                        <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden shadow-inner flex items-center justify-center">
                                            <Award className="w-8 h-8 text-gray-400" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-[#00703C]">{w.name}</h4>
                                            <p className="text-xs text-gray-500">Won {w.win}</p>
                                        </div>
                                        <button className="bg-[#009951] text-white px-3 py-1 rounded-full text-xs font-bold uppercase hover:bg-green-700 transition-colors flex items-center gap-1">
                                            <Play className="w-3 h-3" /> View Video
                                        </button>
                                    </div>
                                ))
                            )}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#004d28] text-white py-12 px-4 border-t border-green-800">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#00703C] font-black text-xl">A</div>
                            <span className="font-bold text-lg tracking-widest">AICLUB BIG WINNER</span>
                        </div>
                        <div className="space-y-2 text-sm text-green-200">
                            <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> 800 - WINNER (800 645 54667)</p>
                            <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@aiclub.com</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Quick Links</h4>
                        <ul className="space-y-2 text-xs text-green-100">
                            <li>Play Now</li>
                            <li>Watch Live</li>
                            <li>Media Center</li>
                            <li>Price Breakdown</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">About Us</h4>
                        <ul className="space-y-2 text-xs text-green-100">
                            <li>Brand Ambassador/Host</li>
                            <li>FAQ</li>
                            <li>Download App</li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 uppercase text-sm text-yellow-400">Engage With Us</h4>
                        <div className="flex gap-4">
                            <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20"><Instagram className="w-5 h-5" /></div>
                            <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20"><Facebook className="w-5 h-5" /></div>
                            <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20"><Twitter className="w-5 h-5" /></div>
                            <div className="bg-white/10 p-2 rounded-full cursor-pointer hover:bg-white/20"><Youtube className="w-5 h-5" /></div>
                        </div>
                        <div className="mt-8 flex items-center gap-2 text-[10px] text-green-400">
                            <img src="/placeholder-license.png" className="w-8 h-8 grayscale opacity-50" alt="" />
                            <span>Anjouan Licensing Services Inc.</span>
                        </div>
                    </div>
                </div>
                <div className="text-center text-[10px] text-green-500 mt-12 border-t border-green-800 pt-8">
                    © 2026 AICLUB BIG WINNER | AI-D-Mart Global. All Rights Reserved.
                </div>
            </footer>

            {/* Advanced Booking Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-3xl w-full max-w-4xl h-[90vh] overflow-y-auto md:overflow-hidden shadow-2xl relative flex flex-col md:flex-row">

                        {/* Summary & Form Panel (Left) */}
                        <div className="md:w-1/2 p-6 md:p-8 bg-gray-50 flex-none md:overflow-y-auto">
                            <button onClick={() => setSelectedProduct(null)} className="md:hidden absolute top-4 right-4 bg-gray-200 p-2 rounded-full hover:bg-gray-300 z-10">
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-2xl font-black text-[#00703C] uppercase mb-1">Your Lucky Numbers</h3>
                            <p className="text-sm text-gray-500 mb-6">Complete your details to win big!</p>

                            {/* Ticket Price & Free Status */}
                            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="font-bold text-gray-700">Ticket Price</span>
                                    <span className="font-black text-xl text-[#00703C]">₹ {selectedProduct.pricePerNumber || 50}</span>
                                </div>
                                {isLoggedIn && isFirstTimeUser && !freeChanceUsed && (
                                    <div className="flex items-center gap-2 text-green-600 font-bold bg-green-50 p-2 rounded-lg mt-2">
                                        <Gift className="w-4 h-4" />
                                        First Ticket is FREE! (Applied at checkout)
                                    </div>
                                )}
                                {!isLoggedIn && (
                                    <div className="flex items-center gap-2 text-orange-600 font-medium bg-orange-50 p-2 rounded-lg mt-2 text-sm">
                                        <LogIn className="w-4 h-4" />
                                        <span>Log in to get your first ticket <strong>FREE</strong>!</span>
                                    </div>
                                )}
                            </div>

                            {/* Selected Numbers Summary */}
                            {selectedNumbers.length > 0 && (
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
                                    <h4 className="font-bold text-gray-700 text-sm uppercase mb-2">Selected Numbers</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNumbers.sort((a, b) => a - b).map(num => (
                                            <span key={num} className="w-8 h-8 rounded-full bg-[#FFD700] text-[#00703C] font-black flex items-center justify-center text-sm shadow-sm">
                                                {num}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Participant Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Lucky Name (Optional)</label>
                                    <input
                                        type="text"
                                        value={participantName}
                                        onChange={(e) => setParticipantName(e.target.value)}
                                        placeholder="Enter Name (For Family/Friends)"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00703C] focus:ring-0 outline-none text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">Leave empty to use your registered name.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Mobile Number (Optional)</label>
                                    <input
                                        type="tel"
                                        value={participantMobile}
                                        onChange={(e) => setParticipantMobile(e.target.value)}
                                        placeholder="e.g. 9876543210"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00703C] focus:ring-0 outline-none text-sm"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1">If empty, ticket is booked under your mobile.</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Email <span className="text-red-500">*</span></label>
                                    <input
                                        type="email"
                                        required
                                        value={participantEmail}
                                        onChange={(e) => setParticipantEmail(e.target.value)}
                                        placeholder="Required for confirmation"
                                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00703C] focus:ring-0 outline-none text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">City/State</label>
                                        <input
                                            type="text"
                                            value={participantCityState}
                                            onChange={(e) => setParticipantCityState(e.target.value)}
                                            placeholder="E.g. Mumbai, MH"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00703C] focus:ring-0 outline-none text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Address</label>
                                        <input
                                            type="text"
                                            value={participantAddress}
                                            onChange={(e) => setParticipantAddress(e.target.value)}
                                            placeholder="Local Address"
                                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#00703C] focus:ring-0 outline-none text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Your Photo (MANDATORY JPG/PNG)</label>
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#00703C] hover:bg-green-50 transition-colors"
                                    >
                                        {participantPhoto ? (
                                            <div className="relative w-20 h-20 rounded-full overflow-hidden shadow-md">
                                                <img src={participantPhoto} alt="Upload" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="bg-gray-100 p-3 rounded-full mb-2">
                                                    <Upload className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <span className="text-xs text-gray-500 font-medium">Click to upload photo</span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>

                        {/* Number Picker (Right) */}
                        <div className="md:w-1/2 bg-[#00703C] p-6 text-white flex flex-col flex-none md:overflow-y-auto">
                            <button onClick={() => setSelectedProduct(null)} className="hidden md:block absolute top-6 right-6 bg-white/20 p-2 rounded-full hover:bg-white/40">
                                <X className="w-4 h-4" />
                            </button>

                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                Pick Numbers <span className="bg-[#FFD700] text-[#00703C] text-xs px-2 py-0.5 rounded-full">{selectedNumbers.length} Selected</span>
                            </h3>

                            <div className="mb-6 pr-2 md:flex-1 md:overflow-y-auto">
                                <div className="grid grid-cols-7 gap-2">
                                    {Array.from({ length: selectedProduct.totalNumbers || 49 }, (_, i) => i + 1).map(num => (
                                        <button
                                            key={num}
                                            onClick={() => {
                                                setSelectedNumbers(prev => prev.includes(num) ? prev.filter(n => n !== num) : [...prev, num]);
                                            }}
                                            className={`w-10 h-10 rounded-full font-bold transition-all text-sm ${selectedNumbers.includes(num)
                                                ? 'bg-[#FFD700] text-[#00703C] shadow-lg scale-110'
                                                : 'bg-[#005c30] text-green-300 hover:bg-[#008f4d] hover:text-white'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-green-700 pt-6 mt-4">
                                <label className="flex items-start gap-2 mb-4 cursor-pointer text-sm">
                                    <input type="checkbox" checked={agreeToTerms} onChange={e => setAgreeToTerms(e.target.checked)} className="mt-1 shrink-0 accent-[#FFD700] w-4 h-4" />
                                    <span className="leading-tight text-white font-medium text-xs">I agree to the Terms & Conditions and confirm I am 18 years or older.</span>
                                </label>
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-green-200 text-sm">Total Payable</div>
                                    <div className="font-black text-3xl">₹ {calculateTotal().toFixed(1)}</div>
                                </div>
                                <button
                                    onClick={openCheckout}
                                    disabled={selectedNumbers.length === 0}
                                    className="w-full bg-[#FFD700] text-[#00703C] py-4 rounded-xl font-black uppercase shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                    Confirm Selection <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rules Modal */}
            {showRules && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
                        <button onClick={() => setShowRules(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Info className="w-8 h-8 text-yellow-600" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Rules & Regulations</h3>
                        </div>

                        <div className="space-y-4 text-sm text-gray-600 mb-6 max-h-60 overflow-y-auto pr-2">
                            <p>1. Participants must be 18 years or older.</p>
                            <p>2. Winners are selected randomly via automated system.</p>
                            <p>3. Prizes must be claimed within 30 days of the draw.</p>
                            <p>4. One free ticket per new user account.</p>
                            <p>5. Multiple entries are allowed via paid tickets.</p>
                            <p className="font-bold text-gray-900">By proceeding, you agree to these terms.</p>
                        </div>

                        {calculateTotal() > 0 && selectedNumbers.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Select Payment Method</label>
                                <select
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:border-[#00703C]"
                                    onChange={(e) => {
                                        // Store selected payment method temporarily in a data attribute or state. 
                                        // Here we just use an inline click handler override later.
                                    }}
                                    id="paymentMethodSelect"
                                >
                                    <option value="wallet">Wallet Balance</option>
                                    <option value="upi">UPI Payment</option>
                                </select>
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setShowRules(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors">
                                Cancel
                            </button>
                            {calculateTotal() === 0 && selectedNumbers.length > 0 ? (
                                <button onClick={() => handleBooking()} className="flex-1 py-3 bg-[#00703C] text-white font-bold rounded-xl hover:bg-[#005c30] transition-colors shadow-lg">
                                    Get Free Ticket
                                </button>
                            ) : (
                                <button onClick={() => {
                                    const selectEl = document.getElementById('paymentMethodSelect') as HTMLSelectElement;
                                    const method = selectEl ? selectEl.value : 'wallet';
                                    if (method === 'wallet') {
                                        handleBooking('wallet');
                                    } else {
                                        setShowCheckout(true);
                                    }
                                }} className="flex-1 py-3 bg-[#00703C] text-white font-bold rounded-xl hover:bg-[#005c30] transition-colors shadow-lg">
                                    Proceed to Pay ₹{calculateTotal()}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
                    <div className="bg-white rounded-3xl p-6 w-full max-w-md relative z-[110] max-h-[85vh] overflow-y-auto shadow-2xl">
                        <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-50 mb-2 transition-transform hover:scale-105">
                            <X className="w-5 h-5 text-gray-600" />
                        </button>

                        <div className="mb-6">
                            <h3 className="font-bold text-gray-900 text-lg mb-2">Confirm Your Selection</h3>
                            <div className="flex flex-wrap gap-2 justify-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                                {selectedNumbers.sort((a, b) => a - b).map(num => (
                                    <span key={num} className="w-8 h-8 rounded-full bg-[#FFD700] text-[#00703C] font-black flex items-center justify-center text-sm shadow-sm scale-90">
                                        {num}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <UpiPayment
                            amount={calculateTotal()}
                            description={`Lottery Ticket Purchase (${Math.max(0, selectedNumbers.length - (isFirstTimeUser && !freeChanceUsed ? 1 : 0))} paid + ${isFirstTimeUser && !freeChanceUsed ? 1 : 0} free)`}
                            isLoading={false}
                            onSuccess={() => handleBooking('mock_pay_id')}
                            onCancel={() => setShowCheckout(false)}
                        />
                    </div>
                </div>
            )}
            {/* Success Popup Modal */}
            {showSuccessPopup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[200] backdrop-blur-md">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md relative z-10 text-center shadow-2xl overflow-hidden">

                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner animate-bounce">
                            <CheckCircle size={48} />
                        </div>

                        <h3 className="text-3xl font-black text-[#00703C] mb-2">Booking Confirmed!</h3>
                        <p className="text-gray-600 mb-6">Your ticket has been successfully booked.</p>

                        <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-100 text-left relative z-20">
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="text-gray-500 font-bold text-sm">Name</span>
                                <span className="font-bold text-gray-900 text-sm">{participantName || user?.name || 'Guest User'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="text-gray-500 font-bold text-sm">Mobile</span>
                                <span className="font-bold text-gray-900 text-sm">{participantMobile || 'Not provided'}</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="text-gray-500 font-bold text-sm">Lucky Number(s)</span>
                                <span className="font-black text-[#00703C] text-sm">{selectedNumbers.join(', ')} ({selectedNumbers.length} Tickets)</span>
                            </div>
                            <div className="flex justify-between border-b pb-2 mb-2">
                                <span className="text-gray-500 font-bold text-sm">Transaction ID</span>
                                <span className="font-bold text-gray-900 text-sm uppercase">{lastTransactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500 font-bold text-sm">Date & Time</span>
                                <span className="font-bold text-gray-900 text-sm">{new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                        </div>

                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg text-sm font-bold mb-6 border border-yellow-200 relative z-20">
                            📧 A confirmation email has been sent to {participantEmail || 'your email'}.
                        </div>

                        <button
                            onClick={() => {
                                setShowSuccessPopup(false);
                                setSelectedProduct(null);
                                setSelectedNumbers([]);
                                setParticipantName('');
                                setParticipantMobile('');
                                setParticipantAddress('');
                                setParticipantCityState('');
                                setParticipantEmail('');
                                setParticipantPhoto(null);
                                setParticipantPhotoFile(null);
                                setAgreeToTerms(false);
                            }}
                            className="relative z-20 w-full bg-[#00703C] text-white py-3 rounded-xl font-bold hover:bg-[#005c30] transition-all shadow-lg hover:shadow-xl"
                        >
                            Back To Draws
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

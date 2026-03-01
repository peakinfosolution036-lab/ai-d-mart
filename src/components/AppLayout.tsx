'use client'

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Menu, LogOut, Home, Info, User, X, ChevronRight, Shield, Briefcase, Trophy, Crown, Wallet, Award, CalendarDays } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { APP_NAME } from '@/constants';
import MobileBottomNav from './MobileBottomNav';

export const AppLayout = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const router = useRouter();
    const { isLoggedIn, logout, userRole } = useAuth();
    const [menuOpen, setMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Don't show header/footer on dashboard and admin pages
    const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin');
    const isLanding = pathname === '/';
    const isPublicPage = pathname === '/' || pathname === '/about';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleNav = (path: string) => {
        router.push(path);
        setMenuOpen(false);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    const isActive = (path: string) => pathname === path;

    useEffect(() => {
        if (isLoggedIn && isPublicPage) {
            const dashboard = userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard';
            router.push(dashboard);
        }
    }, [isLoggedIn, isPublicPage, userRole, router]);

    const isHeaderSolid = scrolled || !isLanding;

    return (
        <>
            {/* Header - only show on non-dashboard pages */}
            {!isDashboard && (
                <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isHeaderSolid
                    ? 'bg-[#00703C] shadow-lg border-b border-white/10'
                    : 'bg-[#00703C]/90 border-b border-white/5'
                    }`}>
                    <div className="max-w-[1700px] mx-auto px-4 md:px-8 xl:px-12 py-5 flex justify-between items-center">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#00703C] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform shadow-lg shadow-[#FFD700]/20">
                                <Shield className="text-white" size={24} />
                            </div>
                            <span className="text-xl font-black text-white drop-shadow-md hidden">{APP_NAME}</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden lg:flex items-center gap-4 xl:gap-7">
                            {[
                                { name: 'Home', path: '/' },
                                { name: 'About', path: '/about' },
                                { name: 'Shop', path: '/shop' },
                                { name: 'Events', path: '/event-enquiry' },
                                { name: 'Business', path: '/referral' },
                                { name: 'Lucky Draw', path: '/lucky-draw' },
                                { name: 'Awards', path: '/awards' },
                                { name: 'Wallet', path: '/wallet' },
                                { name: 'Careers', path: '/careers' },
                            ].map((item) => (
                                <Link
                                    key={item.path}
                                    href={item.path}
                                    className={`font-bold transition-colors text-xs xl:text-sm uppercase tracking-wider ${isActive(item.path)
                                        ? 'text-[#FFD700]'
                                        : 'text-white/90 hover:text-[#FFD700]'
                                        }`}
                                >
                                    {item.name}
                                </Link>
                            ))}

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href={userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard'}
                                        className="font-bold text-white/90 hover:text-[#FFD700] transition-colors text-xs xl:text-sm uppercase tracking-wider"
                                    >
                                        Dashboard
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 xl:px-6 xl:py-3 rounded-full font-bold transition-all text-xs xl:text-sm uppercase tracking-wider"
                                    >
                                        <LogOut size={16} className="xl:w-5 xl:h-5" />
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="font-bold text-white/90 hover:text-[#FFD700] transition-colors text-xs xl:text-sm uppercase tracking-wider"
                                    >
                                        Login
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="bg-[#FFD700] hover:bg-[#FFD700]/90 text-[#00703C] px-5 py-3 xl:px-8 xl:py-4 rounded-full font-black transition-all text-xs xl:text-sm uppercase tracking-widest shadow-lg shadow-[#FFD700]/20 hover:scale-105 active:scale-95"
                                    >
                                        Get Started
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                        >
                            {menuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {menuOpen && (
                        <div className="lg:hidden bg-[#00703C] border-t border-white/10 shadow-xl">
                            <nav className="px-4 py-2 space-y-0.5 max-h-[85vh] overflow-y-auto">
                                {[
                                    { name: 'Home', path: '/', icon: Home },
                                    { name: 'About', path: '/about', icon: Info },
                                    { name: 'Shop', path: '/shop', icon: Briefcase },
                                    { name: 'Events', path: '/event-enquiry', icon: CalendarDays },
                                    { name: 'Business', path: '/referral', icon: Crown },
                                    { name: 'Lucky Draw', path: '/lucky-draw', icon: Trophy },
                                    { name: 'Awards', path: '/awards', icon: Award },
                                    { name: 'Wallet', path: '/wallet', icon: Wallet },
                                    { name: 'Careers', path: '/careers', icon: Briefcase },
                                ].map((item) => (
                                    <button key={item.path} onClick={() => handleNav(item.path)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white font-medium flex items-center justify-between text-sm transition-colors">
                                        <span className="flex items-center gap-3"><item.icon size={18} className="text-[#FFD700]" /> {item.name}</span>
                                        <ChevronRight size={16} className="text-white/50" />
                                    </button>
                                ))}

                                {isLoggedIn ? (
                                    <>
                                        <button onClick={() => handleNav(userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white font-medium flex items-center justify-between text-sm transition-colors">
                                            <span className="flex items-center gap-3"><User size={18} className="text-[#FFD700]" /> Dashboard</span>
                                            <ChevronRight size={16} className="text-white/50" />
                                        </button>
                                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium flex items-center justify-between text-sm transition-colors border border-red-500/20">
                                            <span className="flex items-center gap-3"><LogOut size={18} /> Logout</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleNav('/login')} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white font-medium flex items-center justify-between text-sm transition-colors">
                                            <span className="flex items-center gap-3"><User size={18} className="text-[#FFD700]" /> Login</span>
                                            <ChevronRight size={16} className="text-white/50" />
                                        </button>
                                        <button onClick={() => handleNav('/register')} className="w-full text-left px-3 py-3 rounded-xl bg-[#FFD700] text-[#00703C] font-black flex items-center justify-between text-sm uppercase tracking-widest shadow-lg shadow-[#FFD700]/10">
                                            <span>Get Started</span>
                                            <ChevronRight size={16} />
                                        </button>
                                    </>
                                )}
                            </nav>
                        </div>
                    )}
                </header>
            )}

            {/* Main Content */}
            <main className={!isDashboard ? 'pt-20 pb-20 md:pb-0' : ''}>
                {children}
            </main>
            <MobileBottomNav />
        </>
    );
};

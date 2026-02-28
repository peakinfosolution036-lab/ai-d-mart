'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, ArrowRight, ShieldCheck, AlertCircle, Loader2, CheckCircle2, Star, Sparkles } from 'lucide-react';
import { UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginPage() {
    const router = useRouter();
    const { login, isLoggedIn, isLoading: authLoading, userRole } = useAuth();

    const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [rememberMe, setRememberMe] = useState(false);

    // Redirect if already logged in
    useEffect(() => {
        if (isLoggedIn && !authLoading) {
            const dashboard = userRole === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard';
            router.push(dashboard);
        }
    }, [isLoggedIn, authLoading, userRole, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await login(identifier, password, role);

            if (result.success) {
                const dashboard = role === UserRole.ADMIN ? '/admin/dashboard' : '/dashboard';
                router.push(dashboard);
            } else {
                setError(result.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };


    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <Loader2 className="w-12 h-12 animate-spin text-[#00703C]" />
                    <p className="text-slate-500 font-medium animate-pulse">Checking authentication...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-8 bg-slate-50 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#00703C]/10 rounded-full blur-[120px] opacity-50"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#FFD700]/10 rounded-full blur-[120px] opacity-50"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden max-w-5xl w-full flex flex-col md:flex-row min-h-[650px] relative z-10"
            >
                {/* Left Side - Visual */}
                <div className="md:w-[45%] bg-[#00703C] p-10 text-white flex flex-col justify-between relative overflow-hidden group">
                    {/* Dynamic Mesh Background */}
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#004D2C] via-[#00703C] to-[#004D2C]"></div>
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                x: [0, 50, 0],
                                y: [0, 30, 0]
                            }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-[#FFD700] rounded-full blur-[100px] opacity-30"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                x: [0, -40, 0],
                                y: [0, -60, 0]
                            }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] bg-[#00703C] rounded-full blur-[100px] opacity-20"
                        />
                        <div className="absolute inset-0 bg-[#004D2C]/10 backdrop-blur-[2px]"></div>
                        {/* Grid Pattern Overlay */}
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
                    </div>

                    <div className="relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                            className="w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/30 rounded-2xl flex items-center justify-center mb-8 shadow-xl"
                        >
                            <ShieldCheck size={32} className="text-white drop-shadow-md" />
                        </motion.div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={role}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ duration: 0.3 }}
                            >
                                <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight">
                                    {role === UserRole.ADMIN ? (
                                        <>Admin <span className="text-[#FFD700]">Portal</span></>
                                    ) : (
                                        <>Welcome <span className="text-[#FFD700]">Back</span></>
                                    )}
                                </h2>
                                <p className="text-green-50 text-lg leading-relaxed max-w-sm">
                                    {role === UserRole.ADMIN
                                        ? 'Access the command center to manage users, oversight products, and drive digital transformation.'
                                        : 'Step back into your digital workspace. Your store, your earnings, and premium services are ready for you.'
                                    }
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-12 space-y-4">
                            {[
                                { icon: CheckCircle2, text: "Secure 256-bit encryption" },
                                { icon: Star, text: "Premium merchant tools" },
                                { icon: Sparkles, text: "AI-powered insights" }
                            ].map((item, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + (i * 0.1) }}
                                    key={i}
                                    className="flex items-center gap-3 text-white/80"
                                >
                                    <item.icon size={18} className="text-[#FFD700]" />
                                    <span className="text-sm font-medium">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="relative z-10 mt-auto pt-10">
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                <Sparkles size={100} />
                            </div>
                            <div className="flex -space-x-4 mb-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#004D2C] bg-gradient-to-br from-[#00703C] to-[#004D2C] flex items-center justify-center overflow-hidden relative">
                                        <Image
                                            src={`/partners/partner${i}.png`}
                                            alt={`Partner ${i}`}
                                            width={40}
                                            height={40}
                                            unoptimized
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="w-10 h-10 rounded-full border-2 border-[#004D2C] bg-white flex items-center justify-center text-[10px] font-bold text-[#00703C] shadow-xl group-hover:scale-110 transition-transform z-10">
                                    +1.2k
                                </div>
                            </div>
                            <p className="text-sm font-bold text-white tracking-wide">Trusted by 1000+ active partners</p>
                            <p className="text-xs text-green-100 mt-1">Join the digital revolution in Bharat.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="md:w-[55%] p-8 md:p-14 flex flex-col justify-center bg-white relative">
                    <div className="mb-10">
                        <motion.h3
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl font-bold text-slate-900 mb-2"
                        >
                            Sign In
                        </motion.h3>
                        <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-500 text-lg"
                        >
                            Welcome back! Please enter your details.
                        </motion.p>
                    </div>

                    {/* Role Toggle */}
                    <div className="relative flex bg-slate-100 p-1.5 rounded-2xl mb-10 w-full max-w-md mx-auto shadow-inner">
                        <div
                            className={`absolute h-[calc(100%-12px)] top-1.5 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] bg-white rounded-xl shadow-md z-0 ${role === UserRole.CUSTOMER ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[calc(50%+3px)] w-[calc(50%-6px)]'
                                }`}
                        />
                        <button
                            type="button"
                            onClick={() => { setRole(UserRole.CUSTOMER); setError(''); }}
                            className={`relative flex-1 py-3 text-xs font-bold rounded-xl transition-colors z-10 ${role === UserRole.CUSTOMER ? 'text-[#00703C]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Customer
                        </button>
                        <button
                            type="button"
                            onClick={() => { setRole(UserRole.ADMIN); setError(''); }}
                            className={`relative flex-1 py-3 text-xs font-bold rounded-xl transition-colors z-10 ${role === UserRole.ADMIN ? 'text-[#00703C]' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Admin
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0, y: -20 }}
                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                exit={{ opacity: 0, height: 0, y: -20 }}
                                className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4 overflow-hidden"
                            >
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="w-6 h-6 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-700 text-sm font-medium leading-relaxed">{error}</p>
                                    {error.includes('verify your email') && (
                                        <Link
                                            href="/verify-email"
                                            className="text-[#00703C] text-sm font-bold hover:underline mt-2 inline-block"
                                        >
                                            Verify your email here →
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 px-1">
                                {role === UserRole.CUSTOMER ? 'Customer ID / Mobile / Email' : 'Admin ID / Email'}
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400 group-focus-within:text-[#00703C] transition-colors" />
                                </div>
                                <input
                                    required
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    className="block w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-[#00703C]/10 focus:border-[#00703C] focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                                    placeholder={role === UserRole.CUSTOMER ? "Ex: DI0001 or 9876543210" : "Ex: admin@aidmart.com"}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between px-1">
                                <label className="text-sm font-bold text-slate-700">Password</label>
                                <Link href="/forgot-password" title="Forgot Password" className="text-xs text-[#00703C] font-bold hover:text-[#004D2C] transition-colors">
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#00703C] transition-colors" />
                                </div>
                                <input
                                    required
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-[#00703C]/10 focus:border-[#00703C] focus:bg-white outline-none transition-all placeholder:text-slate-400 text-slate-900 font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="peer sr-only"
                                    />
                                    <div className="w-5 h-5 border-2 border-slate-300 rounded-md transition-all peer-checked:bg-[#00703C] peer-checked:border-[#00703C] group-hover:border-[#00703C] flex items-center justify-center">
                                        <svg className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">Remember me</span>
                            </label>
                        </div>

                        <motion.button
                            whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 112, 60, 0.4)" }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center items-center gap-3 bg-[#00703C] hover:bg-[#004D2C] text-white font-extrabold py-5 px-4 rounded-[1.25rem] shadow-xl shadow-[#00703C]/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <span className="relative z-10">Sign In to Account</span>
                                    <ArrowRight size={22} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#004D2C] to-[#00703C] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </>
                            )}
                        </motion.button>


                        {role === UserRole.CUSTOMER && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-center mt-10"
                            >
                                <p className="text-slate-600 font-medium">
                                    New to our platform?{' '}
                                    <Link href="/register" className="text-[#00703C] font-extrabold hover:text-[#004D2C] hover:underline underline-offset-4 decoration-2">
                                        Create an Account
                                    </Link>
                                </p>
                            </motion.div>
                        )}
                    </form>
                </div>
            </motion.div>
        </div>
    );
}


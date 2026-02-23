'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function MobileBottomNav() {
    const pathname = usePathname();
    const { isLoggedIn, userRole } = useAuth();

    // Hide on dashboard or if not logged in (optional, but user asked for "mobile view only", implies logged in context usually, but let's show for all)
    // Actually, user just said "mobile view only".
    // "the 4 sticky buttons i want in our tyhat too in our wesbite in mobile view only"

    if (pathname?.startsWith('/admin')) return null;

    const navItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Wallet', href: '/wallet', icon: Wallet },
        { name: 'Shop', href: '/shop', icon: ShoppingBag },
        { name: 'Profile', href: isLoggedIn ? (userRole === 'ADMIN' ? '/admin/dashboard' : '/dashboard') : '/login', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#00703C] border-t border-[#005c30] z-[100] pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-[#FFD700]' : 'text-white/70 hover:text-white'
                                }`}
                        >
                            <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}

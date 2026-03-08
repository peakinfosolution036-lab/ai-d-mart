'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function NotificationDropdown({
    theme = 'dark'
}: {
    theme?: 'dark' | 'light'
}) {
    const { user, isLoggedIn } = useAuth();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isLoggedIn || !user?.id) return;

        const fetchNotifs = async () => {
            try {
                const res = await fetch(`/api/customer/notifications?userId=${user.id}`);
                const data = await res.json();
                if (data.success) {
                    setNotifications(data.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch notifications', error);
            }
        };

        fetchNotifs();
    }, [isLoggedIn, user?.id]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleMarkAsRead = async (id: string, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        try {
            await fetch(`/api/customer/notifications?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });
        } catch (error) {
            console.error('Failed to mark read', error);
        }
    };

    const handleMarkAllRead = async () => {
        if (!user?.id) return;
        const unreadNotifs = notifications.filter(n => !n.read);
        if (unreadNotifs.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        try {
            await fetch(`/api/customer/notifications?all=true&userId=${user.id}`, {
                method: 'PATCH'
            });
        } catch (error) {
            console.error('Failed to mark all read', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle size={18} className="text-emerald-500" />;
            case 'warning': return <AlertTriangle size={18} className="text-amber-500" />;
            case 'info':
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const btnClasses = theme === 'dark'
        ? "w-10 h-10 xl:w-12 xl:h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all relative"
        : "w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-600 border border-slate-100 shadow-sm hover:shadow-md transition-all relative";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={btnClasses}
            >
                <Bell size={20} />
                {notifications.filter(n => !n.read).length > 0 && (
                    <span className={`absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 ${theme === 'dark' ? 'border-[#00703C]' : 'border-white'} text-[10px] font-black text-white flex items-center justify-center shadow-lg`}>
                        {notifications.filter(n => !n.read).length}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in slide-in-from-top-2">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-900">Notifications</h3>
                        {notifications.filter(n => !n.read).length > 0 && (
                            <button onClick={handleMarkAllRead} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                                Mark all as read
                            </button>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-slate-50">
                                {notifications.map((n) => (
                                    <div key={n.id} className={`p-4 hover:bg-slate-50 transition-colors flex gap-4 ${!n.read ? 'bg-blue-50/30' : ''}`}>
                                        <div className="mt-1 shrink-0">
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!n.read ? 'font-bold text-slate-900' : 'font-medium text-slate-600'}`}>
                                                {n.title}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-2 font-bold">{new Date(n.createdAt).toLocaleString()}</p>
                                        </div>
                                        {!n.read && (
                                            <button onClick={(e) => handleMarkAsRead(n.id, e)} className="shrink-0 text-slate-400 hover:text-blue-600 self-start p-1 relative top-[-4px]">
                                                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center bg-slate-50/30">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-slate-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-500">No new notifications</p>
                                <p className="text-xs text-slate-400 mt-1">We'll notify you when something arrives.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

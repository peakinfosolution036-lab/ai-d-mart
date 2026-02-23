'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
    message,
    type,
    isVisible,
    onClose,
    duration = 5000
}) => {
    useEffect(() => {
        if (isVisible && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, duration, onClose]);

    const icons = {
        success: <CheckCircle className="text-emerald-500" size={20} />,
        error: <XCircle className="text-rose-500" size={20} />,
        info: <Info className="text-blue-500" size={20} />,
        warning: <AlertCircle className="text-amber-500" size={20} />
    };

    const backgrounds = {
        success: 'bg-emerald-50 border-emerald-100',
        error: 'bg-rose-50 border-rose-100',
        info: 'bg-blue-50 border-blue-100',
        warning: 'bg-amber-50 border-amber-100'
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] min-w-[320px] max-w-md"
                >
                    <div className={`
                        flex items-center gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md bg-white/90
                        ${backgrounds[type]}
                    `}>
                        <div className="flex-shrink-0">
                            {icons[type]}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-black text-slate-800 tracking-tight leading-tight">
                                {message}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-slate-400"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

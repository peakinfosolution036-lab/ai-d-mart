'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    addDays,
    eachDayOfInterval,
    getYear,
    getMonth,
    setYear,
    setMonth,
    isValid,
    parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DatePickerProps {
    value: string;
    onChange: (date: string) => void;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
    value,
    onChange,
    label,
    placeholder = "Select date",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);

    // Safety check for date parsing
    const getSafeDate = (dateStr: string) => {
        if (!dateStr) return new Date();
        const parsed = parseISO(dateStr);
        return isValid(parsed) ? parsed : new Date();
    };

    const [currentMonth, setCurrentMonth] = useState(getSafeDate(value));
    const [selectedDate, setSelectedDate] = useState<Date | null>(value ? getSafeDate(value) : null);
    const containerRef = useRef<HTMLDivElement>(null);

    const years = Array.from({ length: 100 }, (_, i) => getYear(new Date()) - i + 10); // Show future years too
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleDateClick = (day: Date) => {
        setSelectedDate(day);
        const dateStr = format(day, 'yyyy-MM-dd');
        onChange(dateStr);
        setIsOpen(false);
    };

    const renderHeader = () => (
        <div className="flex items-center justify-between px-2 py-4 border-b border-slate-50">
            <div className="flex gap-2 items-center">
                <div className="relative group">
                    <select
                        value={getMonth(currentMonth)}
                        onChange={(e) => setCurrentMonth(setMonth(currentMonth, parseInt(e.target.value)))}
                        className="appearance-none bg-slate-50 border border-slate-100 pl-3 pr-8 py-2 rounded-xl font-black text-slate-800 text-xs outline-none cursor-pointer hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                    >
                        {months.map((month, i) => (
                            <option key={month} value={i}>{month}</option>
                        ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
                <div className="relative group">
                    <select
                        value={getYear(currentMonth)}
                        onChange={(e) => setCurrentMonth(setYear(currentMonth, parseInt(e.target.value)))}
                        className="appearance-none bg-slate-50 border border-slate-100 pl-3 pr-8 py-2 rounded-xl font-black text-slate-800 text-xs outline-none cursor-pointer hover:bg-white hover:border-blue-200 transition-all shadow-sm"
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                    <ChevronRight size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 text-slate-400 pointer-events-none" />
                </div>
            </div>
            <div className="flex gap-1">
                <button
                    type="button"
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-blue-50 bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-blue-600 border border-transparent hover:border-blue-100"
                >
                    <ChevronLeft size={16} />
                </button>
                <button
                    type="button"
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="p-2 hover:bg-blue-50 bg-slate-50 rounded-xl transition-all text-slate-500 hover:text-blue-600 border border-transparent hover:border-blue-100"
                >
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderDays = () => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return (
            <div className="grid grid-cols-7 mb-2 px-2 pt-2">
                {days.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                        {day.substring(0, 1)}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({
            start: startDate,
            end: endDate,
        });

        return (
            <div className="grid grid-cols-7 gap-1 px-2 pb-2">
                {calendarDays.map((day, i) => {
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <button
                            type="button"
                            key={i}
                            onClick={() => handleDateClick(day)}
                            className={`
                                relative h-9 w-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all mx-auto
                                ${!isCurrentMonth ? 'text-slate-300' : 'text-slate-600'}
                                ${isSelected
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 z-10 scale-105'
                                    : 'hover:bg-blue-50 hover:text-blue-600'
                                }
                                ${isToday && !isSelected ? 'text-blue-600 font-black' : ''}
                            `}
                        >
                            {format(day, 'd')}
                            {isToday && !isSelected && (
                                <span className="absolute bottom-1.5 w-1 h-1 bg-blue-600 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        );
    };

    return (
        <div className={`relative ${className} w-full`} ref={containerRef}>
            {label && <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer transition-all duration-300
                    ${isOpen ? 'ring-4 ring-blue-500/10 border-blue-200' : 'hover:border-slate-300 hover:bg-slate-50/50'}
                    ${value ? 'shadow-sm' : ''}
                `}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl transition-colors ${isOpen ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:text-blue-600'}`}>
                        <CalendarIcon size={18} />
                    </div>
                    <span className={`font-black text-sm tracking-tight ${value ? 'text-slate-900' : 'text-slate-400 font-bold'}`}>
                        {value ? format(getSafeDate(value), 'PPP') : placeholder}
                    </span>
                </div>
                <div className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : 'text-slate-300'}`}>
                    <ChevronRight className="rotate-90" size={18} />
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute z-[9999] mt-3 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-[320px] left-0 md:left-auto md:right-0 overflow-hidden origin-top-right backdrop-blur-xl bg-white/95"
                    >
                        {renderHeader()}
                        <div className="p-2">
                            {renderDays()}
                            {renderCells()}
                        </div>
                        <div className="p-4 border-t border-slate-50 flex gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    const today = new Date();
                                    setCurrentMonth(today);
                                    handleDateClick(today);
                                }}
                                className="flex-1 py-3 text-xs font-black text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-2xl transition-all uppercase tracking-widest"
                            >
                                Today
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setSelectedDate(null);
                                    onChange('');
                                    setIsOpen(false);
                                }}
                                className="flex-1 py-3 text-xs font-black text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all uppercase tracking-widest"
                            >
                                Clear
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

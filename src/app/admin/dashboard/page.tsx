'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard, Users, Package, ShoppingCart, Calendar,
    Briefcase, Tag, FileText, Settings, LogOut, Menu,
    Bell, ChevronRight, TrendingUp, TrendingDown, Search as SearchIcon,
    CheckCircle, Clock, XCircle, Shield, UserCheck, UserX,
    Eye, EyeOff, Edit, Trash2, Plus, Filter, Download, RefreshCw,
    X, AlertCircle, MapPin, Phone, Mail, CreditCard,
    DollarSign, BarChart2, Store, Megaphone, Share2, Wallet,
    BriefcaseBusiness, BellRing, User, Activity, Search, Star,
    ShoppingBag, Save, ArrowUpRight
} from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown } from '@/components/ui/Dropdown';
import { Toast, ToastType } from '@/components/ui/Toast';
import { motion, AnimatePresence } from 'framer-motion';
import { exportReportsAnalytics } from '@/lib/exportUtils';
import NotificationDropdown from '@/components/NotificationDropdown';
import AdminFinancialReports from '@/components/AdminFinancialReports';

const adminMenuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'users', label: 'User Management', icon: Users, category: 'Management' },
    { id: 'stores', label: 'Store Inventory', icon: Package, category: 'Management' },
    { id: 'events', label: 'Events', icon: Calendar, category: 'Management' },
    { id: 'exclusive-events', label: 'Exclusive Events', icon: Star, category: 'Management' },
    { id: 'jobs', label: 'Job Portal', icon: Briefcase, category: 'Management' },
    { id: 'lucky-draw', label: 'Lucky Draw', icon: Star, category: 'Management' },
    { id: 'withdrawals', label: 'Withdrawal Requests', icon: Wallet, category: 'Management' },
    { id: 'referrals', label: 'Referrals', icon: Share2, category: 'Marketing' },
    { id: 'offers', label: 'Offers', icon: Tag, category: 'Marketing' },
    { id: 'promotions', label: 'Promotions', icon: Megaphone, category: 'Marketing' },
    { id: 'reports', label: 'Reports', icon: BarChart2, category: 'Analytics' },
    { id: 'notifications', label: 'Notifications', icon: BellRing, category: 'System' },
    { id: 'settings', label: 'Settings', icon: Settings, category: 'System' },
];

interface Customer {
    id: string;
    email: string;
    name: string;
    phone?: string;
    status: string;
    createdAt: string;
    utrNumber?: string;
    paymentScreenshot?: string;
    address?: string;
    dob?: string;
    referredBy?: string;
    walletBalance?: number;
}

interface Product {
    id: string;
    name: string;
    price: string;
    category: string;
    image: string;
    inStock: boolean;
    storeId?: string;
    businessId?: string;
}

interface Job {
    id: string;
    title: string;
    company: string;
    type: string;
    salary: string;
    description: string;
    location: string;
    postedBy?: string;
    status: string;
}

interface Offer {
    id: string;
    title: string;
    code: string;
    discount: string;
    description: string;
    color: string;
    validUntil: string;
}


export default function AdminDashboard() {
    const router = useRouter();
    const { isLoggedIn, isLoading, user, userRole, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Customer management state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');

    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [presignedScreenshotUrl, setPresignedScreenshotUrl] = useState<string | null>(null);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [businesses, setBusinesses] = useState<any[]>([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0
    });

    // Event management state
    const [events, setEvents] = useState<any[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', location: '', image: '', category: 'General', ticketType: 'Free', price: '', status: 'Publish' });
    const [eventBookings, setEventBookings] = useState<any[]>([]);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
    const [selectedEventForBookings, setSelectedEventForBookings] = useState<any>(null);
    const [eventLoading, setEventLoading] = useState(false);
    const [isEditingEvent, setIsEditingEvent] = useState(false);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState<string | null>(null);
    const [isEditingJob, setIsEditingJob] = useState(false);
    const [editingJobId, setEditingJobId] = useState<string | null>(null);
    const [isEditingOffer, setIsEditingOffer] = useState(false);
    const [editingOfferId, setEditingOfferId] = useState<string | null>(null);
    const [isEditingPromo, setIsEditingPromo] = useState(false);
    const [editingPromoId, setEditingPromoId] = useState<string | null>(null);

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', description: '', image: '', storeId: '' });

    // Jobs state
    const [jobs, setJobs] = useState<Job[]>([]);
    const [jobLoading, setJobLoading] = useState(false);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [newJob, setNewJob] = useState({ title: '', company: '', type: 'Full-time', salary: '', description: '', location: '', status: 'Publish' });
    const [jobApplications, setJobApplications] = useState<any[]>([]);
    const [showJobApplicationsModal, setShowJobApplicationsModal] = useState(false);
    const [selectedJobForApplications, setSelectedJobForApplications] = useState<any>(null);

    // Withdrawals state
    const [withdrawals, setWithdrawals] = useState<any[]>([]);

    // Offers state
    const [offers, setOffers] = useState<Offer[]>([]);
    const [offerLoading, setOfferLoading] = useState(false);
    const [showAddOfferModal, setShowAddOfferModal] = useState(false);
    const [newOffer, setNewOffer] = useState({
        title: '',
        code: '',
        discount: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        description: '',
        color: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        validFrom: '',
        validUntil: '',
        eventId: '',
        eventTitle: '',
        minOrderValue: '',
        isEnabled: true
    });


    // Promotions state
    const [showAddPromoModal, setShowAddPromoModal] = useState(false);
    const [newPromo, setNewPromo] = useState({
        code: '',
        discount: '',
        discountType: 'percentage' as 'percentage' | 'fixed',
        title: '',
        description: '',
        expiryDate: '',
        minPurchase: '',
        maxUsage: '',
        maxUsagePerUser: '1'
    });

    // Stores, Orders & Transactions state
    const [stores, setStores] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [commissions, setCommissions] = useState({ rate: 10, total: 0 });
    const [productCategories, setProductCategories] = useState(['Electronics', 'Fashion', 'Home & Decor', 'Food & Beverages']);
    const [jobStats, setJobStats] = useState<any>(null);

    // Notifications state
    const [showAddNotificationModal, setShowAddNotificationModal] = useState(false);
    const [newNotification, setNewNotification] = useState({
        id: '',
        title: '',
        message: '',
        type: 'broadcast',
        targetCity: '',
        targetInterests: '',
        targetEventType: '',
        actionUrl: '',
        targetUserId: ''
    });
    const [viewingNotification, setViewingNotification] = useState<any>(null);
    const [isEditingNotification, setIsEditingNotification] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string, type: 'promo' | 'job' | 'notification' | 'event' | 'product' | 'offer' | 'user' } | null>(null);
    const [settingsTab, setSettingsTab] = useState('account');

    // Platform Reports & Settings
    const [platformStats, setPlatformStats] = useState<any>(null);
    const [platformSettings, setPlatformSettings] = useState<any>(null);
    const [allCampaigns, setAllCampaigns] = useState<any[]>([]);

    // Admin's own business state (Minimal)
    const [adminBusiness, setAdminBusiness] = useState({
        name: 'Headquarters',
        logo: '',
        contactNumber: '+91 9876543210',
        email: 'admin@platform.com',
        address: '123 Tech Park, Bangalore, India',
        about: 'Premium E-commerce and Event Management Platform.',
        bankInfo: {
            details: 'HDFC Bank - 50100234567890',
            payoutMethod: 'IMPS/NEFT',
            gstId: '29ABCDE1234F1Z5'
        },
        settings: {
            bookingsEnabled: true,
            defaultCurrency: 'INR',
            language: 'en',
            serviceArea: 'Bangalore'
        }
    });

    // Export dropdown state
    const [showExportDropdown, setShowExportDropdown] = useState(false);

    // Reports state (Minimal)
    const [reportsData, setReportsData] = useState({
        events: {
            total: 24,
            active: 18,
            closed: 6
        },
        bookings: {
            total: 156,
            confirmed: 142,
            cancelled: 14
        },
        revenue: {
            total: 450000,
            perEvent: 18750,
            today: 12500,
            thisMonth: 85000
        },
        customers: {
            total: 1200,
            repeat: 450
        }
    });

    // Admin Settings State
    const [adminAccountSettings, setAdminAccountSettings] = useState({
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [adminNotificationSettings, setAdminNotificationSettings] = useState({
        bookingAlerts: true,
        paymentAlerts: true,
        newUserAlerts: true,
        eventSubmissions: true,
        jobApplications: true,
        customerReviews: true,
        systemUpdates: false,
        marketingUpdates: false
    });

    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const viewResume = async (base64: string, name: string) => {
        if (!base64) {
            showToast('No resume uploaded for this application.', 'info');
            return;
        }

        let pdfData = base64;
        if (!base64.startsWith('data:application/pdf')) {
            // Check if it's potential raw base64
            if (/^[A-Za-z0-9+/=]+$/.test(base64.trim().replace(/\s/g, ''))) {
                pdfData = `data:application/pdf;base64,${base64.trim().replace(/\s/g, '')}`;
            } else {
                showToast('Invalid resume format. The file might be corrupted or in an unsupported format.', 'error');
                return;
            }
        }

        try {
            // Using fetch on a data URL is a robust way to get a Blob without manually decoding base64
            const response = await fetch(pdfData);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Open in new tab
            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                showToast('Pop-up blocked. Please allow pop-ups to view the resume.', 'warning');
            }

            // Cleanup URL after some time to free memory
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (e) {
            console.error('Resume view error:', e);
            showToast('Failed to open resume. The data might be corrupted.', 'error');
        }
    };

    useEffect(() => {
        if (user) {
            setAdminAccountSettings(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user]);

    const lastFetchedRef = React.useRef<string>('');

    // Redirect if not admin
    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                router.push('/login');
            } else if (userRole !== 'ADMIN') {
                router.push('/dashboard');
            }
        }
    }, [isLoggedIn, isLoading, userRole, router]);

    // Data Fetching Logic
    const fetchCustomers = useCallback(async () => {
        setLoadingCustomers(true);
        try {
            const params = new URLSearchParams();
            if (statusFilter) params.append('status', statusFilter);


            const response = await fetch(`/api/admin/customers?${params.toString()}`, { credentials: 'include' });
            const data = await response.json();

            if (data.success) {
                setCustomers(data.data || []);
                const all = data.data || [];
                setStats({
                    totalUsers: all.length,
                    activeUsers: all.filter((c: Customer) => c.status === 'ACTIVE').length,
                    pendingUsers: all.filter((c: Customer) => c.status === 'PENDING').length,
                    suspendedUsers: all.filter((c: Customer) => c.status === 'SUSPENDED').length,
                });
            }
        } catch (error) {
            console.error('Failed to fetch customers:', error);
        } finally {
            setLoadingCustomers(false);
        }
    }, [statusFilter]);

    const fetchData = useCallback(async (endpoint: string, setter: (data: any) => void, loader: (l: boolean) => void) => {
        loader(true);
        try {
            const res = await fetch(`/api/admin/${endpoint}`);
            const data = await res.json();
            if (data && data.success) {
                setter(data.data || data);
            } else {
                setter([]);
            }
        } catch (e) {
            console.error(`Failed to fetch ${endpoint}`, e);
            setter([]);
        } finally {
            loader(false);
        }
    }, []);

    const createItem = async (endpoint: string, item: any, refresh: () => void, modalSetter: (v: boolean) => void, resetItem: () => void) => {
        try {
            const res = await fetch(`/api/admin/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            const data = await res.json();
            if (data.success) {
                refresh();
                modalSetter(false);
                resetItem();
            } else {
                showToast(data.error || 'Failed to create item', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred while creating item', 'error');
        }
    };

    const updateItem = async (endpoint: string, item: any, refresh: () => void, modalSetter: (v: boolean) => void, resetItem: () => void) => {
        try {
            const res = await fetch(`/api/admin/${endpoint}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });

            if (!res.ok) {
                showToast(`Failed to update: ${res.status} ${res.statusText}`, 'error');
                return;
            }

            const data = await res.json();
            if (data.success) {
                showToast('Updated successfully', 'success');
                refresh();
                modalSetter(false);
                resetItem();
                setIsEditingEvent(false);
                setEditingEventId(null);
                setIsEditingProduct(false);
                setEditingProductId(null);
                setIsEditingJob(false);
                setEditingJobId(null);
                setIsEditingOffer(false);
                setEditingOfferId(null);
                setIsEditingPromo(false);
                setEditingPromoId(null);
            } else {
                showToast(data.error || 'Failed to update item', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred while updating item', 'error');
        }
    };

    const fetchEvents = useCallback(() => fetchData('events', setEvents, setEventLoading), [fetchData]);
    const fetchProducts = useCallback(async () => {
        setProductLoading(true);
        try {
            const res = await fetch('/api/admin/shop');
            const data = await res.json();
            if (data && data.success) {
                setProducts(Array.isArray(data.products) ? data.products : (data.data || []));
            } else {
                setProducts([]);
            }
        } catch (e) {
            console.error('Failed to fetch products', e);
            setProducts([]);
        } finally {
            setProductLoading(false);
        }
    }, []);
    const fetchJobs = useCallback(() => fetchData('jobs', setJobs, setJobLoading), [fetchData]);
    const fetchOffers = useCallback(() => fetchData('offers', setOffers, setOfferLoading), [fetchData]);
    const fetchPromotions = useCallback(() => fetchData('promotions', setPromotions, setActionLoading), [fetchData]);
    const fetchNotifications = useCallback(() => fetchData('notifications', setNotifications, setActionLoading), [fetchData]);
    const fetchBusinesses = useCallback(() => fetchData('businesses', setBusinesses, setActionLoading), [fetchData]);
    const fetchStores = useCallback(() => fetchData('stores', setStores, setActionLoading), [fetchData]);
    const fetchOrders = useCallback(() => fetchData('orders', setOrders, setActionLoading), [fetchData]);
    const fetchTransactions = useCallback(() => fetchData('transactions', setTransactions, setActionLoading), [fetchData]);

    const toggleOfferEnabled = async (id: string, isEnabled: boolean) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/offers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isEnabled })
            });
            const data = await res.json();
            if (data.success) fetchOffers();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const togglePromoActive = async (id: string, active: boolean) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/promotions', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, active })
            });
            const data = await res.json();
            if (data.success) fetchPromotions();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const deletePromo = async (id: string) => {
        setDeleteConfirm({ id, type: 'promo' });
    };

    const confirmDeletePromo = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/promotions?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Promo code deleted', 'success');
                fetchPromotions();
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to delete promo code', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const fetchWithdrawals = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/withdrawals');
            const data = await res.json();
            if (data.success) {
                setWithdrawals(data.data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const updateWithdrawalStatus = async (requestSk: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/withdrawals', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestSk, status })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Withdrawal marked as ${status}`, 'success');
                fetchWithdrawals();
            } else {
                showToast(data.error || 'Failed to update withdrawal', 'error');
            }
        } catch (e) {
            console.error('Failed to update withdrawal', e);
            showToast('Failed to update withdrawal', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const fetchJobStats = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/jobs?action=stats');
            const data = await res.json();
            if (data.success) setJobStats(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const updateJobStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/jobs`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                fetchJobs();
                fetchJobStats();
            }
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const deleteJob = async (id: string) => {
        setDeleteConfirm({ id, type: 'job' });
    };

    const confirmDeleteJob = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/jobs?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Job listing deleted', 'success');
                fetchJobs();
                fetchJobStats();
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to delete job', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const updateStoreStatus = async (storeId: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/stores/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeId, status })
            });
            const data = await res.json();
            if (data.success) fetchStores();
        } catch (e) {
            console.error('Failed to update store status', e);
        } finally {
            setActionLoading(false);
        }
    };

    const addNotification = async () => {
        if (!newNotification.title || !newNotification.message) {
            showToast('Title and message are required', 'warning');
            return;
        }

        setActionLoading(true);
        const { targetUserId, id, ...rest } = newNotification;
        const payload = {
            ...rest,
            userId: targetUserId || undefined,
            targetInterests: newNotification.targetInterests ? newNotification.targetInterests.split(',').map(i => i.trim()) : []
        };

        try {
            const endpoint = isEditingNotification ? `/api/admin/notifications?id=${id}` : '/api/admin/notifications';
            const method = isEditingNotification ? 'PATCH' : 'POST';

            const res = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                showToast(isEditingNotification ? 'Notification updated successfully!' : 'Broadcast sent successfully!', 'success');
                fetchNotifications();
                setShowAddNotificationModal(false);
                setIsEditingNotification(false);
                setNewNotification({
                    id: '', title: '', message: '', type: 'broadcast', targetCity: '', targetInterests: '', targetEventType: '', actionUrl: '', targetUserId: ''
                });
            } else {
                showToast(data.error || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Failed to process notification:', error);
            showToast('An error occurred', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteNotification = async (id: string) => {
        setDeleteConfirm({ id, type: 'notification' });
    };

    const confirmDeleteNotification = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/notifications?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Notification deleted', 'success');
                fetchNotifications();
            } else {
                showToast(data.error || 'Failed to delete', 'error');
            }
        } catch (error) {
            showToast('An error occurred', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const editNotification = (n: any) => {
        setNewNotification({
            id: n.id,
            title: n.title,
            message: n.message,
            type: n.type || 'broadcast',
            targetCity: n.targetCity || '',
            targetInterests: Array.isArray(n.targetInterests) ? n.targetInterests.join(', ') : '',
            targetEventType: n.targetEventType || '',
            actionUrl: n.actionUrl || '',
            targetUserId: n.userId || ''
        });
        setIsEditingNotification(true);
        setShowAddNotificationModal(true);
    };

    const updateEventStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/events`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Event marked as ${status}`, 'success');
                fetchEvents();
            }
        } catch (e) {
            console.error('Failed to update event status', e);
            showToast('Failed to update event status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteEvent = async (id: string) => {
        setDeleteConfirm({ id, type: 'event' });
    };

    const confirmDeleteEvent = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/events?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                showToast('Event deleted', 'success');
                fetchEvents();
            }
        } catch (e) {
            console.error('Failed to delete event', e);
            showToast('Failed to delete event', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const handleEventImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Compress and resize image to fit DynamoDB limits
            const img = new window.Image();
            const reader = new FileReader();
            reader.onloadend = () => {
                img.src = reader.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 600;
                    const MAX_HEIGHT = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = (height * MAX_WIDTH) / width;
                        width = MAX_WIDTH;
                    }
                    if (height > MAX_HEIGHT) {
                        width = (width * MAX_HEIGHT) / height;
                        height = MAX_HEIGHT;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                    setNewEvent({ ...newEvent, image: compressedImage });
                };
            };
            reader.readAsDataURL(file);
        }
    };

    const addEvent = () => {
        if (isEditingEvent && editingEventId) {
            updateItem('events', { ...newEvent, id: editingEventId }, fetchEvents, setShowAddModal, () => setNewEvent({ title: '', description: '', date: '', time: '', location: '', image: '', category: 'General', ticketType: 'Free', price: '', status: 'Publish' }));
        } else {
            createItem('events', newEvent, fetchEvents, setShowAddModal, () => setNewEvent({ title: '', description: '', date: '', time: '', location: '', image: '', category: 'General', ticketType: 'Free', price: '', status: 'Publish' }));
        }
    };

    const editEvent = (event: any) => {
        setNewEvent({
            title: event.title || '',
            description: event.description || '',
            date: event.date || '',
            time: event.time || '',
            location: event.location || '',
            image: event.image || '',
            category: event.category || 'General',
            ticketType: event.ticketType || 'Free',
            price: event.price || '',
            status: event.status || 'Publish'
        });
        setIsEditingEvent(true);
        setEditingEventId(event.id);
        setShowAddModal(true);
    };

    const fetchEventBookings = useCallback(() => fetchData('events/bookings', setEventBookings, setActionLoading), [fetchData]);

    const updateBookingStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/events/bookings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                fetchEventBookings();
                if (status === 'CONFIRMED') {
                    showToast('Booking confirmed! Confirmation email sent to user.', 'success');
                } else {
                    showToast(`Booking status updated to ${status}`, 'success');
                }
            } else {
                showToast(data.error || 'Failed to update booking status', 'error');
            }
        } catch (e) {
            console.error('Failed to update booking status', e);
            showToast('Failed to update booking status', 'error');
        } finally {
            setActionLoading(false);
        }
    };
    const handleProductImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // DynamoDB has a 400KB hard limit. We should stay well below that for the image.
            if (file.size > 250 * 1024) {
                showToast('Image is too large (limit: 250KB). Please use a smaller image or a URL.', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewProduct({ ...newProduct, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const addProduct = () => {
        const priceNum = parseFloat(newProduct.price) || 0;
        const productPayload = {
            ...newProduct,
            images: newProduct.image ? [newProduct.image] : [],
            originalPrice: priceNum,
            offerPrice: priceNum,
            price: priceNum,
            stock: 1,
            inStock: true,
            status: 'Active',
        };
        const resetFn = () => setNewProduct({ name: '', price: '', category: '', description: '', image: '', storeId: '' });
        if (isEditingProduct && editingProductId) {
            updateProductItem({ ...productPayload, id: editingProductId }, fetchProducts, setShowAddProductModal, resetFn);
        } else {
            createItem('shop', productPayload, fetchProducts, setShowAddProductModal, resetFn);
        }
    };

    const updateProductItem = async (item: any, refresh: () => void, modalSetter: (v: boolean) => void, resetItem: () => void) => {
        try {
            const priceNum = parseFloat(item.price) || item.originalPrice || item.offerPrice || 0;
            const updateData = {
                ...item,
                PK: `PRODUCT#${item.id}`,
                originalPrice: priceNum,
                offerPrice: priceNum,
                price: priceNum,
            };

            const res = await fetch(`/api/admin/shop`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData)
            });

            if (!res.ok) {
                showToast(`Failed to update: ${res.status} ${res.statusText}`, 'error');
                return;
            }

            const data = await res.json();
            if (data.success) {
                showToast('Product updated successfully', 'success');
                refresh();
                modalSetter(false);
                resetItem();
                setIsEditingProduct(false);
                setEditingProductId(null);
            } else {
                showToast(data.error || 'Failed to update product', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred while updating product', 'error');
        }
    };

    const editProduct = (product: any) => {
        setNewProduct({
            name: product.name || '',
            price: String(product.price || product.offerPrice || product.originalPrice || ''),
            category: product.category || '',
            description: product.description || '',
            image: product.image || (product.images && product.images[0]) || '',
            storeId: product.storeId || ''
        });
        setIsEditingProduct(true);
        setEditingProductId(product.id);
        setShowAddProductModal(true);
    };

    const deleteProduct = async (id: string) => {
        setDeleteConfirm({ id, type: 'product' });
    };

    const confirmDeleteProduct = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/shop?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Product deleted', 'success');
                fetchProducts();
            } else {
                showToast(data.error || 'Failed to delete product', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to delete product', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const toggleProductStock = async (product: any) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/shop`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...product, status: product.status === 'Active' ? 'Out of Stock' : 'Active' })
            });
            const data = await res.json();
            if (data.success) fetchProducts();
            else showToast(data.error, 'error');
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };
    const fetchJobApplications = useCallback(() => fetchData('jobs/applications', setJobApplications, setActionLoading), [fetchData, setJobApplications]);

    const updateJobApplicationStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/jobs/applications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                fetchJobApplications();
                showToast(`Application marked as ${status}! Email notification sent to applicant.`, 'success');
            } else {
                showToast(data.error || 'Failed to update application status', 'error');
            }
        } catch (e) {
            console.error('Failed to update job application status', e);
            showToast('Failed to update application status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const addJob = () => {
        if (isEditingJob && editingJobId) {
            updateItem('jobs', { ...newJob, id: editingJobId }, fetchJobs, setShowAddJobModal, () => setNewJob({ title: '', company: '', type: 'Full-time', salary: '', description: '', location: '', status: 'Publish' }));
        } else {
            createItem('jobs', newJob, fetchJobs, setShowAddJobModal, () => setNewJob({ title: '', company: '', type: 'Full-time', salary: '', description: '', location: '', status: 'Publish' }));
        }
    };

    const editJob = (job: any) => {
        setNewJob({
            title: job.title || '',
            company: job.company || '',
            type: job.type || 'Full-time',
            salary: job.salary || '',
            description: job.description || '',
            location: job.location || '',
            status: job.status || 'Publish'
        });
        setIsEditingJob(true);
        setEditingJobId(job.id);
        setShowAddJobModal(true);
    };

    const addOffer = () => {
        if (isEditingOffer && editingOfferId) {
            updateItem('offers', { ...newOffer, id: editingOfferId }, fetchOffers, setShowAddOfferModal, () => setNewOffer({ title: '', code: '', discount: '', discountType: 'percentage', description: '', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', validFrom: '', validUntil: '', eventId: '', eventTitle: '', minOrderValue: '', isEnabled: true }));
        } else {
            createItem('offers', newOffer, fetchOffers, setShowAddOfferModal, () => setNewOffer({ title: '', code: '', discount: '', discountType: 'percentage', description: '', color: 'bg-gradient-to-r from-blue-500 to-indigo-500', validFrom: '', validUntil: '', eventId: '', eventTitle: '', minOrderValue: '', isEnabled: true }));
        }
    };

    const editOffer = (offer: any) => {
        setNewOffer({
            title: offer.title || '',
            code: offer.code || '',
            discount: offer.discount || '',
            discountType: offer.discountType || 'percentage',
            description: offer.description || '',
            color: offer.color || 'bg-gradient-to-r from-blue-500 to-indigo-500',
            validFrom: offer.validFrom || '',
            validUntil: offer.validUntil || '',
            eventId: offer.eventId || '',
            eventTitle: offer.eventTitle || '',
            minOrderValue: offer.minOrderValue || '',
            isEnabled: offer.isEnabled !== undefined ? offer.isEnabled : true
        });
        setIsEditingOffer(true);
        setEditingOfferId(offer.id);
        setShowAddOfferModal(true);
    };
    const addPromo = () => {
        if (!newPromo.code || !newPromo.discount) {
            showToast('Promo code and discount are required', 'warning');
            return;
        }
        const promoData = {
            ...newPromo,
            discount: parseFloat(newPromo.discount as string),
            minPurchase: parseFloat(newPromo.minPurchase as string) || 0,
            maxUsage: parseInt(newPromo.maxUsage as string) || 1000,
            maxUsagePerUser: parseInt(newPromo.maxUsagePerUser as string) || 1
        };

        if (isEditingPromo && editingPromoId) {
            updateItem('promotions', { ...promoData, id: editingPromoId }, fetchPromotions, setShowAddPromoModal, () => setNewPromo({ code: '', discount: '', discountType: 'percentage', title: '', description: '', expiryDate: '', minPurchase: '', maxUsage: '', maxUsagePerUser: '1' }));
        } else {
            createItem('promotions', promoData, fetchPromotions, setShowAddPromoModal, () => setNewPromo({ code: '', discount: '', discountType: 'percentage', title: '', description: '', expiryDate: '', minPurchase: '', maxUsage: '', maxUsagePerUser: '1' }));
        }
    };

    const editPromo = (promo: any) => {
        setNewPromo({
            code: promo.code || '',
            discount: promo.discount?.toString() || '',
            discountType: promo.discountType || 'percentage',
            title: promo.title || '',
            description: promo.description || '',
            expiryDate: promo.expiryDate || '',
            minPurchase: promo.minPurchase?.toString() || '',
            maxUsage: promo.maxUsage?.toString() || '1000',
            maxUsagePerUser: promo.maxUsagePerUser?.toString() || '1'
        });
        setIsEditingPromo(true);
        setEditingPromoId(promo.id);
        setShowAddPromoModal(true);
    };

    const updateOfferStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/offers`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) fetchOffers();
        } catch (e) {
            console.error('Failed to update offer status', e);
        } finally {
            setActionLoading(false);
        }
    };

    const deleteOffer = async (id: string) => {
        setDeleteConfirm({ id, type: 'offer' });
    };

    const confirmDeleteOffer = async (id: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/offers?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                showToast('Offer deleted', 'success');
                fetchOffers();
            } else {
                showToast(data.error || 'Failed to delete offer', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to delete offer', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const fetchPlatformStats = useCallback(async () => {
        try {
            const res = await fetch('/api/reports');
            const data = await res.json();
            if (data.success) {
                setPlatformStats(data.data);
                // Sync with reportsData state
                setReportsData({
                    events: {
                        total: data.data.totalEvents || 0,
                        active: data.data.totalEvents || 0,
                        closed: 0
                    },
                    bookings: {
                        total: data.data.totalBookings || 0,
                        confirmed: data.data.totalBookings || 0,
                        cancelled: 0
                    },
                    revenue: {
                        total: data.data.totalRevenue || 0,
                        perEvent: data.data.totalEvents > 0 ? data.data.totalRevenue / data.data.totalEvents : 0,
                        today: 0,
                        thisMonth: 0
                    },
                    customers: {
                        total: data.data.totalCustomers || 0,
                        repeat: 0
                    }
                });
            }
        } catch (e) { console.error(e); }
    }, []);

    const fetchPlatformSettings = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/settings');
            const data = await res.json();
            if (data.success) {
                setPlatformSettings(data.data);
                if (data.data.adminBusiness) {
                    setAdminBusiness(data.data.adminBusiness);
                }
                if (data.data.notificationSettings) {
                    setAdminNotificationSettings(data.data.notificationSettings);
                }
            }
        } catch (e) { console.error(e); }
    }, []);

    const savePlatformSettings = async (settings: any) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...settings, adminId: user?.id || 'admin' })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Settings saved successfully!', 'success');
                fetchPlatformSettings();
            }
        } catch (e) {
            console.error('Failed to save settings', e);
            showToast('Failed to save settings', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const saveAdminBusiness = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...platformSettings,
                    adminBusiness: adminBusiness,
                    adminId: user?.id || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Business details saved successfully!', 'success');
                fetchPlatformSettings();
            } else {
                showToast(data.error || 'Failed to save business details', 'error');
            }
        } catch (e) {
            console.error('Failed to save business details', e);
            showToast('Failed to save business details', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const updateAdminAccount = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...platformSettings,
                    adminName: adminAccountSettings.name,
                    adminEmail: adminAccountSettings.email,
                    adminId: user?.id || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Account settings updated!', 'success');
                fetchPlatformSettings();
            }
        } catch (e) { console.error(e); showToast('Failed to update account settings', 'error'); }
        finally { setActionLoading(false); }
    };

    const changeAdminPassword = async () => {
        // Validation
        if (!adminAccountSettings.currentPassword || !adminAccountSettings.newPassword) {
            showToast('Please fill in both current and new password fields', 'warning');
            return;
        }

        if (adminAccountSettings.newPassword.length < 8) {
            showToast('New password must be at least 8 characters long', 'warning');
            return;
        }

        if (adminAccountSettings.confirmPassword && adminAccountSettings.newPassword !== adminAccountSettings.confirmPassword) {
            showToast('New password and confirmation do not match', 'error');
            return;
        }

        setActionLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: adminAccountSettings.currentPassword,
                    newPassword: adminAccountSettings.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Password changed successfully!', 'success');
                // Clear password fields
                setAdminAccountSettings({
                    ...adminAccountSettings,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            } else {
                showToast(data.error || 'Failed to change password', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('Failed to change password', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const saveAdminNotifications = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...platformSettings,
                    notificationSettings: adminNotificationSettings,
                    adminId: user?.id || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Notification preferences saved!', 'success');
                fetchPlatformSettings();
            }
        } catch (e) { console.error(e); showToast('Failed to save notification preferences', 'error'); }
        finally { setActionLoading(false); }
    };

    const saveAllSettings = async () => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...platformSettings,
                    adminBusiness: adminBusiness,
                    adminName: adminAccountSettings.name,
                    adminEmail: adminAccountSettings.email,
                    notificationSettings: adminNotificationSettings,
                    adminId: user?.id || 'admin'
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('All settings saved successfully!', 'success');
                fetchPlatformSettings();
            }
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    const fetchAllCampaigns = useCallback(async () => {
        try {
            const res = await fetch('/api/campaigns');
            const data = await res.json();
            if (data.success) setAllCampaigns(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const updateCampaignStatus = async (id: string, status: string) => {
        setActionLoading(true);
        try {
            const res = await fetch('/api/campaigns', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) fetchAllCampaigns();
        } catch (e) { console.error(e); }
        finally { setActionLoading(false); }
    };

    useEffect(() => {
        if (!isLoggedIn || isLoading) return;

        const fetchKey = `${activeTab}:${statusFilter}`;
        if (lastFetchedRef.current === fetchKey) return;
        lastFetchedRef.current = fetchKey;

        switch (activeTab) {
            case 'overview': case 'users': fetchCustomers(); break;
            case 'events': fetchEvents(); break;
            case 'stores': fetchStores(); fetchProducts(); break;
            case 'jobs': fetchJobs(); fetchJobStats(); break;
            case 'withdrawals': fetchWithdrawals(); break;
            case 'offers': fetchOffers(); fetchEvents(); break;
            case 'promotions': fetchPromotions(); fetchAllCampaigns(); break;
            case 'notifications': fetchNotifications(); break;
            case 'business': fetchPlatformSettings(); fetchBusinesses(); fetchTransactions(); break;
            case 'reports': fetchPlatformStats(); break;
            case 'settings': fetchPlatformSettings(); break;
        }
    }, [activeTab, isLoggedIn, isLoading, statusFilter,
        fetchCustomers, fetchEvents, fetchStores, fetchProducts, fetchJobs,
        fetchJobStats, fetchWithdrawals, fetchOffers, fetchPromotions,
        fetchNotifications, fetchBusinesses, fetchTransactions,
        fetchAllCampaigns, fetchPlatformSettings, fetchPlatformStats
    ]);

    // Close export dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showExportDropdown) {
                const target = event.target as HTMLElement;
                if (!target.closest('.export-dropdown-container')) {
                    setShowExportDropdown(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showExportDropdown]);

    const updateCustomerStatus = async (customerId: string, status: string) => {
        setActionLoading(true);
        try {
            const response = await fetch('/api/admin/customers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerId, status }),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) {
                showToast(`User status updated to ${status}`, 'success');
                fetchCustomers();
                setShowModal(false);
                setSelectedCustomer(null);
            } else {
                showToast(data.error || 'Failed to update user status', 'error');
            }
        } catch (error) {
            console.error('Failed to update customer:', error);
            showToast('Failed to update user status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const deleteCustomer = async (customerId: string) => {
        setDeleteConfirm({ id: customerId, type: 'user' });
    };

    const confirmDeleteCustomer = async (customerId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/admin/customers?customerId=${customerId}`, {
                method: 'DELETE',
            });
            const data = await res.json();
            if (data.success) {
                showToast('User deleted successfully', 'success');
                setShowModal(false);
                setSelectedCustomer(null);
                fetchCustomers();
            } else {
                showToast(data.error || 'Failed to delete user', 'error');
            }
        } catch (error) {
            showToast('Failed to delete user', 'error');
        } finally {
            setActionLoading(false);
            setDeleteConfirm(null);
        }
    };

    const updateBusinessVerification = async (businessId: string, status: 'verified' | 'rejected') => {
        setActionLoading(true);
        try {
            const action = status === 'verified' ? 'verify' : 'reject';
            const res = await fetch('/api/admin/businesses/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: businessId, action })
            });
            const data = await res.json();
            if (data.success) {
                showToast(`Business ${status} successfully!`, 'success');
                fetchBusinesses();
            } else {
                showToast('Failed to update business status', 'error');
            }
        } catch (error) {
            console.error('Failed to verify business:', error);
            showToast('Failed to update business status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    if (isLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    // --- RENDER FUNCTIONS ---

    const renderOverview = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50', change: '+12%' },
                    { label: 'Active Users', value: stats.activeUsers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50', change: '+5%' },
                    { label: 'Pending', value: stats.pendingUsers, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: '+2' },
                    { label: 'Suspended', value: stats.suspendedUsers, icon: UserX, color: 'text-red-600', bg: 'bg-red-50', change: '-1' },
                ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center ${stat.color}`}>
                                <stat.icon size={26} />
                            </div>
                            <span className="flex items-center gap-1 text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                <TrendingUp size={14} /> {stat.change}
                            </span>
                        </div>
                        <div>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                            <p className="text-slate-500 font-medium mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Section */}
            <div>
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Activity className="text-blue-600" /> Recent User Registrations
                </h3>
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                    <div className="divide-y divide-slate-50">
                        {customers && customers.length > 0 ? (
                            customers.slice(0, 5).map((customer: any) => (
                                <div key={customer.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-lg">{customer.name || 'Unknown User'}</p>
                                            <p className="text-sm text-slate-500">{customer.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 justify-between md:justify-end w-full md:w-auto">
                                        <div className="text-left md:text-right">
                                            <p className="text-sm font-medium text-slate-600 hidden md:block">Joined On</p>
                                            <p className="text-sm text-slate-500">{new Date(customer.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${customer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                            customer.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <Activity className="mx-auto text-slate-300 mb-3" size={32} />
                                <p className="text-slate-500 font-medium">No recent registrations found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderUserManagement = () => (
        <div className="space-y-6">
            <div className="flex gap-2">
                <Dropdown
                    options={[
                        { label: 'All Status', value: '' },
                        { label: 'Active', value: 'ACTIVE' },
                        { label: 'Pending', value: 'PENDING' },
                        { label: 'Suspended', value: 'SUSPENDED' },
                    ]}
                    value={statusFilter}
                    onChange={val => setStatusFilter(val)}
                    placeholder="All Status"
                    className="min-w-[150px]"
                />
                <button onClick={fetchCustomers} className="px-4 py-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">
                    <RefreshCw size={20} className={`text-slate-600 ${loadingCustomers ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">User Profile</th>
                                <th className="text-left px-6 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="text-right px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center text-blue-700 font-bold text-lg">
                                                {customer.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{customer.name}</p>
                                                <p className="text-xs text-slate-500 font-medium">{customer.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${customer.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-100' :
                                            customer.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                                'bg-red-50 text-red-700 border-red-100'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'ACTIVE' ? 'bg-green-500' : customer.status === 'PENDING' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                                            <button onClick={async () => { setSelectedCustomer(customer); setShowModal(true); setPresignedScreenshotUrl(null); if (customer.paymentScreenshot) { try { const res = await fetch(`/api/admin/presign?url=${encodeURIComponent(customer.paymentScreenshot)}`, { credentials: 'include' }); const data = await res.json(); if (data.signedUrl) setPresignedScreenshotUrl(data.signedUrl); } catch { } } }} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 shadow-sm">
                                                <Eye size={16} />
                                            </button>
                                            {customer.status === 'PENDING' && (
                                                <>
                                                    <button onClick={() => updateCustomerStatus(customer.id, 'ACTIVE')} className="p-2 bg-green-50 border border-green-200 text-green-600 rounded-xl hover:bg-green-100 shadow-sm">
                                                        <UserCheck size={16} />
                                                    </button>
                                                    <button onClick={() => updateCustomerStatus(customer.id, 'REJECTED')} className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 shadow-sm">
                                                        <UserX size={16} />
                                                    </button>
                                                </>
                                            )}
                                            <button onClick={() => deleteCustomer(customer.id)} className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-xl hover:bg-red-100 shadow-sm" title="Delete User">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderGridItem = (items: any[], title: string, onAdd: () => void, renderCard: (item: any) => React.ReactNode, icon: any) => (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900">{title}</h3>
                    <p className="text-slate-500">Manage your {title.toLowerCase()} inventory</p>
                </div>
                <button onClick={onAdd} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20">
                    <Plus size={20} /> Add New
                </button>
            </div>
            {(!items || items.length === 0) ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center shadow-sm">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                        {React.createElement(icon, { size: 40 })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No items yet</h3>
                    <p className="text-slate-500">Get started by adding your first item.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map(renderCard)}
                </div>
            )}
        </div>
    );

    // Render Helpers for specific types
    const renderStores = () => (
        <div className="space-y-12">
            {renderGridItem(products, 'Store Inventory', () => setShowAddProductModal(true), (p) => (
                <div key={p.id} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                    <div className="aspect-square rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden relative">
                        <Image src={p.image || (p.images && p.images[0]) || '/images.jpg'} alt={p.name || 'Product'} width={400} height={400} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <button
                            onClick={() => toggleProductStock(p)}
                            className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-white backdrop-blur-md transition-all ${p.inStock ? 'bg-green-500/80 hover:bg-red-500' : 'bg-red-500/80 hover:bg-green-500'}`}
                        >
                            {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                        <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <button
                                onClick={() => editProduct(p)}
                                className="p-2 bg-white/80 backdrop-blur-md text-slate-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-900 hover:text-white shadow-lg"
                                title="Edit Product"
                            >
                                <Edit size={16} />
                            </button>
                            <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 bg-white/80 backdrop-blur-md text-red-600 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white shadow-lg"
                                title="Delete Product"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                    <div className="px-2">
                        <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">{p.name}</h4>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">{p.category}</span>
                            <span className="text-lg font-black text-slate-900">₹{p.price || p.offerPrice || 0}</span>
                        </div>
                    </div>
                </div>
            ), Package)}
        </div>
    );

    const renderPromotions = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-1">Promo & Campaigns</h3>
                    <p className="text-slate-500 font-medium">Create and track promo codes for platform-wide discounts</p>
                </div>
                <button
                    onClick={() => setShowAddPromoModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
                >
                    <Plus size={20} /> Create Promo Code
                </button>
            </div>

            {/* Campaign Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <Tag size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Total Active Promos</p>
                        <p className="text-2xl font-black text-slate-900">{promotions.filter((p: any) => p.active).length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <TrendingUp size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Total Uses</p>
                        <p className="text-2xl font-black text-slate-900">
                            {promotions.reduce((sum: number, p: any) => sum + (p.usedCount || 0), 0)}
                        </p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                        <Clock size={28} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-400">Expiring Soon</p>
                        <p className="text-2xl font-black text-slate-900">
                            {promotions.filter((p: any) => {
                                if (!p.expiryDate) return false;
                                const days = (new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 3600 * 24);
                                return days > 0 && days < 7;
                            }).length}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h4 className="text-xl font-bold text-slate-900">Active Promo Codes</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {promotions.map((p: any) => (
                        <div key={p.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between group hover:bg-white hover:shadow-xl transition-all relative overflow-hidden">
                            {p.usedCount >= p.maxUsage && p.maxUsage > 0 && (
                                <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-black px-3 py-1 uppercase tracking-widest -rotate-45 translate-x-3 translate-y-2">
                                    Full
                                </div>
                            )}
                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-sm font-black tracking-widest shadow-md">
                                        {p.code}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => editPromo(p)}
                                            className="p-2 bg-white text-slate-600 border border-slate-100 rounded-lg hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                            title="Edit Promotion"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => togglePromoActive(p.id, !p.active)}
                                            className={`p-2 rounded-lg transition-colors ${p.active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}
                                            title={p.active ? 'Deactivate' : 'Activate'}
                                        >
                                            {p.active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                        </button>
                                        <button
                                            onClick={() => deletePromo(p.id)}
                                            className="p-2 bg-white text-red-600 border border-red-100 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                            title="Delete Promotion"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                <h5 className="font-bold text-slate-900 text-lg mb-1">{p.title}</h5>
                                <p className="text-xs text-slate-500 mb-4 line-clamp-2">{p.description}</p>

                                <div className="flex items-end justify-between mb-4">
                                    <div className="text-2xl font-black text-indigo-600">
                                        {p.discount}{p.discountType === 'fixed' ? '₹' : '%'} <span className="text-xs uppercase opacity-60">OFF</span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">Usage</p>
                                        <p className="font-black text-slate-700">{p.usedCount || 0} / {p.maxUsage || '∞'}</p>
                                    </div>
                                </div>

                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                                    <div
                                        className={`h-full ${p.usedCount >= (p.maxUsage || 1000) ? 'bg-red-500' : 'bg-indigo-500'}`}
                                        style={{ width: `${Math.min(100, ((p.usedCount || 0) / (p.maxUsage || 100)) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-[10px] font-bold">
                                <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock size={12} />
                                    {p.expiryDate ? new Date(p.expiryDate).toLocaleDateString() : 'No Expiry'}
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-400 text-right justify-end">
                                    <DollarSign size={12} />
                                    Min: ₹{p.minPurchase || 0}
                                </div>
                            </div>
                        </div>
                    ))}
                    {promotions.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                            <Megaphone size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No active promo codes or campaigns found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );




    const handleExportReports = (format: 'csv' | 'excel' | 'json') => {
        try {
            exportReportsAnalytics(reportsData, format);
            setShowExportDropdown(false);
            showToast(`Reports exported successfully as ${format.toUpperCase()}`, 'success');
        } catch (error) {
            showToast('Failed to export reports', 'error');
            console.error('Export error:', error);
        }
    };

    const renderReports = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-1">Reports & Analysis</h3>
                    <p className="text-slate-500 font-medium">Monitor your platform&apos;s operational health</p>
                </div>
                <div className="flex gap-2 relative export-dropdown-container">
                    <button
                        onClick={() => setShowExportDropdown(!showExportDropdown)}
                        className="px-6 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export Reports
                    </button>
                    {showExportDropdown && (
                        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl border border-slate-200 shadow-lg z-50 overflow-hidden">
                            <button
                                onClick={() => handleExportReports('csv')}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <Download size={16} /> Export as CSV
                            </button>
                            <button
                                onClick={() => handleExportReports('excel')}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                            >
                                <Download size={16} /> Export as Excel
                            </button>
                            <button
                                onClick={() => handleExportReports('json')}
                                className="w-full px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-2 border-t border-slate-100"
                            >
                                <Download size={16} /> Export as JSON
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. Event Report */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <Calendar className="absolute -right-4 -bottom-4 text-blue-500/5 group-hover:scale-110 transition-transform" size={120} />
                    <p className="text-xs font-black text-blue-500 uppercase tracking-[0.2em] mb-4">Event Report</p>
                    <div className="space-y-4 relative z-10">
                        <div>
                            <p className="text-4xl font-black text-slate-900 mb-1">{reportsData.events.total}</p>
                            <p className="text-xs text-slate-500 font-bold">Total Events Created</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <p className="font-black text-green-600">{reportsData.events.active}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Active</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-400">{reportsData.events.closed}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Closed</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Booking Report */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <CheckCircle className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:scale-110 transition-transform" size={120} />
                    <p className="text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Booking Report</p>
                    <div className="space-y-4 relative z-10">
                        <div>
                            <p className="text-4xl font-black text-slate-900 mb-1">{reportsData.bookings.total}</p>
                            <p className="text-xs text-slate-500 font-bold">Total Platform Bookings</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <p className="font-black text-green-600">{reportsData.bookings.confirmed}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Confirmed</p>
                            </div>
                            <div>
                                <p className="font-black text-rose-500">{reportsData.bookings.cancelled}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Cancelled</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Revenue Report */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <DollarSign className="absolute -right-4 -bottom-4 text-amber-500/5 group-hover:scale-110 transition-transform" size={120} />
                    <p className="text-xs font-black text-amber-500 uppercase tracking-[0.2em] mb-4">Revenue Report</p>
                    <div className="space-y-4 relative z-10">
                        <div>
                            <p className="text-4xl font-black text-slate-900 mb-1">₹{reportsData.revenue.total.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-bold">Total Earnings</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                            <div>
                                <p className="font-black text-slate-900 text-sm">₹{reportsData.revenue.today.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Today</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-900 text-sm">₹{reportsData.revenue.thisMonth.toLocaleString()}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">This Month</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 4. Customer Report */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all">
                    <Users className="absolute -right-4 -bottom-4 text-purple-500/5 group-hover:scale-110 transition-transform" size={120} />
                    <p className="text-xs font-black text-purple-500 uppercase tracking-[0.2em] mb-4">Customer Report</p>
                    <div className="space-y-4 relative z-10">
                        <div>
                            <p className="text-4xl font-black text-slate-900 mb-1">{reportsData.customers.total}</p>
                            <p className="text-xs text-slate-500 font-bold">Total Platform Customers</p>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-50">
                            <div>
                                <p className="font-black text-purple-600">{reportsData.customers.repeat}</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Repeat Users</p>
                            </div>
                            <div>
                                <p className="font-black text-slate-900">{(reportsData.customers.total > 0 ? (reportsData.customers.repeat / reportsData.customers.total * 100) : 0).toFixed(0)}%</p>
                                <p className="text-[10px] text-slate-400 font-bold uppercase">Retention</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Chart */}
            <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-12 px-2">
                    <div>
                        <h4 className="text-2xl font-black text-slate-900 mb-1">Event Revenue Performance</h4>
                        <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Earnings per Event Distribution</p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-2xl border border-green-100">
                        <TrendingUp size={18} />
                        <span className="font-black text-xs uppercase">+24% Growth</span>
                    </div>
                </div>
                <div className="h-56 flex items-end gap-3 px-4">
                    {[30, 45, 25, 60, 40, 75, 50, 90, 65, 85, 40, 55, 30, 70, 45].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-50 rounded-2xl relative group hover:bg-blue-600 transition-all cursor-pointer" style={{ height: `${h}%` }}>
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-black py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl">₹{(h * 500).toLocaleString()}</div>
                            <div className="absolute inset-x-0 bottom-0 h-1 bg-blue-500/20 rounded-b-2xl opacity-0 group-hover:opacity-100" />
                        </div>
                    ))}
                </div>
            </div>

            <AdminFinancialReports />
        </div>
    );

    const renderNotifications = () => (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-bold text-slate-900">Broadcast Center</h3>
                    <button onClick={() => setShowAddNotificationModal(true)} className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm">Send New Alert</button>
                </div>
                <div className="space-y-4">
                    {[...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n, i) => (
                        <div key={n.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 transition-colors">
                            <div className={`w-10 h-10 bg-blue-50 text-blue-600 flex-shrink-0 rounded-xl flex items-center justify-center`}>
                                <BellRing size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start">
                                    <h4 className="font-bold text-slate-900 text-sm truncate">{n.title}</h4>
                                    <div className="flex gap-2 items-center flex-shrink-0">
                                        <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-500 uppercase">{n.type}</span>
                                        <span className="text-[10px] text-slate-400 font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <p className="text-slate-500 text-sm mt-0.5 line-clamp-1">{n.message}</p>
                                {(n.targetCity || n.targetEventType || n.userId) && (
                                    <div className="flex gap-2 mt-2">
                                        {n.targetCity && <span className="text-[10px] text-blue-600 font-bold">📍 {n.targetCity}</span>}
                                        {n.targetEventType && <span className="text-[10px] text-purple-600 font-bold">🎯 {n.targetEventType}</span>}
                                        {n.userId && <span className="text-[10px] text-slate-600 font-bold">👤 User: {n.userId}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-1 ml-auto">
                                <button onClick={() => setViewingNotification(n)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View">
                                    <Eye size={18} />
                                </button>
                                <button onClick={() => editNotification(n)} className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit">
                                    <Edit size={18} />
                                </button>
                                <button onClick={() => deleteNotification(n.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {notifications.length === 0 && (
                        <div className="py-12 text-center text-slate-400">No broadcast history.</div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderSettings = () => {
        const settings = platformSettings || {
            appName: 'Platform',
            appVersion: '1.0.0',
            maintenanceMode: false,
            commissionRate: 10,
            taxRate: 18,
            minWithdrawal: 100,
            maxWithdrawal: 50000,
            featuredListingPrice: 499,
            adPricePerDay: 99,
            supportEmail: 'support@platform.com',
            paymentGateway: { razorpay: true, paytm: false, upi: true },
            features: { jobs: true, events: true, shopping: true, wallet: true }
        };

        const settingsTabs = [
            { id: 'account', label: 'Account', icon: User },
            { id: 'business', label: 'Business', icon: Briefcase },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'system', label: 'System', icon: Settings },
        ];

        return (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Header */}
                <div className="flex justify-between items-center mb-8 bg-gradient-to-r from-slate-900 to-slate-800 p-8 rounded-3xl text-white">
                    <div>
                        <h3 className="text-3xl font-black mb-1">Settings</h3>
                        <p className="text-slate-400 font-medium">Manage your platform configurations</p>
                    </div>
                    <button
                        onClick={saveAllSettings}
                        disabled={actionLoading}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black transition-all flex items-center gap-3 shadow-xl shadow-blue-600/30"
                    >
                        {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                        Save All Changes
                    </button>
                </div>

                <div className="flex gap-8">
                    {/* Settings Navigation */}
                    <div className="w-64 flex-shrink-0">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 sticky top-24">
                            {settingsTabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setSettingsTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold text-sm transition-all ${settingsTab === tab.id
                                        ? 'bg-slate-900 text-white shadow-lg'
                                        : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="h-[calc(100vh-280px)] overflow-y-auto p-8">
                            {/* Account Settings */}
                            {settingsTab === 'account' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-slate-100 pb-6">
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">Account Settings</h4>
                                        <p className="text-slate-500">Manage your personal account information</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                                            <input
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-xl outline-none font-bold transition-all"
                                                value={adminAccountSettings.name}
                                                onChange={e => setAdminAccountSettings({ ...adminAccountSettings, name: e.target.value })}
                                                placeholder="Enter your name"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                                            <input
                                                type="email"
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-xl outline-none font-bold transition-all"
                                                value={adminAccountSettings.email}
                                                onChange={e => setAdminAccountSettings({ ...adminAccountSettings, email: e.target.value })}
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={updateAdminAccount}
                                        disabled={actionLoading}
                                        className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
                                    >
                                        {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Update Account Info
                                    </button>

                                    <div className="border-t border-slate-200 pt-8 mt-8">
                                        <div className="bg-slate-50 rounded-2xl p-6">
                                            <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                                <Shield size={18} className="text-amber-500" />
                                                Change Password
                                            </h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-500 mb-2">Current Password</label>
                                                    <input
                                                        type="password"
                                                        placeholder="Enter current password"
                                                        className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-4 rounded-xl outline-none font-medium transition-all"
                                                        value={adminAccountSettings.currentPassword}
                                                        onChange={e => setAdminAccountSettings({ ...adminAccountSettings, currentPassword: e.target.value })}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-2">New Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Min. 8 characters"
                                                            className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-4 rounded-xl outline-none font-medium transition-all"
                                                            value={adminAccountSettings.newPassword}
                                                            onChange={e => setAdminAccountSettings({ ...adminAccountSettings, newPassword: e.target.value })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-bold text-slate-500 mb-2">Confirm New Password</label>
                                                        <input
                                                            type="password"
                                                            placeholder="Re-enter new password"
                                                            className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-4 rounded-xl outline-none font-medium transition-all"
                                                            value={adminAccountSettings.confirmPassword}
                                                            onChange={e => setAdminAccountSettings({ ...adminAccountSettings, confirmPassword: e.target.value })}
                                                        />
                                                    </div>
                                                </div>
                                                {adminAccountSettings.newPassword && adminAccountSettings.newPassword.length < 8 && (
                                                    <p className="text-xs text-amber-600 font-medium">⚠️ Password must be at least 8 characters long</p>
                                                )}
                                                {adminAccountSettings.confirmPassword && adminAccountSettings.newPassword !== adminAccountSettings.confirmPassword && (
                                                    <p className="text-xs text-red-600 font-medium">❌ Passwords do not match</p>
                                                )}
                                            </div>
                                            <button
                                                onClick={changeAdminPassword}
                                                disabled={actionLoading}
                                                className="mt-6 px-8 py-4 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center gap-2 disabled:opacity-50"
                                            >
                                                {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <Shield size={18} />}
                                                Change Password
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Business Settings */}
                            {settingsTab === 'business' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-slate-100 pb-6">
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">Business Settings</h4>
                                        <p className="text-slate-500">Configure your platform business preferences</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Currency</label>
                                            <select
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-xl font-bold text-slate-700 outline-none transition-all"
                                                value={adminBusiness.settings.defaultCurrency}
                                                onChange={e => setAdminBusiness({ ...adminBusiness, settings: { ...adminBusiness.settings, defaultCurrency: e.target.value } })}
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Language</label>
                                            <select
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-xl font-bold text-slate-700 outline-none transition-all"
                                                value={adminBusiness.settings.language}
                                                onChange={e => setAdminBusiness({ ...adminBusiness, settings: { ...adminBusiness.settings, language: e.target.value } })}
                                            >
                                                <option value="en">English</option>
                                                <option value="hi">Hindi</option>
                                                <option value="ta">Tamil</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Service Area</label>
                                            <input
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 p-4 rounded-xl font-bold outline-none transition-all"
                                                value={adminBusiness.settings.serviceArea}
                                                onChange={e => setAdminBusiness({ ...adminBusiness, settings: { ...adminBusiness.settings, serviceArea: e.target.value } })}
                                                placeholder="e.g. Bangalore"
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                        <h5 className="font-bold text-slate-900 mb-4">Business Information</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Business Name</label>
                                                <input
                                                    className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-3 rounded-xl outline-none font-medium transition-all"
                                                    value={adminBusiness.name}
                                                    onChange={e => setAdminBusiness({ ...adminBusiness, name: e.target.value })}
                                                    placeholder="Your business name"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Contact Number</label>
                                                <input
                                                    className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-3 rounded-xl outline-none font-medium transition-all"
                                                    value={adminBusiness.contactNumber}
                                                    onChange={e => setAdminBusiness({ ...adminBusiness, contactNumber: e.target.value })}
                                                    placeholder="+91 9876543210"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Email</label>
                                                <input
                                                    type="email"
                                                    className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-3 rounded-xl outline-none font-medium transition-all"
                                                    value={adminBusiness.email}
                                                    onChange={e => setAdminBusiness({ ...adminBusiness, email: e.target.value })}
                                                    placeholder="business@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">GST ID</label>
                                                <input
                                                    className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-3 rounded-xl outline-none font-medium transition-all"
                                                    value={adminBusiness.bankInfo.gstId}
                                                    onChange={e => setAdminBusiness({ ...adminBusiness, bankInfo: { ...adminBusiness.bankInfo, gstId: e.target.value } })}
                                                    placeholder="29ABCDE1234F1Z5"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-2">Address</label>
                                            <textarea
                                                className="w-full bg-white border-2 border-transparent focus:border-blue-500 p-3 rounded-xl outline-none font-medium transition-all resize-none"
                                                value={adminBusiness.address}
                                                onChange={e => setAdminBusiness({ ...adminBusiness, address: e.target.value })}
                                                placeholder="Full business address"
                                                rows={2}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-2xl p-6 space-y-4">
                                        <h5 className="font-bold text-slate-900 mb-4">Platform Features</h5>
                                        <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                            <div>
                                                <p className="font-bold text-slate-900">Enable Bookings</p>
                                                <p className="text-xs text-slate-500">Allow customers to make event bookings</p>
                                            </div>
                                            <button
                                                onClick={() => setAdminBusiness({ ...adminBusiness, settings: { ...adminBusiness.settings, bookingsEnabled: !adminBusiness.settings.bookingsEnabled } })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminBusiness.settings.bookingsEnabled ? 'bg-green-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminBusiness.settings.bookingsEnabled ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={saveAdminBusiness}
                                        disabled={actionLoading}
                                        className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2"
                                    >
                                        {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Save Business Settings
                                    </button>
                                </div>
                            )}

                            {/* Notification Settings */}
                            {settingsTab === 'notifications' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-slate-100 pb-6">
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">Notification Preferences</h4>
                                        <p className="text-slate-500">Control how you receive alerts and updates</p>
                                    </div>

                                    <div className="space-y-3">
                                        {/* Booking Alerts */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Booking Alerts</p>
                                                    <p className="text-xs text-slate-500">Get notified for new platform bookings</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, bookingAlerts: !adminNotificationSettings.bookingAlerts })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.bookingAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.bookingAlerts ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Payment Alerts */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Payment Alerts</p>
                                                    <p className="text-xs text-slate-500">Receive updates on payouts and receipts</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, paymentAlerts: !adminNotificationSettings.paymentAlerts })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.paymentAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.paymentAlerts ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* New User Alerts */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                                                    <User size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">New User Registrations</p>
                                                    <p className="text-xs text-slate-500">Alerts when new users join the platform</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, newUserAlerts: !adminNotificationSettings.newUserAlerts })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.newUserAlerts ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.newUserAlerts ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Event Submissions */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Event Submissions</p>
                                                    <p className="text-xs text-slate-500">New events pending approval</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, eventSubmissions: !adminNotificationSettings.eventSubmissions })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.eventSubmissions ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.eventSubmissions ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Job Applications */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                                                    <Briefcase size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Job Applications</p>
                                                    <p className="text-xs text-slate-500">New job applications submitted</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, jobApplications: !adminNotificationSettings.jobApplications })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.jobApplications ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.jobApplications ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Customer Reviews */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
                                                    <Star size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Customer Reviews</p>
                                                    <p className="text-xs text-slate-500">New reviews and ratings posted</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, customerReviews: !adminNotificationSettings.customerReviews })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.customerReviews ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.customerReviews ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* System Updates */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center">
                                                    <Settings size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">System Updates</p>
                                                    <p className="text-xs text-slate-500">Platform maintenance and updates</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, systemUpdates: !adminNotificationSettings.systemUpdates })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.systemUpdates ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.systemUpdates ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>

                                        {/* Marketing Updates */}
                                        <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-cyan-100 text-cyan-600 rounded-xl flex items-center justify-center">
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">Marketing Updates</p>
                                                    <p className="text-xs text-slate-500">Tips, news, and promotional updates</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setAdminNotificationSettings({ ...adminNotificationSettings, marketingUpdates: !adminNotificationSettings.marketingUpdates })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${adminNotificationSettings.marketingUpdates ? 'bg-blue-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${adminNotificationSettings.marketingUpdates ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    </div>

                                    <button
                                        onClick={saveAdminNotifications}
                                        disabled={actionLoading}
                                        className="px-8 py-4 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all flex items-center gap-2"
                                    >
                                        {actionLoading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                                        Save Preferences
                                    </button>
                                </div>
                            )}

                            {/* System Settings */}
                            {settingsTab === 'system' && (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <div className="border-b border-slate-100 pb-6">
                                        <h4 className="text-2xl font-black text-slate-900 mb-2">System Controls</h4>
                                        <p className="text-slate-500">Master platform configuration settings</p>
                                    </div>

                                    {/* Maintenance Mode */}
                                    <div className="p-6 bg-slate-50 rounded-2xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg">Maintenance Mode</p>
                                                <p className="text-sm text-slate-500">Temporarily disable platform access</p>
                                            </div>
                                            <button
                                                onClick={() => savePlatformSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                                className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-red-600' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                        {settings.maintenanceMode && (
                                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                                                ⚠️ Platform is currently in maintenance mode
                                            </div>
                                        )}
                                    </div>

                                    {/* Financial Settings */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <DollarSign size={18} className="text-green-600" />
                                            Financial Configuration
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Commission Rate (%)</label>
                                                <input
                                                    type="number"
                                                    value={settings.commissionRate}
                                                    onChange={(e) => savePlatformSettings({ ...settings, commissionRate: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-2xl text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Tax Rate (%)</label>
                                                <input
                                                    type="number"
                                                    value={settings.taxRate}
                                                    onChange={(e) => savePlatformSettings({ ...settings, taxRate: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-2xl text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                    max="100"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Min Withdrawal (₹)</label>
                                                <input
                                                    type="number"
                                                    value={settings.minWithdrawal}
                                                    onChange={(e) => savePlatformSettings({ ...settings, minWithdrawal: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-lg text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Max Withdrawal (₹)</label>
                                                <input
                                                    type="number"
                                                    value={settings.maxWithdrawal}
                                                    onChange={(e) => savePlatformSettings({ ...settings, maxWithdrawal: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-lg text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Pricing Configuration */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Tag size={18} className="text-purple-600" />
                                            Pricing Configuration
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Featured Listing Price (₹)</label>
                                                <input
                                                    type="number"
                                                    value={settings.featuredListingPrice}
                                                    onChange={(e) => savePlatformSettings({ ...settings, featuredListingPrice: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-lg text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 mb-2">Ad Price Per Day (₹)</label>
                                                <input
                                                    type="number"
                                                    value={settings.adPricePerDay}
                                                    onChange={(e) => savePlatformSettings({ ...settings, adPricePerDay: parseInt(e.target.value) || 0 })}
                                                    className="w-full px-4 py-3 bg-white rounded-xl font-bold text-lg text-slate-900 border-2 border-transparent focus:border-blue-500 outline-none transition-all"
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Gateways */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <CreditCard size={18} className="text-blue-600" />
                                            Payment Gateways
                                        </h5>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                        RZP
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Razorpay</p>
                                                        <p className="text-xs text-slate-500">Online payment gateway</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, paymentGateway: { ...settings.paymentGateway, razorpay: !settings.paymentGateway.razorpay } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.paymentGateway.razorpay ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.paymentGateway.razorpay ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-cyan-100 text-cyan-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                        PTM
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">Paytm</p>
                                                        <p className="text-xs text-slate-500">Digital wallet & payments</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, paymentGateway: { ...settings.paymentGateway, paytm: !settings.paymentGateway.paytm } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.paymentGateway.paytm ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.paymentGateway.paytm ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center font-bold text-xs">
                                                        UPI
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">UPI Payments</p>
                                                        <p className="text-xs text-slate-500">Unified Payment Interface</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, paymentGateway: { ...settings.paymentGateway, upi: !settings.paymentGateway.upi } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.paymentGateway.upi ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.paymentGateway.upi ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Features */}
                                    <div className="bg-slate-50 rounded-2xl p-6">
                                        <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Package size={18} className="text-indigo-600" />
                                            Platform Features
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-bold text-slate-900">Jobs Module</p>
                                                    <p className="text-xs text-slate-500">Job listings & applications</p>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, features: { ...settings.features, jobs: !settings.features.jobs } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.features.jobs ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.features.jobs ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-bold text-slate-900">Events Module</p>
                                                    <p className="text-xs text-slate-500">Event management</p>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, features: { ...settings.features, events: !settings.features.events } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.features.events ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.features.events ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-bold text-slate-900">Shopping Module</p>
                                                    <p className="text-xs text-slate-500">E-commerce features</p>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, features: { ...settings.features, shopping: !settings.features.shopping } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.features.shopping ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.features.shopping ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                                                <div>
                                                    <p className="font-bold text-slate-900">Wallet Module</p>
                                                    <p className="text-xs text-slate-500">Digital wallet system</p>
                                                </div>
                                                <button
                                                    onClick={() => savePlatformSettings({ ...settings, features: { ...settings.features, wallet: !settings.features.wallet } })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${settings.features.wallet ? 'bg-green-500' : 'bg-slate-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all ${settings.features.wallet ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Platform Info */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Settings size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-slate-900 mb-1">Platform Version</p>
                                                <p className="text-sm text-slate-600 mb-3">Platform v{settings.appVersion} - All systems operational</p>
                                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                                    <Mail size={14} />
                                                    <span>Support: {settings.supportEmail}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderEvents = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Event Management</h3>
                    <p className="text-slate-500 text-sm">Review, approve, and track event performance</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all flex items-center gap-2">
                    <Plus size={20} /> Create Official Event
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((e) => (
                    <div key={e.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col group">
                        <div className="h-48 relative overflow-hidden">
                            <Image src={e.image || '/service_events.png'} alt={e.title || 'Event'} width={600} height={400} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${e.status === 'Publish' || e.status === 'ACTIVE' || e.status === 'upcoming'
                                    ? 'bg-emerald-500 text-white border-emerald-400'
                                    : e.status === 'pending'
                                        ? 'bg-amber-500 text-white border-amber-400'
                                        : 'bg-slate-500 text-white border-slate-400'
                                    }`}>
                                    {e.status === 'Publish' ? 'Published' : (e.status || 'Draft')}
                                </span>
                            </div>
                            <div className="absolute bottom-4 left-4">
                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest ">
                                    {e.category || 'General'}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h4 className="font-bold text-xl text-slate-900 mb-2">{e.title}</h4>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Calendar size={14} className="text-blue-500" /> {e.date}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin size={14} className="text-red-500" /> {e.location}
                                </div>
                            </div>

                            {/* Analytics Grid */}
                            <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-3xl mb-6">
                                <div className="text-center border-r border-slate-200">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Views</p>
                                    <p className="font-black text-slate-900">{e.views || 0}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Booked</p>
                                    <p className="font-black text-slate-900">{e.bookings || 0}</p>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col gap-2">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedEventForBookings(e); setShowBookingsModal(true); fetchEventBookings(); }}
                                        className="flex-1 py-3 bg-blue-600/10 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Users size={14} /> Bookings
                                    </button>
                                    <button
                                        onClick={() => updateEventStatus(e.id, e.status === 'Publish' ? 'Close' : 'Publish')}
                                        className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${e.status === 'Publish'
                                            ? 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-600 hover:text-white'
                                            : 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700'
                                            }`}
                                    >
                                        {e.status === 'Publish' ? <XCircle size={14} /> : <CheckCircle size={14} />}
                                        {e.status === 'Publish' ? 'Close Event' : 'Publish Event'}
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => editEvent(e)}
                                        className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Edit size={14} /> Edit
                                    </button>
                                    <button onClick={() => deleteEvent(e.id)} className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bookings Manager Modal */}
            {showBookingsModal && selectedEventForBookings && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Bookings Manager</h3>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedEventForBookings.title}</p>
                            </div>
                            <button onClick={() => setShowBookingsModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 gap-4">
                                {eventBookings.filter(b => b.eventId === selectedEventForBookings.id).map((booking: any) => (
                                    <div key={booking.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 font-black text-xs">
                                                {(booking.userName || booking.userId).substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">{booking.userName || 'Anonymous User'}</p>
                                                <p className="text-xs text-slate-500 font-bold">{booking.userEmail || booking.userId}</p>
                                                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{new Date(booking.bookingDate).toLocaleDateString()} at {new Date(booking.bookingDate).toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {booking.status}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, 'CONFIRMED')}
                                                    className="p-2 bg-white text-green-600 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateBookingStatus(booking.id, 'CANCELLED')}
                                                    className="p-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {eventBookings.filter(b => b.eventId === selectedEventForBookings.id).length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <Users className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold">No bookings found for this event yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderJobs = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* Job Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Total Jobs', value: jobStats?.total || 0, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Open Jobs', value: jobStats?.byStatus?.open || 0, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Pending Approval', value: jobStats?.byStatus?.pending || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
                    { label: 'Applications', value: jobStats?.totalApplications || 0, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pending Approvals Section */}
            {jobs.filter(j => j.status === 'pending').length > 0 && (
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-2xl font-black text-slate-900 mb-6">Pending Approvals</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.filter(j => j.status === 'pending').map(job => (
                            <div key={job.id} className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-lg text-slate-900 mb-1">{job.title}</h4>
                                    <p className="text-blue-600 font-bold text-sm mb-4">{job.company}</p>
                                    <div className="space-y-2 text-xs text-slate-500 mb-6 font-medium">
                                        <p className="flex items-center gap-2 capitalize">📍 {job.location}</p>
                                        <p className="flex items-center gap-2">💰 {job.salary}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => updateJobStatus(job.id, 'open')} className="flex-1 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">Approve</button>
                                    <button onClick={() => updateJobStatus(job.id, 'rejected')} className="flex-1 py-2 bg-white text-red-600 border border-red-100 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors">Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Listings */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black text-slate-900">Active Listings</h3>
                    <button onClick={() => setShowAddJobModal(true)} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm">Post Official Job</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="border-b border-slate-50">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Job Title</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Apps</th>
                                <th className="text-right px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {jobs.map(job => (
                                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-6 text-sm">
                                        <p className="font-bold text-slate-900">{job.title}</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{job.company}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${job.status === 'Publish' || job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {job.status === 'Publish' || job.status === 'open' ? 'Live' : 'Closed'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-6 font-black text-slate-900">{(job as any).applicationsCount || 0}</td>
                                    <td className="px-6 py-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedJobForApplications(job); setShowJobApplicationsModal(true); fetchJobApplications(); }}
                                                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all border border-blue-100"
                                                title="View Candidates"
                                            >
                                                <Users size={16} />
                                            </button>
                                            <button
                                                onClick={() => editJob(job)}
                                                className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-200"
                                                title="Edit Job"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => updateJobStatus(job.id, job.status === 'Publish' || job.status === 'open' ? 'Close' : 'Publish')}
                                                className={`p-3 rounded-xl transition-all border ${job.status === 'Publish' || job.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'}`}
                                                title={job.status === 'Publish' || job.status === 'open' ? 'Close Job' : 'Publish Job'}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                            <button
                                                onClick={() => deleteJob(job.id)}
                                                className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all border border-red-100"
                                                title="Delete Job"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Applications Manager Modal */}
            {showJobApplicationsModal && selectedJobForApplications && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[80vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-black text-slate-900">Job Applications</h3>
                                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mt-1">Candidates for {selectedJobForApplications.title}</p>
                            </div>
                            <button onClick={() => setShowJobApplicationsModal(false)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className="grid grid-cols-1 gap-4">
                                {jobApplications.filter(a => a.jobId === selectedJobForApplications.id).map((app: any) => (
                                    <div key={app.id} className="flex flex-col md:flex-row md:items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 font-black text-xl">
                                                {app.applicantName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg">{app.applicantName || 'Anonymous Applicant'}</p>
                                                <p className="text-xs text-slate-400 font-bold">Applied: {new Date(app.appliedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-4">
                                            {app.resumeUrl && (
                                                <button
                                                    onClick={() => viewResume(app.resumeUrl, app.applicantName)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-xl border border-blue-100 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    <FileText size={14} /> View Resume
                                                </button>
                                            )}
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                                                app.status === 'Shortlisted' ? 'bg-blue-100 text-blue-700' :
                                                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                                }`}>
                                                {app.status || 'Applied'}
                                            </span>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => updateJobApplicationStatus(app.id, 'Shortlisted')}
                                                    className="p-2 bg-white text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all"
                                                    title="Shortlist"
                                                >
                                                    <Star size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateJobApplicationStatus(app.id, 'Hired')}
                                                    className="p-2 bg-white text-green-600 rounded-xl border border-green-100 hover:bg-green-600 hover:text-white transition-all"
                                                    title="Mark as Hired"
                                                >
                                                    <CheckCircle size={16} />
                                                </button>
                                                <button
                                                    onClick={() => updateJobApplicationStatus(app.id, 'Rejected')}
                                                    className="p-2 bg-white text-red-600 rounded-xl border border-red-100 hover:bg-red-600 hover:text-white transition-all"
                                                    title="Reject"
                                                >
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {jobApplications.filter(a => a.jobId === selectedJobForApplications.id).length === 0 && (
                                    <div className="text-center py-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                                        <Briefcase className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-bold">No applications received for this job yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const renderOffers = () => (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-3xl font-black text-slate-900 mb-1">Offer Management</h3>
                    <p className="text-slate-500 font-medium">Create offers with discounts, associate with events, and control availability</p>
                </div>
                <button
                    onClick={() => setShowAddOfferModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20"
                >
                    <Plus size={20} /> Create New Offer
                </button>
            </div>



            {/* Active Offers */}
            <div className="space-y-6">
                <h4 className="text-xl font-bold text-slate-900">Active Offers</h4>
                {offers.filter((o: any) => o.status === 'active' || !o.status).length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                            <Tag size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No active offers</h3>
                        <p className="text-slate-500">Global and approved business offers will appear here.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
                        {offers.filter((o: any) => o.status === 'active' || !o.status).map((o: any) => (
                            <div key={o.id} className={`relative overflow-hidden rounded-[2rem] text-white p-6 h-72 flex flex-col justify-between group ${o.isEnabled === false ? 'opacity-60' : ''}`}>
                                <div className={`absolute inset-0 ${o.color || 'bg-gradient-to-br from-blue-600 to-indigo-700'} transition-all duration-300`}></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-sm font-bold border border-white/10 inline-block">{o.code}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => editOffer(o)}
                                                className="p-2 bg-white/10 hover:bg-white/90 hover:text-slate-900 rounded-lg transition-colors"
                                                title="Edit Offer"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => toggleOfferEnabled(o.id, !o.isEnabled)}
                                                className={`p-2 rounded-lg transition-colors ${o.isEnabled !== false ? 'bg-green-500/30 hover:bg-green-500/50' : 'bg-red-500/30 hover:bg-red-500/50'}`}
                                                title={o.isEnabled !== false ? 'Disable Offer' : 'Enable Offer'}
                                            >
                                                {o.isEnabled !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                                            </button>
                                            <button onClick={() => updateOfferStatus(o.id, 'expired')} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors" title="Expire Offer">
                                                <XCircle size={16} />
                                            </button>
                                            <button onClick={() => deleteOffer(o.id)} className="p-2 bg-red-500/20 hover:bg-red-500/50 rounded-lg transition-colors text-white" title="Delete Offer">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <h4 className="font-black text-3xl mb-1">
                                        {o.discount}{o.discountType === 'fixed' ? '₹' : '%'} OFF
                                    </h4>
                                    <p className="font-medium opacity-90">{o.title}</p>
                                    {o.eventTitle && (
                                        <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded-lg inline-flex items-center gap-1">
                                            <Calendar size={12} /> {o.eventTitle}
                                        </div>
                                    )}
                                    {o.businessName && <p className="text-[10px] uppercase font-black opacity-60 mt-1">Provider: {o.businessName}</p>}
                                </div>
                                <div className="relative z-10 pt-4 border-t border-white/20">
                                    <div className="flex flex-col gap-1 text-[10px] font-medium opacity-80">
                                        <div className="flex items-center gap-2">
                                            <Clock size={12} /> Valid: {o.validFrom ? new Date(o.validFrom).toLocaleDateString() + ' - ' : ''}{new Date(o.validUntil).toLocaleDateString()}
                                        </div>
                                        {o.minOrderValue && (
                                            <div className="flex items-center gap-2">
                                                <DollarSign size={12} /> Min order: ₹{o.minOrderValue}
                                            </div>
                                        )}
                                        {o.city && <div className="flex items-center gap-2"><MapPin size={12} /> {o.city}</div>}
                                    </div>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${o.isEnabled !== false ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                                            {o.isEnabled !== false ? 'ENABLED' : 'DISABLED'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );








    const renderLuckyDraw = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">🎯 Lucky Draw Management</h3>
                    <p className="text-slate-500 text-sm">Manage subscription products, winners, and draw results</p>
                </div>
                <Link href="/admin/lucky-draw" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg">
                    <Star size={20} /> Open Lucky Draw Admin
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                            <Star size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">0</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Products</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <Users size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">0</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Subscribers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                            <TrendingUp size={24} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">₹0</p>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <h4 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Link href="/admin/lucky-draw" className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl hover:shadow-lg transition-all group">
                        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Plus size={20} />
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1">Add Product</h5>
                        <p className="text-xs text-slate-500">Create new lucky draw product</p>
                    </Link>
                    <Link href="/admin/lucky-draw" className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl hover:shadow-lg transition-all group">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Users size={20} />
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1">View Subscribers</h5>
                        <p className="text-xs text-slate-500">Manage user subscriptions</p>
                    </Link>
                    <Link href="/admin/lucky-draw" className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl hover:shadow-lg transition-all group">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <Star size={20} />
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1">Select Winners</h5>
                        <p className="text-xs text-slate-500">Run lucky draw process</p>
                    </Link>
                    <Link href="/admin/lucky-draw" className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100 rounded-2xl hover:shadow-lg transition-all group">
                        <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                            <BarChart2 size={20} />
                        </div>
                        <h5 className="font-bold text-slate-900 mb-1">View Analytics</h5>
                        <p className="text-xs text-slate-500">Check performance stats</p>
                    </Link>
                </div>
            </div>
        </div>
    );

    const renderWithdrawals = () => (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h3 className="text-2xl font-black text-slate-900">Withdrawal Requests</h3>
                    <p className="text-slate-500 text-sm">Review user withdrawal requests and process payouts</p>
                </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                {withdrawals.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No withdrawal requests found.</div>
                ) : (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full min-w-[800px]">
                            <thead className="border-b border-slate-50">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">User ID</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Payout Details</th>
                                    <th className="text-left px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                    <th className="text-right px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {withdrawals.map((w: any) => (
                                    <tr key={w.SK} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-6 text-sm text-slate-600 font-medium">
                                            {new Date(w.createdAt).toLocaleDateString()} {new Date(w.createdAt).toLocaleTimeString()}
                                        </td>
                                        <td className="px-6 py-6 text-sm font-mono text-slate-500">
                                            {w.userId}
                                        </td>
                                        <td className="px-6 py-6 text-sm font-bold text-slate-900">
                                            ₹{w.amount}
                                        </td>
                                        <td className="px-6 py-6 text-sm text-slate-700">
                                            {w.payoutDetails}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${w.status === 'PAID' ? 'bg-green-100 text-green-700' :
                                                w.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                    w.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-amber-100 text-amber-700'
                                                }`}>
                                                {w.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                {w.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateWithdrawalStatus(w.SK, 'APPROVED')}
                                                            className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => updateWithdrawalStatus(w.SK, 'REJECTED')}
                                                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl font-bold text-xs hover:bg-red-600 hover:text-white transition-all"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {w.status === 'APPROVED' && (
                                                    <button
                                                        onClick={() => updateWithdrawalStatus(w.SK, 'PAID')}
                                                        className="px-3 py-1.5 bg-green-50 text-green-600 rounded-xl font-bold text-xs hover:bg-green-600 hover:text-white transition-all"
                                                    >
                                                        Mark Paid
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'overview': return renderOverview();
            case 'users': return renderUserManagement();
            case 'stores': return renderStores();
            case 'events': return renderEvents();
            case 'exclusive-events':
                router.push('/admin/dashboard/Exclusive-Events');
                return <div className="text-center py-20 text-slate-500">Redirecting...</div>;
            case 'jobs': return renderJobs();
            case 'withdrawals': return renderWithdrawals();
            case 'lucky-draw': return renderLuckyDraw();
            case 'referrals':
                router.push('/admin/referrals');
                return <div className="text-center py-20 text-slate-500">Redirecting...</div>;
            case 'offers': return renderOffers();
            case 'promotions': return renderPromotions();
            case 'reports': return renderReports();
            case 'notifications': return renderNotifications();
            case 'settings': return renderSettings();
            default: return <div className="text-center py-20 text-slate-500">Module under development</div>;
        }
    };

    const categories = ['Main', 'Management', 'Marketing', 'Analytics', 'System'];

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50/50 font-plus-jakarta">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#00703C] text-white transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative flex flex-col flex-shrink-0 h-screen shadow-2xl shadow-black/20`}>
                <div className="p-8 border-b border-white/10">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
                            <Shield className="text-[#004D2C]" size={20} />
                        </div>
                        <div>
                            <span className="text-xl font-black tracking-tight block text-white">Admin Dashboard</span>
                            <span className="text-[10px] text-[#FFD700] font-bold tracking-widest uppercase">Admin Control</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-4 space-y-6 overflow-y-auto custom-scrollbar pt-6">
                    {categories.map(cat => (
                        <div key={cat} className="space-y-1">
                            <h4 className="px-4 text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">{cat}</h4>
                            {adminMenuItems.filter(item => item.category === cat).map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${activeTab === item.id
                                        ? 'bg-[#FFD700] text-[#004D2C] shadow-lg shadow-black/10'
                                        : 'text-white/70 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    {activeTab === item.id && (
                                        <div className="absolute left-0 w-1 h-6 bg-[#004D2C] rounded-r-full" />
                                    )}
                                    <item.icon size={18} className={activeTab === item.id ? 'text-[#004D2C]' : 'group-hover:scale-110 transition-transform opacity-70 group-hover:opacity-100'} />
                                    <span className="text-sm font-bold tracking-wide">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="bg-[#004D2C]/30 rounded-2xl p-4 mb-4 border border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#FFD700] text-[#004D2C] rounded-full flex items-center justify-center font-bold">
                                {user.name?.charAt(0) || 'A'}
                            </div>
                            <div className="overflow-hidden">
                                <p className="font-bold text-sm truncate text-white">{user.name}</p>
                                <p className="text-xs text-white/60 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-red-200 hover:bg-red-500/20 transition-colors font-bold text-sm"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/50 px-8 py-4 sticky top-0 z-30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl">
                                <Menu size={24} className="text-slate-700" />
                            </button>
                            <h1 className="text-xl font-bold text-slate-900 hidden md:block">
                                {adminMenuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}
                            </h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                        </div>
                    </div>
                </header>

                <div className="p-6 md:p-8 max-w-[1600px] mx-auto">
                    {renderContent()}
                </div>
            </main>

            {/* Modals */}
            {/* Customer Detail Modal */}
            {showModal && selectedCustomer && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-bold text-slate-900">User Profile</h3>
                            <button onClick={() => { setShowModal(false); setSelectedCustomer(null); setPresignedScreenshotUrl(null); }} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>
                        <div className="p-8 space-y-8">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-slate-100 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-slate-400 mb-4">
                                    {selectedCustomer.name?.charAt(0)}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900">{selectedCustomer.name}</h2>
                                <p className="text-slate-500">{selectedCustomer.email}</p>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-bold ${selectedCustomer.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                    selectedCustomer.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                    }`}>{selectedCustomer.status}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone</p>
                                    <p className="font-semibold text-slate-900">{selectedCustomer.phone || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                                    <p className="font-semibold text-slate-900 truncate">{selectedCustomer.email}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">User ID</p>
                                    <p className="font-semibold text-slate-900 font-mono">{selectedCustomer.id}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Joined</p>
                                    <p className="font-semibold text-slate-900">{selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN') : 'N/A'}</p>
                                </div>
                                {selectedCustomer.address && (
                                    <div className="p-4 bg-slate-50 rounded-2xl md:col-span-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address</p>
                                        <p className="font-semibold text-slate-900">{selectedCustomer.address}</p>
                                    </div>
                                )}
                                {selectedCustomer.referredBy && (
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Referred By</p>
                                        <p className="font-semibold text-slate-900">{selectedCustomer.referredBy}</p>
                                    </div>
                                )}
                                {selectedCustomer.walletBalance !== undefined && (
                                    <div className="p-4 bg-slate-50 rounded-2xl">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Wallet Balance</p>
                                        <p className="font-semibold text-slate-900">₹{selectedCustomer.walletBalance}</p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Details */}
                            <div className="border border-amber-100 bg-amber-50 rounded-2xl p-5 space-y-4">
                                <p className="text-xs font-black text-amber-700 uppercase tracking-wider">Payment Details</p>
                                <div className="grid grid-cols-1 gap-3">
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">UTR / Transaction ID</p>
                                        <p className="font-mono font-bold text-slate-900 text-lg">{selectedCustomer.utrNumber || <span className="text-slate-400 font-normal text-sm">Not submitted</span>}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Screenshot</p>
                                        {selectedCustomer.paymentScreenshot ? (
                                            presignedScreenshotUrl ? (
                                                <a href={presignedScreenshotUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                    <img
                                                        src={presignedScreenshotUrl}
                                                        alt="Payment screenshot"
                                                        className="w-full max-h-64 object-contain rounded-xl border border-amber-200 cursor-pointer hover:opacity-90 transition-opacity"
                                                    />
                                                    <p className="text-xs text-blue-600 mt-1 text-center">Click to open full size</p>
                                                </a>
                                            ) : (
                                                <div className="flex items-center justify-center h-24 bg-amber-50 rounded-xl border border-amber-200">
                                                    <p className="text-xs text-amber-600 animate-pulse">Loading screenshot...</p>
                                                </div>
                                            )
                                        ) : (
                                            <p className="text-slate-400 text-sm">No screenshot uploaded</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {actionLoading ? (
                                <div className="flex justify-center p-4"><RefreshCw className="animate-spin text-blue-600" /></div>
                            ) : (
                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    {selectedCustomer.status === 'PENDING' && (
                                        <>
                                            <button onClick={() => updateCustomerStatus(selectedCustomer.id, 'ACTIVE')} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">Approve</button>
                                            <button onClick={() => updateCustomerStatus(selectedCustomer.id, 'REJECTED')} className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-colors">Reject</button>
                                        </>
                                    )}
                                    {selectedCustomer.status === 'ACTIVE' && (
                                        <button onClick={() => updateCustomerStatus(selectedCustomer.id, 'SUSPENDED')} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-colors">Suspend User</button>
                                    )}
                                    {selectedCustomer.status === 'SUSPENDED' && (
                                        <button onClick={() => updateCustomerStatus(selectedCustomer.id, 'ACTIVE')} className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors">Reactivate</button>
                                    )}
                                    <button onClick={() => deleteCustomer(selectedCustomer.id)} className="flex-1 py-3 bg-slate-100 hover:bg-red-50 text-red-600 rounded-xl font-bold transition-colors border border-red-100">Delete User</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Generic Add Modal */}
            {(showAddProductModal || showAddJobModal || showAddOfferModal || showAddPromoModal || showAddModal) && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <h3 className="text-2xl font-bold mb-6 text-slate-900">
                            {showAddProductModal ? (isEditingProduct ? 'Edit Product' : 'Add Product') :
                                showAddJobModal ? (isEditingJob ? 'Edit Job' : 'Post Job') :
                                    showAddOfferModal ? (isEditingOffer ? 'Edit Offer' : 'Create Offer') :
                                        showAddPromoModal ? (isEditingPromo ? 'Edit Promotion' : 'Create Promotion') :
                                            isEditingEvent ? 'Edit Event' : 'Add Event'}
                        </h3>
                        <div className="space-y-4">
                            {showAddProductModal && (
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Name</label>
                                                <input placeholder="e.g. Wireless Headphones" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Price (₹)</label>
                                                <input placeholder="999" type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-black" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} />
                                            </div>
                                        </div>
                                        <div className="w-36">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1 text-center">Image</label>
                                            <div className="w-full h-[124px] bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                                                {newProduct.image ? (
                                                    <Image src={newProduct.image} alt="Product Preview" width={100} height={100} unoptimized className="w-full h-full object-cover" />
                                                ) : (
                                                    <>
                                                        <Plus className="text-slate-300 mb-1" size={24} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Upload</span>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                                    onChange={handleProductImageUpload}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Electronics', value: 'Electronics' },
                                                    { label: 'Fashion', value: 'Fashion' },
                                                    { label: 'Home & Decor', value: 'Home & Decor' },
                                                    { label: 'Groceries', value: 'Groceries' },
                                                    { label: 'Beauty', value: 'Beauty' },
                                                    { label: 'Services', value: 'Services' },
                                                ]}
                                                value={newProduct.category}
                                                onChange={val => setNewProduct({ ...newProduct, category: val })}
                                                placeholder="Select Category"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Vendor/Store</label>
                                            <select className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold text-slate-700 appearance-none cursor-pointer" value={newProduct.storeId} onChange={e => setNewProduct({ ...newProduct, storeId: e.target.value })}>
                                                <option value="">Platform Global</option>
                                                {businesses.map((s: any) => (
                                                    <option key={s.id} value={s.id}>{s.businessName}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Product Description</label>
                                        <textarea placeholder="Outline key features and specifications..." className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px] font-medium" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            {showAddJobModal && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Job Title</label>
                                        <input placeholder="e.g. Area Sales Manager" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newJob.title} onChange={e => setNewJob({ ...newJob, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                                        <input placeholder="e.g. My Logistics" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location</label>
                                            <input placeholder="e.g. Bangalore" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newJob.location} onChange={e => setNewJob({ ...newJob, location: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Salary Range</label>
                                            <input placeholder="e.g. ₹25k - ₹40k" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newJob.salary} onChange={e => setNewJob({ ...newJob, salary: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Job Type</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Full-time', value: 'Full-time' },
                                                    { label: 'Part-time', value: 'Part-time' },
                                                    { label: 'Contract', value: 'Contract' },
                                                    { label: 'Remote', value: 'Remote' },
                                                ]}
                                                value={newJob.type}
                                                onChange={val => setNewJob({ ...newJob, type: val })}
                                                placeholder="Job Type"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Status</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Publish', value: 'Publish' },
                                                    { label: 'Close', value: 'Close' },
                                                ]}
                                                value={newJob.status}
                                                onChange={val => setNewJob({ ...newJob, status: val })}
                                                placeholder="Status"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Job Description</label>
                                        <textarea placeholder="Outline requirements, responsibilities, and benefits..." className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px] font-medium" value={newJob.description} onChange={e => setNewJob({ ...newJob, description: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            {showAddOfferModal && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Offer Title</label>
                                            <input placeholder="e.g. Diwali Special 50% Off" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold" value={newOffer.title} onChange={e => setNewOffer({ ...newOffer, title: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Promo Code</label>
                                            <input placeholder="DIWALI50" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-black uppercase" value={newOffer.code} onChange={e => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Discount Type</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Percentage (%)', value: 'percentage' },
                                                    { label: 'Fixed Amount (₹)', value: 'fixed' },
                                                ]}
                                                value={newOffer.discountType}
                                                onChange={val => setNewOffer({ ...newOffer, discountType: val as 'percentage' | 'fixed' })}
                                                placeholder="Discount Type"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Discount Value</label>
                                            <input placeholder={newOffer.discountType === 'fixed' ? "500" : "50"} type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-black" value={newOffer.discount} onChange={e => setNewOffer({ ...newOffer, discount: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Associate Event</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Global / No Event', value: '' },
                                                    ...events.map((ev: any) => ({ label: ev.title, value: ev.id }))
                                                ]}
                                                value={newOffer.eventId}
                                                onChange={val => {
                                                    const event = events.find(ev => ev.id === val);
                                                    setNewOffer({ ...newOffer, eventId: val, eventTitle: event?.title || '' });
                                                }}
                                                placeholder="Associate Event"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Valid From</label>
                                            <DatePicker value={newOffer.validFrom} onChange={date => setNewOffer({ ...newOffer, validFrom: date })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Valid Until</label>
                                            <DatePicker value={newOffer.validUntil} onChange={date => setNewOffer({ ...newOffer, validUntil: date })} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Description</label>
                                            <textarea placeholder="Tell customers about this offer..." className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 min-h-[80px]" value={newOffer.description} onChange={e => setNewOffer({ ...newOffer, description: e.target.value })} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {showAddPromoModal && (
                                <div className="space-y-5">
                                    <div className="bg-indigo-50 p-4 rounded-2xl mb-2">
                                        <h4 className="font-black text-indigo-700 uppercase tracking-widest text-xs mb-1">Campaign Configuration</h4>
                                        <p className="text-[10px] text-indigo-500 font-bold uppercase">Configure your promotional campaign and discount rules</p>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Promo Title</label>
                                        <input placeholder="Winter Festival Launch" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-bold text-slate-900" value={newPromo.title} onChange={e => setNewPromo({ ...newPromo, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Campaign Code</label>
                                            <div className="relative">
                                                <input placeholder="LAUNCH100" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-black uppercase tracking-widest text-indigo-600" value={newPromo.code} onChange={e => setNewPromo({ ...newPromo, code: e.target.value.toUpperCase() })} />
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                    <Tag size={16} className="text-indigo-300" />
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Discount Value</label>
                                            <div className="flex bg-slate-50 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-300 transition-all">
                                                <input placeholder="20" type="number" className="flex-1 bg-transparent border-none p-4 outline-none font-black text-slate-900" value={newPromo.discount} onChange={e => setNewPromo({ ...newPromo, discount: e.target.value })} />
                                                <Dropdown
                                                    options={[
                                                        { label: '%', value: 'percentage' },
                                                        { label: '₹', value: 'fixed' },
                                                    ]}
                                                    value={newPromo.discountType}
                                                    onChange={val => setNewPromo({ ...newPromo, discountType: val as any })}
                                                    className="w-24"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Min. Purchase (₹)</label>
                                            <input placeholder="999" type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-black text-slate-900" value={newPromo.minPurchase} onChange={e => setNewPromo({ ...newPromo, minPurchase: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Total Max Usage</label>
                                            <input placeholder="1000" type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-black text-slate-900" value={newPromo.maxUsage} onChange={e => setNewPromo({ ...newPromo, maxUsage: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Usage Per User</label>
                                            <input placeholder="1" type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 font-black text-slate-900" value={newPromo.maxUsagePerUser} onChange={e => setNewPromo({ ...newPromo, maxUsagePerUser: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Expiry Date</label>
                                            <DatePicker value={newPromo.expiryDate} onChange={date => setNewPromo({ ...newPromo, expiryDate: date })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Campaign Description</label>
                                        <textarea placeholder="Tell users what this promotion is for..." className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 min-h-[80px] font-medium text-slate-600" value={newPromo.description} onChange={e => setNewPromo({ ...newPromo, description: e.target.value })} />
                                    </div>
                                </div>
                            )}
                            {showAddModal && (
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Event Title</label>
                                        <input placeholder="e.g. Grand Tech Summit 2026" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Date</label>
                                            <DatePicker value={newEvent.date} onChange={date => setNewEvent({ ...newEvent, date })} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Time</label>
                                            <input type="time" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Location</label>
                                        <input placeholder="e.g. Bangalore Convention Center" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'General', value: 'General' },
                                                    { label: 'Wedding', value: 'Wedding' },
                                                    { label: 'Corporate', value: 'Corporate' },
                                                    { label: 'Expo', value: 'Expo' },
                                                    { label: 'Concert', value: 'Concert' },
                                                    { label: 'Workshop', value: 'Workshop' },
                                                    { label: 'Festival', value: 'Festival' },
                                                ]}
                                                value={newEvent.category}
                                                onChange={val => setNewEvent({ ...newEvent, category: val })}
                                                placeholder="Category"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Status</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Publish', value: 'Publish' },
                                                    { label: 'Close', value: 'Close' },
                                                ]}
                                                value={newEvent.status}
                                                onChange={val => setNewEvent({ ...newEvent, status: val })}
                                                placeholder="Status"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ticket Type</label>
                                            <Dropdown
                                                options={[
                                                    { label: 'Free Entry', value: 'Free' },
                                                    { label: 'Paid Ticket', value: 'Paid' },
                                                ]}
                                                value={newEvent.ticketType}
                                                onChange={val => setNewEvent({ ...newEvent, ticketType: val })}
                                                placeholder="Ticket Type"
                                            />
                                        </div>
                                        {newEvent.ticketType === 'Paid' && (
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Ticket Price</label>
                                                <input placeholder="₹ 500" type="number" className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-medium" value={newEvent.price} onChange={e => setNewEvent({ ...newEvent, price: e.target.value })} />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Event Image</label>
                                        <div className="relative w-full h-40 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                                            {newEvent.image ? (
                                                <Image src={newEvent.image} alt="Event Preview" width={400} height={200} unoptimized className="w-full h-full object-cover" />
                                            ) : (
                                                <>
                                                    <Plus className="text-slate-300 mb-2" size={32} />
                                                    <span className="text-sm font-bold text-slate-400">Click to upload image</span>
                                                    <span className="text-xs text-slate-300 mt-1">Any size - auto compressed</span>
                                                </>
                                            )}
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleEventImageUpload}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                        <textarea placeholder="Describe your event, agenda, and what attendees can expect..." className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px] font-medium" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button onClick={() => {
                                setShowAddProductModal(false); setShowAddJobModal(false);
                                setShowAddOfferModal(false); setShowAddPromoModal(false);
                                setShowAddModal(false);
                                setIsEditingEvent(false);
                                setEditingEventId(null);
                            }} className="flex-1 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                            <button onClick={
                                showAddProductModal ? addProduct :
                                    showAddJobModal ? addJob :
                                        showAddOfferModal ? addOffer :
                                            showAddPromoModal ? addPromo : addEvent
                            } className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors">
                                {(isEditingEvent || isEditingProduct || isEditingJob || isEditingOffer || isEditingPromo) ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Add Notification Modal */}
            {showAddNotificationModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">{isEditingNotification ? 'Edit Notification' : 'Push Notification'}</h3>
                            <button onClick={() => { setShowAddNotificationModal(false); setIsEditingNotification(false); }} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <input
                                placeholder="Notification Title (e.g. Flash Sale Live!)"
                                className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 font-bold"
                                value={newNotification.title}
                                onChange={e => setNewNotification({ ...newNotification, title: e.target.value })}
                            />
                            <textarea
                                placeholder="Your message here..."
                                className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 min-h-[100px]"
                                value={newNotification.message}
                                onChange={e => setNewNotification({ ...newNotification, message: e.target.value })}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Dropdown
                                    options={[
                                        { label: 'Global Broadcast', value: 'broadcast' },
                                        { label: 'Event Reminder', value: 'event_reminder' },
                                        { label: 'Offers', value: 'offer' },
                                        { label: 'Job Alert', value: 'job_alert' },
                                        { label: 'Business Update', value: 'business_update' },
                                    ]}
                                    value={newNotification.type}
                                    onChange={val => setNewNotification({ ...newNotification, type: val })}
                                    placeholder="Notification Type"
                                />
                                <input
                                    placeholder="Target City (Optional)"
                                    className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                                    value={newNotification.targetCity}
                                    onChange={e => setNewNotification({ ...newNotification, targetCity: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Target Event Type"
                                    className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                                    value={newNotification.targetEventType}
                                    onChange={e => setNewNotification({ ...newNotification, targetEventType: e.target.value })}
                                />
                                <input
                                    placeholder="Interests (comma sep)"
                                    className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100"
                                    value={newNotification.targetInterests}
                                    onChange={e => setNewNotification({ ...newNotification, targetInterests: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    placeholder="Action URL (Optional)"
                                    className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                                    value={newNotification.actionUrl}
                                    onChange={e => setNewNotification({ ...newNotification, actionUrl: e.target.value })}
                                />
                                <input
                                    placeholder="Target User ID (Optional)"
                                    className="w-full bg-slate-50 border-none p-4 rounded-xl outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                                    value={newNotification.targetUserId}
                                    onChange={e => setNewNotification({ ...newNotification, targetUserId: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex gap-4 mt-8">
                            <button disabled={actionLoading} onClick={() => setShowAddNotificationModal(false)} className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-colors disabled:opacity-50">Cancel</button>
                            <button
                                disabled={actionLoading}
                                onClick={addNotification}
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Send Broadcast'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* View Notification Modal */}
            {viewingNotification && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Notification Detail</h3>
                            <button onClick={() => setViewingNotification(null)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject</h4>
                                <p className="text-xl font-bold text-slate-900">{viewingNotification.title}</p>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Message</h4>
                                <p className="text-slate-600 font-medium leading-relaxed">{viewingNotification.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Targeting</h4>
                                    <p className="font-bold text-slate-900 capitalize">{viewingNotification.type}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Date Sent</h4>
                                    <p className="font-bold text-slate-900">{new Date(viewingNotification.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                            {viewingNotification.userId && (
                                <div className="p-4 bg-blue-50 rounded-2xl">
                                    <h4 className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Private Recipient</h4>
                                    <p className="font-bold text-blue-900">{viewingNotification.userId}</p>
                                </div>
                            )}
                            {viewingNotification.actionUrl && (
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Action Link</h4>
                                    <p className="font-bold text-blue-600 truncate">{viewingNotification.actionUrl}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-8">
                            <button onClick={() => setViewingNotification(null)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-slate-800 transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal */}
            <AnimatePresence>
                {deleteConfirm && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative"
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <AlertCircle size={40} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                                <p className="text-slate-500 font-medium mb-8">
                                    This action will permanently remove this {deleteConfirm.type} from the system. This cannot be undone.
                                </p>
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setDeleteConfirm(null)}
                                        className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            const { id, type } = deleteConfirm;
                                            if (type === 'promo') confirmDeletePromo(id);
                                            else if (type === 'job') confirmDeleteJob(id);
                                            else if (type === 'notification') confirmDeleteNotification(id);
                                            else if (type === 'event') confirmDeleteEvent(id);
                                            else if (type === 'product') confirmDeleteProduct(id);
                                            else if (type === 'offer') confirmDeleteOffer(id);
                                            else if (type === 'user') confirmDeleteCustomer(id);
                                        }}
                                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center justify-center"
                                        disabled={actionLoading}
                                    >
                                        {actionLoading ? <RefreshCw className="animate-spin" size={20} /> : 'Delete'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}

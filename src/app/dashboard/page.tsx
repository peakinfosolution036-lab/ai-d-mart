'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { UserRole, CustomerUser } from '@/types';
import {
    LayoutDashboard, User, Search, Bell, Calendar, Store,
    Briefcase, TrendingUp, TrendingDown, Tag, Gift, QrCode, FileText,
    Megaphone, Settings, LogOut, Menu, X, ChevronRight,
    Wallet, Star, CheckCircle, Clock, AlertCircle, Shield,
    ArrowUpRight, CreditCard, MapPin, Search as SearchIcon, Loader2, Plus, Activity, BellRing, Package, ShoppingCart,
    XCircle, DollarSign, Share2, Heart, ExternalLink, Ticket, Users, Info, Mail, Phone, Trash2, Copy, ArrowRight, Zap, Trophy
} from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker';
import { Dropdown } from '@/components/ui/Dropdown';
import { Toast, ToastType } from '@/components/ui/Toast';
import ExclusiveEvents from '@/components/ExclusiveEvents';
import { motion, AnimatePresence } from 'framer-motion';

const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'shopping', label: 'Shop', icon: Store },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'cart', label: 'My Cart', icon: ShoppingCart },
    { id: 'jobs', label: 'Jobs', icon: Briefcase },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'offers', label: 'Offers', icon: Tag },
    { id: 'promotions', label: 'Promotions', icon: Megaphone },
    { id: 'lucky-draw', label: 'Lucky Draw', icon: Trophy },
    { id: 'exclusive-events', label: 'Exclusive Events', icon: Calendar },
    { id: 'referrals', label: 'Referrals', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
];

import NotificationDropdown from '@/components/NotificationDropdown';

export default function CustomerDashboard() {
    const router = useRouter();
    const { isLoggedIn, isLoading, user, userRole, logout, checkSession } = useAuth();
    const [activeTab, setActiveTab] = useState('overview');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState<any>({});
    const [loadingData, setLoadingData] = useState(false);
    const [showAddMoney, setShowAddMoney] = useState(false);
    const [addAmount, setAddAmount] = useState('500');
    const [cart, setCart] = useState<any[]>([]);
    const [selectedStore, setSelectedStore] = useState<any>(null);
    const [showStoreView, setShowStoreView] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);
    const [business, setBusiness] = useState<any>(null);
    const [businessBookings, setBusinessBookings] = useState<any[]>([]);
    const [businessLeads, setBusinessLeads] = useState<any[]>([]);
    const [loadingBusiness, setLoadingBusiness] = useState(false);
    const [userStore, setUserStore] = useState<any>(null);
    const [userProducts, setUserProducts] = useState<any[]>([]);
    const [loadingStore, setLoadingStore] = useState(false);
    const [showAddProductModal, setShowAddProductModal] = useState(false);
    const [showRegisterStore, setShowRegisterStore] = useState(false);
    const [showRegisterBusiness, setShowRegisterBusiness] = useState(false);
    const [businessOffers, setBusinessOffers] = useState<any[]>([]);
    const [showAddOfferModal, setShowAddOfferModal] = useState(false);
    const [newOffer, setNewOffer] = useState({ code: '', discount: '', title: '', description: '' });
    const [businessForm, setBusinessForm] = useState({
        businessName: '',
        category: 'Consultancy',
        description: '',
        address: '',
        contactNumber: '',
        email: '',
        ownerName: '',
        businessType: 'Service',
        operatingHours: '9 AM - 6 PM'
    });
    const [showJobSection, setShowJobSection] = useState('find');
    const [selectedJob, setSelectedJob] = useState<any>(null);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showJobDetailsModal, setShowJobDetailsModal] = useState(false);
    const [showPostJobModal, setShowPostJobModal] = useState(false);
    const [jobApplications, setJobApplications] = useState<any[]>([]);
    const [applicants, setApplicants] = useState<any[]>([]);
    const [applying, setApplying] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewTarget, setReviewTarget] = useState<any>(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState('');
    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const openCheckout = (options: any): Promise<any> => {
        return new Promise((resolve) => {
            if (typeof window !== 'undefined' && (window as any).Razorpay) {
                const rzp = new (window as any).Razorpay(options);
                rzp.open();
                resolve(rzp);
            } else {
                showToast('Payment gateway is still loading. Please try again in a moment.', 'warning');
                resolve(null);
            }
        });
    };


    const customer = user as CustomerUser | null;
    const filteredNotifications = React.useMemo(() => {
        const allNotifs = dashboardData.notifications || [];
        if (!customer) return [];
        return allNotifs
            .filter((n: any) => {
                if (n.userId) return n.userId === customer.id;
                if (n.type === 'broadcast') {
                    if (n.targetCity && n.targetCity.toLowerCase() !== customer.city?.toLowerCase()) return false;
                    return true;
                }
                return true;
            })
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [dashboardData.notifications, customer]);
    const [viewingNotification, setViewingNotification] = useState<any>(null);
    const [showMyBookings, setShowMyBookings] = useState(false);

    const [eventFilters, setEventFilters] = useState({ search: '', category: '', location: '', date: '' });
    const [jobFilters, setJobFilters] = useState({ search: '', location: '', type: '' });
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [isBookingEvent, setIsBookingEvent] = useState(false);
    const [savedEvents, setSavedEvents] = useState<string[]>([]);
    const [businessReports, setBusinessReports] = useState<any>(null);
    const [userSettingsData, setUserSettingsData] = useState<any>(null);
    const [businessCampaigns, setBusinessCampaigns] = useState<any[]>([]);
    const [showCreateCampaignModal, setShowCreateCampaignModal] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ title: '', description: '', targetCity: '', targetCategory: '', duration: 7, budget: 500, placement: 'featured' });
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editForm, setEditForm] = useState({ fullName: '', dob: '', aadhaarPan: '', address: '', pinCode: '', mobile: '', city: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastFetchedRef = useRef<string>('');
    const cartLoaded = useRef(false);

    const [promotionsData, setPromotionsData] = useState<any[]>([]);
    const [promoCode, setPromoCode] = useState('');
    const [appliedPromo, setAppliedPromo] = useState<any>(null);
    const [promoError, setPromoError] = useState('');
    const [resumeBase64, setResumeBase64] = useState('');
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isDeletingAccount, setIsDeletingAccount] = useState(false);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
    const [jobAlert, setJobAlert] = useState<{ title: string; message: string; type: 'success' | 'error' | 'info' } | null>(null);
    const [postJobCategory, setPostJobCategory] = useState('Decor');
    const [postJobType, setPostJobType] = useState('Full Time');
    const [regBusinessCategory, setRegBusinessCategory] = useState('Consultancy');
    const [regStoreCategory, setRegStoreCategory] = useState('Electronics');
    const [regStoreSubCategory, setRegStoreSubCategory] = useState('');

    const bookEvent = async (event: any) => {
        if (!customer) return;
        setIsBookingEvent(true);
        try {
            const res = await fetch('/api/events/book', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    eventId: event.id,
                    userId: customer.id,
                    userName: customer.fullName,
                    userEmail: customer.email,
                    amount: event.price,
                    eventTitle: event.title
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Success! Your ticket has been booked.', 'success');
                fetchDashboardData();
                setSelectedEvent(null);
            } else {
                showToast(data.error || 'Failed to book ticket', 'error');
            }
        } catch (error) {
            console.error('Booking error:', error);
            showToast('Failed to book ticket', 'error');
        } finally {
            setIsBookingEvent(false);
        }
    };

    const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type !== 'application/pdf') {
                showToast('Please upload a PDF file', 'warning');
                return;
            }
            if (file.size > 250 * 1024) {
                showToast('Resume file is too large (limit: 250KB). Please use a smaller file.', 'warning');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setResumeBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleSaveEvent = (eventId: string) => {
        setSavedEvents(prev =>
            prev.includes(eventId) ? prev.filter(id => id !== eventId) : [...prev, eventId]
        );
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Simple validation
        if (file.size > 10 * 1024 * 1024) { // Allow up to 10MB initially, but we compress it
            showToast('Image size is too large for processing. Please use a smaller image.', 'warning');
            return;
        }

        setIsProcessing(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Image = reader.result as string;

                // Compress image before sending to DynamoDB (400KB limit per item)
                const compressedImage = await new Promise<string>((resolve) => {
                    const img = new window.Image();
                    img.src = base64Image;
                    img.onload = () => {
                        const canvas = document.createElement('canvas');
                        const MAX_WIDTH = 400;
                        const MAX_HEIGHT = 400;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > MAX_WIDTH) {
                                height *= MAX_WIDTH / width;
                                width = MAX_WIDTH;
                            }
                        } else {
                            if (height > MAX_HEIGHT) {
                                width *= MAX_HEIGHT / height;
                                height = MAX_HEIGHT;
                            }
                        }
                        canvas.width = width;
                        canvas.height = height;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(img, 0, 0, width, height);
                        resolve(canvas.toDataURL('image/jpeg', 0.8));
                    };
                });

                const response = await fetch('/api/customer/profile', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ profileImage: compressedImage })
                });

                const data = await response.json();
                if (data.success) {
                    await checkSession();
                    showToast('Profile image updated successfully!', 'success');
                } else {
                    showToast(data.error || 'Failed to update profile image', 'error');
                }
                setIsProcessing(false);
            };
        } catch (error) {
            console.error('Image upload error:', error);
            showToast('Failed to upload image', 'error');
            setIsProcessing(false);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        try {
            const response = await fetch('/api/customer/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    fullName: editForm.fullName || customer?.fullName,
                    name: editForm.fullName || customer?.fullName,
                    dob: editForm.dob || customer?.dob,
                    aadhaarPan: editForm.aadhaarPan || customer?.aadhaarPan,
                    address: editForm.address || customer?.address,
                    pinCode: editForm.pinCode || customer?.pinCode,
                    mobile: editForm.mobile || customer?.mobile,
                    phone: editForm.mobile || customer?.mobile,
                    city: (editForm as any).city || customer?.city
                })
            });

            const data = await response.json();
            if (data.success) {
                await checkSession();
                setShowEditProfileModal(false);
                showToast('Profile updated successfully!', 'success');
            } else {
                showToast(data.error || 'Failed to update profile', 'error');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            showToast('Failed to update profile', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            showToast('New passwords do not match', 'error');
            return;
        }
        if (passwordForm.newPassword.length < 8) {
            showToast('Password must be at least 8 characters long', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Password updated successfully!', 'success');
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                showToast(data.error || 'Failed to update password', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred while updating password', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleLogoutAllDevices = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch('/api/auth/logout-all', { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                showToast('Logged out from all devices', 'success');
                logout();
                router.push('/');
            } else {
                showToast(data.error || 'Failed to logout from all devices', 'error');
            }
        } catch (e) {
            console.error(e);
            showToast('An error occurred', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const markNotificationAsRead = async (id: string) => {
        try {
            const res = await fetch(`/api/customer/notifications?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ read: true })
            });
            const data = await res.json();
            if (data.success) {
                fetchDashboardData();
            }
        } catch (e) { console.error(e); }
    };

    const markAllNotificationsAsRead = async () => {
        if (!customer) return;
        setIsProcessing(true);
        try {
            const res = await fetch(`/api/customer/notifications?all=true&userId=${customer.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (data.success) {
                fetchDashboardData();
            }
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const deleteNotification = async (id: string) => {
        try {
            const res = await fetch(`/api/customer/notifications?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                fetchDashboardData();
            }
        } catch (e) { console.error(e); }
    };
    const fetchDashboardData = useCallback(async () => {
        setLoadingData(true);
        try {
            const response = await fetch(`/api/customer/data?type=all${customer ? `&userId=${customer.id}` : ''}`);
            const result = await response.json();
            if (result.success) {
                setDashboardData(result.data);
                if (result.data.cart && !cartLoaded.current) {
                    setCart(result.data.cart);
                    cartLoaded.current = true;
                } else if (!cartLoaded.current) {
                    cartLoaded.current = true;
                }
                // Fetch applications if user is seeker
                if (customer) {
                    const appRes = await fetch(`/api/jobs/applications?applicantId=${customer.id}`);
                    const appData = await appRes.json();
                    if (appData.success) setJobApplications(appData.data);
                }
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoadingData(false);
        }
    }, [customer]);

    const fetchBusinessOffers = useCallback(async (businessId: string) => {
        try {
            const res = await fetch(`/api/customer/business/offers?businessId=${businessId}`);
            const data = await res.json();
            if (data.success) setBusinessOffers(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchBusinessReports = useCallback(async (businessId: string) => {
        try {
            const res = await fetch(`/api/reports?type=business&businessId=${businessId}`);
            const data = await res.json();
            if (data.success) setBusinessReports(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const fetchUserSettings = useCallback(async (userId: string) => {
        try {
            const res = await fetch(`/api/customer/settings?userId=${userId}`);
            const data = await res.json();
            if (data.success) setUserSettingsData(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const saveUserSettings = async (settings: any) => {
        if (!customer) return;
        setIsProcessing(true);
        try {
            const res = await fetch('/api/customer/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: customer.id, ...settings })
            });
            const data = await res.json();
            if (data.success) {
                showToast('Settings saved successfully!', 'success');
                fetchUserSettings(customer.id);
            }
        } catch (e) { console.error(e); }
        finally { setIsProcessing(false); }
    };

    const fetchBusinessCampaigns = useCallback(async (businessId: string) => {
        try {
            const res = await fetch(`/api/campaigns?businessId=${businessId}`);
            const data = await res.json();
            if (data.success) setBusinessCampaigns(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const handleCreateCampaign = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business) return;
        setLoadingBusiness(true);
        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCampaign,
                    businessId: business.id,
                    businessName: business.businessName
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowCreateCampaignModal(false);
                fetchBusinessCampaigns(business.id);
                setNewCampaign({ title: '', description: '', targetCity: '', targetCategory: '', duration: 7, budget: 500, placement: 'featured' });
                showToast('Campaign submitted for approval!', 'success');
            }
        } catch (e) { console.error(e); }
        finally { setLoadingBusiness(false); }
    };

    const handleCreateOffer = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!business) return;
        setLoadingBusiness(true);
        try {
            const res = await fetch('/api/customer/business/offers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newOffer,
                    businessId: business.id,
                    businessName: business.businessName,
                    city: customer?.city
                })
            });
            const data = await res.json();
            if (data.success) {
                setShowAddOfferModal(false);
                fetchBusinessOffers(business.id);
                setNewOffer({ code: '', discount: '', title: '', description: '' });
                showToast('Offer submitted for approval!', 'success');
            }
        } catch (e) {
            console.error('Failed to create offer', e);
            showToast('Failed to create offer', 'error');
        } finally {
            setLoadingBusiness(false);
        }
    };

    const fetchPromotions = useCallback(async () => {
        try {
            const res = await fetch('/api/customer/promotions');
            const data = await res.json();
            if (data.success) {
                setPromotionsData(data.data);
            }
        } catch (e) { console.error(e); }
    }, []);

    const fetchOffers = useCallback(async (city?: string) => {
        setLoadingData(true);
        try {
            const url = city ? `/api/customer/offers?city=${city}` : '/api/customer/offers';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setDashboardData((prev: any) => ({ ...prev, offers: data.data }));
            }
        } catch (e) {
            console.error('Failed to fetch offers:', e);
        } finally {
            setLoadingData(false);
        }
    }, []);

    const applyPromo = async () => {
        if (!promoCode || !customer) return;
        setPromoError('');
        const currentCartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);

        try {
            const res = await fetch('/api/customer/promotions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: promoCode,
                    userId: customer.id,
                    totalAmount: currentCartTotal
                })
            });
            const data = await res.json();
            if (data.success) {
                setAppliedPromo(data.data);
                setPromoCode('');
            } else {
                setPromoError(data.error);
                setAppliedPromo(null);
            }
        } catch (e) {
            console.error(e);
            setPromoError('Failed to apply promo code');
        }
    };

    const fetchApplicants = useCallback(async (jobId: string) => {
        try {
            const res = await fetch(`/api/jobs/applications?jobId=${jobId}`);
            const data = await res.json();
            if (data.success) setApplicants(data.data);
        } catch (e) { console.error(e); }
    }, []);

    const updateApplicationStatus = async (appId: string, status: string) => {
        try {
            const res = await fetch(`/api/jobs/applications`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: appId, status })
            });
            const data = await res.json();
            if (data.success && selectedJob) fetchApplicants(selectedJob.id);
        } catch (e) { console.error(e); }
    };

    const handleApplyJob = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedJob || !customer) return;
        setApplying(true);
        const formData = new FormData(e.currentTarget);
        if (!resumeBase64) {
            setJobAlert({
                title: 'Resume Required',
                message: 'Please upload your resume in PDF format before applying.',
                type: 'info'
            });
            setApplying(false);
            return;
        }
        const payload = {
            applicantId: customer.id,
            applicantName: customer.fullName,
            resumeUrl: resumeBase64,
            notes: formData.get('notes')
        };

        try {
            const res = await fetch(`/api/jobs/${selectedJob.id}/apply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setShowApplyModal(false);
                fetchDashboardData();
                setJobAlert({
                    title: 'Application Sent!',
                    message: `Your application for ${selectedJob.title} has been submitted successfully.`,
                    type: 'success'
                });
            } else {
                setJobAlert({
                    title: 'Application Error',
                    message: data.error || 'Something went wrong while submitting your application.',
                    type: 'error'
                });
            }
        } catch (e) {
            console.error(e);
            setJobAlert({
                title: 'Submission Failed',
                message: 'Could not connect to the server. Please check your internet and try again.',
                type: 'error'
            });
        }
        finally { setApplying(false); }
    };

    const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!customer) return;
        const formData = new FormData(e.currentTarget);
        const payload = {
            title: formData.get('title'),
            company: formData.get('company'),
            category: formData.get('category'),
            type: formData.get('type'),
            salary: formData.get('salary'),
            location: formData.get('location'),
            description: formData.get('description'),
            requirements: (formData.get('requirements') as string).split('\n'),
            postedBy: customer.id
        };

        try {
            const res = await fetch(`/api/jobs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                setShowPostJobModal(false);
                fetchDashboardData();
                showToast('Job submitted for approval!', 'success');
            } else {
                showToast(data.error, 'error');
            }
        } catch (e) { console.error(e); }
    };

    // Cart Helpers
    const addToCart = (product: any) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.map(item => item.id === product.id ? { ...item, quantity: (item.quantity) + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    useEffect(() => {
        if (!customer || !cartLoaded.current) return;
        const syncCart = async () => {
            try {
                await fetch('/api/customer/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: customer.id, items: cart })
                });
            } catch (e) { console.error('Cart sync error:', e); }
        };
        const timer = setTimeout(syncCart, 1000);
        return () => clearTimeout(timer);
    }, [cart, customer]);

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.id !== productId));
    };

    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * (item.quantity || 1)), 0);

    const handleCheckout = async () => {
        if (!customer || cart.length === 0) return;

        if (customer.walletBalance < cartTotal) {
            showToast('Insufficient balance. Please recharge your wallet.', 'error');
            setActiveTab('wallet');
            return;
        }

        setIsProcessing(true);
        try {
            const response = await fetch('/api/customer/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: customer.id,
                    items: cart,
                    total: cartTotal,
                    type: 'purchase'
                })
            });
            const result = await response.json();
            if (result.success) {
                setCart([]);
                // Clear from DB
                fetch(`/api/customer/cart?userId=${customer.id}`, { method: 'DELETE' });
                setOrderSuccess(true);
                fetchDashboardData();
            } else {
                showToast(result.error || 'Checkout failed', 'error');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            showToast('Something went wrong during checkout', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const fetchBusinessData = useCallback(async () => {
        if (!customer) return;
        setLoadingBusiness(true);
        try {
            const res = await fetch(`/api/customer/business?userId=${customer.id}`);
            const result = await res.json();
            if (result.success && result.data) {
                setBusiness(result.data);
                // Fetch bookings and leads
                const [bookingsRes, leadsRes] = await Promise.all([
                    fetch(`/api/customer/business/bookings?businessId=${result.data.id}`),
                    fetch(`/api/customer/business/leads?businessId=${result.data.id}`)
                ]);
                const bData = await bookingsRes.json();
                const lData = await leadsRes.json();
                if (bData.success) setBusinessBookings(bData.data);
                if (lData.success) setBusinessLeads(lData.data);
                fetchBusinessOffers(result.data.id);
            }
        } catch (error) {
            console.error('Failed to fetch business data:', error);
        } finally {
            setLoadingBusiness(false);
        }
    }, [customer, fetchBusinessOffers]);

    const fetchStoreData = useCallback(async () => {
        if (!customer) return;
        setLoadingStore(true);
        try {
            const res = await fetch(`/api/customer/store?userId=${customer.id}`);
            const result = await res.json();
            if (result.success) {
                setUserStore(result.store);
                setUserProducts(result.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch store data:', error);
        } finally {
            setLoadingStore(false);
        }
    }, [customer]);

    const handleRegisterStore = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!customer) return;

        const formData = new FormData(e.currentTarget);
        const payload = {
            userId: customer.id,
            businessId: business?.id,
            name: formData.get('name'),
            category: formData.get('category'),
            description: formData.get('description'),
            location: formData.get('location'),
        };

        setIsProcessing(true);
        try {
            const res = await fetch('/api/customer/store', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                setShowRegisterStore(false);
                fetchStoreData();
                showToast('Store listing submitted for approval!', 'success');
            }
        } catch (error) {
            console.error('Store registration error:', error);
            showToast('Store registration error', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!userStore) return;

        const formData = new FormData(e.currentTarget);
        const payload = {
            storeId: userStore.id,
            businessId: business?.id,
            name: formData.get('name'),
            price: formData.get('price'),
            category: formData.get('category'),
            description: formData.get('description'),
            image: formData.get('image'),
        };

        setIsProcessing(true);
        try {
            const res = await fetch('/api/customer/store/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                setShowAddProductModal(false);
                fetchStoreData();
                showToast('Product added successfully!', 'success');
            }
        } catch (error) {
            console.error('Add product error:', error);
            showToast('Add product error', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const viewResume = async (base64: string, name: string) => {
        if (!base64) {
            showToast('No resume uploaded for this application.', 'info');
            return;
        }

        let pdfData = base64;
        if (!base64.startsWith('data:application/pdf')) {
            if (/^[A-Za-z0-9+/=]+$/.test(base64.trim().replace(/\s/g, ''))) {
                pdfData = `data:application/pdf;base64,${base64.trim().replace(/\s/g, '')}`;
            } else {
                showToast('Invalid resume format. The file might be corrupted or in an unsupported format.', 'error');
                return;
            }
        }

        try {
            const response = await fetch(pdfData);
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            const newWindow = window.open(url, '_blank');
            if (!newWindow) {
                showToast('Pop-up blocked. Please allow pop-ups to view the resume.', 'warning');
            }
            setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (e) {
            console.error('Resume view error:', e);
            showToast('Failed to open resume. The data might be corrupted.', 'error');
        }
    };

    const submitReview = async () => {
        if (!customer || !reviewTarget) return;
        setIsProcessing(true);
        try {
            const res = await fetch('/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    targetId: reviewTarget.id,
                    userId: customer.id,
                    userName: customer.fullName,
                    rating: reviewRating,
                    comment: reviewComment
                })
            });
            const result = await res.json();
            if (result.success) {
                setShowReviewModal(false);
                setReviewComment('');
                setReviewRating(5);
                showToast('Review submitted successfully!', 'success');
                fetchDashboardData();
            }
        } catch (error) {
            console.error('Review error:', error);
            showToast('Review error', 'error');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRegisterBusiness = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customer) return;
        setLoadingBusiness(true);
        try {
            const res = await fetch('/api/customer/business', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...businessForm, userId: customer.id })
            });
            const result = await res.json();
            if (result.success) {
                setBusiness(result.data);
                setShowRegisterBusiness(false);
                showToast('Business profile created successfully! It will be verified by admin.', 'success');
            }
        } catch (error) {
            showToast('Failed to register business', 'error');
        } finally {
            setLoadingBusiness(false);
        }
    };

    const handleUpdateBookingStatus = async (bookingId: string, status: string) => {
        setLoadingBusiness(true);
        try {
            const res = await fetch('/api/customer/business/bookings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: bookingId, status })
            });
            const result = await res.json();
            if (result.success) {
                setBusinessBookings(prev => prev.map(b => b.id === bookingId ? { ...b, status } : b));
            }
        } catch (error) {
            console.error('Failed to update booking status:', error);
            showToast('Failed to update booking status', 'error');
        } finally {
            setLoadingBusiness(false);
        }
    };

    // Redirect if not logged in or not a customer
    useEffect(() => {
        if (!isLoading) {
            if (!isLoggedIn) {
                router.push('/login');
            } else if (userRole === UserRole.ADMIN) {
                router.push('/admin/dashboard');
            } else {
                const fetchKey = `${activeTab}:${customer?.id}:${business?.id}:${customer?.city}`;
                if (lastFetchedRef.current === fetchKey) return;
                lastFetchedRef.current = fetchKey;

                fetchDashboardData();
                if (activeTab === 'offers') {
                    fetchOffers(customer?.city);
                }
                if (activeTab === 'settings' && customer?.id) {
                    fetchUserSettings(customer.id);
                }
                if (activeTab === 'promotions') {
                    fetchPromotions();
                    if (business?.id) {
                        fetchBusinessCampaigns(business.id);
                    }
                }
            }
        }
    }, [isLoggedIn, isLoading, userRole, router, activeTab, customer?.city, customer?.id, business?.id,
        fetchDashboardData, fetchBusinessData, fetchStoreData, fetchOffers,
        fetchBusinessReports, fetchBusinessCampaigns, fetchUserSettings, fetchPromotions]);

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };

    const handleAddMoney = async () => {
        if (!customer) return;

        const amount = parseFloat(addAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Create Order
            const orderRes = await fetch('/api/razorpay/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: amount,
                    currency: 'INR',
                    receipt: `wallet_${Date.now()}`
                })
            });

            const orderData = await orderRes.json();
            if (!orderData.success) throw new Error(orderData.message);

            // 2. Open Checkout
            await openCheckout({
                amount: orderData.amount,
                currency: orderData.currency,
                name: 'Platform',
                description: 'Wallet Recharge',
                order_id: orderData.orderId,
                prefill: {
                    name: customer.fullName,
                    email: customer.email,
                    contact: customer.mobile || customer.phone
                },
                theme: { color: '#2563eb' },
                handler: async (response: any) => {
                    setIsProcessing(true);
                    try {
                        // 3. Verify Payment
                        const verifyRes = await fetch('/api/razorpay/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature
                            })
                        });

                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            // 4. Update Wallet via our API
                            const walletRes = await fetch('/api/customer/wallet', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: customer.id,
                                    amount: amount,
                                    reference: response.razorpay_payment_id,
                                    description: 'Wallet recharge via Razorpay'
                                })
                            });

                            const walletData = await walletRes.json();
                            if (walletData.success) {
                                setShowAddMoney(false);
                                showToast('Wallet recharged successfully!', 'success');
                                fetchDashboardData(); // Refresh data
                            } else {
                                throw new Error(walletData.message);
                            }
                        } else {
                            throw new Error(verifyData.message);
                        }
                    } catch (err: any) {
                        showToast(`Error: ${err.message}`, 'error');
                    } finally {
                        setIsProcessing(false);
                    }
                }
            });
        } catch (err: any) {
            showToast(`Payment failed: ${err.message}`, 'error');
        } finally {
            if (!showAddMoney) setIsProcessing(false);
        }
    };

    if (isLoading || !customer) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Welcome Section */}
                        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-blue-600 to-indigo-600 p-8 md:p-12 text-white shadow-2xl shadow-blue-900/20">
                            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl"></div>

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                <div>
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium mb-4">
                                        <span className={`w-2 h-2 rounded-full ${customer.status === 'ACTIVE' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                                        {customer.status === 'ACTIVE' ? 'Active Member' : 'Account Pending'}
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tight mb-2">Hello, {(customer?.fullName || user?.name || 'User')?.split(' ')[0]}! 👋</h2>
                                    <p className="text-blue-100 text-lg max-w-xl">Welcome to your digital command center. Explore opportunities, manage your wallet, and enjoy your shopping experience.</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="text-blue-600" /> Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: 'Shop Products', icon: Store, bg: 'bg-rose-50', text: 'text-rose-600', tab: 'shopping' },
                                    { label: 'Apply for Jobs', icon: Briefcase, bg: 'bg-violet-50', text: 'text-violet-600', tab: 'jobs' },
                                    { label: 'View Offers', icon: Tag, bg: 'bg-orange-50', text: 'text-orange-600', tab: 'offers' },
                                    { label: 'Book Events', icon: Calendar, bg: 'bg-emerald-50', text: 'text-emerald-600', tab: 'events' },
                                ].map((action) => (
                                    <button
                                        key={action.label}
                                        onClick={() => setActiveTab(action.tab)}
                                        className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 text-left"
                                    >
                                        <div className={`w-14 h-14 ${action.bg} ${action.text} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <action.icon size={28} />
                                        </div>
                                        <span className="font-bold text-slate-900 block group-hover:text-blue-600 transition-colors">{action.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Activity className="text-blue-600" /> At a Glance
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                                            <Wallet size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Wallet Balance</p>
                                            <h4 className="text-2xl font-black text-slate-900">₹{(customer?.walletBalance || 0).toLocaleString()}</h4>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('wallet')} className="text-emerald-600 text-sm font-bold flex items-center gap-1 hover:underline">Manage Wallet <ChevronRight size={16} /></button>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                                            <Trophy size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lucky Draw Entries</p>
                                            <h4 className="text-2xl font-black text-slate-900">{dashboardData.luckyDrawEntries?.length || 0}</h4>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('lucky-draw')} className="text-amber-600 text-sm font-bold flex items-center gap-1 hover:underline">View Entries <ChevronRight size={16} /></button>
                                </div>
                                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-shadow">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Referrals</p>
                                            <h4 className="text-2xl font-black text-slate-900">{customer?.referrals?.length || 0}</h4>
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveTab('referrals')} className="text-purple-600 text-sm font-bold flex items-center gap-1 hover:underline">Invite Friends <ChevronRight size={16} /></button>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <Clock className="text-blue-600" /> Recent Activity
                            </h3>
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                                <div className="divide-y divide-slate-50">
                                    {dashboardData.transactions && dashboardData.transactions.length > 0 ? (
                                        dashboardData.transactions.slice(0, 3).map((txn: any) => (
                                            <div key={txn.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                        {txn.type === 'credit' ? <ArrowUpRight size={20} /> : <ArrowUpRight size={20} className="rotate-180" />}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-900">{txn.description}</p>
                                                        <p className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`font-black ${txn.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                        {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-12 text-center">
                                            <Activity className="mx-auto text-slate-300 mb-3" size={32} />
                                            <p className="text-slate-500 font-medium">No recent activity found.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'shopping':
                if (showStoreView && selectedStore) {
                    const storeProducts = (dashboardData.products || []).filter((p: any) => p.storeId === selectedStore.id || p.businessId === selectedStore.id);
                    return (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
                            <button onClick={() => { setShowStoreView(false); setSelectedStore(null); }} className="flex items-center gap-2 text-slate-500 font-bold hover:text-blue-600 transition-colors">
                                <ChevronRight className="rotate-180" size={20} /> Back to Stores
                            </button>

                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="w-40 h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 border border-slate-100 overflow-hidden">
                                    {selectedStore.logo ? <Image src={selectedStore.logo} alt={selectedStore.businessName} width={160} height={160} unoptimized className="w-full h-full object-cover" /> : <Store size={64} />}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-2">
                                        <h3 className="text-4xl font-black text-slate-900">{selectedStore.businessName}</h3>
                                        <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-black uppercase tracking-widest border border-green-100">Verified Partner</span>
                                    </div>
                                    <p className="text-slate-500 text-lg mb-6 max-w-2xl">{selectedStore.description || 'Welcome to our premium store collection.'}</p>
                                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold text-sm">
                                            <MapPin size={16} /> {selectedStore.address}
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl text-slate-600 font-bold text-sm">
                                            <Star className="text-amber-400 fill-amber-400" size={16} /> 4.8 (120+ reviews)
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {storeProducts.map((product: any) => (
                                    <div key={product.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-50">
                                            <Image src={product.image} alt={product.name} width={400} height={400} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <button onClick={() => addToCart(product)} className="absolute bottom-4 right-4 w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white">
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                        <div className="px-2">
                                            <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">{product.name}</h4>
                                            <p className="text-slate-500 text-sm mb-4">₹{product.price}</p>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-900 hover:text-white transition-all text-sm"
                                            >
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {storeProducts.length === 0 && (
                                    <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                                        <Package className="mx-auto text-slate-200 mb-4" size={48} />
                                        <p className="text-slate-400 font-medium">No products listed by this store yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300 pb-20">

                        {/* Featured Global Products */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-center px-4">
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900">Trending Now</h4>
                                    <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Exciting deals</p>
                                </div>
                                <button className="text-blue-600 font-bold hover:underline">See Global Inventory</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {(dashboardData.products || []).filter((p: any) => p.sellerId === 'admin').slice(0, 4).map((product: any) => (
                                    <div key={product.id} className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500">
                                        <div className="relative aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-50">
                                            <Image src={product.image} alt={product.name} width={400} height={400} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <button onClick={() => addToCart(product)} className="absolute bottom-4 right-4 w-12 h-12 bg-white text-slate-900 rounded-2xl flex items-center justify-center shadow-xl opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all hover:bg-blue-600 hover:text-white">
                                                <Plus size={24} />
                                            </button>
                                        </div>
                                        <div className="px-2">
                                            <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">{product.name}</h4>
                                            <div className="flex justify-between items-center mb-4">
                                                <p className="text-blue-600 font-black">₹{product.price}</p>
                                                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-400">Platform</span>
                                            </div>
                                            <button
                                                onClick={() => addToCart(product)}
                                                className="w-full py-3 bg-slate-50 text-slate-900 rounded-2xl font-bold hover:bg-slate-900 hover:text-white transition-all text-sm"
                                            >
                                                Quick Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {(dashboardData.products || []).filter((p: any) => p.sellerId === 'admin').length === 0 && (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                        <Package className="mx-auto text-slate-200 mb-2" size={32} />
                                        <p className="text-slate-400 font-bold text-sm">No global items to show at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* Floating Cart Indicator */}
                        {cart.length > 0 && (
                            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5">
                                <button
                                    onClick={() => setActiveTab('cart')}
                                    className="px-8 py-4 bg-slate-900 text-white rounded-full font-black shadow-2xl shadow-slate-900/40 flex items-center gap-4 hover:bg-black transition-all"
                                >
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart size={24} />
                                        <span>{cart.length} items in Cart</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/20" />
                                    <span>₹{cartTotal}</span>
                                </button>
                            </div>
                        )}
                    </div>
                );

            case 'jobs':
                const isEmployer = true; // For demo, let's allow everyone to see employer tools or based on business status
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-blue-900/20">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-2">Bharat Career Portal</h3>
                                <p className="text-slate-400 text-lg">Connect with event opportunities or hire the best talent across Bharat.</p>
                                <div className="flex gap-4 mt-8">
                                    <button
                                        onClick={() => setShowJobSection('find')}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all ${showJobSection === 'find' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                    >
                                        Find Jobs
                                    </button>
                                    <button
                                        onClick={() => setShowJobSection('applications')}
                                        className={`px-6 py-3 rounded-xl font-bold transition-all ${showJobSection === 'applications' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                                    >
                                        My Applications
                                    </button>
                                </div>
                            </div>
                            <Briefcase className="absolute right-0 bottom-0 text-white/5 -mr-10 -mb-10" size={280} />
                        </div>

                        {showJobSection === 'find' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input
                                            placeholder="Filter by Location"
                                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-100 outline-none font-bold text-slate-600"
                                            value={jobFilters.location}
                                            onChange={e => setJobFilters({ ...jobFilters, location: e.target.value })}
                                        />
                                    </div>
                                    <Dropdown
                                        options={[
                                            { label: 'All Job Types', value: '' },
                                            { label: 'Full-time', value: 'Full-time' },
                                            { label: 'Part-time', value: 'Part-time' },
                                            { label: 'Contract', value: 'Contract' },
                                        ]}
                                        value={jobFilters.type}
                                        onChange={val => setJobFilters({ ...jobFilters, type: val })}
                                        placeholder="All Job Types"
                                        className="w-full"
                                    />
                                </div>

                                <div className="grid gap-4">
                                    {(dashboardData.jobs || []).filter((j: any) => {
                                        const matchesSearch = !jobFilters.search || j.title.toLowerCase().includes(jobFilters.search.toLowerCase()) || j.company.toLowerCase().includes(jobFilters.search.toLowerCase());
                                        const matchesLocation = !jobFilters.location || j.location?.toLowerCase().includes(jobFilters.location.toLowerCase());
                                        const matchesType = !jobFilters.type || j.type === jobFilters.type;
                                        // Support both internal 'open' and user-facing 'Publish' statuses
                                        const isLive = j.status === 'open' || j.status === 'Publish';
                                        return matchesSearch && matchesLocation && matchesType && isLive;
                                    }).map((job: any) => {
                                        const hasApplied = jobApplications.some((app: any) => (app.jobId === job.id) || (app.jobTitle === job.title && app.company === job.company));
                                        return (
                                            <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group">
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                                                        {job.company.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-xl font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                                                            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">{job.type}</span>
                                                        </div>
                                                        <p className="text-slate-500 font-bold mb-3">{job.company}</p>
                                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500 font-medium">
                                                            <span className="flex items-center gap-1.5"><DollarSign size={16} /> {job.salary}</span>
                                                            <span className="flex items-center gap-1.5"><MapPin size={16} /> {job.location}</span>
                                                            <span className="flex items-center gap-1.5"><Clock size={16} /> {new Date(job.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 w-full md:w-auto">
                                                    <button
                                                        onClick={() => { setSelectedJob(job); setShowJobDetailsModal(true); }}
                                                        className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black hover:bg-slate-200 transition-all whitespace-nowrap"
                                                    >
                                                        View Details
                                                    </button>
                                                    <button
                                                        onClick={() => { if (!hasApplied) { setSelectedJob(job); setShowApplyModal(true); } }}
                                                        disabled={hasApplied}
                                                        className={`px-8 py-4 rounded-2xl font-black transition-all whitespace-nowrap ${hasApplied
                                                            ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100'
                                                            : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200'
                                                            }`}
                                                    >
                                                        {hasApplied ? (
                                                            <span className="flex items-center gap-2">
                                                                <CheckCircle size={18} /> Already Applied
                                                            </span>
                                                        ) : 'Apply Now'}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {(!dashboardData.jobs || dashboardData.jobs.filter((j: any) => j.status === 'open').length === 0) && (
                                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <SearchIcon size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold">No open jobs found matching your criteria.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showJobSection === 'applications' && (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 px-2">Your Applications</h3>
                                <div className="grid gap-4">
                                    {jobApplications.map((app: any) => (
                                        <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black ${app.status === 'Hired' || app.status === 'accepted' ? 'bg-green-100 text-green-600' :
                                                    app.status === 'Rejected' || app.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                                        app.status === 'Shortlisted' || app.status === 'shortlisted' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {app.status === 'Hired' || app.status === 'accepted' ? <CheckCircle size={24} /> :
                                                        app.status === 'Rejected' || app.status === 'rejected' ? <XCircle size={24} /> :
                                                            app.status === 'Shortlisted' || app.status === 'shortlisted' ? <Star size={24} /> : <Clock size={24} />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{app.jobTitle}</h4>
                                                    <p className="text-slate-500 font-medium">{app.company} • Applied on {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${app.status === 'Hired' || app.status === 'accepted' ? 'bg-green-50 text-green-700 border-green-100' :
                                                    app.status === 'Rejected' || app.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                                                        app.status === 'Shortlisted' || app.status === 'shortlisted' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-slate-50 text-slate-600 border-slate-100'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {jobApplications.length === 0 && (
                                        <div className="py-20 text-center bg-white rounded-[2.5rem] border border-slate-100">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Activity size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold">You haven&apos;t applied for any jobs yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {showJobSection === 'post' && (
                            <div className="space-y-8">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black text-slate-900 px-2">Job Listings & Applicants</h3>
                                    <button
                                        onClick={() => setShowPostJobModal(true)}
                                        className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-200"
                                    >
                                        Post Job Opening
                                    </button>
                                </div>

                                <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50/50 border-b border-slate-100">
                                            <tr>
                                                <th className="text-left px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Job Position</th>
                                                <th className="text-left px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                                                <th className="text-left px-6 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Applicants</th>
                                                <th className="text-right px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {(dashboardData.jobs || []).filter((j: any) => j.postedBy === customer.id).map((job: any) => (
                                                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <p className="font-bold text-slate-900">{job.title}</p>
                                                        <p className="text-xs text-slate-400 font-medium">Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${job.status === 'open' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            job.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-red-50 text-red-700 border-red-100'
                                                            }`}>
                                                            {job.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
                                                                {job.applicationsCount || 0}
                                                            </div>
                                                            <span className="text-sm text-slate-500 font-medium">Candidates</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-5 text-right">
                                                        <button
                                                            onClick={() => { setSelectedJob(job); fetchApplicants(job.id); router.push('#applicants'); }}
                                                            className="text-blue-600 font-black text-sm hover:underline"
                                                        >
                                                            View Candidates →
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {selectedJob && applicants.length > 0 && (
                                    <div id="applicants" className="space-y-6 pt-8 border-t border-slate-100 scroll-mt-8">
                                        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                                            <div>
                                                <h4 className="text-xl font-black text-slate-900">Applicants for {selectedJob.title}</h4>
                                                <p className="text-slate-500 font-medium">Review and manage candidates</p>
                                            </div>
                                            <button onClick={() => setSelectedJob(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all text-slate-500"><X size={20} /></button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {applicants.map((app: any) => (
                                                <div key={app.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-xl">
                                                            {app.applicantName.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <h5 className="font-bold text-slate-900">{app.applicantName}</h5>
                                                            <p className="text-xs text-slate-500 font-medium">Applied {new Date(app.appliedAt).toLocaleDateString()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3 mb-6">
                                                        <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
                                                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Resume</span>
                                                            <button
                                                                onClick={() => viewResume(app.resumeUrl, app.applicantName)}
                                                                className="text-blue-600 font-black text-xs hover:underline flex items-center gap-1"
                                                            >
                                                                Open <ArrowUpRight size={12} />
                                                            </button>
                                                        </div>
                                                        {app.notes && (
                                                            <div className="p-3 bg-slate-50 rounded-xl">
                                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cover Note</p>
                                                                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">&quot;{app.notes}&quot;</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'shortlisted')}
                                                            className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs hover:bg-blue-700 shadow-lg shadow-blue-100"
                                                        >
                                                            Shortlist
                                                        </button>
                                                        <button
                                                            onClick={() => updateApplicationStatus(app.id, 'rejected')}
                                                            className="flex-1 py-2.5 bg-white text-red-600 border border-red-100 rounded-xl font-black text-xs hover:bg-red-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );

            // ... Other cases follow generic structure or existing logic but styled ...
            case 'offers': {
                const availableOffers = dashboardData.offers || [];
                return (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
                        {/* Header Banner */}
                        <div className="relative overflow-hidden rounded-[3rem] bg-white border border-slate-100 shadow-xl shadow-slate-200/40 p-1">
                            <div className="bg-slate-50/50 rounded-[2.8rem] p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-blue-600/5 rounded-full blur-3xl animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">
                                        <Zap size={10} fill="currentColor" /> Active Deals
                                    </div>
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-2">Exclusive Offers</h3>
                                    <p className="text-slate-500 font-medium text-lg max-w-xl">Curated savings and partner deals specifically for our verified community members.</p>
                                </div>

                                <div className="relative z-10 flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-white/50">
                                    <div className="flex items-center gap-3 pl-3 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                                        <MapPin size={18} className="text-blue-600" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Region</span>
                                            <Dropdown
                                                options={[
                                                    { label: 'All Regions', value: '' },
                                                    { label: 'Mumbai', value: 'Mumbai' },
                                                    { label: 'Bangalore', value: 'Bangalore' },
                                                    { label: 'Delhi', value: 'Delhi' },
                                                    { label: 'Hyderabad', value: 'Hyderabad' },
                                                    { label: 'Pune', value: 'Pune' },
                                                ]}
                                                value={customer?.city || ''}
                                                onChange={(val) => fetchOffers(val)}
                                                placeholder="Select Region"
                                                className="!p-0 !bg-transparent !border-none !h-auto font-black text-slate-900 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {availableOffers.length === 0 ? (
                            <div className="bg-white rounded-[3rem] p-24 text-center border border-slate-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="relative z-10">
                                    <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 text-slate-300 group hover:scale-110 transition-transform duration-500">
                                        <Tag size={48} className="group-hover:rotate-12 transition-transform" />
                                    </div>
                                    <h4 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No active offers</h4>
                                    <p className="text-slate-500 max-w-sm mx-auto font-medium text-lg">Try selecting a different region or check back later for new exclusive deals.</p>
                                    <button onClick={() => fetchOffers('')} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-colors shadow-xl shadow-slate-900/10">
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-1">
                                {availableOffers.map((offer: any) => (
                                    <div key={offer.id} className="relative group rounded-[3rem] overflow-hidden flex flex-col h-[400px] transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_40px_80px_-15px_rgba(37,99,235,0.2)]">
                                        {/* Premium Background with Gradient & Mesh */}
                                        <div className={`absolute inset-0 ${offer.color || 'bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700'} group-hover:scale-110 transition-transform duration-1000`}></div>
                                        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay"></div>

                                        {/* Animated Glass Elements */}
                                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[80px] group-hover:bg-white/30 transition-all duration-1000"></div>
                                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-400/20 rounded-full blur-[80px] group-hover:bg-blue-300/30 transition-all duration-1000"></div>

                                        {/* Main Content Area */}
                                        <div className="relative px-8 pt-8 pb-4 z-10 flex-1 flex flex-col">
                                            <div className="flex justify-between items-center mb-8">
                                                <div className="px-5 py-2.5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 text-[11px] font-black tracking-[0.2em] uppercase text-white shadow-xl flex items-center gap-3">
                                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_#4ade80]"></div>
                                                    {offer.code}
                                                </div>
                                                <div className="flex items-center gap-2 text-[11px] font-black text-white px-4 py-2.5 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
                                                    <Clock size={14} className="text-blue-300" />
                                                    {new Date(offer.validUntil).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </div>
                                            </div>

                                            <div className="mt-4 flex flex-col gap-2">
                                                <div className="flex items-start justify-between gap-6">
                                                    <div className="flex-1">
                                                        <h4 className="text-4xl font-black text-white tracking-tighter leading-none mb-3 drop-shadow-2xl line-clamp-2">
                                                            {offer.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mb-4">
                                                            <div className="w-8 h-1 bg-white/40 rounded-full"></div>
                                                            <div className="w-2 h-1 bg-white/20 rounded-full"></div>
                                                        </div>
                                                        <p className="text-sm text-white/70 font-medium leading-relaxed line-clamp-3">
                                                            {offer.description || 'Unlock this exclusive partner reward to save big on your next purchase.'}
                                                        </p>
                                                    </div>
                                                    <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white/10 backdrop-blur-3xl rounded-[2rem] border border-white/20 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">SAVE</span>
                                                        <h4 className="text-5xl font-black text-white tracking-tighter drop-shadow-lg">
                                                            {offer.discountType === 'percentage' ? '' : '₹'}{offer.discount}
                                                            <span className="text-2xl opacity-60 ml-0.5">{offer.discountType === 'percentage' ? '%' : ''}</span>
                                                        </h4>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Perforation Line */}
                                        <div className="relative z-10 px-4 flex items-center justify-between">
                                            <div className="w-4 h-8 bg-slate-50/100 rounded-r-full -ml-4 z-20 shadow-[inset_-2px_0_4px_rgba(0,0,0,0.05)]"></div>
                                            <div className="flex-1 h-[1px] border-t-2 border-dashed border-white/30 mx-2"></div>
                                            <div className="w-4 h-8 bg-slate-50/100 rounded-l-full -mr-4 z-20 shadow-[inset_2px_0_4px_rgba(0,0,0,0.05)]"></div>
                                        </div>

                                        {/* Premium Footer Area */}
                                        <div className="relative z-10 p-8 pt-6 bg-black/10 backdrop-blur-3xl border-t border-white/10 mt-auto flex flex-col gap-6">
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 shadow-inner group-hover:bg-white/20 transition-all duration-500 group-hover:rotate-6">
                                                        <Store size={22} className="text-white" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest leading-none mb-1.5">Official Partner</span>
                                                        <span className="text-sm font-black text-white uppercase tracking-wider truncate max-w-[140px] drop-shadow-md">
                                                            {offer.businessName || 'Platform Elite'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(offer.code);
                                                        showToast(`Protocol ${offer.code} copied!`, 'success');
                                                    }}
                                                    className="px-8 py-4 bg-white text-blue-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] shadow-[0_15px_30px_-5px_rgba(255,255,255,0.3)] hover:scale-105 hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2 group/btn"
                                                >
                                                    Claim Reward <ArrowUpRight size={14} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );
            }

            case 'events': {
                const eventItems = (dashboardData.events || []).filter((e: any) => {
                    const matchesSearch = !eventFilters.search || e.title.toLowerCase().includes(eventFilters.search.toLowerCase());
                    const matchesCategory = !eventFilters.category || e.category === eventFilters.category;
                    const matchesLocation = !eventFilters.location || e.location?.toLowerCase().includes(eventFilters.location.toLowerCase());
                    const matchesDate = !eventFilters.date || e.date === eventFilters.date;
                    // Only show published events
                    return matchesSearch && matchesCategory && matchesLocation && matchesDate && e.status !== 'Close';
                });

                const myBookings = (dashboardData.eventBookings || []).filter((b: any) => b.userId === customer.id);

                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Event Header & Filters */}
                        <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/20">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                                <div>
                                    <h3 className="text-4xl font-black text-slate-900 mb-2">Bharat Events</h3>
                                    <p className="text-slate-500 font-medium italic">Discover experiences that matter to you</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowMyBookings(!showMyBookings)}
                                        className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${showMyBookings ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                    >
                                        <Ticket size={20} /> {showMyBookings ? 'Back to Discovery' : 'My Bookings'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        placeholder="Filter by Location"
                                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-slate-600 outline-none transition-all"
                                        value={eventFilters.location}
                                        onChange={e => setEventFilters({ ...eventFilters, location: e.target.value })}
                                    />
                                </div>
                                <Dropdown
                                    options={[
                                        { label: 'All Categories', value: '' },
                                        { label: 'General', value: 'General' },
                                        { label: 'Wedding', value: 'Wedding' },
                                        { label: 'Corporate', value: 'Corporate' },
                                        { label: 'Expo', value: 'Expo' },
                                        { label: 'Concert', value: 'Concert' },
                                    ]}
                                    value={eventFilters.category}
                                    onChange={val => setEventFilters({ ...eventFilters, category: val })}
                                    placeholder="All Categories"
                                />
                                <DatePicker
                                    value={eventFilters.date}
                                    onChange={date => setEventFilters({ ...eventFilters, date })}
                                    placeholder="Filter by Date"
                                />
                            </div>
                        </div>

                        {!showMyBookings ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {eventItems.map((e: any) => (
                                    <div key={e.id} className="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col">
                                        <div className="h-60 relative overflow-hidden">
                                            <Image src={e.image} alt={e.title} width={600} height={400} unoptimized className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute top-4 left-4">
                                                <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest ">
                                                    {e.category || 'General'}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(ev) => { ev.stopPropagation(); toggleSaveEvent(e.id); }}
                                                className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md transition-all ${savedEvents.includes(e.id) ? 'bg-red-500 text-white' : 'bg-white/80 text-slate-400 hover:text-red-500'}`}
                                            >
                                                <Heart size={20} fill={savedEvents.includes(e.id) ? 'currentColor' : 'none'} />
                                            </button>
                                        </div>
                                        <div className="p-8 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-2xl text-slate-900 leading-tight flex-1">{e.title}</h4>
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${e.ticketType === 'Paid' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                                    {e.ticketType === 'Paid' ? `₹${e.price}` : 'Free'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 mb-6">
                                                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                                                        <Calendar size={16} />
                                                    </div>
                                                    {new Date(e.date).toLocaleDateString()} {e.time && `@ ${e.time}`}
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
                                                    <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center text-red-500">
                                                        <MapPin size={16} />
                                                    </div>
                                                    {e.location}
                                                </div>
                                            </div>

                                            <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed">
                                                {e.description}
                                            </p>

                                            <button
                                                onClick={() => bookEvent(e)}
                                                className="w-full py-4 bg-slate-900 text-white rounded-[1.5rem] font-black shadow-xl shadow-slate-200 hover:bg-black transition-all flex items-center justify-center gap-2 mt-auto"
                                            >
                                                {e.ticketType === 'Paid' ? 'Book Tickets' : 'Register Now'} <ArrowUpRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <h3 className="text-2xl font-black text-slate-900 px-2">My Event Bookings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {myBookings.map((booking: any) => (
                                        <div key={booking.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-xl transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                                                    <Ticket size={32} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-xl text-slate-900">{booking.eventTitle}</h4>
                                                    <p className="text-slate-500 font-medium">Booked on {new Date(booking.bookingDate).toLocaleDateString()}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                                            {booking.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {myBookings.length === 0 && (
                                        <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border border-slate-100">
                                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                                <Calendar size={40} />
                                            </div>
                                            <p className="text-slate-400 font-bold">You haven&apos;t booked any events yet.</p>
                                            <button onClick={() => setShowMyBookings(false)} className="mt-4 text-blue-600 font-bold hover:underline">Explore Events →</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {!showMyBookings && eventItems.length === 0 && (
                            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-slate-100">
                                <Calendar className="mx-auto text-slate-100 mb-6" size={80} />
                                <h4 className="text-2xl font-bold text-slate-900">No events found</h4>
                                <p className="text-slate-500 mt-2 max-w-sm mx-auto">Try adjusting your filters or search terms to find more upcoming experiences.</p>
                                <button onClick={() => setEventFilters({ search: '', category: '', location: '', date: '' })} className="mt-6 text-blue-600 font-bold hover:underline">Clear all filters</button>
                            </div>
                        )}

                        {/* Event Details Modal */}
                        {selectedEvent && (
                            <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
                                <div className="bg-white rounded-[3rem] max-w-2xl w-full my-auto shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden relative">
                                    <button onClick={() => setSelectedEvent(null)} className="absolute top-6 right-6 z-10 p-3 bg-white/80 backdrop-blur-md rounded-full text-slate-900 hover:bg-white shadow-xl transition-all">
                                        <X size={20} />
                                    </button>

                                    <div className="h-64 relative">
                                        <Image src={selectedEvent.image} alt={selectedEvent.title} width={800} height={500} unoptimized className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                                            <div>
                                                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-3 inline-block">Confirmed Event</span>
                                                <h2 className="text-3xl font-black text-white">{selectedEvent.title}</h2>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-8">
                                        <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                                    <Calendar size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</p>
                                                    <p className="font-bold text-slate-900">{selectedEvent.date}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-600">
                                                    <MapPin size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venue</p>
                                                    <p className="font-bold text-slate-900">{selectedEvent.location}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                                    <Users size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Capacity</p>
                                                    <p className="font-bold text-slate-900">Limited Seats</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2"><Info size={20} className="text-blue-500" /> About Event</h4>
                                            <p className="text-slate-600 leading-relaxed font-medium">
                                                {selectedEvent.description || 'Join us for this exclusive event experience. Bring your family and friends for a day full of excitement, learning, and networking in the heart of the city.'}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem]">
                                            <div>
                                                <p className="text-sm font-bold text-slate-400">Total Price</p>
                                                <p className="text-2xl font-black text-slate-900">₹{selectedEvent.price || 0}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button className="p-4 bg-white text-slate-600 rounded-2xl hover:text-blue-600 shadow-sm border border-slate-100">
                                                    <Share2 size={24} />
                                                </button>
                                                <button
                                                    onClick={() => bookEvent(selectedEvent)}
                                                    disabled={isBookingEvent}
                                                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {isBookingEvent ? <Loader2 className="animate-spin" size={20} /> : <Ticket size={24} />}
                                                    {isBookingEvent ? 'Processing...' : 'Confirm Registration'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            }



            case 'wallet':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <p className="text-blue-100 font-medium mb-1">Available Balance</p>
                                <h3 className="text-5xl font-black mb-6">₹{customer.walletBalance?.toLocaleString() || 0}</h3>
                                <button
                                    onClick={() => setShowAddMoney(true)}
                                    className="px-8 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2"
                                >
                                    <Plus size={20} /> Add Money
                                </button>
                            </div>
                            <Wallet className="absolute right-0 bottom-0 text-white/10 -mr-8 -mb-8" size={200} />
                        </div>

                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-slate-900">Recent Transactions</h3>
                                <button className="text-blue-600 font-bold text-sm hover:underline">View All</button>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {loadingData ? (
                                    <div className="p-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto"></div>
                                    </div>
                                ) : dashboardData.transactions && dashboardData.transactions.length > 0 ? (
                                    dashboardData.transactions.map((txn: any) => (
                                        <div key={txn.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${txn.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    {txn.type === 'credit' ? <ArrowUpRight size={24} /> : <ArrowUpRight size={24} className="rotate-180" />}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-900">{txn.description}</p>
                                                    <p className="text-sm text-slate-500">{new Date(txn.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-black text-lg ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                                    {txn.type === 'credit' ? '+' : '-'}₹{txn.amount}
                                                </p>
                                                <p className="text-xs font-bold text-slate-400">ID: {txn.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                            <FileText size={32} />
                                        </div>
                                        <p className="text-slate-400 font-medium">No transactions yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                );

            case 'profile':
                return (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-32 h-32 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-blue-500/20 overflow-hidden relative">
                                    {customer.profileImage ? (
                                        <Image src={customer.profileImage} alt={customer.fullName} width={200} height={200} unoptimized className="w-full h-full object-cover" />
                                    ) : (
                                        <span>{customer.fullName?.charAt(0)}</span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Plus className="text-white" size={32} />
                                    </div>
                                </div>
                                <div className="absolute bottom-0 right-0 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center border-4 border-white group-hover:bg-blue-600 transition-colors">
                                    <Plus size={20} />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-3xl font-black text-slate-900 mb-2">{customer.fullName}</h3>
                                <p className="text-slate-500 font-medium mb-4">{customer.email}</p>
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold uppercase tracking-wider">Customer ID: {customer.id}</span>
                                    <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-bold uppercase tracking-wider">Since {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'New Member'}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setEditForm({
                                        fullName: customer.fullName || '',
                                        dob: customer.dob || '',
                                        aadhaarPan: customer.aadhaarPan || '',
                                        address: customer.address || '',
                                        pinCode: customer.pinCode || '',
                                        mobile: customer.mobile || customer.phone || '',
                                        city: customer.city || ''
                                    });
                                    setShowEditProfileModal(true);
                                }}
                                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                            >
                                Edit Profile
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Contact Information', fields: [{ icon: Bell, label: 'Mobile', value: customer.mobile || customer.phone }, { icon: Shield, label: 'Email', value: customer.email }] },
                                { label: 'Personal Details', fields: [{ icon: Calendar, label: 'DOB', value: customer.dob }, { icon: FileText, label: 'Aadhaar/PAN', value: customer.aadhaarPan }] },
                            ].map((section) => (
                                <div key={section.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                                    <h4 className="text-lg font-bold text-slate-900 mb-4">{section.label}</h4>
                                    <div className="space-y-4">
                                        {section.fields.map((field) => (
                                            <div key={field.label} className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                                                    <field.icon size={18} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{field.label}</p>
                                                    <p className="font-bold text-slate-900">{field.value}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );



            case 'notifications': {
                const customerNotifs = filteredNotifications;
                return (
                    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-end mb-2 px-2">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 mb-1">Notifications</h3>
                                <p className="text-slate-500 font-medium">Stay updated with your latest alerts</p>
                            </div>
                            <button
                                onClick={markAllNotificationsAsRead}
                                disabled={isProcessing || !filteredNotifications.some((n: any) => !n.read)}
                                className="text-blue-600 font-bold hover:underline mb-1 text-sm border-2 border-blue-50 px-4 py-2 rounded-xl disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" size={16} /> : 'Mark all as read'}
                            </button>
                        </div>
                        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/20 overflow-hidden divide-y divide-slate-50">
                            {customerNotifs.length > 0 ? customerNotifs.map((n: any) => {
                                const getIcon = () => {
                                    switch (n.type) {
                                        case 'event_reminder': return <Calendar size={24} />;
                                        case 'offer_reward': return <Tag size={24} />;
                                        case 'job_alert': return <Briefcase size={24} />;
                                        case 'business_update': return <TrendingUp size={24} />;
                                        case 'booking_confirmation': return <CheckCircle size={24} />;
                                        case 'broadcast': return <Megaphone size={24} />;
                                        default: return <BellRing size={24} />;
                                    }
                                };
                                const getColors = () => {
                                    switch (n.type) {
                                        case 'event_reminder': return 'bg-purple-50 text-purple-600';
                                        case 'offer_reward': return 'bg-amber-50 text-amber-600';
                                        case 'job_alert': return 'bg-blue-50 text-blue-600';
                                        case 'business_update': return 'bg-indigo-50 text-indigo-600';
                                        case 'booking_confirmation': return 'bg-green-50 text-green-600';
                                        case 'broadcast': return 'bg-rose-50 text-rose-600';
                                        default: return 'bg-slate-50 text-slate-600';
                                    }
                                };
                                return (
                                    <div key={n.id} onClick={() => { setViewingNotification(n); if (!n.read) markNotificationAsRead(n.id); }} className="p-6 flex gap-5 hover:bg-slate-50/80 transition-all group relative cursor-pointer">
                                        <div className={`w-16 h-16 rounded-[1.5rem] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 ${getColors()}`}>
                                            {getIcon()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className={`font-bold text-lg group-hover:text-blue-600 transition-colors truncate pr-4 ${!n.read ? 'text-slate-900' : 'text-slate-500'}`}>
                                                    {n.title}
                                                </h4>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-1 rounded-md">
                                                        {new Date(n.createdAt).toLocaleDateString()}
                                                    </span>
                                                    <button onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(n.id); }} className="p-1 text-slate-300 hover:text-red-500 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={`font-medium leading-relaxed line-clamp-2 ${!n.read ? 'text-slate-600' : 'text-slate-400'}`}>
                                                {n.message}
                                            </p>
                                            <div className="mt-3 flex items-center gap-4">
                                                <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                                                    View Details <ArrowUpRight size={14} />
                                                </button>
                                                {!n.read && (
                                                    <button onClick={(e) => { e.stopPropagation(); markNotificationAsRead(n.id); }} className="text-xs font-bold text-slate-400 hover:text-blue-600 transition-colors flex items-center gap-1">
                                                        <CheckCircle size={14} /> Mark as read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!n.read && <div className="absolute left-[3.25rem] top-6 w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>}
                                    </div>
                                );
                            }) : (
                                <div className="p-20 text-center">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <BellRing className="text-slate-300" size={40} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900">All caught up!</h4>
                                    <p className="text-slate-500 mt-2">No new notifications at the moment.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            }





            case 'promotions': {
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Customer Promo Code Section */}
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                                <div className="text-center md:text-left flex-1">
                                    <h3 className="text-4xl font-black mb-2">Have a Promo Code?</h3>
                                    <p className="text-indigo-100 text-lg mb-8 max-w-md">Unlock additional discounts and exclusive perks across the platform.</p>

                                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto md:mx-0">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                placeholder="Enter code (e.g. FEST2026)"
                                                className="w-full bg-white text-slate-900 border-none p-4 rounded-2xl outline-none focus:ring-4 focus:ring-white/20 font-black uppercase tracking-widest placeholder:text-slate-300 placeholder:font-bold"
                                                value={promoCode}
                                                onChange={e => setPromoCode(e.target.value)}
                                            />
                                            {promoError && <p className="absolute -bottom-6 left-0 text-rose-300 text-[10px] font-black uppercase">{promoError}</p>}
                                        </div>
                                        <button
                                            onClick={applyPromo}
                                            className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black hover:bg-indigo-50 transition-all shadow-lg active:scale-95"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                    {appliedPromo && (
                                        <div className="mt-8 flex items-center justify-center md:justify-start gap-3 animate-bounce">
                                            <CheckCircle className="text-emerald-400" size={24} />
                                            <p className="font-black text-xl">₹{appliedPromo.discountValue} Saved! <span className="text-sm opacity-60">Expires in 2h</span></p>
                                        </div>
                                    )}
                                </div>
                                <div className="hidden md:flex flex-1 justify-center">
                                    <div className="w-64 h-64 bg-white/10 rounded-[3rem] border-4 border-white/20 flex flex-col items-center justify-center backdrop-blur-md">
                                        <Megaphone size={80} className="mb-4 text-white" />
                                        <div className="text-center">
                                            <p className="font-black text-3xl uppercase tracking-tighter">Big Savings</p>
                                            <p className="font-bold opacity-60">Live Now</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Public Promotions */}
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                                    <Tag className="text-indigo-600" /> Platform Offers
                                </h3>
                                <div className="px-4 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold">
                                    {promotionsData.length} Available
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {promotionsData.map((promo: any) => (
                                    <div key={promo.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 -mt-5 -mr-5 w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50"></div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
                                                    <Tag size={28} />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <div className="bg-indigo-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200">
                                                        {promo.discountType === 'fixed' ? `₹${promo.discount} OFF` : `${promo.discount}% OFF`}
                                                    </div>
                                                    {promo.expiryDate && (
                                                        <span className="text-[10px] text-rose-500 font-bold mt-2 flex items-center gap-1">
                                                            <Clock size={10} /> Exp: {new Date(promo.expiryDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <h4 className="text-xl font-bold text-slate-900 mb-2 truncate">{promo.title}</h4>
                                            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{promo.description || 'Exclusive discount for our users.'}</p>
                                        </div>

                                        <div className="relative z-10">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Promotion Code</p>
                                                    <p className="font-black text-slate-900 text-lg tracking-[0.2em]">{promo.code}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(promo.code);
                                                        setPromoCode(promo.code);
                                                        showToast(`Code ${promo.code} copied!`, 'info');
                                                    }}
                                                    className="p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                    title="Copy Code"
                                                >
                                                    <Copy size={16} />
                                                </button>
                                            </div>

                                            <div className="flex items-center justify-between gap-4">
                                                <div className="text-[10px] font-bold text-slate-400">
                                                    {promo.minPurchase > 0 ? `Min purchase: ₹${promo.minPurchase}` : 'No min. purchase'}
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setPromoCode(promo.code);
                                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
                                                >
                                                    Apply Now <ArrowRight size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {promotionsData.length === 0 && (
                                    <div className="col-span-full py-16 text-center text-slate-400 font-medium bg-slate-50/30 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                                        <Megaphone size={48} className="mx-auto mb-4 opacity-10" />
                                        <p>No active platform-wide promotions. Check back later!</p>
                                    </div>
                                )}
                            </div>
                        </div>



                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex gap-6 items-center hover:shadow-lg transition-all cursor-pointer group">
                                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex-shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp size={40} />
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 mb-1">Featured Listing</h4>
                                    <p className="text-slate-500 font-medium">Appear at the top of search results.</p>
                                </div>
                                <ChevronRight className="ml-auto text-slate-300 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </div>
                    </div>
                );
            }

            case 'lucky-draw':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-2">🎰 Lucky Draw</h3>
                                <p className="text-purple-100 text-lg mb-6">Try your luck and win amazing prizes!</p>
                                <Link href="/lucky-draw" className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors">
                                    <Trophy size={20} /> Play Now
                                </Link>
                            </div>
                            <Trophy className="absolute right-0 bottom-0 text-white/10 -mr-8 -mb-8" size={200} />
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h4 className="text-xl font-bold text-slate-900 mb-4">How it Works</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <CreditCard size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">1. Subscribe</h5>
                                    <p className="text-slate-500 text-sm">Get premium access for ₹5000</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Star size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">2. Pick Numbers</h5>
                                    <p className="text-slate-500 text-sm">Choose your lucky numbers (1-100)</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Trophy size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">3. Win Prizes</h5>
                                    <p className="text-slate-500 text-sm">Get amazing rewards and gifts</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'exclusive-events':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <ExclusiveEvents userId={customer.id} />
                    </div>
                );

            case 'referrals':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-4xl font-black mb-2">💰 Referral Program</h3>
                                <p className="text-green-100 text-lg mb-6">Earn 25 points for each successful referral!</p>
                                <Link href="/referral" className="inline-flex items-center gap-2 bg-white text-green-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-colors">
                                    <Users size={20} /> View Dashboard
                                </Link>
                            </div>
                            <Users className="absolute right-0 bottom-0 text-white/10 -mr-8 -mb-8" size={200} />
                        </div>

                        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                            <h4 className="text-xl font-bold text-slate-900 mb-4">How it Works</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Share2 size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">1. Share Link</h5>
                                    <p className="text-slate-500 text-sm">Share your unique referral code</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Users size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">2. Friend Joins</h5>
                                    <p className="text-slate-500 text-sm">They sign up using your code</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <Star size={32} />
                                    </div>
                                    <h5 className="font-bold text-slate-900 mb-2">3. Earn Points</h5>
                                    <p className="text-slate-500 text-sm">Get 25 points per referral</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'exclusive-events':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                        <ExclusiveEvents userId={customer.id} />
                    </div>
                );

            case 'settings': {
                const settings = userSettingsData || {
                    notifications: { email: true, push: true, sms: false, promotions: true, orderUpdates: true, newOffers: true, events: true, bookings: true },
                    language: 'en',
                    region: 'IN',
                    currency: 'INR',
                    privacy: { profileVisibility: 'public', showLocation: true, allowAnalytics: true },
                    paymentMethods: [],
                    theme: 'system'
                };

                return (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">
                        <div className="flex justify-between items-end">
                            <div>
                                <h3 className="text-4xl font-black text-slate-900 mb-1">Account Settings</h3>
                                <p className="text-slate-500 font-medium">Manage your profile, security and preferences</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* 1. Profile Info */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><User size={20} /></div>
                                    Profile Information
                                </h4>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white shadow-sm bg-white flex items-center justify-center p-1">
                                            {customer?.profileImage ? (
                                                <Image src={customer.profileImage} alt="Profile" width={200} height={200} unoptimized className="w-full h-full object-contain" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-2xl bg-slate-100 rounded-xl">
                                                    {customer?.fullName?.charAt(0) || 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900">{customer?.fullName}</p>
                                            <p className="text-sm text-slate-500">{customer?.email}</p>
                                        </div>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="ml-auto px-4 py-2 bg-white text-slate-900 rounded-xl font-bold text-sm border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors"
                                        >
                                            Change Photo
                                        </button>
                                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Full Name</label>
                                            <input
                                                className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                                value={editForm.fullName || customer?.fullName || ''}
                                                onChange={(e) => setEditForm(prev => ({ ...prev, fullName: e.target.value }))}
                                                onBlur={() => editForm.fullName && handleProfileUpdate({ preventDefault: () => { } } as any)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Phone Number</label>
                                            <input
                                                className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold"
                                                defaultValue={customer?.mobile}
                                                readOnly
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Security (Password Update) */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center"><Shield size={20} /></div>
                                    Security & Password
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Current Password</label>
                                        <input
                                            type="password"
                                            className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold"
                                            value={passwordForm.currentPassword}
                                            onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">New Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold"
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold"
                                                value={passwordForm.confirmPassword}
                                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={handlePasswordUpdate}
                                        disabled={isProcessing}
                                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95 disabled:opacity-50"
                                    >
                                        {isProcessing ? 'Updating...' : 'Update Password'}
                                    </button>
                                </div>
                            </div>

                            {/* 3. Notifications */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
                                <h4 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center"><Bell size={20} /></div>
                                    Notification Preferences
                                </h4>
                                <div className="space-y-3">
                                    {[
                                        { key: 'email', label: 'Email Alerts', desc: 'Critical updates via email' },
                                        { key: 'events', label: 'Event Reminders', desc: 'Don\'t miss your booked events' },
                                        { key: 'bookings', label: 'Booking Confirmation', desc: 'Updates on your service requests' },
                                        { key: 'promotions', label: 'Offers & Promotions', desc: 'Best deals from nearby stores' },
                                    ].map(({ key, label, desc }) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                            <div>
                                                <p className="font-bold text-slate-900">{label}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{desc}</p>
                                            </div>
                                            <button
                                                onClick={() => saveUserSettings({ ...settings, notifications: { ...settings.notifications, [key]: !settings.notifications[key] } })}
                                                className={`w-12 h-6 rounded-full transition-all relative ${settings.notifications[key] ? 'bg-amber-500' : 'bg-slate-200'}`}
                                            >
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.notifications[key] ? 'left-7' : 'left-1'}`} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Language & Region */}
                            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8 space-y-6">
                                <h4 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center"><MapPin size={20} /></div>
                                    Language & Region
                                </h4>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Display Language</label>
                                        <Dropdown
                                            options={[
                                                { label: 'English (US)', value: 'en' },
                                                { label: 'हिंदी (Bharat)', value: 'hi' },
                                                { label: 'தமிழ் (Tamil)', value: 'ta' },
                                                { label: 'తెలుగు (Telugu)', value: 'te' },
                                            ]}
                                            value={settings.language}
                                            onChange={val => saveUserSettings({ ...settings, language: val })}
                                            placeholder="Select Language"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1 ml-1">Preferred City / Region</label>
                                        <input
                                            className="w-full bg-slate-50 border-none p-4 rounded-xl font-bold focus:ring-2 focus:ring-blue-100 transition-all"
                                            value={editForm.city || customer?.city || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, city: e.target.value }))}
                                            onBlur={() => editForm.city && handleProfileUpdate({ preventDefault: () => { } } as any)}
                                            placeholder="Enter your city"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. Account Controls */}
                        <div className="bg-rose-50/30 rounded-[3rem] border border-rose-100 p-8">
                            <h4 className="text-xl font-black text-rose-900 mb-6 flex items-center gap-3">
                                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center"><Activity size={20} /></div>
                                Critical Account Actions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <button
                                    onClick={logout}
                                    className="p-6 bg-white border border-rose-100 rounded-[2rem] text-left hover:shadow-lg hover:shadow-rose-100 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <LogOut size={24} />
                                    </div>
                                    <h5 className="font-bold text-slate-900">Logout</h5>
                                    <p className="text-xs text-slate-500">Sign out of your account on this device</p>
                                </button>

                                <button
                                    onClick={handleLogoutAllDevices}
                                    className="p-6 bg-white border border-rose-100 rounded-[2rem] text-left hover:shadow-lg hover:shadow-rose-100 transition-all group"
                                >
                                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Shield size={24} />
                                    </div>
                                    <h5 className="font-bold text-slate-900">Logout All Devices</h5>
                                    <p className="text-xs text-slate-500">Secure your account by ending all sessions</p>
                                </button>

                                <button
                                    onClick={() => {
                                        setIsDeletingAccount(true);
                                    }}
                                    className="p-6 bg-rose-600 rounded-[2rem] text-left hover:bg-rose-700 transition-all group shadow-xl shadow-rose-200"
                                >
                                    <div className="w-12 h-12 bg-white/20 text-white rounded-2xl flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform">
                                        <Trash2 size={24} />
                                    </div>
                                    <h5 className="font-bold text-white">Delete Account</h5>
                                    <p className="text-xs text-white/70">Permanently erase your identity and data</p>
                                </button>
                            </div>
                        </div>
                    </div>
                );
            }

            case 'cart':
                return (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div className="flex justify-between items-end px-2">
                            <div>
                                <h3 className="text-3xl font-black text-slate-900 mb-1">Your Cart</h3>
                                <p className="text-slate-500 font-medium">Review and checkout your selected items</p>
                            </div>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{cart.length} Items</span>
                        </div>

                        {cart.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-4">
                                    {cart.map((item) => (
                                        <div key={item.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex gap-6 items-center">
                                            <div className="w-24 h-24 bg-slate-50 rounded-3xl overflow-hidden flex-shrink-0">
                                                <Image src={item.image} alt={item.name} width={100} height={100} unoptimized className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-900 text-lg mb-1 truncate">{item.name}</h4>
                                                <p className="text-slate-500 text-sm mb-2">{item.category}</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg">
                                                        <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-slate-600 font-bold">-</button>
                                                        <span className="font-bold text-slate-900">{item.quantity}</span>
                                                        <button onClick={() => addToCart(item)} className="text-slate-400 hover:text-slate-600 font-bold">+</button>
                                                    </div>
                                                    <span className="font-black text-slate-900">₹{parseFloat(item.price) * (item.quantity || 1)}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="p-3 text-red-100 hover:text-red-500 transition-colors">
                                                <X size={24} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm sticky top-8">
                                        <h4 className="text-xl font-bold text-slate-900 mb-6">Order Summary</h4>
                                        <div className="space-y-4 mb-8">
                                            <div className="flex justify-between text-slate-500 font-medium">
                                                <span>Subtotal</span>
                                                <span>₹{cartTotal}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-500 font-medium">
                                                <span>Delivery</span>
                                                <span className="text-green-600 font-bold">FREE</span>
                                            </div>
                                            <div className="pt-4 border-t border-slate-50 flex justify-between">
                                                <span className="text-lg font-bold text-slate-900">Total</span>
                                                <span className="text-2xl font-black text-slate-900">₹{cartTotal}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            disabled={isProcessing}
                                            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? <Loader2 className="animate-spin" /> : 'Pay via Wallet'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ShoppingCart className="text-slate-200" size={48} />
                                </div>
                                <h4 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h4>
                                <p className="text-slate-500 mb-8 max-w-xs mx-auto">Looks like you haven&apos;t added anything to your cart yet.</p>
                                <button onClick={() => setActiveTab('shopping')} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">Start Shopping</button>
                            </div>
                        )}

                        {orderSuccess && (
                            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95">
                                    <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle size={40} />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">Order Placed!</h3>
                                    <p className="text-slate-500 mb-8">Your order has been confirmed and we&apos;ve notified the store.</p>
                                    <button onClick={() => { setOrderSuccess(false); setActiveTab('orders'); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold">Track Order</button>
                                </div>
                            </div>
                        )}
                    </div>
                );

            case 'orders':
                const myOrders = (dashboardData.orders || []).filter((o: any) => o.userId === customer.id);
                return (
                    <div className="max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
                        <div className="px-2">
                            <h3 className="text-3xl font-black text-slate-900 mb-1">Your Orders</h3>
                            <p className="text-slate-500 font-medium">Track your recent purchases and bookings</p>
                        </div>

                        <div className="space-y-4">
                            {myOrders.map((order: any) => (
                                <div key={order.id} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex -space-x-4">
                                        {order.items?.slice(0, 3).map((item: any, idx: number) => (
                                            <div key={idx} className="w-16 h-16 rounded-2xl border-4 border-white bg-slate-100 overflow-hidden shadow-sm">
                                                <Image src={item.image} alt={item.name} width={100} height={100} unoptimized className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex-1 text-center md:text-left">
                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-1">
                                            <h4 className="font-bold text-slate-900">Order #{order.id.slice(-8).toUpperCase()}</h4>
                                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${order.status === 'pending' ? 'bg-amber-50 text-amber-600' :
                                                order.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-bold">{new Date(order.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-center md:text-right">
                                        <p className="text-lg font-black text-slate-900">₹{order.total}</p>
                                        <p className="text-xs text-slate-400 font-bold">{order.items?.length} items</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="px-6 py-2 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-colors text-sm">Details</button>
                                        <button
                                            onClick={() => { setReviewTarget(order); setShowReviewModal(true); }}
                                            className="px-6 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold hover:bg-blue-100 transition-colors text-sm"
                                        >
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {myOrders.length === 0 && (
                                <div className="bg-white rounded-[3rem] p-20 text-center border border-slate-100">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <Package className="text-slate-200" size={40} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-1">No orders yet</h4>
                                    <p className="text-slate-500 mb-6">Start shopping to see your orders here.</p>
                                    <button onClick={() => setActiveTab('shopping')} className="text-blue-600 font-bold hover:underline">Explore Marketplace</button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="h-screen flex overflow-hidden bg-slate-50/50 font-plus-jakarta">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white border-r border-slate-100 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:relative flex flex-col flex-shrink-0 h-screen`}>
                <div className="p-8">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Shield className="text-white" size={20} />
                        </div>
                        <span className="text-2xl font-black text-slate-900 tracking-tight">Dashboard</span>
                    </Link>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    {menuItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-4 px-6 py-4 rounded-[1.25rem] transition-all duration-300 group ${activeTab === item.id
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                }`}
                        >
                            <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : 'group-hover:scale-110 transition-transform'} />
                            <span className="font-bold tracking-wide">{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={18} className="ml-auto opacity-60" />}
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-slate-50">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-6 py-4 rounded-[1.25rem] text-red-500 font-bold hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={22} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Main Content */}
            <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
                <header className="px-8 py-6 flex items-center justify-between sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white rounded-xl shadow-sm transition-all">
                            <Menu size={24} className="text-slate-700" />
                        </button>
                        <h1 className="text-2xl font-black text-slate-900 hidden md:block">
                            {menuItems.find(m => m.id === activeTab)?.label}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <NotificationDropdown theme="light" />
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-bold text-slate-900">{customer?.fullName || user?.name}</p>
                            </div>
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20 overflow-hidden">
                                {customer.profileImage ? (
                                    <Image src={customer.profileImage} alt={customer.fullName} width={48} height={48} unoptimized className="w-full h-full object-cover" />
                                ) : (
                                    customer.fullName?.charAt(0)
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Add Money Modal */}
            {showAddMoney && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !isProcessing && setShowAddMoney(false)}></div>
                    <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowAddMoney(false)}
                            disabled={isProcessing}
                            className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                        >
                            <X size={20} className="text-slate-400" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <Plus size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-900">Add Money</h3>
                            <p className="text-slate-500">Recharge your wallet instantly</p>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2 pl-1">Amount (₹)</label>
                                <input
                                    type="number"
                                    value={addAmount}
                                    onChange={(e) => setAddAmount(e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-2xl text-2xl font-black text-slate-900 outline-none transition-all"
                                    disabled={isProcessing}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                {['100', '500', '1000'].map(amount => (
                                    <button
                                        key={amount}
                                        onClick={() => setAddAmount(amount)}
                                        disabled={isProcessing}
                                        className={`py-3 rounded-xl font-bold transition-all ${addAmount === amount ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                    >
                                        +₹{amount}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={handleAddMoney}
                                disabled={isProcessing || !addAmount || parseFloat(addAmount) <= 0}
                                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-600/30 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={24} />
                                        Processing...
                                    </>
                                ) : (
                                    <>Pay ₹{addAmount || '0'}</>
                                )}
                            </button>

                            <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                                <Shield size={12} /> Secure transaction via Razorpay
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Modals for Jobs */}
            {showJobDetailsModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative overflow-hidden">
                        <button onClick={() => setShowJobDetailsModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200">
                            <X size={24} />
                        </button>

                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center font-black text-3xl">
                                {selectedJob.company.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-slate-900">{selectedJob.title}</h3>
                                <p className="text-slate-500 font-bold text-lg uppercase tracking-wider">{selectedJob.company}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-10 border-y border-slate-50 py-8">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><DollarSign size={12} /> Salary Package</p>
                                <p className="font-bold text-slate-900">{selectedJob.salary}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><MapPin size={12} /> Work Location</p>
                                <p className="font-bold text-slate-900">{selectedJob.location}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12} /> Job Type</p>
                                <p className="font-bold text-slate-900">{selectedJob.type}</p>
                            </div>
                        </div>

                        <div className="mb-10">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Role Description</h4>
                            <div className="bg-slate-50 p-6 rounded-3xl min-h-[150px] max-h-[300px] overflow-y-auto">
                                <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">
                                    {selectedJob.description || "The employer hasn't provided a detailed description for this role. Please reach out to them during the application process for more information."}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowJobDetailsModal(false)}
                                className="flex-1 py-5 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-lg hover:bg-slate-200 transition-all"
                            >
                                Not Interested
                            </button>
                            <button
                                onClick={() => { setShowJobDetailsModal(false); setShowApplyModal(true); }}
                                className="flex-[2] py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
                            >
                                Apply for this Position
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showApplyModal && selectedJob && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative overflow-hidden">
                        <button onClick={() => setShowApplyModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20} /></button>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">Apply for {selectedJob.title}</h3>
                        <p className="text-slate-500 mb-8 font-medium">at {selectedJob.company}</p>

                        <form onSubmit={handleApplyJob} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Upload Resume (PDF)</label>
                                <div className="relative w-full h-24 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                                    {resumeBase64 ? (
                                        <div className="flex items-center gap-3 text-blue-600">
                                            <FileText size={24} />
                                            <span className="text-sm font-bold">Resume Attached</span>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setResumeBase64(''); }} className="p-1 hover:bg-blue-50 rounded-full">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <Plus className="text-slate-300 mb-1" size={24} />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider text-center px-4 leading-relaxed">Click to Select PDF Resume<br /><span className="text-[8px] opacity-60">Max 800KB</span></span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleResumeUpload}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Short Cover Note</label>
                                <textarea name="notes" rows={3} placeholder="Why are you a good fit?" className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <button disabled={applying} className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50">
                                {applying ? 'Submitting...' : 'Submit Application'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showPostJobModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowPostJobModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20} /></button>
                        <h3 className="text-2xl font-black text-slate-900 mb-8">Post New Job Opening</h3>

                        <form onSubmit={handlePostJob} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Job Title</label>
                                <input name="title" required placeholder="e.g. Senior Decorator" className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Company Name</label>
                                <input name="company" required placeholder="Your Business Name" className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <Dropdown
                                    name="category"
                                    options={[
                                        { label: 'Decor', value: 'Decor' },
                                        { label: 'Catering', value: 'Catering' },
                                        { label: 'Photography', value: 'Photography' },
                                        { label: 'Management', value: 'Management' },
                                    ]}
                                    value={postJobCategory}
                                    onChange={val => setPostJobCategory(val)}
                                    placeholder="Select Category"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Job Type</label>
                                <Dropdown
                                    name="type"
                                    options={[
                                        { label: 'Full Time', value: 'Full Time' },
                                        { label: 'Part Time', value: 'Part Time' },
                                        { label: 'Contract', value: 'Contract' },
                                        { label: 'Freelance', value: 'Freelance' },
                                    ]}
                                    value={postJobType}
                                    onChange={val => setPostJobType(val)}
                                    placeholder="Select Type"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Salary Range</label>
                                <input name="salary" required placeholder="e.g. ₹20k - ₹30k" className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                <input name="location" required placeholder="e.g. Mumbai / Remote" className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Description</label>
                                <textarea name="description" rows={3} required className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Requirements (one per line)</label>
                                <textarea name="requirements" rows={3} required className="w-full px-5 py-3 bg-slate-50 rounded-xl border-none focus:ring-2 focus:ring-blue-100 outline-none font-medium" />
                            </div>
                            <div className="md:col-span-2 pt-4">
                                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">
                                    Submit Job Post
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Register Store Modal */}
            {showRegisterStore && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowRegisterStore(false)}></div>
                    <div className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Enable Marketplace</h3>
                            <p className="text-slate-500">List your store in our shopping section</p>
                        </div>
                        <form onSubmit={handleRegisterStore} className="space-y-6">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Store Name</label>
                                <input name="name" required defaultValue={business?.businessName} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Store Category</label>
                                <Dropdown
                                    name="category"
                                    options={[
                                        { label: 'Decorators', value: 'Decorators' },
                                        { label: 'Caterers', value: 'Caterers' },
                                        { label: 'Venues', value: 'Venues' },
                                        { label: 'Gifts & Sweets', value: 'Gifts & Sweets' },
                                        { label: 'Fashion', value: 'Fashion' },
                                        { label: 'Electronics', value: 'Electronics' },
                                    ]}
                                    value={regStoreCategory}
                                    onChange={val => setRegStoreCategory(val)}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Location</label>
                                <input name="location" required defaultValue={business?.address} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Store Description</label>
                                <textarea name="description" rows={3} required defaultValue={business?.description} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg hover:bg-blue-700 transition-all disabled:opacity-50">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Activate Marketplace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Product Modal */}
            {showAddProductModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddProductModal(false)}></div>
                    <div className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-8">
                            <h3 className="text-2xl font-black text-slate-900">Add New Product</h3>
                            <p className="text-slate-500">List a product in your store</p>
                        </div>
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Product Name</label>
                                    <input name="name" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Price (₹)</label>
                                    <input name="price" type="number" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                    <input name="category" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Image URL</label>
                                <input name="image" placeholder="https://..." className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-medium focus:ring-2 focus:ring-blue-100 outline-none" />
                            </div>
                            <button type="submit" disabled={isProcessing} className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 transition-all disabled:opacity-50">
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Push to Marketplace'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}></div>
                    <div className="relative bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                                <Star size={32} className="fill-amber-500" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Write a Review</h3>
                            <p className="text-slate-500">Share your experience with others</p>
                        </div>

                        <div className="space-y-6">
                            <div className="flex justify-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setReviewRating(star)}
                                        className={`p-2 transition-all ${reviewRating >= star ? 'text-amber-400 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                                    >
                                        <Star size={32} className={reviewRating >= star ? 'fill-amber-400' : ''} />
                                    </button>
                                ))}
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">Your Feedback</label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    placeholder="Tell us what you liked or what could be better..."
                                    rows={4}
                                    className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-100 outline-none font-medium transition-all"
                                />
                            </div>

                            <button
                                onClick={submitReview}
                                disabled={isProcessing || !reviewComment}
                                className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 hover:bg-black transition-all disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="animate-spin" /> : 'Submit Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {showAddOfferModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative">
                        <button onClick={() => setShowAddOfferModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20} /></button>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4">
                                <Tag size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Post Exclusive Offer</h3>
                            <p className="text-slate-500">Reach more customers with a limited time deal</p>
                        </div>

                        <form onSubmit={handleCreateOffer} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Offer Code</label>
                                    <input
                                        required
                                        value={newOffer.code}
                                        onChange={e => setNewOffer({ ...newOffer, code: e.target.value.toUpperCase() })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                        placeholder="SAVE50"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Discount</label>
                                    <input
                                        required
                                        value={newOffer.discount}
                                        onChange={e => setNewOffer({ ...newOffer, discount: e.target.value })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                        placeholder="50% / ₹100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Offer Title</label>
                                <input
                                    required
                                    value={newOffer.title}
                                    onChange={e => setNewOffer({ ...newOffer, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                    placeholder="Exclusive Summer Discount"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    required
                                    value={newOffer.description}
                                    onChange={e => setNewOffer({ ...newOffer, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-medium h-24"
                                    placeholder="Valid on all services until end of the month..."
                                />
                            </div>
                            <button
                                disabled={loadingBusiness}
                                className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all disabled:opacity-50 mt-4"
                            >
                                {loadingBusiness ? 'Submitting...' : 'Post Offer for Approval'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Campaign Modal */}
            {showCreateCampaignModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
                        <button onClick={() => setShowCreateCampaignModal(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"><X size={20} /></button>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                                <Megaphone size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Create Ad Campaign</h3>
                            <p className="text-slate-500">Promote your business to reach more customers</p>
                        </div>

                        <form onSubmit={handleCreateCampaign} className="space-y-4">
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Campaign Title</label>
                                <input
                                    required
                                    value={newCampaign.title}
                                    onChange={e => setNewCampaign({ ...newCampaign, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                    placeholder="Summer Sale Promotion"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                                <textarea
                                    required
                                    value={newCampaign.description}
                                    onChange={e => setNewCampaign({ ...newCampaign, description: e.target.value })}
                                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-medium h-20"
                                    placeholder="Describe your campaign..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Target City</label>
                                    <Dropdown
                                        options={[
                                            { label: 'All Cities', value: '' },
                                            { label: 'Mumbai', value: 'Mumbai' },
                                            { label: 'Bangalore', value: 'Bangalore' },
                                            { label: 'Delhi', value: 'Delhi' },
                                            { label: 'Hyderabad', value: 'Hyderabad' },
                                            { label: 'Pune', value: 'Pune' },
                                        ]}
                                        value={newCampaign.targetCity}
                                        onChange={val => setNewCampaign({ ...newCampaign, targetCity: val })}
                                        placeholder="All Cities"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                                    <Dropdown
                                        options={[
                                            { label: 'All Categories', value: '' },
                                            { label: 'Shopping', value: 'shopping' },
                                            { label: 'Events', value: 'events' },
                                            { label: 'Services', value: 'services' },
                                        ]}
                                        value={newCampaign.targetCategory}
                                        onChange={val => setNewCampaign({ ...newCampaign, targetCategory: val })}
                                        placeholder="All Categories"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Duration (Days)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        required
                                        value={newCampaign.duration}
                                        onChange={e => setNewCampaign({ ...newCampaign, duration: parseInt(e.target.value) })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Budget (₹)</label>
                                    <input
                                        type="number"
                                        min="100"
                                        required
                                        value={newCampaign.budget}
                                        onChange={e => setNewCampaign({ ...newCampaign, budget: parseInt(e.target.value) })}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-rose-500 rounded-2xl outline-none transition-all font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Placement</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['banner', 'featured', 'sidebar', 'popup'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewCampaign({ ...newCampaign, placement: p })}
                                            className={`p-3 rounded-xl font-bold text-sm capitalize transition-all ${newCampaign.placement === p ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl flex justify-between items-center mt-6">
                                <span className="text-slate-500 font-medium">Estimated Cost</span>
                                <span className="text-2xl font-black text-slate-900">₹{newCampaign.budget}</span>
                            </div>
                            <button
                                disabled={loadingBusiness}
                                className="w-full py-5 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:opacity-90 transition-all disabled:opacity-50 mt-4"
                            >
                                {loadingBusiness ? 'Creating...' : 'Launch Campaign'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Edit Profile Modal */}
            <AnimatePresence>
                {showEditProfileModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                            onClick={() => setShowEditProfileModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white rounded-[3rem] w-full max-w-lg p-10 shadow-3xl overflow-visible my-8"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
                            <button
                                onClick={() => setShowEditProfileModal(false)}
                                className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-all text-slate-400 group"
                            >
                                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center text-blue-600 mx-auto mb-6 shadow-inner relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-blue-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500 opacity-10" />
                                    <User size={36} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Edit Profile</h3>
                                <p className="text-slate-500 font-medium">Keep your account details up to date</p>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                        <div className="relative group">
                                            <input
                                                required
                                                value={editForm.fullName}
                                                onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                                placeholder="John Doe"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <DatePicker
                                            label="Date of Birth"
                                            value={editForm.dob}
                                            onChange={date => setEditForm({ ...editForm, dob: date })}
                                        />
                                        <div>
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Number</label>
                                            <input
                                                required
                                                value={editForm.mobile}
                                                onChange={e => setEditForm({ ...editForm, mobile: e.target.value })}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                                placeholder="+91..."
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Aadhaar/PAN</label>
                                        <input
                                            required
                                            value={editForm.aadhaarPan}
                                            onChange={e => setEditForm({ ...editForm, aadhaarPan: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                            placeholder="XXXX-XXXX-XXXX"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Address</label>
                                        <textarea
                                            required
                                            value={editForm.address}
                                            onChange={e => setEditForm({ ...editForm, address: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-medium text-slate-800 placeholder:text-slate-300 shadow-sm h-28 resize-none"
                                            placeholder="Tell us where you are based..."
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Pin Code</label>
                                        <input
                                            required
                                            value={editForm.pinCode}
                                            onChange={e => setEditForm({ ...editForm, pinCode: e.target.value })}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-800 placeholder:text-slate-300 shadow-sm"
                                            placeholder="613XXX"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isProcessing}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[2rem] font-black text-lg shadow-xl shadow-blue-200 hover:shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-3 mt-4"
                                >
                                    {isProcessing ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            Save Changes
                                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                                <ChevronRight size={18} />
                                            </div>
                                        </>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
            {/* View Notification Modal */}
            {viewingNotification && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-lg w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-900">Notification Alert</h3>
                            <button onClick={() => setViewingNotification(null)} className="text-slate-400 p-2 hover:bg-slate-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto">
                                <BellRing size={40} />
                            </div>
                            <div className="text-center">
                                <h4 className="text-xl font-bold text-slate-900 mb-2">{viewingNotification.title}</h4>
                                <p className="text-slate-500 font-medium">{viewingNotification.message}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</h4>
                                    <p className="font-bold text-slate-900 capitalize">{viewingNotification.type || 'Alert'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Received</h4>
                                    <p className="font-bold text-slate-900">{new Date(viewingNotification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-3">
                            <button onClick={() => setViewingNotification(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors">Dismiss</button>
                            {viewingNotification.actionUrl && (
                                <Link
                                    href={viewingNotification.actionUrl}
                                    onClick={() => setViewingNotification(null)}
                                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors text-center"
                                >
                                    Take Action
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {confirmDeleteId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle size={40} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Are you sure?</h3>
                            <p className="text-slate-500 font-medium mb-8">
                                This action will permanently remove this notification from your alerts.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        deleteNotification(confirmDeleteId);
                                        setConfirmDeleteId(null);
                                    }}
                                    className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
            />

            {/* Account Deletion Modal */}
            {isDeletingAccount && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-200">
                        <div className="text-center">
                            <div className="w-24 h-24 bg-rose-50 text-rose-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <AlertCircle size={48} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 mb-4">Delete Account?</h3>
                            <div className="space-y-4 mb-10">
                                <p className="text-slate-500 font-medium leading-relaxed">
                                    <span className="text-rose-600 font-black">WARNING:</span> This action is permanent and cannot be undone.
                                </p>
                                <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100">
                                    <ul className="text-left text-xs font-bold text-rose-700 space-y-2">
                                        <li className="flex items-start gap-2">• All personal data will be erased</li>
                                        <li className="flex items-start gap-2">• Wallet balance will be forfeited</li>
                                        <li className="flex items-start gap-2">• Active bookings will be cancelled</li>
                                        <li className="flex items-start gap-2">• Access to Bharat Career Portal will end</li>
                                    </ul>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button
                                    onClick={() => {
                                        setIsDeletingAccount(false);
                                        showToast('Account deletion request submitted.', 'info');
                                    }}
                                    className="w-full py-5 bg-rose-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:bg-rose-700 transition-all active:scale-95"
                                >
                                    Yes, Delete My Account
                                </button>
                                <button
                                    onClick={() => setIsDeletingAccount(false)}
                                    className="w-full py-5 bg-slate-100 text-slate-600 rounded-2xl font-black text-lg hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    No, Keep My Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


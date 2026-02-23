import { FeeStructure, DashboardItem, AdminPermission } from '@/types';

export const APP_NAME = "Devaramane Events";
export const COMPANY_NAME = "Devaramane Events and Industries";

export const REGISTRATION_FEE: FeeStructure = {
    baseFee: 5000,
    discountPercent: 75,
    discountedFee: 1250,
    gstPercent: 18,
    gstAmount: 225,
    totalAmount: 1475,
    breakdown: {
        referral: 500,
        regFee: 500,
        gst: 225
    }
};

// Customer Dashboard Items
export const CUSTOMER_DASHBOARD_ITEMS: DashboardItem[] = [
    { id: 'overview', label: 'Overview', iconName: 'LayoutDashboard', color: 'bg-indigo-600' },
    { id: 'profile', label: 'Profile', iconName: 'User', color: 'bg-blue-500' },
    { id: 'events', label: 'Events', iconName: 'Calendar', color: 'bg-purple-500' },
    { id: 'shopping', label: 'Shopping', iconName: 'Store', color: 'bg-pink-500' },
    { id: 'jobs', label: 'Jobs', iconName: 'Briefcase', color: 'bg-orange-500' },
    { id: 'offers', label: 'Offers', iconName: 'Tag', color: 'bg-red-500' },
    { id: 'qr', label: 'My QR', iconName: 'QrCode', color: 'bg-gray-800' },
    { id: 'reports', label: 'Reports', iconName: 'FileText', color: 'bg-cyan-600' },
    { id: 'settings', label: 'Settings', iconName: 'Settings', color: 'bg-slate-600' },
];

// Admin Dashboard Items
export const ADMIN_DASHBOARD_ITEMS: DashboardItem[] = [
    { id: 'overview', label: 'Dashboard', iconName: 'LayoutDashboard', color: 'bg-indigo-600' },
    { id: 'users', label: 'User Management', iconName: 'Users', color: 'bg-blue-500', permission: AdminPermission.MANAGE_USERS },
    { id: 'products', label: 'Products', iconName: 'Package', color: 'bg-green-500', permission: AdminPermission.MANAGE_PRODUCTS },
    { id: 'orders', label: 'Orders', iconName: 'ShoppingCart', color: 'bg-yellow-500', permission: AdminPermission.MANAGE_ORDERS },
    { id: 'events', label: 'Events', iconName: 'Calendar', color: 'bg-purple-500', permission: AdminPermission.MANAGE_EVENTS },
    { id: 'jobs', label: 'Jobs', iconName: 'Briefcase', color: 'bg-orange-500', permission: AdminPermission.MANAGE_JOBS },
    { id: 'offers', label: 'Offers', iconName: 'Tag', color: 'bg-red-500', permission: AdminPermission.MANAGE_OFFERS },
    { id: 'reports', label: 'Reports', iconName: 'FileText', color: 'bg-cyan-600', permission: AdminPermission.VIEW_REPORTS },
    { id: 'settings', label: 'Settings', iconName: 'Settings', color: 'bg-slate-600', permission: AdminPermission.MANAGE_SETTINGS },
];

// Product Categories
export const PRODUCT_CATEGORIES = [
    'Electronics',
    'Fashion',
    'Home & Living',
    'Sports',
    'Books',
    'Health & Beauty',
    'Groceries',
    'Toys & Games',
];

// Job Types
export const JOB_TYPES = [
    'Full Time',
    'Part Time',
    'Contract',
    'Freelance',
];

// Status Colors
export const STATUS_COLORS = {
    ACTIVE: 'bg-green-100 text-green-700',
    PENDING: 'bg-yellow-100 text-yellow-700',
    SUSPENDED: 'bg-red-100 text-red-700',
    REJECTED: 'bg-gray-100 text-gray-700',
};

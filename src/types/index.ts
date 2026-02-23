// User Roles
export enum UserRole {
    ADMIN = 'ADMIN',
    CUSTOMER = 'CUSTOMER',
    GUEST = 'GUEST'
}

// User Status
export enum UserStatus {
    ACTIVE = 'ACTIVE',
    PENDING = 'PENDING',
    SUSPENDED = 'SUSPENDED',
    REJECTED = 'REJECTED'
}

// Base User Interface
export interface BaseUser {
    id: string;
    email: string;
    mobile?: string;
    phone?: string;
    createdAt: string;
    updatedAt: string;
}

// Admin User
export interface AdminUser extends BaseUser {
    role: UserRole.ADMIN;
    name: string;
    department: string;
    permissions: AdminPermission[];
    isSuperAdmin: boolean;
}

// Customer User
export interface CustomerUser extends BaseUser {
    role: UserRole.CUSTOMER;
    fullName: string;
    dob: string;
    aadhaarPan: string;
    address: string;
    pinCode: string;
    inviteCode?: string;
    referredBy?: string;
    status: UserStatus;
    walletBalance: number;
    kycVerified: boolean;
    profileImage?: string;
    city?: string;
    location?: {
        lat: number;
        lng: number;
    };
    selfieImage?: string;
    mobile?: string;
}

// Union type for any user
export type User = AdminUser | CustomerUser;

// Admin Permissions
export enum AdminPermission {
    MANAGE_USERS = 'MANAGE_USERS',
    MANAGE_PRODUCTS = 'MANAGE_PRODUCTS',
    MANAGE_ORDERS = 'MANAGE_ORDERS',
    MANAGE_EVENTS = 'MANAGE_EVENTS',
    MANAGE_JOBS = 'MANAGE_JOBS',
    MANAGE_OFFERS = 'MANAGE_OFFERS',
    VIEW_REPORTS = 'VIEW_REPORTS',
    MANAGE_SETTINGS = 'MANAGE_SETTINGS',
    SUPER_ADMIN = 'SUPER_ADMIN'
}

// Session Interface
export interface UserSession {
    id: string;
    userId: string;
    role: UserRole;
    token: string;
    expiresAt: Date;
    createdAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
}

// Multi-Session Support (for customers)
export interface MultiSession {
    sessions: UserSession[];
    activeSessionId: string;
}

// Registration Data
export interface RegistrationData {
    fullName: string;
    dob: string;
    mobile: string;
    email: string;
    aadhaarPan: string;
    address: string;
    pinCode: string;
    inviteCode: string;
    password: string;
    confirmPassword: string;
    location?: { lat: number; lng: number };
    selfieImage?: string;
}

// Login Credentials
export interface LoginCredentials {
    identifier: string; // email, mobile, or customer ID
    password: string;
    role: UserRole;
}

// Auth Response
export interface AuthResponse {
    success: boolean;
    message: string;
    user?: User;
    session?: UserSession;
    error?: string;
}

// Fee Structure
export interface FeeStructure {
    baseFee: number;
    discountPercent: number;
    discountedFee: number;
    gstPercent: number;
    gstAmount: number;
    totalAmount: number;
    breakdown: {
        referral: number;
        regFee: number;
        gst: number;
    };
}

// Dashboard Item
export interface DashboardItem {
    id: string;
    label: string;
    iconName: string;
    color: string;
    route?: string;
    permission?: AdminPermission;
}

// Event Item
export interface EventItem {
    id: string;
    title: string;
    description?: string;
    date: string;
    location: string;
    image: string;
    createdBy: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
}

// Product Item
export interface ProductItem {
    id: string;
    name: string;
    description?: string;
    price: string;
    category: string;
    rating: number;
    image: string;
    inStock: boolean;
    quantity?: number;
    sellerId?: string;
    storeId?: string;
    businessId?: string;
}

// Job Item
export interface JobItem {
    id: string;
    title: string;
    company: string;
    category: string; // e.g. 'Event Planning', 'Catering', 'Security'
    description: string;
    type: 'Full Time' | 'Part Time' | 'Contract' | 'Freelance';
    salary: string;
    location: string;
    requirements: string[];
    postedBy: string; // User ID of the employer
    status: 'pending' | 'open' | 'closed' | 'filled' | 'rejected';
    createdAt: string;
    updatedAt: string;
    applicationsCount?: number;
}

// Job Application
export interface JobApplication {
    id: string;
    jobId: string;
    jobTitle: string; // Redundant for easy display
    company: string;  // Redundant for easy display
    applicantId: string;
    applicantName: string;
    status: 'pending' | 'shortlisted' | 'rejected' | 'accepted';
    resumeUrl: string;
    appliedAt: string;
    updatedAt: string;
    notes?: string;
}

// Job Stats (for Admin/Reports)
export interface JobStats {
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    pendingApprovals: number;
    hiredCount: number;
}

// Offer Item
export interface OfferItem {
    id: string;
    businessId?: string;
    businessName?: string;
    code: string;
    discount: string;
    title: string;
    description: string;
    color: string;
    status: 'pending' | 'active' | 'expired' | 'rejected';
    city?: string;
    location?: {
        lat: number;
        lng: number;
    };
    validFrom: string;
    validUntil: string;
    usageLimit?: number;
    usedCount: number;
    minOrderValue?: number;
    applicableCategories?: string[];
    createdAt?: string;
    updatedAt?: string;
}


// Transaction
export interface Transaction {
    id: string;
    userId: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    category: 'purchase' | 'refund' | 'commission';
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
    reference?: string;
}

// Notification Type
export enum NotificationType {
    INFO = 'info',
    SUCCESS = 'success',
    WARNING = 'warning',
    ERROR = 'error',
    EVENT_REMINDER = 'event_reminder',
    JOB_ALERT = 'job_alert',
    BUSINESS_UPDATE = 'business_update',
    BOOKING_CONFIRMATION = 'booking_confirmation',
    BROADCAST = 'broadcast'
}

// Notification
export interface Notification {
    id: string;
    userId?: string; // Optional for broadcasts
    title: string;
    message: string;
    type: NotificationType;
    read: boolean;
    createdAt: string;
    actionUrl?: string;

    // Targeting for broadcasts
    targetCity?: string;
    targetInterests?: string[];
    targetEventType?: string;
}

// Promotion Item
export interface PromotionItem {
    id: string;
    title: string;
    description: string;
    image: string;
    link?: string;
    type: 'banner' | 'popup' | 'sidebar';
    active: boolean;
    startDate: string;
    endDate: string;
}

// Business Detail
export interface BusinessDetail {
    id: string;
    userId: string;
    businessName: string;
    category: string;
    description: string;
    address: string;
    contactNumber: string;
    email: string;
    website?: string;
    logo?: string;
    images?: string[];
    status: 'pending' | 'active' | 'suspended' | 'verified' | 'rejected';
    isVerified: boolean;
    verificationDate?: string;
    ownerName: string;
    gstNumber?: string;
    businessType: 'Retail' | 'Service' | 'Manufacturer' | 'Wholesale';
    operatingHours?: string;
    createdAt: string;
    updatedAt: string;
}

// Business Booking
export interface BusinessBooking {
    id: string;
    businessId: string;
    customerId: string;
    customerName: string;
    serviceName: string;
    bookingDate: string;
    timeSlot: string;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    totalAmount: number;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

// Business Lead / Inquiry
export interface BusinessLead {
    id: string;
    businessId: string;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    status: 'new' | 'contacted' | 'closed';
    createdAt: string;
}

// Ad Campaign (Promotion)
export interface AdCampaign {
    id: string;
    businessId: string;
    businessName: string;
    title: string;
    description: string;
    image?: string;
    targetCity?: string;
    targetCategory?: string;
    duration: number; // days
    startDate: string;
    endDate: string;
    budget: number;
    spent: number;
    impressions: number;
    clicks: number;
    status: 'pending' | 'active' | 'paused' | 'completed' | 'rejected';
    placement: 'banner' | 'featured' | 'sidebar' | 'popup';
    createdAt: string;
    updatedAt: string;
}

// User Settings / Preferences
export interface UserSettings {
    id: string;
    userId: string;
    notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
        promotions: boolean;
        orderUpdates: boolean;
        newOffers: boolean;
    };
    language: string;
    region: string;
    currency: string;
    privacy: {
        profileVisibility: 'public' | 'private' | 'business-only';
        showLocation: boolean;
        allowAnalytics: boolean;
    };
    paymentMethods: {
        id: string;
        type: 'upi' | 'card' | 'netbanking';
        label: string;
        isDefault: boolean;
    }[];
    theme: 'light' | 'dark' | 'system';
    updatedAt: string;
}

// Platform Settings (Admin)
export interface PlatformSettings {
    id: string;
    appName: string;
    appVersion: string;
    maintenanceMode: boolean;
    paymentGateway: {
        paytm: boolean;
        upi: boolean;
    };
    commissionRate: number;
    taxRate: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    featuredListingPrice: number;
    adPricePerDay: number;
    supportEmail: string;
    supportPhone: string;
    features: {
        jobs: boolean;
        events: boolean;
        shopping: boolean;
    };
    updatedAt: string;
    updatedBy: string;
}

// Report Data
export interface ReportData {
    period: string;
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalBookings: number;
    eventBookings: number;
    topBusinesses: {
        id: string;
        name: string;
        revenue: number;
        bookings: number;
    }[];
    categoryBreakdown: {
        category: string;
        count: number;
        revenue: number;
    }[];
    dailyMetrics: {
        date: string;
        users: number;
        orders: number;
        revenue: number;
    }[];
}


// Lucky Draw Types
export interface LuckyDrawSubscription {
    id: string;
    userId: string;
    planName: string;
    amount: number;
    status: 'active' | 'expired' | 'cancelled';
    startDate: string;
    endDate: string;
    paymentId: string;
    createdAt: string;
}

export interface LuckyDrawProduct {
    id: string;
    name: string;
    description: string;
    image: string;
    totalNumbers: number;
    pricePerNumber: number;
    status: 'active' | 'completed' | 'cancelled';
    drawDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface NumberBooking {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    numbers: number[];
    totalAmount: number;
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentId?: string;
    bookedAt: string;
}

export interface LuckyDrawWinner {
    id: string;
    productId: string;
    productName: string;
    userId: string;
    userName: string;
    winningNumber: number;
    gift: string;
    giftValue: number;
    status: 'pending' | 'claimed' | 'delivered';
    selectedAt: string;
    notified: boolean;
}

export interface DrawResult {
    id: string;
    productId: string;
    winningNumbers: number[];
    selectedBy: string;
    selectionMethod: 'manual' | 'random';
    completedAt: string;
}

// API Response
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

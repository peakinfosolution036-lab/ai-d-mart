import {
    AdminUser,
    CustomerUser,
    UserSession,
    UserRole,
    UserStatus,
    AdminPermission,
    EventItem,
    ProductItem,
    JobItem,
    OfferItem,
    Transaction,
    Notification
} from '@/types';
import { hashPassword } from './auth';

// In-memory database (replace with real database in production)
class MockDatabase {
    private admins: Map<string, AdminUser & { password: string }> = new Map();
    private customers: Map<string, CustomerUser & { password: string }> = new Map();
    private sessions: Map<string, UserSession> = new Map();
    private events: Map<string, EventItem> = new Map();
    private products: Map<string, ProductItem> = new Map();
    private jobs: Map<string, JobItem> = new Map();
    private offers: Map<string, OfferItem> = new Map();
    private transactions: Map<string, Transaction> = new Map();
    private notifications: Map<string, Notification> = new Map();

    constructor() {
        this.seedData();
    }

    private seedData() {
        // Seed Super Admin
        const superAdmin: AdminUser & { password: string } = {
            id: 'ADM0001',
            email: 'admin@aidmart.com',
            mobile: '9999999999',
            name: 'Super Admin',
            role: UserRole.ADMIN,
            department: 'Super Admin',
            permissions: [AdminPermission.SUPER_ADMIN],
            isSuperAdmin: true,
            password: hashPassword('admin123'),
            createdAt: new Date('2023-01-01').toISOString(),
            updatedAt: new Date().toISOString()
        };
        this.admins.set(superAdmin.id, superAdmin);

        // Seed Department Admins
        const departments = [
            { name: 'User Manager', dept: 'User Management', email: 'users@aidmart.com' },
            { name: 'Product Manager', dept: 'Product Management', email: 'products@aidmart.com' },
            { name: 'Marketing Head', dept: 'Marketing', email: 'marketing@aidmart.com' },
        ];

        departments.forEach((d, i) => {
            const admin: AdminUser & { password: string } = {
                id: `ADM${1002 + i}`,
                email: d.email,
                mobile: `988888880${i}`,
                name: d.name,
                role: UserRole.ADMIN,
                department: d.dept,
                permissions: this.getDefaultPermissions(d.dept),
                isSuperAdmin: false,
                password: hashPassword('admin123'),
                createdAt: new Date('2023-06-01').toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.admins.set(admin.id, admin);
        });

        // Seed Customers
        const customerData = [
            { name: 'Rahul Sharma', mobile: '9876543210', status: UserStatus.ACTIVE },
            { name: 'Priya Patel', mobile: '9876543211', status: UserStatus.PENDING },
            { name: 'Amit Kumar', mobile: '9876543212', status: UserStatus.ACTIVE },
            { name: 'Sneha Reddy', mobile: '9876543213', status: UserStatus.ACTIVE },
            { name: 'Vikram Singh', mobile: '9876543214', status: UserStatus.SUSPENDED },
        ];

        customerData.forEach((c, i) => {
            const customer: CustomerUser & { password: string } = {
                id: `DI00${23 + i}`,
                email: `${c.name.toLowerCase().replace(' ', '.')}@gmail.com`,
                mobile: c.mobile,
                fullName: c.name,
                dob: '1990-01-15',
                aadhaarPan: `ABCDE${1234 + i}F`,
                address: 'Karnataka, India',
                pinCode: '560001',
                role: UserRole.CUSTOMER,
                status: c.status,
                walletBalance: Math.floor(Math.random() * 5000),
                kycVerified: c.status === UserStatus.ACTIVE,
                password: hashPassword('customer123'),
                createdAt: new Date(`2023-${6 + i}-15`).toISOString(),
                updatedAt: new Date().toISOString()
            };
            this.customers.set(customer.id, customer);
        });

        // Seed Events
        const eventsData = [
            { title: 'Grand Launch Event', date: 'Oct 24, 2023', location: 'Bangalore Convention Center', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400' },
            { title: 'Diwali Mega Sale', date: 'Nov 10, 2023', location: 'City Center Mall', image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=400' },
            { title: 'Partner Meet 2024', date: 'Jan 15, 2024', location: 'Hyderabad Tech Park', image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=400' },
        ];
        eventsData.forEach((e, i) => {
            this.events.set(`evt_${i + 1}`, {
                ...e,
                id: `evt_${i + 1}`,
                status: 'upcoming',
                createdBy: 'ADM0001'
            });
        });

        // Seed Products
        const productsData = [
            { name: 'Smart Watch Pro', price: '2499', category: 'Electronics', rating: 4.5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200', inStock: true },
            { name: 'Leather Backpack', price: '1299', category: 'Fashion', rating: 4.2, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200', inStock: true },
            { name: 'Wireless Earbuds', price: '1999', category: 'Electronics', rating: 4.8, image: 'https://images.unsplash.com/photo-1572569028738-411a0977d42f?auto=format&fit=crop&q=80&w=200', inStock: true },
            { name: 'Running Shoes', price: '2999', category: 'Sports', rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', inStock: true },
        ];
        productsData.forEach((p, i) => {
            this.products.set(`prod_${i + 1}`, { ...p, id: `prod_${i + 1}` });
        });

        // Seed Jobs
        const jobsData = [
            {
                title: 'Area Sales Manager',
                company: 'Devaramane Industries',
                category: 'Sales',
                description: 'Manage sales operations in assigned area',
                type: 'Full Time' as const,
                salary: '₹25k - ₹40k',
                location: 'Bangalore',
                requirements: ['2+ years experience', 'Good communication skills']
            },
            {
                title: 'Delivery Partner',
                company: 'AI D Mart Logistics',
                category: 'Logistics',
                description: 'Deliver packages to customers',
                type: 'Part Time' as const,
                salary: '₹15k - ₹20k',
                location: 'Bangalore',
                requirements: ['Valid driving license', 'Own vehicle']
            },
            {
                title: 'Customer Support',
                company: 'AI D Mart',
                category: 'Support',
                description: 'Handle customer inquiries and support',
                type: 'Full Time' as const,
                salary: '₹18k - ₹25k',
                location: 'Bangalore',
                requirements: ['Good communication', 'Problem solving skills']
            },
        ];
        jobsData.forEach((j, i) => {
            this.jobs.set(`job_${i + 1}`, {
                ...j,
                id: `job_${i + 1}`,
                postedBy: 'ADM0001',
                status: 'open',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
        });

        // Seed Offers
        const offersData = [
            { code: 'DIWALI50', discount: '50%', title: 'Diwali Special', description: 'Valid on all electronics over ₹5000', color: 'bg-red-500' },
            { code: 'WELCOME20', discount: '20%', title: 'New User Bonus', description: 'Flat discount on your first order', color: 'bg-blue-500' },
            { code: 'PARTNER10', discount: '10%', title: 'Partner Exclusive', description: 'Special discount for active partners', color: 'bg-green-500' },
        ];
        offersData.forEach((o, i) => {
            this.offers.set(`offer_${i + 1}`, {
                ...o,
                id: `offer_${i + 1}`,
                status: 'active' as const,
                validFrom: new Date().toISOString(),
                validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                usedCount: 0
            });
        });

    }

    private getDefaultPermissions(department: string): AdminPermission[] {
        const map: Record<string, AdminPermission[]> = {
            'User Management': [AdminPermission.MANAGE_USERS, AdminPermission.VIEW_REPORTS],
            'Product Management': [AdminPermission.MANAGE_PRODUCTS, AdminPermission.MANAGE_ORDERS],
            'Marketing': [AdminPermission.MANAGE_EVENTS, AdminPermission.MANAGE_OFFERS],
        };
        return map[department] || [AdminPermission.VIEW_REPORTS];
    }

    // Admin Methods
    getAdminById(id: string) {
        return this.admins.get(id);
    }

    getAdminByEmail(email: string) {
        return Array.from(this.admins.values()).find(a => a.email === email);
    }

    getAdminByMobile(mobile: string) {
        return Array.from(this.admins.values()).find(a => a.mobile === mobile);
    }

    getAllAdmins() {
        return Array.from(this.admins.values()).map(({ password, ...admin }) => admin);
    }

    // Customer Methods
    getCustomerById(id: string) {
        return this.customers.get(id);
    }

    getCustomerByEmail(email: string) {
        return Array.from(this.customers.values()).find(c => c.email === email);
    }

    getCustomerByMobile(mobile: string) {
        return Array.from(this.customers.values()).find(c => c.mobile === mobile);
    }

    getAllCustomers() {
        return Array.from(this.customers.values()).map(({ password, ...customer }) => customer);
    }

    createCustomer(customer: CustomerUser & { password: string }) {
        this.customers.set(customer.id, customer);
        return customer;
    }

    updateCustomer(id: string, updates: Partial<CustomerUser>) {
        const customer = this.customers.get(id);
        if (customer) {
            const updated = { ...customer, ...updates, updatedAt: new Date().toISOString() };
            this.customers.set(id, updated);
            return updated;
        }
        return null;
    }

    // Session Methods
    createSession(session: UserSession) {
        this.sessions.set(session.id, session);
        return session;
    }

    getSessionById(id: string) {
        return this.sessions.get(id);
    }

    getSessionByToken(token: string) {
        return Array.from(this.sessions.values()).find(s => s.token === token);
    }

    getSessionsByUserId(userId: string) {
        return Array.from(this.sessions.values()).filter(s => s.userId === userId);
    }

    deleteSession(id: string) {
        return this.sessions.delete(id);
    }

    deleteSessionsByUserId(userId: string) {
        const sessions = this.getSessionsByUserId(userId);
        sessions.forEach(s => this.sessions.delete(s.id));
    }

    // Events
    getAllEvents() { return Array.from(this.events.values()); }
    getEventById(id: string) { return this.events.get(id); }
    createEvent(event: EventItem) { this.events.set(event.id, event); return event; }
    updateEvent(id: string, updates: Partial<EventItem>) {
        const event = this.events.get(id);
        if (event) { this.events.set(id, { ...event, ...updates }); return this.events.get(id); }
        return null;
    }
    deleteEvent(id: string) { return this.events.delete(id); }

    // Products
    getAllProducts() { return Array.from(this.products.values()); }
    getProductById(id: string) { return this.products.get(id); }
    createProduct(product: ProductItem) { this.products.set(product.id, product); return product; }
    deleteProduct(id: string) { return this.products.delete(id); }

    // Jobs
    getAllJobs() { return Array.from(this.jobs.values()); }
    getJobById(id: string) { return this.jobs.get(id); }
    createJob(job: JobItem) { this.jobs.set(job.id, job); return job; }
    deleteJob(id: string) { return this.jobs.delete(id); }

    // Offers
    getAllOffers() { return Array.from(this.offers.values()); }
    getOfferById(id: string) { return this.offers.get(id); }
    getOfferByCode(code: string) { return Array.from(this.offers.values()).find(o => o.code === code); }
    createOffer(offer: OfferItem) { this.offers.set(offer.id, offer); return offer; }
    deleteOffer(id: string) { return this.offers.delete(id); }


    // Transactions
    getTransactionsByUserId(userId: string) {
        return Array.from(this.transactions.values()).filter(t => t.userId === userId);
    }
    createTransaction(transaction: Transaction) {
        this.transactions.set(transaction.id, transaction);
        return transaction;
    }

    // Notifications
    getNotificationsByUserId(userId: string) {
        return Array.from(this.notifications.values())
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    createNotification(notification: Notification) {
        this.notifications.set(notification.id, notification);
        return notification;
    }
    markNotificationRead(id: string) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.read = true;
            this.notifications.set(id, notification);
        }
    }
}

// Singleton instance
export const db = new MockDatabase();

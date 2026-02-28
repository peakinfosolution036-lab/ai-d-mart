'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';

// --- Types ---
export interface EventItem { id: string; title: string; date: string; location: string; image: string; }
export interface ProductItem { id: string; name: string; price: string; category: string; rating: number; image: string; inStock: boolean; }
export interface JobItem { id: string; title: string; company: string; type: string; salary: string; }
export interface OfferItem { id: string; code: string; discount: string; title: string; description: string; color: string; }
export interface RewardItem { id: string; name: string; points: number; image: string; }
export interface UserItem { id: string; name: string; mobile: string; status: 'Approved' | 'Pending' | 'Rejected'; amount: string; date: string; }

interface DataContextType {
    events: EventItem[];
    products: ProductItem[];
    jobs: JobItem[];
    offers: OfferItem[];
    rewards: RewardItem[];
    users: UserItem[];
    addEvent: (item: Omit<EventItem, 'id'>) => void;
    addProduct: (item: Omit<ProductItem, 'id'>) => void;
    addJob: (item: Omit<JobItem, 'id'>) => void;
    addOffer: (item: Omit<OfferItem, 'id'>) => void;
    addReward: (item: Omit<RewardItem, 'id'>) => void;
    registerUser: (userData: any) => string;
    deleteItem: (type: 'event' | 'product' | 'job' | 'offer' | 'reward' | 'user', id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error('useData must be used within a DataProvider');
    return context;
};

// --- Initial Mock Data ---
const INITIAL_EVENTS: EventItem[] = [
    { id: '1', title: 'Grand Launch Event', date: 'Oct 24, 2023', location: 'Bangalore Convention Center', image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400' },
    { id: '2', title: 'Diwali Mega Sale', date: 'Nov 10, 2023', location: 'City Center Mall', image: 'https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?auto=format&fit=crop&q=80&w=400' },
];

const INITIAL_PRODUCTS: ProductItem[] = [
    { id: '1', name: 'Smart Watch Pro', price: '2499', category: 'Electronics', rating: 4.5, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200', inStock: true },
    { id: '2', name: 'Leather Backpack', price: '1299', category: 'Fashion', rating: 4.2, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200', inStock: true },
    { id: '3', name: 'Wireless Earbuds', price: '1999', category: 'Electronics', rating: 4.8, image: 'https://images.unsplash.com/photo-1572569028738-411a0977d42f?auto=format&fit=crop&q=80&w=200', inStock: true },
    { id: '4', name: 'Running Shoes', price: '2999', category: 'Sports', rating: 4.6, image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=200', inStock: true },
];

const INITIAL_JOBS: JobItem[] = [
    { id: '1', title: 'Area Sales Manager', company: 'Devaramane Industries', type: 'Full Time', salary: '₹25k - ₹40k' },
    { id: '2', title: 'Delivery Partner', company: 'Logistics', type: 'Part Time', salary: '₹15k - ₹20k' },
];

const INITIAL_OFFERS: OfferItem[] = [
    { id: '1', code: 'DIWALI50', discount: '50%', title: 'Diwali Special', description: 'Valid on all electronics over ₹5000', color: 'bg-red-500' },
    { id: '2', code: 'WELCOME20', discount: '20%', title: 'New User Bonus', description: 'Flat discount on your first order', color: 'bg-blue-500' },
];

const INITIAL_REWARDS: RewardItem[] = [
    { id: '1', name: 'Gold Ring', points: 5000, image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Smart Watch', points: 2500, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200' },
    { id: '3', name: 'Laptop Bag', points: 1500, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=200' },
];

const INITIAL_USERS: UserItem[] = [
    { id: 'DI0023', name: "Rahul Sharma", mobile: "9876543210", status: "Approved", amount: "₹1,475", date: "Oct 24, 2023" },
    { id: 'DI0024', name: "Priya Patel", mobile: "9876543211", status: "Pending", amount: "₹1,475", date: "Oct 25, 2023" },
    { id: 'DI0025', name: "Amit Kumar", mobile: "9876543212", status: "Approved", amount: "₹1,475", date: "Oct 26, 2023" },
];

// --- Provider ---
export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS);
    const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
    const [jobs, setJobs] = useState<JobItem[]>(INITIAL_JOBS);
    const [offers, setOffers] = useState<OfferItem[]>(INITIAL_OFFERS);
    const [rewards, setRewards] = useState<RewardItem[]>(INITIAL_REWARDS);
    const [users, setUsers] = useState<UserItem[]>(INITIAL_USERS);

    const generateId = () => Math.random().toString(36).substr(2, 9);

    const addEvent = (item: Omit<EventItem, 'id'>) => setEvents([...events, { ...item, id: generateId() }]);
    const addProduct = (item: Omit<ProductItem, 'id'>) => setProducts([...products, { ...item, id: generateId() }]);
    const addJob = (item: Omit<JobItem, 'id'>) => setJobs([...jobs, { ...item, id: generateId() }]);
    const addOffer = (item: Omit<OfferItem, 'id'>) => setOffers([...offers, { ...item, id: generateId() }]);
    const addReward = (item: Omit<RewardItem, 'id'>) => setRewards([...rewards, { ...item, id: generateId() }]);

    const registerUser = (userData: any) => {
        const newId = `DI${Math.floor(1000 + Math.random() * 9000)}`;
        const newUser: UserItem = {
            id: newId,
            name: userData.fullName,
            mobile: userData.mobile,
            status: 'Pending',
            amount: '₹1,475',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        setUsers([newUser, ...users]);
        return newId;
    };

    const deleteItem = (type: string, id: string) => {
        if (type === 'event') setEvents(events.filter(i => i.id !== id));
        if (type === 'product') setProducts(products.filter(i => i.id !== id));
        if (type === 'job') setJobs(jobs.filter(i => i.id !== id));
        if (type === 'offer') setOffers(offers.filter(i => i.id !== id));
        if (type === 'reward') setRewards(rewards.filter(i => i.id !== id));
        if (type === 'user') setUsers(users.filter(i => i.id !== id));
    }

    return (
        <DataContext.Provider value={{
            events, products, jobs, offers, rewards, users,
            addEvent, addProduct, addJob, addOffer, addReward, registerUser, deleteItem
        }}>
            {children}
        </DataContext.Provider>
    );
};

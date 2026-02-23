'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
    fullName?: string;
    phone?: string;
    role: 'ADMIN' | 'CUSTOMER';
    status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'REJECTED';
    walletBalance?: number;
    rewardPoints?: number;
    kycVerified?: boolean;
    address?: string;
    pinCode?: string;
    dob?: string;
    aadhaarPan?: string;
    mobile?: string;
    profileImage?: string;
    selfieImage?: string;
    location?: { lat: number; lng: number };
    createdAt?: string;
}

interface AuthContextType {
    // State
    isLoggedIn: boolean;
    isLoading: boolean;
    user: User | null;
    userRole: 'ADMIN' | 'CUSTOMER' | 'GUEST';

    // Actions
    login: (email: string, password: string, role?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    register: (data: any) => Promise<{ success: boolean; error?: string; userId?: string; requiresVerification?: boolean }>;
    verifyEmail: (email: string, code: string) => Promise<{ success: boolean; error?: string }>;
    forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
    resetPassword: (email: string, code: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
    checkSession: () => Promise<void>;

    // Helpers
    isAdmin: () => boolean;
    isCustomer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [userRole, setUserRole] = useState<'ADMIN' | 'CUSTOMER' | 'GUEST'>('GUEST');

    // Check session on mount
    const checkSession = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data?.user) {
                    setUser(data.data.user);
                    setUserRole(data.data.user.role);
                    setIsLoggedIn(true);
                } else {
                    resetState();
                }
            } else {
                resetState();
            }
        } catch (error) {
            console.error('Session check error:', error);
            resetState();
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const resetState = () => {
        setIsLoggedIn(false);
        setUser(null);
        setUserRole('GUEST');
    };

    const login = async (email: string, password: string, role?: string) => {
        try {
            setIsLoading(true);

            console.log('Starting login for:', email);

            // Authenticate with our backend (which uses Cognito)
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role }),
                credentials: 'include'
            });

            const data = await response.json();
            console.log('Login result:', data.success);

            if (!data.success) {
                return { success: false, error: data.error || 'Login failed' };
            }

            // Set user data from our backend
            setUser(data.data.user);
            setUserRole(data.data.user.role);
            setIsLoggedIn(true);

            console.log('Login successful!');
            return { success: true };

        } catch (error: any) {
            console.error('Login error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Clear backend session
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            resetState();
        }
    };

    const register = async (data: any) => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    userId: result.data?.userId,
                    requiresVerification: result.data?.requiresVerification
                };
            } else {
                return { success: false, error: result.error || 'Registration failed' };
            }
        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, error: 'Network error. Please try again.' };
        } finally {
            setIsLoading(false);
        }
    };

    const verifyEmail = async (email: string, code: string) => {
        try {
            const response = await fetch('/api/auth/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            });

            const result = await response.json();
            return { success: result.success, error: result.error };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const forgotPassword = async (email: string) => {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();
            return { success: result.success, error: result.error };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const resetPassword = async (email: string, code: string, newPassword: string) => {
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code, newPassword }),
            });

            const result = await response.json();
            return { success: result.success, error: result.error };
        } catch (error) {
            return { success: false, error: 'Network error. Please try again.' };
        }
    };

    const isAdmin = () => userRole === 'ADMIN';
    const isCustomer = () => userRole === 'CUSTOMER';

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            isLoading,
            user,
            userRole,
            login,
            logout,
            register,
            verifyEmail,
            forgotPassword,
            resetPassword,
            checkSession,
            isAdmin,
            isCustomer,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

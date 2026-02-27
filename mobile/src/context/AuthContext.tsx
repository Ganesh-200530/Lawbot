import React, { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

interface User {
    id: number;
    name: string;
    email: string;
    city?: string;
    state?: string;
    country?: string;
    phone?: string;
    gender?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: any) => Promise<void>;
    signup: (userData: any) => Promise<void>;
    logout: () => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const checkUserLoggedIn = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const login = async (userData: any) => {
        const response = await api.post('/auth/login', userData);
        if (response.data.user) {
            setUser(response.data.user);
        }
    };

    const signup = async (userData: any) => {
        await api.post('/auth/signup', userData);
    };

    const logout = async () => {
        await api.get('/auth/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

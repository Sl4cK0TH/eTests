import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/client';
import { User, TokenResponse } from '../types';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string, role: 'teacher' | 'student') => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('access_token');
        if (token) {
            // Decode JWT to get user info (simple decode, not verification)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUser({
                    id: payload.sub,
                    email: '',
                    full_name: '',
                    role: payload.role,
                    is_active: true,
                    created_at: '',
                });
            } catch {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        const { data } = await api.post<TokenResponse>('/auth/login', { email, password });
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        // Decode token
        const payload = JSON.parse(atob(data.access_token.split('.')[1]));
        setUser({
            id: payload.sub,
            email,
            full_name: '',
            role: payload.role,
            is_active: true,
            created_at: '',
        });
    };

    const register = async (email: string, password: string, fullName: string, role: 'teacher' | 'student') => {
        await api.post('/auth/register', {
            email,
            password,
            full_name: fullName,
            role,
        });
        // Auto login after register
        await login(email, password);
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}

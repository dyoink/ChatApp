'use client';

import { useState, useEffect, useCallback } from 'react';
import { authApi, userApi, User, LoginRequest, SignupRequest } from '@/lib/api';

interface AuthState {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
}

interface AuthActions {
    login: (credentials: LoginRequest) => Promise<{ success: boolean; message?: string }>;
    signup: (userData: SignupRequest) => Promise<{ success: boolean; message?: string }>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
    clearError: () => void;
}

export function useAuth(): AuthState & AuthActions {
    const [state, setState] = useState<AuthState>({
        user: null,
        token: null,
        isLoading: true,
        error: null,
    });

    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await userApi.getProfile();

            if (response.result === 'SUCCESS' && response.data) {
                setState(prev => ({
                    ...prev,
                    user: response.data,
                    isLoading: false,
                    error: null,
                }));
            } else {
                throw new Error(response.message || 'Failed to fetch user profile');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // If token is invalid, clear it
            localStorage.removeItem('authToken');
            setState(prev => ({
                ...prev,
                user: null,
                token: null,
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to fetch user profile',
            }));
        }
    }, []);

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                                const token = localStorage.getItem('authToken');
                if (token) {
                    setState(prev => ({ ...prev, token, isLoading: true }));
                    fetchUserProfile();
                } else {
                    setState(prev => ({ ...prev, isLoading: false }));
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                setState(prev => ({ ...prev, isLoading: false }));
            }
        };

        initializeAuth();
    }, [fetchUserProfile]);

    // Login function
    const login = useCallback(async (credentials: LoginRequest): Promise<{ success: boolean; message?: string }> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await authApi.login(credentials);

            if (response.result === 'SUCCESS' && response.data) {
                const { token } = response.data;
                localStorage.setItem('authToken', token);
                // Lưu token vào cookie (7 ngày)
                document.cookie = `authToken=${token}; path=/; max-age=604800;`;

                setState(prev => ({ ...prev, token, isLoading: true }));
                await fetchUserProfile();

                return { success: true };
            } else {
                const errorMessage = response.message || 'Login failed';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, message: errorMessage };
        }
    }, [fetchUserProfile]);

    // Signup function
    const signup = useCallback(async (userData: SignupRequest): Promise<{ success: boolean; message?: string }> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await authApi.signup(userData);

            if (response.result === 'SUCCESS' && response.data) {
                // After successful signup, automatically login
                const loginResponse = await authApi.login({
                    email: userData.email,
                    password: userData.password,
                });

                if (loginResponse.result === 'SUCCESS' && loginResponse.data) {
                    const { token } = loginResponse.data;
                    localStorage.setItem('authToken', token);
                    // Lưu token vào cookie (7 ngày)
                    document.cookie = `authToken=${token}; path=/; max-age=604800;`;

                    setState(prev => ({ ...prev, user: response.data, token, isLoading: false }));
                    return { success: true };
                } else {
                    throw new Error('Auto-login failed after signup');
                }
            } else {
                const errorMessage = response.message || 'Signup failed';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, message: errorMessage };
        }
    }, []);

    // Logout function
    const logout = useCallback(() => {
        localStorage.removeItem('authToken');
        // Xóa cookie
        document.cookie = 'authToken=; Max-Age=0; path=/;';
        setState({
            user: null,
            token: null,
            isLoading: false,
            error: null,
        });
    }, []);

    // Update profile function
    const updateProfile = useCallback(async (data: Partial<User>): Promise<{ success: boolean; message?: string }> => {
        try {
            setState(prev => ({ ...prev, isLoading: true, error: null }));

            const response = await userApi.updateProfile(data);

            if (response.result === 'SUCCESS' && response.data) {
                setState(prev => ({
                    ...prev,
                    user: response.data,
                    isLoading: false,
                }));
                return { success: true };
            } else {
                const errorMessage = response.message || 'Profile update failed';
                setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
                return { success: false, message: errorMessage };
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Network error';
            setState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
            return { success: false, message: errorMessage };
        }
    }, []);

    // Clear error function
    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    return {
        ...state,
        login,
        signup,
        logout,
        updateProfile,
        clearError,
    };
} 
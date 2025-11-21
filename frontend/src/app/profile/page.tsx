'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle, Edit, Save, X } from 'lucide-react';

// Avatar options
const AVATAR_OPTIONS = [
    '/avatars/avatar1.png',
    '/avatars/avatar2.png',
    '/avatars/avatar3.png',
    '/avatars/avatar4.png',
    '/avatars/avatar5.png',
    '/avatars/avatar6.png',
    '/avatars/avatar7.png',
    '/avatars/avatar8.png',
    '/avatars/avatar9.png',
    '/avatars/avatar10.png',
];

export default function ProfilePage() {
    const { user, updateProfile, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        avatarUrl: '',
    });
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    // Initialize form data when user loads
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
            }));
        }
    }, [user]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    // Validation rules
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // Username validation
        if (!formData.username) {
            newErrors.username = 'Username is required';
        } else if (formData.username.length < 3) {
            newErrors.username = 'Username must be at least 3 characters';
        } else if (formData.username.length > 50) {
            newErrors.username = 'Username must be less than 50 characters';
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            newErrors.username = 'Username can only contain letters, numbers, and underscores';
        }

        // Email validation
        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        // Password validation (only if changing password)
        if (formData.newPassword) {
            if (!formData.currentPassword) {
                newErrors.currentPassword = 'Current password is required to change password';
            }
            if (formData.newPassword.length < 6) {
                newErrors.newPassword = 'New password must be at least 6 characters';
            }
            if (formData.newPassword !== formData.confirmPassword) {
                newErrors.confirmPassword = 'Passwords do not match';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setSuccessMessage('');

        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const updateData: any = {
                username: formData.username,
                avatarUrl: formData.avatarUrl,
            };

            // Only include password if user is changing it
            if (formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            const result = await updateProfile(updateData);

            if (result.success) {
                setSuccessMessage('Profile updated successfully!');
                setIsEditing(false);
                // Clear password fields
                setFormData(prev => ({
                    ...prev,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                }));
            } else {
                setErrors({ general: result.message || 'Update failed' });
            }
        } catch {
            setErrors({ general: 'An unexpected error occurred' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    // Handle avatar selection
    const handleAvatarSelect = (avatarUrl: string) => {
        setFormData(prev => ({ ...prev, avatarUrl }));
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setErrors({});
        setSuccessMessage('');
        // Reset form data to current user data
        if (user) {
            setFormData(prev => ({
                ...prev,
                username: user.username,
                email: user.email,
                avatarUrl: user.avatarUrl,
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect to login
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.8)] transition-all duration-300">
                    Profile Settings
                </h1>
                <p className="text-muted-foreground mt-2">
                    Manage your account information and preferences
                </p>
            </div>

            {/* Profile Card */}
            <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">Profile Information</CardTitle>
                            <CardDescription>
                                Update your account details and avatar
                            </CardDescription>
                        </div>
                        {!isEditing && (
                            <Button
                                onClick={() => setIsEditing(true)}
                                variant="outline"
                                className="flex items-center gap-2"
                            >
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Avatar Section */}
                        <div className="space-y-4">
                            <label className="text-sm font-medium">Profile Picture</label>
                            <div className="flex items-center gap-4">
                                <Avatar className="h-20 w-20">
                                    <AvatarImage src={formData.avatarUrl} alt={user.username} />
                                    <AvatarFallback className="text-lg">
                                        {user.username.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <div className="flex-1">
                                        <div className="grid grid-cols-5 gap-2">
                                            {AVATAR_OPTIONS.map((avatar, index) => (
                                                <button
                                                    key={avatar}
                                                    type="button"
                                                    onClick={() => handleAvatarSelect(avatar)}
                                                    className={`relative w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${formData.avatarUrl === avatar
                                                        ? 'border-primary ring-2 ring-primary/20'
                                                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                                        }`}
                                                    disabled={isSubmitting}
                                                >
                                                    <Image
                                                        src={avatar}
                                                        alt={`Avatar ${index + 1}`}
                                                        width={48}
                                                        height={48}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    {formData.avatarUrl === avatar && (
                                                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                            <CheckCircle className="h-4 w-4 text-primary" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Username Field */}
                        <div className="space-y-2">
                            <label htmlFor="username" className="text-sm font-medium">
                                Username
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder="Enter your username"
                                    value={formData.username}
                                    onChange={(e) => handleInputChange('username', e.target.value)}
                                    className={`pl-10 ${errors.username ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                            {errors.username && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.username}
                                </div>
                            )}
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className={`pl-10 ${errors.email ? 'border-red-500 focus:border-red-500' : ''}`}
                                    disabled={!isEditing || isSubmitting}
                                />
                            </div>
                            {errors.email && (
                                <div className="flex items-center gap-2 text-sm text-red-500">
                                    <AlertCircle className="h-4 w-4" />
                                    {errors.email}
                                </div>
                            )}
                        </div>

                        {/* Password Change Section */}
                        {isEditing && (
                            <div className="space-y-4 border-t pt-6">
                                <h3 className="text-lg font-medium">Change Password</h3>
                                <p className="text-sm text-muted-foreground">
                                    Leave blank if you don&apos;t want to change your password
                                </p>

                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label htmlFor="currentPassword" className="text-sm font-medium">
                                        Current Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            placeholder="Enter current password"
                                            value={formData.currentPassword}
                                            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                                            className={`pl-10 pr-10 ${errors.currentPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            disabled={isSubmitting}
                                        >
                                            {showCurrentPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.currentPassword && (
                                        <div className="flex items-center gap-2 text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.currentPassword}
                                        </div>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label htmlFor="newPassword" className="text-sm font-medium">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? 'text' : 'password'}
                                            placeholder="Enter new password"
                                            value={formData.newPassword}
                                            onChange={(e) => handleInputChange('newPassword', e.target.value)}
                                            className={`pl-10 pr-10 ${errors.newPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            disabled={isSubmitting}
                                        >
                                            {showNewPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.newPassword && (
                                        <div className="flex items-center gap-2 text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.newPassword}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm New Password */}
                                <div className="space-y-2">
                                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                                        Confirm New Password
                                    </label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                        <Input
                                            id="confirmPassword"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Confirm new password"
                                            value={formData.confirmPassword}
                                            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                            className={`pl-10 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500' : ''}`}
                                            disabled={isSubmitting}
                                        />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            disabled={isSubmitting}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                    {errors.confirmPassword && (
                                        <div className="flex items-center gap-2 text-sm text-red-500">
                                            <AlertCircle className="h-4 w-4" />
                                            {errors.confirmPassword}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Success Message */}
                        {successMessage && (
                            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-green-600 dark:text-green-400">
                                    {successMessage}
                                </span>
                            </div>
                        )}

                        {/* General Error */}
                        {errors.general && (
                            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-red-500" />
                                <span className="text-sm text-red-600 dark:text-red-400">
                                    {errors.general}
                                </span>
                            </div>
                        )}

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    className="flex-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 hover:from-pink-600 hover:via-purple-600 hover:to-blue-600 text-white"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Saving...
                                        </div>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Save Changes
                                        </>
                                    )}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                            </div>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
} 
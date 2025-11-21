'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Key, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function CreateRoomPage() {
    const [form, setForm] = useState({
        name: '',
        password: '',
        maxMembers: 5,
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const router = useRouter();
    const { token, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/');
        }
    }, [token, isLoading, router]);

    const validate = () => {
        const errs: { [key: string]: string } = {};
        if (!form.name || form.name.length < 3) errs.name = 'Room name must be at least 3 characters';
        if (form.password && form.password.length !== 6) errs.password = 'Password must be 6 characters';
        if (form.maxMembers < 1 || form.maxMembers > 10) errs.maxMembers = 'Members must be 1-10';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (field: string, value: string | number) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const res = await roomApi.createRoom({
                name: form.name,
                password: form.password || undefined,
                maxMembers: form.maxMembers,
            });
            if (res.result === 'SUCCESS' && res.data) {
                setSuccess('Room created! Redirecting...');
                setTimeout(() => {
                    if (res.data) router.push(`/chat/${res.data.id}`);
                }, 1200);
            } else {
                setErrors({ general: res.message || 'Create room failed' });
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (err) {
            setErrors({ general: 'Network error' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
            <div className="w-full max-w-md">
                <Card className="border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.8)] transition-all duration-300">
                            Create a Room
                        </CardTitle>
                        <CardDescription>Set up a new chat room</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium">Room Name</label>
                                <Input id="name" value={form.name} onChange={e => handleChange('name', e.target.value)} disabled={isSubmitting} />
                                {errors.name && <div className="flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" />{errors.name}</div>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium flex items-center gap-1"><Key className="h-4 w-4" />Password (optional, 6 chars)</label>
                                <Input id="password" value={form.password} onChange={e => handleChange('password', e.target.value)} maxLength={6} disabled={isSubmitting} />
                                {errors.password && <div className="flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" />{errors.password}</div>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="maxMembers" className="text-sm font-medium flex items-center gap-1"><Users className="h-4 w-4" />Max Members (1-10)</label>
                                <Input id="maxMembers" type="number" min={1} max={10} value={form.maxMembers} onChange={e => handleChange('maxMembers', Number(e.target.value))} disabled={isSubmitting} />
                                {errors.maxMembers && <div className="flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" />{errors.maxMembers}</div>}
                            </div>
                            {errors.general && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-600 dark:text-red-400">{errors.general}</span></div>}
                            {success && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"><Badge variant="secondary">{success}</Badge></div>}
                            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white" disabled={isSubmitting}>{isSubmitting ? 'Creating...' : 'Create Room'}</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
} 
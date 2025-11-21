'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Key, Hash } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function JoinRoomPage() {
    const [form, setForm] = useState({
        code: '',
        password: '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState('');
    const [shake, setShake] = useState(false);
    const router = useRouter();
    const { token, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/');
        }
    }, [token, isLoading, router]);

    const validate = () => {
        const errs: { [key: string]: string } = {};
        if (!form.code || form.code.length !== 6) errs.code = 'Room code must be 6 characters';
        if (form.password && form.password.length !== 6) errs.password = 'Password must be 6 characters';
        setErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setForm(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess('');
        if (!validate()) return;
        setIsSubmitting(true);
        try {
            const res = await roomApi.joinRoom({
                code: form.code,
                password: form.password || undefined,
            });
            if (res.result === 'SUCCESS' && res.data) {
                setSuccess('Joined room! Redirecting...');
                setTimeout(() => {
                    if (res.data) router.push(`/chat/${res.data.id}`);
                }, 1200);
            } else {
                setErrors({ general: res.message || 'Join room failed' });
                setShake(true);
                setTimeout(() => setShake(false), 600);
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (err) {
            setErrors({ general: 'Network error' });
            setShake(true);
            setTimeout(() => setShake(false), 600);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-blue-900 p-4">
            <div className="w-full max-w-md">
                <Card className={`border-0 shadow-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm ${shake ? 'animate-shake border-red-500' : ''}`}>
                    <CardHeader>
                        <CardTitle className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.8)] transition-all duration-300">
                            Join a Room
                        </CardTitle>
                        <CardDescription>Enter the room code and password (if required)</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="code" className="text-sm font-medium flex items-center gap-1"><Hash className="h-4 w-4" />Room Code</label>
                                <Input id="code" value={form.code} onChange={e => handleChange('code', e.target.value.toUpperCase())} maxLength={6} disabled={isSubmitting} className={errors.code ? 'border-red-500' : ''} />
                                {errors.code && <div className="flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" />{errors.code}</div>}
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-medium flex items-center gap-1"><Key className="h-4 w-4" />Password (if required)</label>
                                <Input id="password" value={form.password} onChange={e => handleChange('password', e.target.value)} maxLength={6} disabled={isSubmitting} className={errors.password ? 'border-red-500' : ''} />
                                {errors.password && <div className="flex items-center gap-2 text-sm text-red-500"><AlertCircle className="h-4 w-4" />{errors.password}</div>}
                            </div>
                            {errors.general && <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"><AlertCircle className="h-4 w-4 text-red-500" /><span className="text-sm text-red-600 dark:text-red-400">{errors.general}</span></div>}
                            {success && <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"><Badge variant="secondary">{success}</Badge></div>}
                            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white" disabled={isSubmitting}>{isSubmitting ? 'Joining...' : 'Join Room'}</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
            <style jsx global>{`
        @keyframes shake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.6s;
        }
      `}</style>
        </div>
    );
} 
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi, Room } from '@/lib/api';
import { Button } from '@/components/ui/button';

import { RoomCard } from '@/components/RoomCard';
import { ArrowLeft, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function UserRoomsPage() {
    const [personalRooms, setPersonalRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();
    const [filter, setFilter] = useState<'all' | 'private' | 'public'>('all');
    const [page, setPage] = useState(0);
    const [size] = useState(16);
    const [total, setTotal] = useState(0);
    const { token, isLoading } = useAuth();

    const fetchPersonalRooms = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await roomApi.getUserRooms(page, size);
            if (res.result === 'SUCCESS' && res.data) {
                setPersonalRooms(res.data.rooms);
                setTotal(res.data.totalElements);
            } else {
                setError(res.message || 'Failed to fetch your rooms');
            }
        }
        catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (!token) return;
        fetchPersonalRooms();
    }, [token, fetchPersonalRooms]);

    const handleRoomClick = (room: Room) => {
        router.push(`/chat/${room.id}`);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl xl:max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/rooms">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.8)] transition-all duration-300">
                        Your Rooms
                    </h1>
                    <p className="text-muted-foreground">Rooms you&apos;ve created or joined</p>
                </div>
            </div>
            {/* Filter Buttons */}
            <div className="flex gap-2 mb-6">
                <Button
                    variant={filter === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilter('all')}
                >
                    All
                </Button>
                <Button
                    variant={filter === 'private' ? 'default' : 'outline'}
                    onClick={() => setFilter('private')}
                >
                    Private
                </Button>
                <Button
                    variant={filter === 'public' ? 'default' : 'outline'}
                    onClick={() => setFilter('public')}
                >
                    Public
                </Button>
            </div>
            {/* Content */}
            {loading ? (
                <div className="text-center py-8">
                    <div className="text-muted-foreground">Loading your rooms...</div>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{error}</div>
                    <Button onClick={fetchPersonalRooms}>Try Again</Button>
                </div>
            ) : personalRooms.length === 0 ? (
                <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
                    <p className="text-muted-foreground mb-4">
                        You haven&apos;t created or joined any rooms yet.
                    </p>
                    <div className="flex gap-2 justify-center">
                        <Link href="/rooms/create">
                            <Button>Create Room</Button>
                        </Link>
                        <Link href="/rooms/join">
                            <Button variant="outline">Join Room</Button>
                        </Link>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {personalRooms
                            .filter(room =>
                                filter === 'all'
                                    ? true
                                    : filter === 'private'
                                        ? room.hasPassword
                                        : !room.hasPassword
                            )
                            .map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    isJoined
                                    onClick={handleRoomClick}
                                />
                            ))}
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                        <span className="text-sm">Page {page + 1} / {Math.max(1, Math.ceil(total / size))}</span>
                        <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * size >= total}><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </>
            )}
        </div>
    );
} 
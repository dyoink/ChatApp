'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { roomApi, Room } from '@/lib/api';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RoomCard } from '@/components/RoomCard';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function RoomsPage() {
    const [query, setQuery] = useState('');
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'private' | 'public'>('all');

    // TODO: Replace with real user joined/created rooms from API
    const [userRoomIds, setUserRoomIds] = useState<number[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'password' | 'confirm' | null>(null);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [password, setPassword] = useState('');
    const [modalError, setModalError] = useState('');
    const [joining, setJoining] = useState(false);

    const router = useRouter();
    const { token, isLoading } = useAuth();

    const fetchRooms = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await roomApi.searchRooms(query, page, size);
            if (res.result === 'SUCCESS' && res.data) {
                setRooms(res.data.rooms);
                setTotal(res.data.totalElements);
            } else {
                setError(res.message || 'Failed to fetch rooms');
            }
        }
        catch {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    }, [query, page, size]);

    const fetchUserRoomIds = useCallback(async () => {
        try {
            const res = await roomApi.getUserRoomIds();
            if (res.result === 'SUCCESS' && Array.isArray(res.data)) {
                setUserRoomIds(res.data);
            }
        }
        catch (err) {
            console.error('Failed to fetch user room ids:', err);
        }
    }, []);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace('/');
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (!token) return;
        fetchRooms();
        fetchUserRoomIds();
    }, [token, fetchRooms, fetchUserRoomIds]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        fetchRooms();
    };

    const handleRoomClick = (room: Room) => {
        const isJoined = userRoomIds.includes(room.id);
        setSelectedRoom(room);
        setModalError('');
        setPassword('');
        if (!isJoined) {
            if (room.hasPassword) {
                setModalType('password');
                setShowModal(true);
            } else {
                setModalType('confirm');
                setShowModal(true);
            }
        } else {
            router.push(`/chat/${room.id}`);
        }
    };

    const handleJoinRoom = async () => {
        if (!selectedRoom) return;
        setJoining(true);
        setModalError('');
        try {
            const res = await roomApi.joinRoom({
                code: selectedRoom.code,
                password: selectedRoom.hasPassword ? password : undefined,
            });
            if (res.result === 'SUCCESS' && res.data) {
                setShowModal(false);
                // Refresh personal rooms after joining
                await fetchUserRoomIds();
                router.push(`/chat/${selectedRoom.id}`);
            } else {
                setModalError(res.message || 'Failed to join room');
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (err) {
            setModalError('Network error');
        } finally {
            setJoining(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl xl:max-w-7xl">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-6 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)] hover:drop-shadow-[0_0_16px_rgba(139,92,246,0.8)] transition-all duration-300">Rooms</h1>
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                <Input
                    placeholder="Search rooms..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    className="max-w-xs"
                />
                <Button type="submit" variant="outline"><Search className="h-4 w-4" /></Button>
            </form>
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
            {/* Public Rooms */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Public Rooms</h2>
                {loading ? (
                    <div className="text-muted-foreground">Loading...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>
                ) : rooms.length === 0 ? (
                    <div className="text-muted-foreground">No rooms found.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {rooms
                            .filter(room =>
                                filter === 'all'
                                    ? true
                                    : filter === 'private'
                                        ? room.hasPassword
                                        : !room.hasPassword
                            )
                            .map(room => (
                                <RoomCard key={room.id} room={room} onClick={handleRoomClick} />
                            ))}
                    </div>
                )}
                {/* Pagination */}
                <div className="flex items-center justify-center gap-2 mt-6">
                    <Button variant="outline" size="icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm">Page {page + 1} / {Math.max(1, Math.ceil(total / size))}</span>
                    <Button variant="outline" size="icon" onClick={() => setPage(p => p + 1)} disabled={(page + 1) * size >= total}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {modalType === 'password'
                                ? 'Enter Room Password'
                                : 'Join Room'}
                        </DialogTitle>
                        <DialogDescription>
                            {modalType === 'password'
                                ? `This room requires a password. Please enter it to join.`
                                : `Do you want to join this room?`}
                        </DialogDescription>
                    </DialogHeader>
                    {modalType === 'password' && (
                        <Input
                            type="password"
                            placeholder="Room password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            disabled={joining}
                        />
                    )}
                    {modalError && (
                        <div className="text-red-500 text-sm mt-2">{modalError}</div>
                    )}
                    <DialogFooter>
                        <Button onClick={handleJoinRoom} disabled={joining || (modalType === 'password' && !password)}>
                            {joining ? 'Joining...' : 'Join Room'}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
} 
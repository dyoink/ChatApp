"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { roomApi, Room } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { RoomCard } from "@/components/RoomCard";
import { ArrowLeft, Users, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { memberApi, RoomMember } from "@/lib/api";

export default function OwnRoomsPage() {
    const [ownRooms, setOwnRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [size] = useState(16);
    const [total, setTotal] = useState(0);
    const { token, isLoading } = useAuth();
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [members, setMembers] = useState<RoomMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);
    const [membersError, setMembersError] = useState("");
    const [kicking, setKicking] = useState<number | null>(null);

    const fetchOwnRooms = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await roomApi.getOwnRooms(page, size);
            if (res.result === "SUCCESS" && res.data) {
                setOwnRooms(res.data.rooms);
                setTotal(res.data.totalElements);
            } else {
                setError(res.message || "Failed to fetch your own rooms");
            }
        } catch {
            setError("Network error");
        } finally {
            setLoading(false);
        }
    }, [page, size]);

    useEffect(() => {
        if (!isLoading && !token) {
            router.replace("/");
        }
    }, [token, isLoading, router]);

    useEffect(() => {
        if (!token) return;
        fetchOwnRooms();
    }, [fetchOwnRooms, token]);

    const handleRoomClick = (room: Room) => {
        router.push(`/chat/${room.id}`);
    };

    const handleDeleteClick = (room: Room) => {
        setSelectedRoom(room);
        setDeleteError("");
        setShowDeleteModal(true);
    };

    const handleDeleteRoom = async () => {
        if (!selectedRoom) return;
        setDeleting(true);
        setDeleteError("");
        try {
            const res = await roomApi.deleteRoom(selectedRoom.id);
            if (res.result === "SUCCESS") {
                setShowDeleteModal(false);
                setSelectedRoom(null);
                fetchOwnRooms();
            } else {
                setDeleteError(res.message || "Failed to delete room");
            }
        } catch {
            setDeleteError("Network error");
        } finally {
            setDeleting(false);
        }
    };

    const handleManageMembersClick = async (room: Room) => {
        setSelectedRoom(room);
        setShowMembersModal(true);
        setMembers([]);
        setMembersError("");
        setMembersLoading(true);
        try {
            const res = await memberApi.getRoomMembers(room.id);
            if (res.result === "SUCCESS" && Array.isArray(res.data)) {
                setMembers(res.data);
            } else {
                setMembersError(res.message || "Failed to fetch members");
            }
        } catch {
            setMembersError("Network error");
        } finally {
            setMembersLoading(false);
        }
    };

    const handleKickMember = async (userId: number) => {
        if (!selectedRoom) return;
        setKicking(userId);
        try {
            const res = await roomApi.kickMember(selectedRoom.id, userId);
            if (res.result === "SUCCESS") {
                setMembers(members.filter(m => m.userId !== userId));
            } else {
                setMembersError(res.message || "Failed to kick member");
            }
        } catch {
            setMembersError("Network error");
        } finally {
            setKicking(null);
        }
    };

    return (
        <>
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
                            Your Own Rooms
                        </h1>
                        <p className="text-muted-foreground">Rooms you have created (as owner)</p>
                    </div>
                </div>
                {/* Content */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="text-muted-foreground">Loading your own rooms...</div>
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <div className="text-red-500 mb-4">{error}</div>
                        <Button onClick={fetchOwnRooms}>Try Again</Button>
                    </div>
                ) : ownRooms.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
                        <p className="text-muted-foreground mb-4">
                            You haven&apos;t created any rooms yet.
                        </p>
                        <div className="flex gap-2 justify-center">
                            <Link href="/rooms/create">
                                <Button>Create Room</Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                            {ownRooms.map((room) => (
                                <div key={room.id} className="relative group">
                                    <RoomCard
                                        room={room}
                                        isJoined
                                        onClick={handleRoomClick}
                                    />
                                    <button
                                        className="absolute top-3 right-3 z-10 p-1 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-600 dark:text-red-300 shadow transition-opacity opacity-0 group-hover:opacity-100"
                                        title="Delete room"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleDeleteClick(room);
                                        }}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        className="absolute top-3 left-3 z-10 p-1 rounded-full bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-300 shadow transition-opacity opacity-0 group-hover:opacity-100"
                                        title="Manage members"
                                        onClick={e => {
                                            e.stopPropagation();
                                            handleManageMembersClick(room);
                                        }}
                                    >
                                        <Users className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        {/* Pagination */}
                        <div className="flex items-center justify-center gap-2 mt-2">
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={page === 0}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <span className="text-sm">
                                Page {page + 1} / {Math.max(1, Math.ceil(total / size))}
                            </span>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setPage((p) => p + 1)}
                                disabled={(page + 1) * size >= total}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
            {/* Delete Room Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Room</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete the room <b>{selectedRoom?.name}</b>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    {deleteError && <div className="text-red-500 text-sm mb-2">{deleteError}</div>}
                    <DialogFooter>
                        <Button
                            variant="destructive"
                            onClick={handleDeleteRoom}
                            disabled={deleting}
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                        <DialogClose asChild>
                            <Button variant="outline" type="button" disabled={deleting}>Cancel</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Members Modal */}
            <Dialog open={showMembersModal} onOpenChange={setShowMembersModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Members</DialogTitle>
                        <DialogDescription>
                            Room: <b>{selectedRoom?.name}</b>
                        </DialogDescription>
                    </DialogHeader>
                    {membersLoading ? (
                        <div className="text-muted-foreground">Loading members...</div>
                    ) : membersError ? (
                        <div className="text-red-500 text-sm mb-2">{membersError}</div>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto">
                            {members.map(member => (
                                <div key={member.userId} className="flex items-center gap-3 p-2 rounded hover:bg-accent">
                                    <Avatar>
                                        <AvatarImage src={member.avatarUrl} alt={member.username} />
                                        <AvatarFallback>{member.username[0]}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium flex-1">{member.username} {member.role === 'creator' && <span className="text-xs text-pink-500">(Owner)</span>}</span>
                                    {member.role !== 'creator' && (
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            disabled={kicking === member.userId}
                                            onClick={() => handleKickMember(member.userId)}
                                        >
                                            {kicking === member.userId ? 'Kicking...' : 'Kick'}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" type="button">Close</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
} 
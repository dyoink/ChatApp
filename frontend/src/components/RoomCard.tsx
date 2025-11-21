import { Room } from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Key, Copy } from 'lucide-react';
import { useState } from 'react';

interface RoomCardProps {
    room: Room;
    onClick?: (room: Room) => void;
    isJoined?: boolean;
}

export function RoomCard({ room, onClick, isJoined }: RoomCardProps) {
    const [copied, setCopied] = useState(false);

    const handleCopyCode = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Ngăn không cho trigger onClick của card
        try {
            await navigator.clipboard.writeText(room.code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset sau 2 giây
        } catch (err) {
            console.error('Failed to copy code:', err);
        }
    };

    return (
        <Card
            className={`transition-shadow hover:shadow-xl cursor-pointer border-2 ${isJoined ? 'border-blue-500' : 'border-transparent'} rounded-2xl bg-white/90 dark:bg-gray-900/80 shadow-md hover:-translate-y-1 duration-200 w-full min-w-[220px] max-w-full`}
            onClick={() => onClick?.(room)}
        >
            <CardContent className="p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="font-bold text-lg truncate">
                        {room.name}
                    </div>
                    <Badge
                        variant="secondary"
                        className="ml-2 cursor-pointer hover:bg-secondary/80 transition-colors flex items-center gap-1"
                        onClick={handleCopyCode}
                        title="Click to copy room code"
                    >
                        {room.code}
                        <Copy className="h-3 w-3" />
                    </Badge>
                </div>
                {copied && (
                    <div className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded">
                        Code copied to clipboard!
                    </div>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {room.memberCount}/{room.maxMembers}
                    </span>
                    <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {room.creatorUsername}
                    </span>
                    {room.hasPassword && (
                        <span className="flex items-center gap-1 text-pink-500">
                            <Key className="h-4 w-4" />
                            Private
                        </span>
                    )}
                    {room.memberCount >= room.maxMembers && (
                        <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                            <Badge variant="destructive" className="bg-yellow-400 text-yellow-900 dark:bg-yellow-600 dark:text-white">Full</Badge>
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 
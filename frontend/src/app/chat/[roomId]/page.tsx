// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { notFound } from 'next/navigation';
import { Chat } from '@/components/Chat';

export default function ChatPage({ params }) {
    const roomId = Number(params.roomId);
    if (!roomId || isNaN(roomId)) return notFound();
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <Chat roomId={roomId} isOwner={false} />
        </div>
    );
} 
'use client';

import { Client, IMessage, StompSubscription, Frame } from '@stomp/stompjs';

// WebSocket message interfaces
export interface ChatMessage {
    id: number;
    roomId: number;
    userId: number;
    username: string;
    avatarUrl: string;
    content: string;
    contentType: 'text' | 'image' | 'video';
    timestamp: string;
    seenBy: number[];
}

export interface RoomStatus {
    userId: number;
    username: string;
    avatarUrl: string;
    roomId: number;
    status: 'online' | 'offline';
}

export interface Notification {
    id: string;
    type: 'NEW_MESSAGE' | 'ROOM_INVITE' | 'SYSTEM';
    title: string;
    message: string;
    roomId?: string;
    timestamp: string;
}

export type WebSocketHook = {
    connect: () => Promise<void>;
    disconnect: () => void;
    subscribeToRoom: (roomId: string, callback: (message: ChatMessage) => void) => void;
    subscribeToRoomStatus: (roomId: string, callback: (status: RoomStatus) => void) => void;
    subscribeToNotifications: (userId: number, callback: (notification: Notification) => void) => void;
    sendMessage: (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'seenBy'>) => void;
    markMessageAsSeen: (roomId: string, messageId: number) => void;
    unsubscribe: (topicKey: string) => void;
    unsubscribeAll: () => void;
    isConnected: () => boolean;
};

// WebSocket service class using SockJS + StompJS
export class WebSocketService {
    private stompClient: Client | null = null;
    private connected: boolean = false;
    private subscriptions: Map<string, StompSubscription> = new Map();
    private jwt: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private reconnectTimeout: any = null;

    constructor(jwt: string) {
        // Lấy token mới nhất từ localStorage (hoặc nơi lưu trữ)
        const token = (typeof window !== 'undefined') ? localStorage.getItem('authToken') : jwt;
        // if (!token || token.length < 10) {
        //     console.error('[STOMP] JWT token missing or invalid:', token);
        // }
        this.jwt = token || '';
        // if (typeof window !== 'undefined') {
        //     console.log('[STOMP] Using WebSocket endpoint:', process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080/chat');
        //     console.log('[STOMP] Using JWT token:', this.jwt);
        // }
        this.connect();
    }

    connect() {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        return new Promise<void>((resolve, reject) => {
            // Lấy token mới nhất từ localStorage (hoặc nơi lưu trữ)
            const token = (typeof window !== 'undefined') ? localStorage.getItem('authToken') : this.jwt;
            // if (!token || token.length < 10) {
            //     console.error('[STOMP] JWT token missing or invalid:', token);
            // }
            // Truyền token qua query param để backend nhận được trong handshake
            const wsBaseUrl = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080/chat') + `?Authorization=Bearer%20${encodeURIComponent(token || '')}`;
            // if (typeof window !== 'undefined') {
            //     console.log('[STOMP] Connecting to:', wsBaseUrl);
            // }
            const client = new Client({
                brokerURL: wsBaseUrl,
                // Không cần connectHeaders cho handshake, chỉ dùng nếu backend xử lý STOMP frame
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                debug: (str) => {
                    // if (process.env.NODE_ENV === 'development') console.log('[STOMP]', str);
                },
                reconnectDelay: 5000,
                onConnect: () => {
                    this.connected = true;
                    // console.log('[STOMP] STOMP connected');
                    resolve();
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onStompError: (frame: Frame) => {
                    // console.error('[STOMP] Broker error:', frame.headers['message'], frame.body);
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onWebSocketClose: (evt) => {
                    // console.warn('[STOMP] WebSocket closed', evt);
                    this.connected = false;
                    if (!this.reconnectTimeout) {
                        this.reconnectTimeout = setTimeout(() => {
                            this.connect();
                            this.reconnectTimeout = null;
                        }, 5000);
                    }
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                onWebSocketError: (evt) => {
                    // console.error('[STOMP] WebSocket error', evt);
                },
            });
            this.stompClient = client;
            client.activate();
        });
    }

    disconnect(): void {
        if (this.stompClient && this.connected) {
            this.stompClient.deactivate();
            this.subscriptions.clear();
            this.connected = false;
            // console.log('WebSocket disconnected');
        }
    }

    subscribeToRoom(roomId: string, callback: (message: ChatMessage) => void): void {
        if (!this.stompClient || !this.connected) return;
        const sub = this.stompClient.subscribe(
            `/topic/rooms/${roomId}`,
            (message: IMessage) => {
                try {
                    const chatMessage: ChatMessage = JSON.parse(message.body);
                    callback(chatMessage);
                } catch {
                    // console.error('Error parsing chat message:');
                }
            }
        );
        this.subscriptions.set(`room-${roomId}`, sub);
    }

    subscribeToRoomStatus(roomId: string, callback: (status: RoomStatus) => void): void {
        if (!this.stompClient || !this.connected) return;
        const sub = this.stompClient.subscribe(
            `/topic/rooms/${roomId}/status`,
            (message: IMessage) => {
                try {
                    const status: RoomStatus = JSON.parse(message.body);
                    callback(status);
                } catch {
                    // console.error('Error parsing room status:');
                }
            }
        );
        this.subscriptions.set(`status-${roomId}`, sub);
    }

    subscribeToNotifications(userId: number, callback: (notification: Notification) => void): void {
        if (!this.stompClient || !this.connected) return;
        const sub = this.stompClient.subscribe(
            `/topic/users/${userId}/notifications`,
            (message: IMessage) => {
                try {
                    const notification: Notification = JSON.parse(message.body);
                    callback(notification);
                } catch {
                    // console.error('Error parsing notification:');
                }
            }
        );
        this.subscriptions.set(`notifications-${userId}`, sub);
    }

    sendMessage(roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'seenBy'>): void {
        if (!this.stompClient || !this.connected) return;
        this.stompClient.publish({
            destination: `/app/rooms/${roomId}/send`,
            body: JSON.stringify(message),
        });
    }

    markMessageAsSeen(roomId: string, messageId: number): void {
        if (!this.stompClient || !this.connected) return;
        this.stompClient.publish({
            destination: `/app/rooms/${roomId}/messages/${messageId}/seen`,
            body: JSON.stringify({ roomId, messageId }),
        });
    }

    unsubscribe(topicKey: string): void {
        const sub = this.subscriptions.get(topicKey);
        if (sub) {
            sub.unsubscribe();
            this.subscriptions.delete(topicKey);
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach((sub) => sub.unsubscribe());
        this.subscriptions.clear();
    }

    isConnected(): boolean {
        return this.connected;
    }
}

// Hook for using WebSocket service
export function createWebSocketClient(jwt: string): WebSocketHook {
    const wsService = new WebSocketService(jwt);
    return {
        connect: () => wsService.connect(),
        disconnect: () => wsService.disconnect(),
        subscribeToRoom: (roomId: string, callback: (message: ChatMessage) => void) =>
            wsService.subscribeToRoom(roomId, callback),
        subscribeToRoomStatus: (roomId: string, callback: (status: RoomStatus) => void) =>
            wsService.subscribeToRoomStatus(roomId, callback),
        subscribeToNotifications: (userId: number, callback: (notification: Notification) => void) =>
            wsService.subscribeToNotifications(userId, callback),
        sendMessage: (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp' | 'seenBy'>) =>
            wsService.sendMessage(roomId, message),
        markMessageAsSeen: (roomId: string, messageId: number) =>
            wsService.markMessageAsSeen(roomId, messageId),
        unsubscribe: (topicKey: string) => wsService.unsubscribe(topicKey),
        unsubscribeAll: () => wsService.unsubscribeAll(),
        isConnected: () => wsService.isConnected(),
    };
} 
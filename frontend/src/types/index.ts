// User types
export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
}

// Room types
export interface Room {
    id: string;
    name: string;
    code: string;
    ownerId: number;
    ownerUsername: string;
    memberCount: number;
    maxMembers: number;
    hasPassword: boolean;
    createdAt: string;
    unreadCount?: number;
}

export interface CreateRoomRequest {
    name: string;
    password?: string;
    memberLimit: number;
}

export interface JoinRoomRequest {
    code: string;
    password?: string;
}

// Message types
export interface ChatMessage {
    id: string;
    roomId: string;
    userId: number;
    username: string;
    content: string;
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO';
    fileUrl?: string;
    timestamp: string;
    seen: boolean;
}

// Notification types
export interface Notification {
    id: string;
    type: 'NEW_MESSAGE' | 'ROOM_INVITE' | 'SYSTEM';
    title: string;
    message: string;
    roomId?: string;
    timestamp: string;
}

// Room status types
export interface RoomStatus {
    roomId: string;
    userId: number;
    username: string;
    status: 'ONLINE' | 'OFFLINE';
}

// API Response types
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
    result: 'SUCCESS' | 'ERROR';
    message: string;
    data: T | null;
}

// Auth types
export interface LoginRequest {
    email: string;
    password: string;
}

export interface SignupRequest {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
}

export interface AuthResponse {
    token: string;
    type: string;
}

// File upload types
export interface FileUploadResponse {
    url: string;
    filename: string;
    size: number;
}

// Pagination types
export interface PaginationParams {
    page: number;
    size: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    size: number;
}

// Admin types
export interface AdminStats {
    totalUsers: number;
    totalRooms: number;
    activeRooms: number;
    totalMessages: number;
}

// Form validation types
export interface FormErrors {
    [key: string]: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Component props types
export interface BaseComponentProps {
    className?: string;
    children?: React.ReactNode;
}

export interface ButtonProps extends BaseComponentProps {
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    onClick?: () => void;
}

export interface InputProps extends BaseComponentProps {
    type?: 'text' | 'email' | 'password' | 'number';
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    error?: string;
    disabled?: boolean;
}

// Chat component types
export interface ChatProps {
    roomId: string;
    userId: number;
    isOwner: boolean;
}

export interface MessageProps {
    message: ChatMessage;
    isOwnMessage: boolean;
    onDelete?: (messageId: string) => void;
}

export interface MessageInputProps {
    onSend: (content: string, file?: File) => void;
    disabled?: boolean;
}

// Room list types
export interface RoomCardProps {
    room: Room;
    onClick: (roomId: string) => void;
}

export interface RoomListProps {
    rooms: Room[];
    onRoomClick: (roomId: string) => void;
    loading?: boolean;
}

// Notification types
export interface NotificationProps {
    notification: Notification;
    onClose: (id: string) => void;
}

export interface NotificationListProps {
    notifications: Notification[];
    onClose: (id: string) => void;
}

// Avatar types
export interface AvatarProps {
    src: string;
    alt: string;
    size?: 'sm' | 'md' | 'lg';
    fallback?: string;
}

// Modal/Dialog types
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

// Loading states
export interface LoadingState {
    isLoading: boolean;
    error?: string;
}

// Error types
export interface AppError {
    message: string;
    code?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    details?: any;
}

// WebSocket types
export interface WebSocketConfig {
    url: string;
    jwt: string;
    reconnectDelay?: number;
    heartbeatInterval?: number;
}

// File types
export interface FileInfo {
    name: string;
    size: number;
    type: string;
    url: string;
}

// Validation types
export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    custom?: (value: any) => boolean | string;
}

export interface ValidationSchema {
    [field: string]: ValidationRule;
} 
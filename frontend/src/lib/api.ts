import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// API Response interface
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
    result: 'SUCCESS' | 'ERROR';
    message: string;
    data: T | null;
}

// User interface
export interface User {
    id: number;
    username: string;
    email: string;
    avatarUrl: string;
}

// Auth interfaces
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

// Create axios instance
const api: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add JWT token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('authToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('authToken');
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Auth API functions
export const authApi = {
    // Login with email
    login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/api/auth/login', data);
        return response.data;
    },

    // Signup with username and email
    signup: async (data: SignupRequest): Promise<ApiResponse<User>> => {
        const response = await api.post<ApiResponse<User>>('/api/auth/signup', data);
        return response.data;
    },
};

// User API functions
export const userApi = {
    // Get user profile
    getProfile: async (): Promise<ApiResponse<User>> => {
        const response = await api.get<ApiResponse<User>>('/api/users/profile');
        return response.data;
    },

    // Update user profile
    updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
        const response = await api.put<ApiResponse<User>>('/api/users/profile', data);
        return response.data;
    },
};

// Room API functions
export interface CreateRoomRequest {
    name: string;
    password?: string;
    maxMembers: number;
}

export interface JoinRoomRequest {
    code: string;
    password?: string;
}

export interface Room {
    id: number;
    name: string;
    code: string;
    maxMembers: number;
    creatorUsername: string;
    memberCount: number;
    hasPassword: boolean;
}

export interface RoomSearchResponse {
    rooms: Room[];
    page: number;
    size: number;
    totalElements: number;
}

export interface UserRoomsResponse {
    rooms: Room[];
    page: number;
    size: number;
    totalElements: number;
}

export const roomApi = {
    // Create room
    createRoom: async (data: CreateRoomRequest): Promise<ApiResponse<Room>> => {
        const response = await api.post<ApiResponse<Room>>('/api/rooms/create', data);
        return response.data;
    },
    // Join room
    joinRoom: async (data: JoinRoomRequest): Promise<ApiResponse<Room>> => {
        const response = await api.post<ApiResponse<Room>>('/api/rooms/join', data);
        return response.data;
    },
    // Search rooms
    searchRooms: async (query: string, page = 0, size = 10): Promise<ApiResponse<RoomSearchResponse>> => {
        const response = await api.get<ApiResponse<RoomSearchResponse>>('/api/rooms/search', {
            params: { query, page, size },
        });
        return response.data;
    },
    // Get user's joined rooms
    getUserRooms: async (page = 0, size = 16): Promise<ApiResponse<UserRoomsResponse>> => {
        const response = await api.get<ApiResponse<UserRoomsResponse>>('/api/rooms/user', {
            params: { page, size },
        });
        return response.data;
    },
    // Delete room
    deleteRoom: async (roomId: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/api/rooms/delete?roomId=${roomId}`);
        return response.data;
    },
    // Kick member
    kickMember: async (roomId: number, userId: number): Promise<ApiResponse<null>> => {
        const response = await api.post<ApiResponse<null>>(`/api/rooms/kick?roomId=${roomId}&userId=${userId}`);
        return response.data;
    },
    getUserRoomIds: async (): Promise<ApiResponse<number[]>> => {
        const response = await api.get<ApiResponse<number[]>>('/api/rooms/user/ids');
        return response.data;
    },
    // Get user's own rooms (where user is creator)
    getOwnRooms: async (page = 0, size = 16): Promise<ApiResponse<UserRoomsResponse>> => {
        const response = await api.get<ApiResponse<UserRoomsResponse>>('/api/rooms/own', {
            params: { page, size },
        });
        return response.data;
    },
    // Get room by id
    getRoomById: async (roomId: number): Promise<ApiResponse<Room>> => {
        const response = await api.get<ApiResponse<Room>>(`/api/rooms/${roomId}`);
        return response.data;
    },
};

// File upload API (placeholder)
export const uploadApi = {
    uploadFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await api.post<ApiResponse<{ url: string }>>('/api/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
};

// Chat message types
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

export interface ChatHistoryResponse {
    messages: ChatMessage[];
    page: number;
    size: number;
    totalElements: number;
}

export const chatApi = {
    // Lấy lịch sử tin nhắn
    getMessages: async (roomId: number, page = 0, size = 30): Promise<ApiResponse<ChatHistoryResponse>> => {
        const response = await api.get<ApiResponse<ChatHistoryResponse>>(`/api/rooms/${roomId}/messages`, {
            params: { page, size },
        });
        return response.data;
    },
    // Xóa tin nhắn
    deleteMessage: async (roomId: number, messageId: number): Promise<ApiResponse<null>> => {
        const response = await api.delete<ApiResponse<null>>(`/api/rooms/${roomId}/messages/${messageId}/delete`);
        return response.data;
    },
    // Upload file
    uploadFile: async (file: File): Promise<ApiResponse<{ url: string }>> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<ApiResponse<{ url: string }>>('/api/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};

// Room member API
export interface RoomMember {
    userId: number;
    username: string;
    avatarUrl: string;
    role: 'creator' | 'admin' | 'member';
    online: boolean;
}

export const memberApi = {
    getRoomMembers: async (roomId: number): Promise<ApiResponse<RoomMember[]>> => {
        const response = await api.get<ApiResponse<RoomMember[]>>(`/api/rooms/${roomId}/members`);
        return response.data;
    },
};

export default api; 
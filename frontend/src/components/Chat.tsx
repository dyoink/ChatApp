"use client";

import { useEffect, useRef, useState } from "react";
import { chatApi, ChatMessage } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { createWebSocketClient, WebSocketHook } from "@/lib/stomp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Card } from "@/components/ui/card";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Paperclip, Send, Trash2, Image as ImageIcon, Video as VideoIcon, Eye, Loader2, Copy } from "lucide-react";
import Image from "next/image";
import { roomApi } from "@/lib/api";

interface ChatProps {
    roomId: number;
    isOwner: boolean;
}

export function Chat({ roomId, isOwner }: ChatProps) {
    const { user } = useAuth();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [uploading, setUploading] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const [ws, setWs] = useState<WebSocketHook | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [token, setToken] = useState<string>(""); // Nếu không dùng, xóa dòng này
    const [roomInfo, setRoomInfo] = useState<{ name: string; code: string } | null>(null);
    const [copying, setCopying] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const t = localStorage.getItem("authToken") || "";
            setToken(t);
            setWs(createWebSocketClient(t));
        }
    }, []);

    // Lấy thông tin phòng khi vào chat
    useEffect(() => {
        roomApi.getRoomById(roomId).then(res => {
            if (res.result === "SUCCESS" && res.data) {
                setRoomInfo({ name: res.data.name, code: res.data.code });
            }
        });
    }, [roomId]);

    const handleCopyCode = async () => {
        if (!roomInfo) return;
        await navigator.clipboard.writeText(roomInfo.code);
        setCopying(true);
        setTimeout(() => setCopying(false), 1500);
    };

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    // Fetch initial messages
    useEffect(() => {
        setLoading(true);
        chatApi.getMessages(roomId, 0, 30)
            .then(res => {
                if (res.result === "SUCCESS" && res.data) {
                    setMessages(res.data.messages.reverse());
                    setHasMore(res.data.messages.length === 30);
                    setPage(0);
                } else {
                    setError(res.message || "Failed to load messages");
                }
            })
            .catch(() => setError("Network error"))
            .finally(() => setLoading(false));
    }, [roomId]);

    const isWsConnected = ws && typeof ws.isConnected === 'function' && ws.isConnected();

    // WebSocket: subscribe to new messages
    useEffect(() => {
        if (!ws || typeof ws.isConnected !== 'function' || typeof ws.subscribeToRoom !== 'function') return;
        if (!ws.isConnected()) return;
        ws.subscribeToRoom(roomId.toString(), (msg: ChatMessage) => {
            setMessages(prev => {
                // Nếu đã có optimistic message (id là Date.now()), thay thế bằng message thật
                const optimisticIdx = prev.findIndex(m =>
                    m.id.toString().length === 13 && // id tạm thời là Date.now()
                    m.userId === msg.userId &&
                    m.content === msg.content &&
                    m.contentType === msg.contentType
                );
                if (optimisticIdx !== -1) {
                    const updated = [...prev];
                    updated[optimisticIdx] = msg;
                    return updated;
                }
                // Nếu đã có message id thật, cập nhật lại
                const idx = prev.findIndex(m => m.id === msg.id);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = msg;
                    return updated;
                }
                // Nếu chưa có, thêm mới
                return [...prev, msg];
            });
        });
        return () => {
            if (ws && typeof ws.unsubscribe === 'function') ws.unsubscribe(`room-${roomId}`);
        };
    }, [ws, roomId, isWsConnected]);

    // Scroll to bottom khi có tin nhắn mới
    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages.length]);

    // Gửi tin nhắn
    const handleSend = async () => {
        if (!input.trim()) return;
        setSending(true);
        const content = input.trim();
        const contentType = "text" as const;
        if (ws && typeof ws.sendMessage === 'function') {
            ws.sendMessage(
                String(roomId),
                {
                    roomId: Number(roomId),
                    content,
                    contentType,
                    userId: user?.id ?? 0,
                    username: user?.username ?? '',
                    avatarUrl: user?.avatarUrl ?? ''
                }
            );
            // Optimistic UI: push message tạm thời
            const optimisticMsg = {
                id: Date.now(),
                roomId: Number(roomId),
                userId: user?.id ?? 0,
                username: user?.username ?? '',
                avatarUrl: user?.avatarUrl ?? '',
                content,
                contentType,
                timestamp: new Date().toISOString(),
                seenBy: [user?.id ?? 0]
            };
            setMessages(prev => [...prev, optimisticMsg]);
        }
        setInput("");
        setSending(false);
    };

    // Load more messages (pagination)
    const loadMore = async () => {
        setLoading(true);
        const nextPage = page + 1;
        const res = await chatApi.getMessages(roomId, nextPage, 30);
        if (res.result === "SUCCESS" && res.data) {
            const newMessages = res.data.messages;
            setMessages(prev => [...newMessages.reverse(), ...prev]);
            setHasMore(newMessages.length === 30);
            setPage(nextPage);
        }
        setLoading(false);
    };

    // Xóa tin nhắn (owner)
    const handleDelete = async (msg: ChatMessage) => {
        if (!isOwner) return;
        await chatApi.deleteMessage(roomId, msg.id);
        setMessages(prev => prev.filter(m => m.id !== msg.id));
    };

    // Đánh dấu đã đọc khi message hiển thị
    useEffect(() => {
        if (!ws || typeof ws.markMessageAsSeen !== 'function' || !user) return;
        messages.forEach(msg => {
            if (!msg.seenBy.includes(user.id)) {
                ws.markMessageAsSeen(String(roomId), msg.id);
            }
        });
    }, [messages, ws, user, roomId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFile(selectedFile);
        if (selectedFile && !sending && !uploading) {
            setInput(""); // clear text input nếu có
            // Gửi luôn file
            await handleSendFile(selectedFile);
        }
    };

    // Hàm riêng để gửi file (tách khỏi handleSend để tái sử dụng)
    const handleSendFile = async (selectedFile: File) => {
        setSending(true);
        let contentType: "image" | "video" = "image";
        const ext = selectedFile.name.split(".").pop()?.toLowerCase();
        if (["jpg", "jpeg", "png"].includes(ext || "")) contentType = "image";
        else if (["mp4"].includes(ext || "")) contentType = "video";
        else {
            setError("Only .jpg, .png, .mp4 allowed");
            setSending(false);
            return;
        }
        if ((contentType === "image" && selectedFile.size > 5 * 1024 * 1024) || (contentType === "video" && selectedFile.size > 50 * 1024 * 1024)) {
            setError("File too large");
            setSending(false);
            return;
        }
        setUploading(true);
        const res = await chatApi.uploadFile(selectedFile);
        if (res.result === "SUCCESS" && res.data) {
            const content = res.data.url;
            if (ws && typeof ws.sendMessage === 'function') {
                ws.sendMessage(
                    String(roomId),
                    {
                        roomId: Number(roomId),
                        content,
                        contentType,
                        userId: user?.id ?? 0,
                        username: user?.username ?? '',
                        avatarUrl: user?.avatarUrl ?? ''
                    }
                );
                // Optimistic UI: push message tạm thời
                const optimisticMsg = {
                    id: Date.now(),
                    roomId: Number(roomId),
                    userId: user?.id ?? 0,
                    username: user?.username ?? '',
                    avatarUrl: user?.avatarUrl ?? '',
                    content,
                    contentType,
                    timestamp: new Date().toISOString(),
                    seenBy: [user?.id ?? 0]
                };
                setMessages(prev => [...prev, optimisticMsg]);
            }
        } else {
            setError(res.message || "Upload failed");
            setUploading(false);
            setSending(false);
            setFile(null);
            return;
        }
        setUploading(false);
        setSending(false);
        setFile(null);
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh]">
            {/* Room Info Header */}
            {roomInfo && (
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-4 pt-4 pb-2">
                    <div className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(236,72,153,0.7)]">
                        {roomInfo.name}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-mono text-muted-foreground">Room code:</span>
                        <span
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold cursor-pointer select-all hover:scale-105 transition-transform shadow"
                            title="Click to copy room code"
                            onClick={handleCopyCode}
                        >
                            {roomInfo.code}
                            <Copy className="h-4 w-4 ml-1" />
                        </span>
                        {copying && <span className="text-xs text-green-400 ml-2">Copied!</span>}
                    </div>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 bg-white dark:bg-gray-900 rounded-t-xl" ref={chatRef}>
                {loading && <div className="text-center text-muted-foreground"><Loader2 className="animate-spin inline-block mr-2" />Loading...</div>}
                {hasMore && !loading && (
                    <div className="text-center mb-2">
                        <Button variant="outline" size="sm" onClick={loadMore}>Load older messages</Button>
                    </div>
                )}
                {messages.map(msg => (
                    <div key={msg.id} className={`flex mb-2 ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-2 rounded-lg shadow ${msg.userId === user?.id ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <Image src={msg.avatarUrl} alt={msg.username} width={24} height={24} className="rounded-full" />
                                <span className="font-semibold text-xs">{msg.username}</span>
                                <span className="text-xs text-muted-foreground">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                {msg.seenBy.length > 1 && <Eye className="h-3 w-3 ml-1 text-green-400" /* title="Seen" */ />}
                                {isOwner && <Button size="icon" variant="ghost" onClick={() => handleDelete(msg)}><Trash2 className="h-4 w-4 text-red-500" /></Button>}
                            </div>
                            {msg.contentType === "text" && <div className="break-words whitespace-pre-wrap">{msg.content}</div>}
                            {msg.contentType === "image" && (
                                <Image
                                    src={msg.content.startsWith('http') ? msg.content : API_BASE_URL + msg.content}
                                    alt="img"
                                    width={320}
                                    height={320}
                                    className="rounded-lg mt-2 max-w-[320px] max-h-[320px] object-contain border"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            )}
                            {msg.contentType === "video" && (
                                <video
                                    controls
                                    src={msg.content.startsWith('http') ? msg.content : API_BASE_URL + msg.content}
                                    className="rounded-lg mt-2 max-w-[400px] max-h-[320px] object-contain border"
                                    style={{ width: '100%', height: 'auto' }}
                                />
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 bg-white dark:bg-gray-900 rounded-b-xl flex items-center gap-2">
                <Input
                    placeholder="Type a message..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    disabled={sending || uploading}
                />
                <input
                    type="file"
                    accept="image/jpeg,image/png,video/mp4"
                    style={{ display: 'none' }}
                    id="file-upload"
                    onChange={handleFileChange}
                />
                <label htmlFor="file-upload">
                    <Button variant="ghost" size="icon" asChild>
                        <span>{file ? <Paperclip className="h-5 w-5 text-blue-500" /> : <ImageIcon className="h-5 w-5" />}</span>
                    </Button>
                </label>
                <Button onClick={handleSend} disabled={sending || uploading || (!input.trim() && !file)} className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white">
                    {sending || uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Send className="h-5 w-5" />}
                </Button>
            </div>
            {error && <div className="text-center text-red-500 mt-2">{error}</div>}
        </div>
    );
} 
export interface PageProps {
    params?: { roomId: string };
    searchParams?: { [key: string]: string | string[] | undefined };
} 
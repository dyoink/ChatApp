import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Kiểm tra token trong cookie (Next.js app router nên dùng cookie)
    const token = request.cookies.get('authToken')?.value;
    const isAuth = !!token;
    const url = request.nextUrl.clone();

    // Các route cần bảo vệ
    const protectedRoutes = [
        '/rooms',
        '/rooms/',
        '/rooms/create',
        '/rooms/join',
        '/rooms/user',
        '/chat',
    ];
    // Nếu truy cập các route này mà chưa đăng nhập thì redirect về trang chủ
    if (
        protectedRoutes.some((route) => url.pathname.startsWith(route)) &&
        !isAuth
    ) {
        url.pathname = '/';
        return NextResponse.redirect(url);
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/rooms/:path*', '/chat/:path*'],
}; 
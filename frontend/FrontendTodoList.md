# To-Do List for ChatApp Frontend (Next.js 15)

This to-do list outlines the tasks for building the frontend of a real-time chat web application using Next.js 15, TypeScript, ShadCN UI, and TailwindCSS, located in `D:\TongHop\ChatApp\frontend`. The frontend handles user interfaces for registration, room creation/joining, real-time chat (text, .jpg/.png images, .mp4 videos), notifications, and an admin dashboard, supporting 50-100 concurrent users locally with a neon-themed, responsive UI. All tasks align with `D:\TongHop\ChatApp\ChatAppPRD.md` and `D:\TongHop\ChatApp\frontend\.cursor\rules\FrontendSystemPrompt.mdc`, using Next.js 15 App Router and best practices.

## 1. Project Setup
- [ ] Initialize a Next.js 15 project with TypeScript:
  - Run `npx create-next-app@15 chatapp-frontend --typescript --tailwind --app` in `D:\TongHop\ChatApp\frontend`.
  - Install dependencies: ShadCN UI (`@shadcn/ui`), STOMP client (`@stomp/stompjs`), Axios (`axios`).
- [ ] Configure TailwindCSS:
  - Set up dark/light mode with neon color scheme (pink, green, blue) in `tailwind.config.js`.
  - Add global styles in `/styles/globals.css` for neon-themed UI (e.g., glow effects, neon borders).
- [ ] Set up project structure:
  - Create folders: `/app` (pages), `/components` (UI components), `/public/avatars` (static assets), `/lib` (utilities, e.g., Axios, STOMP client), `/styles` (global CSS).
  - Add environment variables in `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:8080`, `NEXT_PUBLIC_WS_URL=ws://localhost:8080/chat`.
- [ ] Configure ShadCN UI:
  - Run `npx shadcn-ui@latest init` and select components: `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Pagination`.

## 2. Static Assets
- [ ] Add 10 avatar images:
  - Place `avatar1.png` to `avatar10.jpg` in `/public/avatars`.
  - Optimize images (<100KB each) using Next.js `Image` component for loading.

## 3. Layout
- [ ] Create main layout (`/app/layout.tsx`):
  - Implement header: Show user avatar (Next.js `Image`), username, login/logout button (hidden when not logged in) using ShadCN UI `Avatar`, `Button`.
  - Add main content area for room lists, chat, or dashboard.
  - Use TailwindCSS for responsive design with neon styling (pink, green, blue) and dark/light mode (`dark:` prefix).
  - Export metadata for SEO:
    ```tsx
    import type { Metadata } from 'next';
    export const metadata: Metadata = {
      title: 'ChatApp',
      description: 'Real-time chat application',
    };
    ```
- [ ] Implement dark/light mode toggle:
  - Add toggle button in header (ShadCN UI `Button`).
  - Store preference in localStorage; apply `dark` class with TailwindCSS.

## 4. Pages
- [ ] Create `/app/login/page.tsx` (Server Component):
  - Form: Email, password inputs (ShadCN UI `Input`, `Button`).
  - Use `'use client'` for form interactivity; call `/api/auth/login` (POST, Axios).
  - Store JWT in localStorage; redirect to `/rooms` on success.
  - Show error message for invalid credentials (TailwindCSS neon-styled alert).
  - Add metadata:
    ```tsx
    export const metadata: Metadata = {
      title: 'Login - ChatApp',
      description: 'Log in to access ChatApp',
    };
    ```
- [ ] Create `/app/signup/page.tsx` (Server Component):
  - Form: Username, email, password, avatar selection (ShadCN UI `Select` or grid with Next.js `Image`).
  - Use `'use client'` for form and avatar selection; call `/api/auth/signup` (POST).
  - Store JWT and redirect to `/rooms`.
  - Show error for duplicate username/email.
  - Add metadata for SEO.
- [ ] Create `/app/profile/page.tsx` (Server Component):
  - Display: Username, email, avatar (Next.js `Image`).
  - Form: Update username, password, avatar (select from `/public/avatars`) using ShadCN UI.
  - Call `/api/users/profile` (GET/PUT, JWT required).
  - Show success/error messages (neon-styled).
  - Add metadata for SEO.
- [ ] Create `/app/rooms/create/page.tsx` (Server Component):
  - Form: Room name, optional 6-character password (letters/numbers), member limit (1-10) using ShadCN UI.
  - Use `'use client'` for form; call `/api/rooms/create` (POST, JWT).
  - Redirect to `/chat/[roomId]` on success.
  - Show error for invalid inputs (neon-styled).
  - Add metadata for SEO.
- [ ] Create `/app/rooms/join/page.tsx` (Server Component):
  - Form: Room code (6 digits), password (if required) using ShadCN UI.
  - Use `'use client'` for form; call `/api/rooms/join` (POST, JWT).
  - On password error: Show red border, shake animation (CSS), and "Incorrect password" message.
  - Redirect to `/chat/[roomId]` on success.
  - Add metadata for SEO.
- [ ] Create `/app/rooms/page.tsx` (Server Component):
  - Display two sections: Personal rooms (user-created/joined), public rooms (paginated, 10 rooms/page).
  - Fetch rooms from `/api/rooms/search` (GET, paginated).
  - Show room details: Name, code, owner username, member count, unread message count (ShadCN UI `Card`, `Badge`).
  - Add pagination controls (ShadCN UI `Pagination`).
  - Link to `/chat/[roomId]` on click.
  - Add metadata for SEO.
- [ ] Create `/app/chat/[roomId]/page.tsx` (Server Component):
  - Render chat interface with `/components/Chat.tsx`.
  - Fetch room details and initial 30 messages from `/api/rooms/{roomId}/messages` (GET).
  - Show owner controls: Kick member, delete message buttons (ShadCN UI `Button`).
  - Add metadata for SEO.
- [ ] Create `/app/admin/page.tsx` (Server Component):
  - Display stats: Total users, rooms, active rooms (fetch from `/api/admin/stats`, GET, JWT).
  - Management: Buttons to delete rooms/users (call `/api/admin/rooms/{roomId}/delete`, `/api/admin/users/{userId}/delete`, JWT).
  - Restrict to admin role (check JWT).
  - Use ShadCN UI `Card`, `Button` for layout.
  - Add metadata for SEO.
- [ ] Create `/app/error.tsx` (Client Component):
  - Implement error boundary with `'use client'`:
    ```tsx
    'use client';
    export default function Error({
      error,
      reset,
    }: {
      error: Error & { digest?: string };
      reset: () => void;
    }) {
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold">Something went wrong!</h2>
          <p>{error.message}</p>
          <button
            className="mt-4 px-4 py-2 bg-neon-pink text-white rounded"
            onClick={reset}
          >
            Try again
          </button>
        </div>
      );
    }
    ```
- [ ] Create `/app/loading.tsx` (Server Component):
  - Implement loading state:
    ```tsx
    export default function Loading() {
      return <div className="p-4 text-center">Loading...</div>;
    }
    ```

## 5. Chat Interface
- [ ] Create `/components/Chat.tsx` (Client Component):
  - Use `'use client'` for WebSocket and interactivity.
  - Message list:
    - Display 30 messages (text, .jpg/.png images, .mp4 videos) with timestamps and seen checkmarks.
    - Align messages: Others (left), user (right) using TailwindCSS.
    - Use Next.js `Image` for images, `<video>` for videos (controls enabled, autoplay disabled).
    - Load older messages on scroll up (call `/api/rooms/{roomId}/messages`, GET, paginated).
  - Input area:
    - Text input (ShadCN UI `Input`).
    - File input: Restrict to .jpg/.png (5MB), .mp4 (50MB) with `accept="image/jpeg,image/png,video/mp4"`.
    - Submit button (ShadCN UI `Button`) to send via `/app/rooms/{roomId}/send` (STOMP).
    - Call `/api/upload` (POST, JWT) for files; show error for invalid format/size (neon-styled alert).
  - Owner controls:
    - Delete message button (call `/api/rooms/{roomId}/messages/{messageId}/delete`, DELETE, JWT).
    - Kick member button (call `/api/rooms/kick`, POST, JWT).
  - Member list:
    - Show online/offline status (updated via `/topic/rooms/{roomId}/status`, STOMP).
  - Implement seen status:
    - Send seen event to `/app/rooms/{roomId}/messages/{messageId}/seen` (STOMP) when message is visible.
    - Display checkmark for seen messages (updated via `/topic/rooms/{roomId}`).
  - Style with TailwindCSS (neon, dark/light mode).

## 6. Notifications
- [ ] Create `/components/Notification.tsx` (Client Component):
  - Use `'use client'` for WebSocket.
  - Display neon-style popup (bottom-right, 1-2s) for new messages via `/topic/users/{userId}/notifications` (STOMP).
  - Style with TailwindCSS (neon colors: pink, green, blue; dark/light mode).
  - Update unread message count in `/app/rooms/page.tsx` (badge on room cards, updated via WebSocket).

## 7. WebSocket Integration
- [ ] Create `/lib/stomp.ts`:
  - Configure STOMP client (`@stomp/stompjs`):
    ```tsx
    'use client';
    import { Client } from '@stomp/stompjs';
    export function createStompClient(jwt: string) {
      return new Client({
        brokerURL: process.env.NEXT_PUBLIC_WS_URL,
        connectHeaders: { Authorization: `Bearer ${jwt}` },
      });
    }
    ```
- [ ] Subscribe to channels in `/components/Chat.tsx` and `/components/Notification.tsx`:
  - `/topic/rooms/{roomId}`: Messages, seen status updates.
  - `/topic/rooms/{roomId}/status`: Online/offline member updates.
  - `/topic/users/{userId}/notifications`: New message notifications.
- [ ] Send messages:
  - Text/file URLs to `/app/rooms/{roomId}/send` (STOMP).
  - Seen events to `/app/rooms/{roomId}/messages/{messageId}/seen` (STOMP).

## 8. API Integration
- [ ] Create `/lib/api.ts`:
  - Configure Axios with base URL (`NEXT_PUBLIC_API_URL`) and JWT headers:
    ```tsx
    import axios from 'axios';
    const api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
    });
    export default api;
    ```
- [ ] Handle API calls:
  - `/api/auth/signup`, `/api/auth/login` for authentication.
  - `/api/users/profile` for profile management.
  - `/api/rooms/create`, `/api/rooms/join`, `/api/rooms/search`, `/api/rooms/kick`, `/api/rooms/delete` for rooms.
  - `/api/upload` for file uploads.
  - `/api/rooms/{roomId}/messages` for message history.
  - `/api/admin/stats`, `/api/admin/rooms/{roomId}/delete`, `/api/admin/users/{userId}/delete` for admin.

## 9. Testing
- [ ] Write unit tests (Jest, React Testing Library):
  - Test components: `Chat`, `Notification`, forms (login, signup, create room, join room).
  - Test API calls (mock Axios responses).
  - Test WebSocket interactions (mock STOMP client).
- [ ] Write integration tests:
  - Test flows: Signup, create room (with/without password), join, chat (text/image/video), kick, delete.
  - Test pagination: Room list, message history.
  - Test UI: Dark/light mode, neon styling, responsive design, password error handling (red border, shake, message).
- [ ] Test browser compatibility:
  - Verify functionality on Chrome, Firefox, Edge, and mobile devices.

## 10. Deployment
- [ ] Run locally:
  - Start Next.js with `npm run dev` in `D:\TongHop\ChatApp\frontend`.
  - Verify integration with backend (WebSocket, APIs).
- [ ] Prepare for Docker (post-development):
  - Create Dockerfile for Next.js 15:
    ```Dockerfile
    FROM node:18-alpine
    WORKDIR /app
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build
    EXPOSE 3000
    CMD ["npm", "start"]
    ```
  - Plan for Docker Compose with backend and PostgreSQL (post-development).
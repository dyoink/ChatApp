# To-Do List for ChatApp Backend (Spring Boot)

This to-do list outlines the tasks for building the backend of a real-time chat web application using Spring Boot (Java 17), located in `D:\TongHop\ChatApp\backend`. The backend handles user management, room management, real-time chat (text, .jpg/.png images, .mp4 videos), notifications, and admin dashboard APIs, supporting 50-100 concurrent users locally.

## 1. Project Setup
- [ ] Initialize a Spring Boot project (Java 17) with dependencies:
  - Spring Web
  - Spring WebSocket
  - Spring Security
  - Spring Data JPA
  - PostgreSQL Driver
- [ ] Configure `application.properties`:
  - Set PostgreSQL connection details (host, port, database, username, password).
  - Configure JWT secret and token expiration.
  - Set file storage path for uploaded images/videos.

## 2. Database Schema
- [ ] Define JPA entities:
  - `Users`: id (Long, auto-increment), username (String, unique), password_hash (String), email (String, unique), avatar_url (String).
  - `Rooms`: id (Long), name (String), creator_id (Long, foreign key to Users), code (String, 6-digit, unique), password_hash (String, nullable), max_members (Integer, 1-10), created_at (Timestamp).
  - `Room_members`: room_id (Long, foreign key to Rooms), user_id (Long, foreign key to Users), joined_at (Timestamp), role (String, enum: admin/creator/member).
  - `Messages`: id (Long), room_id (Long, foreign key to Rooms), user_id (Long, foreign key to Users), content (String, text or file URL), content_type (String, enum: text/image/video), timestamp (Timestamp), seen_by (String, comma-separated user_ids).
- [ ] Create JPA repositories for each entity with basic CRUD operations.
- [ ] Generate database schema using Hibernate (auto-create or migration scripts).

## 3. User Management APIs
- [ ] Implement `/api/auth/signup` (POST):
  - Input: username, email, password, avatar_url (from 10 predefined avatars).
  - Hash password using BCrypt.
  - Save user to `Users` table.
  - Return JWT token.
- [ ] Implement `/api/auth/login` (POST):
  - Input: email, password.
  - Validate credentials, return JWT token.
- [ ] Implement `/api/users/profile`:
  - GET: Return username, email, avatar_url (authenticate with JWT).
  - PUT: Update username, password (re-hash), or avatar_url (authenticate with JWT).

## 4. Room Management APIs
- [ ] Implement `/api/rooms/create` (POST):
  - Input: name, optional password (6 characters, letters/numbers), max_members (1-10).
  - Generate unique 6-digit code (random, check uniqueness in `Rooms`).
  - Hash password (if provided) using BCrypt.
  - Save to `Rooms` and add creator to `Room_members` (role: creator).
  - Return room details (id, name, code, max_members).
- [ ] Implement `/api/rooms/join` (POST):
  - Input: code, password (if required).
  - Validate code exists in `Rooms`.
  - Check password (if exists) using BCrypt; return error ("Incorrect password") if invalid.
  - Check max_members limit.
  - Add user to `Room_members` (role: member).
  - Return room details.
- [ ] Implement `/api/rooms/delete` (DELETE):
  - Input: room_id (authenticate with JWT).
  - Allow only room owner (creator_id) or admin.
  - Delete room from `Rooms` and related entries in `Room_members` and `Messages`.
- [ ] Implement `/api/rooms/search` (GET):
  - Input: query (room ID, name, or owner username), page, size (default 10).
  - Return paginated list of rooms (id, name, code, creator username, member count).
- [ ] Implement `/api/rooms/kick` (POST):
  - Input: room_id, user_id to kick (authenticate with JWT).
  - Allow only room owner.
  - Remove user from `Room_members`.

## 5. Chat Functionality
- [ ] Configure WebSocket with STOMP:
  - Set endpoint: `/chat`.
  - Configure message broker (e.g., in-memory or RabbitMQ).
- [ ] Implement message sending:
  - Endpoint: `/app/rooms/{roomId}/send` (STOMP).
  - Input: text or file URL, content_type (text/image/video).
  - Validate user is in `Room_members`.
  - Save to `Messages` table (content, content_type, timestamp, user_id, room_id).
  - Broadcast to `/topic/rooms/{roomId}`.
- [ ] Implement file upload endpoint `/api/upload` (POST):
  - Accept .jpg/.png (max 5MB), .mp4 (max 50MB).
  - Validate file format and size; return error message if invalid.
  - Store files locally (e.g., `backend/uploads/`), generate URL.
  - Return file URL for use in chat.
- [ ] Implement message deletion:
  - Endpoint: `/api/rooms/{roomId}/messages/{messageId}/delete` (DELETE).
  - Allow only room owner (creator_id).
  - Remove message from `Messages`.
- [ ] Implement seen status:
  - Endpoint: `/app/rooms/{roomId}/(messages/{messageId}/seen` (STOMP).
  - Add user_id to `seen_by` in `Messages`.
  - Broadcast updated seen status to `/topic/rooms/{roomId}`.
- [ ] Implement message history:
  - Endpoint: `/api/rooms/{roomId}/messages` (GET).
  - Input: page, size (default 30).
  - Return paginated messages (id, content, content_type, timestamp, seen_by).
- [ ] Implement online/offline status:
  - Track user connections via WebSocket.
  - Broadcast status changes to `/topic/rooms/{roomId}/status`.

## 6. Notifications
- [ ] Implement notification sending:
  - On new message, send to `/topic/users/{userId}/notifications` for room members.
  - Include room_id, message preview.

## 7. Admin Dashboard APIs
- [ ] Implement `/api/admin/stats` (GET):
  - Return: total users, total rooms, active rooms (with online members).
  - Restrict to admin role (JWT).
- [ ] Implement `/api/admin/users/{userId}/delete` (DELETE):
  - Delete user from `Users` and related `Room_members`, `Messages`.
  - Restrict to admin role.
- [ ] Implement `/api/admin/rooms/{roomId}/delete` (DELETE):
  - Delete room and related `Room_members`, `Messages`.
  - Restrict to admin role.

## 8. Testing
- [ ] Write unit tests for:
  - APIs: signup, login, profile, room creation/join/search, file upload.
  - WebSocket: message sending/receiving, seen status, notifications.
  - File validation: format (.jpg/.png/.mp4), size (5MB/50MB).
- [ ] Write integration tests for:
  - Full flow: signup, create room (with/without password), join, chat, kick, delete.
  - Pagination: room search, message history.
  - Admin actions: stats, delete rooms/users.

## 9. Deployment
- [ ] Run locally:
  - Start Spring Boot with `mvn spring-boot:run`.
  - Verify functionality for 50-100 concurrent users.
- [ ] Prepare for Docker (post-development):
  - Create Dockerfile for Spring Boot.
  - Plan for Docker Compose with PostgreSQL.
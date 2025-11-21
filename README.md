# ChatApp - Real-time Chat Application

## Overview
ChatApp is a modern real-time chat application built with Next.js 15 (frontend) and Spring Boot (backend). It features JWT authentication, real-time messaging via WebSocket/STOMP, room management, and rich media support (images, videos). The UI is designed with a neon theme using Tailwind CSS and shadcn/ui for a beautiful, responsive experience.

---

## Table of Contents
1. [Features](#features)
2. [Backend Overview](#backend-overview)
3. [Frontend Overview](#frontend-overview)
4. [Main Functionalities](#main-functionalities)
    - [User Registration](#user-registration)
    - [User Login](#user-login)
    - [Room Creation](#room-creation)
    - [Room Search & Join](#room-search--join)
    - [Chat Messaging (Text, Image, Video)](#chat-messaging-text-image-video)
    - [Room Management](#room-management)
    - [User Profile & Settings](#user-profile--settings)
5. [Developer Info](#developer-info)

---

## Features
- **JWT Authentication**: Secure login and registration.
- **Real-time Chat**: Instant messaging using WebSocket (STOMP protocol).
- **Media Messaging**: Send and receive images and videos in chat.
- **Room Management**: Create, search, join, and manage chat rooms (public/private).
- **Modern UI/UX**: Neon-themed, responsive design with dark/light mode.
- **Admin Controls**: Room owners can manage members and delete rooms.
- **Pagination & Filtering**: Efficient room and message browsing.

---

## Backend Overview
- **Framework**: Spring Boot (Java)
- **Authentication**: JWT-based, secure endpoints
- **WebSocket**: Native WebSocket with STOMP for real-time messaging
- **REST APIs**: For user, room, and message management
- **Media Upload**: REST endpoint for image/video upload, static resource serving
- **Database**: PostgreSQL

---

## Frontend Overview
- **Framework**: Next.js 15 (React, TypeScript)
- **UI Library**: Tailwind CSS, shadcn/ui
- **State Management**: React Context, hooks
- **WebSocket Client**: Native WebSocket for real-time chat
- **Responsive Design**: Mobile-first, dark/light mode

---

## Main Functionalities
![z6803958949361_3354e8377169e1fd923c3e7f43dac6f4](https://github.com/user-attachments/assets/93d5478d-c9e1-4cab-a5b6-c42beba9b352)
![z6803958949362_23cac63807029ae4ca8a4ac41c85e13f](https://github.com/user-attachments/assets/ebd6aa80-5cc7-4802-958a-d5a60b0cd90a)


### 1. User Registration
- Users can sign up with username, email, and password.
- Validation and error handling for user-friendly experience.

![z6803958901656_0bed6002e990c3adb83a406033b2b3e9](https://github.com/user-attachments/assets/af03aa7a-0a80-4cb9-b763-59a2af39e661)


---

### 2. User Login
- Secure login with JWT authentication.
- Redirects to chat rooms upon successful login.

![z6803958949364_c1b1f9bb9417b37ca3176e60deca97aa](https://github.com/user-attachments/assets/865f1cb3-20e4-429b-bfe9-9ad9ecd32e9b)


---

### 3. Room Creation
- Users can create new chat rooms (public or private with password).
- Set room name, password (optional), and max members.

![z6803959109816_3fda45294cc25ad311dfed001ff57916](https://github.com/user-attachments/assets/49674b5a-afa7-4521-b4f2-7e8e52234200)


---

### 4. Room Search & Join
- Browse and search for public rooms.
- Filter by public/private.
- Join rooms directly or via password (for private rooms).
- Pagination for efficient browsing.

![z6803959154866_bfa350d543089b969f8374910cfd9745](https://github.com/user-attachments/assets/aa88833d-90c7-497e-9088-3555c7891b3c)
![z6804012153773_a0d767d5fe21906ada22a165a1369955](https://github.com/user-attachments/assets/c34b792a-e2cd-4d6e-ae4f-1d9fad5d47b1)


---

### 5. Chat Messaging (Text, Image, Video)
- Real-time text messaging in rooms.
- Upload and send images (JPG, PNG, max 5MB) and videos (MP4, max 50MB).
- Media is displayed inline in the chat.
- Optimistic UI for instant feedback.

![z6803995275121_99470bbc6799c0b3c4226d55cea84645](https://github.com/user-attachments/assets/0d4e58bf-632c-4d32-8b1b-f431870895af)
![z6803995224271_f82fd3f3a4d2b4365da32afe847cb058](https://github.com/user-attachments/assets/7282b94c-fcb7-4933-a42c-2f342bd365b0)


---

### 6. Room Management
- "Your Rooms": List of rooms the user has joined.
- "Own Rooms": List of rooms the user created (owner).
- Member list and management modal for each room.

![z6803959065737_02146d9c7fb58e41d09dd31e4f1048bc](https://github.com/user-attachments/assets/255a8a75-2d7a-40c1-96b1-2e5021e0c4c9)
![z6803959025824_b5754eee40471bd78dd44f1bc72ae816](https://github.com/user-attachments/assets/21711cc4-c38b-4f0c-a724-7bc9d0cb6441)
![z6803958901679_48fa0d3fae0eba37a92495f7738f1820](https://github.com/user-attachments/assets/b77b93c0-1be4-4f52-8c0d-73fbfffc6b4b)

- Room owners can delete rooms and manage (kick) members.
  
![z6803959410995_8f1e797de2a27a96a9dddbf073b1bd7e](https://github.com/user-attachments/assets/21a4c3e4-79af-4381-93e0-29543583eed9)
![z6803959289612_f1de3820e93682a992bb4f49b17b65bc](https://github.com/user-attachments/assets/f068ea9e-a5df-4d16-a67d-60640a2d1451)

---

### 7. User Profile & Settings
- View and update user profile (avatar, username, email, password).
- Theme toggle (dark/light mode).
  
![z6803959237992_d325cabf0c44a43108ce83b06bad22fa](https://github.com/user-attachments/assets/094fe949-9f44-4fa0-b069-271b7ff01127)


---

## Developer Info
- **Author**: Trần Chí Đức
- **Tech Stack**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Spring Boot, WebSocket, JWT

---

## Notes
- If you need to add more features or screenshots, please let me know!
- For any questions or contributions, feel free to contact the developer. 

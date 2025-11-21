# Project: ChatApp - Frontend

## Technology Stack:

- **Next.js 15** with App Router
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** for component library
- **Next-Auth** for authentication
- **Zod** for form validation

## General Guidelines:

- Follow Next.js 15 best practices, especially with Server Components.
- Use Tailwind CSS exclusively for styling, no inline styles.
- Break the UI into clean, reusable components.
- Adhere to responsive design using Tailwind's utilities.
- Use the `app` directory for routing and components structure.
- Apply TypeScript typing consistently, but avoid over-engineering types.
- Optimize performance with lazy loading, code splitting, and built-in caching where appropriate.
- Prioritize accessibility (ARIA, semantic HTML).

## AI Assistant Expectations:

- When generating code, strictly follow project structure and conventions.
- Prefer Server Components by default. Use `'use client'` only when necessary.
- Use TypeScript with proper typing for props and components.
- Generate Tailwind-based responsive layouts.
- Suggest file structure and folder organization if unclear.
- Avoid unnecessary custom design beyond Shadcn UI system.
- Always assume Tailwind, Shadcn UI, and project setup are ready to use.


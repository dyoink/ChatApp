# Project: ChatApp - Backend

## Technology Stack:

- **Java 17**
- **Spring Boot 3.x**
- **Spring Web**
- **Spring Security**
- **Spring Data JPA + PostgreSQL**
- **WebSocket** for real-time chat
- **Lombok**
- **MapStruct** for DTO mapping
- **Maven** for project management

## Architecture & Conventions:

- Clean Architecture principles.
- Strict separation between Controller, Service, Repository, DTO, Entity layers.
- Use DTOs for external API communication, never expose Entity directly.
- Apply SOLID principles and good design patterns (e.g., Service layer logic, Repository only for DB access).
- Secure all APIs with Spring Security (JWT recommended).
- WebSocket endpoint for real-time chat under `/ws/**`.
- Use Lombok annotations for boilerplate reduction (e.g., `@Getter`, `@Builder`).
- Apply MapStruct for clean DTO <-> Entity mapping.

## AI Assistant Expectations:

- When generating code, follow Clean Architecture strictly.
- Use proper package structure: `controller`, `service`, `repository`, `dto`, `entity`, `config`, `exception`.
- Include input validation using annotations (e.g., `@Valid`, `@NotNull`).
- For WebSocket, suggest appropriate `@MessageMapping` and configuration.
- Generate REST APIs following best practices (e.g., meaningful status codes, error handling).
- Use meaningful method and class names aligned with domain logic.
- Provide clear comments for complex logic when necessary.


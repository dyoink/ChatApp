# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Cài dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy toàn bộ source code
COPY . .

# Build production
ENV NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_WS_URL=ws://localhost:8080/chat
RUN npm run build

# Stage 2: Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Tạo user non-root
RUN addgroup -g 1001 -S appgroup && adduser -S appuser -u 1001 -G appgroup

# Copy node_modules và .next từ builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/package.json ./package.json

# Copy public (bao gồm avatars)
COPY --from=builder /app/public ./public

# Chỉ copy các file cấu hình cần thiết
COPY --from=builder /app/next.config.ts ./

# Thiết lập biến môi trường production
ENV NODE_ENV=production
ENV NEXT_PUBLIC_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_WS_URL=ws://localhost:8080/chat

# Chuyển quyền thư mục cho user non-root
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000

CMD ["npm", "start"]
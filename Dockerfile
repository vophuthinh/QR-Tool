# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# ✅ Inject env for Vite at build-time
ARG VITE_AZURE_CLIENT_ID
ARG VITE_AZURE_TENANT_ID

ENV VITE_AZURE_CLIENT_ID=$VITE_AZURE_CLIENT_ID
ENV VITE_AZURE_TENANT_ID=$VITE_AZURE_TENANT_ID

# Build the application
RUN npm run build

# Stage 2: Production
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Xóa TẤT CẢ cấu hình nginx mặc định (port 80)
RUN rm -rf /etc/nginx/conf.d/*

# Đảm bảo nginx.conf không có default server block nào listen port 80
RUN sed -i '/listen.*80/d' /etc/nginx/nginx.conf || true

# Tạo nginx configuration - CHỈ listen trên port 3111, KHÔNG có port 80
RUN echo 'server { \
    listen 3111; \
    listen [::]:3111; \
    server_name _; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Gzip compression \
    gzip on; \
    gzip_vary on; \
    gzip_min_length 1024; \
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json; \
    \
    # Security headers \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-XSS-Protection "1; mode=block" always; \
    \
    # Cache static assets \
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    \
    # SPA routing - redirect all to index.html \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Service worker \
    location /sw.js { \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
        add_header Pragma "no-cache"; \
        add_header Expires "0"; \
    } \
}' > /etc/nginx/conf.d/app.conf

# Expose port
EXPOSE 3111

# Start nginx
CMD ["nginx", "-g", "daemon off;"]


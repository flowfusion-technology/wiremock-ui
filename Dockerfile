FROM node:22-alpine as builder

# Force rebuild trigger - 1
WORKDIR /app

RUN apk add --no-cache git bash

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

# Build for production with legacy OpenSSL support
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV SKIP_PREFLIGHT_CHECK=true
ENV PUBLIC_URL=/ui
RUN yarn build

# Verify build was successful
RUN test -d /app/build || (echo "Build failed - no build directory" && exit 1)
RUN test -f /app/build/index.html || (echo "Build failed - no index.html" && exit 1)

# Fix Mixed Content: Replace HTTP URLs with HTTPS in index.html
# Use -i'' for Alpine's sed (busybox sed)
RUN sed -i'' 's|http://\([^"]*\)|https://\1|g' /app/build/index.html 2>/dev/null || \
    sed -i 's|http://\([^"]*\)|https://\1|g' /app/build/index.html || true

# Production stage with nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Configure nginx for React Router with base path /ui
RUN echo 'server { \
    listen 80; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Security headers to prevent Mixed Content \
    add_header X-Content-Type-Options "nosniff" always; \
    add_header X-Frame-Options "SAMEORIGIN" always; \
    \
    # Serve config.json \
    location = /ui/config.json { \
        alias /usr/share/nginx/html/config.json; \
        add_header Cache-Control "no-cache"; \
        add_header Content-Type "application/json"; \
    } \
    \
    # Serve static assets (JS, CSS) - must come before /ui/ location \
    location ~ ^/ui/static/ { \
        alias /usr/share/nginx/html/static/; \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
        add_header X-Content-Type-Options "nosniff" always; \
    } \
    \
    # Serve other static files (favicon, manifest) \
    location ~ ^/ui/(favicon\.ico|manifest\.json)$ { \
        alias /usr/share/nginx/html/$1; \
        expires 1y; \
    } \
    \
    # Main UI location - serve React app \
    location /ui/ { \
        alias /usr/share/nginx/html/; \
        try_files $uri $uri/ /ui/index.html; \
        add_header Cache-Control "no-cache"; \
        add_header Content-Security-Policy "upgrade-insecure-requests" always; \
    } \
    \
    # Redirect /ui to /ui/ \
    location = /ui { \
        return 301 /ui/; \
    } \
    \
    # Redirect root to /ui/ \
    location = / { \
        return 301 /ui/; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

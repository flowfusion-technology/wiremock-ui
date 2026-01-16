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

# Production stage with nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Configure nginx for React Router with base path /ui
RUN echo 'server { \
    listen 80; \
    location /ui { \
        alias /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /ui/index.html; \
    } \
    location = /ui { \
        return 301 /ui/; \
    } \
    location / { \
        return 301 /ui/; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

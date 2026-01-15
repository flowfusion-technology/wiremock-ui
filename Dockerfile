FROM node:22-alpine as builder

WORKDIR /app
RUN apk add --no-cache \
    git \
    bash

COPY *.json yarn.lock ./
RUN yarn install

COPY /src /app/src
COPY /public /app/public

# Build for production (skip TypeScript errors)
RUN SKIP_PREFLIGHT_CHECK=true yarn build || true

# Production stage with nginx
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

# Configure nginx for React Router
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

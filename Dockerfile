FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache git bash

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

ENV SKIP_PREFLIGHT_CHECK=true
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

EXPOSE 3000

CMD ["yarn", "start"]

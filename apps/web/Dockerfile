# Next.js web image — production build + start.
FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .

# NEXT_PUBLIC_* must be present at build time (baked into the client bundle).
# DigitalOcean passes the build-time env var as a build arg of the same name.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

ENV PORT=8080
EXPOSE 8080

# `next start` honours $PORT.
CMD ["npm", "start"]

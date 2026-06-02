# Next.js web image (development-friendly)
FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

EXPOSE 3000

# Dev default. For production use `npm run build` then `npm start`.
CMD ["npm", "run", "dev"]

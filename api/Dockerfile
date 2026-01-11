FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --only=production

# COPY package.json .
# RUN npm install --production

COPY index.js .
COPY proto ./proto

EXPOSE 8080

CMD ["node", "index.js"]
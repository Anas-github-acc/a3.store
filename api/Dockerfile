FROM node:20-alpine

WORKDIR /app

COPY package.json .
RUN npm install --production

COPY index.js .
COPY ../proto ./proto

EXPOSE 8080

CMD ["node", "index.js"]
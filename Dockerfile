FROM node:alpine
ENV NODE_ENV=production

WORKDIR /app

COPY . /app

RUN npm install --production

CMD ["node", "server.js"]
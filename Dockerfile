FROM node:16-alpine

WORKDIR /app

copy package*.json ./

RUN npm ci

COPY . .

EXPOSE 80/tcp

CMD ["npm", "start"]


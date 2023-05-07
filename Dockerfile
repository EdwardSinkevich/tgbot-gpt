FROM node:16-alpine

WORKDIR /app

copy package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]


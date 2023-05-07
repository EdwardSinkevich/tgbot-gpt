FROM node:16-alpine

WORKDIR /app

copy package*.json ./

RUN npm ci

COPY . .

ENV PORT=3000

EXPOSE $PORT

CMD ["npm", "start"]


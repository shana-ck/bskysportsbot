FROM node:24-alpine

RUN apk add --no-cache ffmpeg

WORKDIR .

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD ["node", "index.js"]

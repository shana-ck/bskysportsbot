FROM node:20-alpine

WORKDIR .

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9000

CMD ["node", "index.js"]
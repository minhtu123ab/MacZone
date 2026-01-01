FROM node:20-alpine

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5000
CMD [ "npm", "run", "start" ]
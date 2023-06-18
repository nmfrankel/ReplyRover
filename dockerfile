FROM node:18

# Create app directory
WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=80
EXPOSE 80

CMD [ "npm", "run", "start" ]

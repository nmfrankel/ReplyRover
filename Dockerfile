FROM node:lts-alpine

# Create app directory
WORKDIR /server

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=80
EXPOSE 80

# Build
RUN npx prisma generate
RUN npm run build
RUN find ./dist -name "*.js" -exec sed -i -E "s#import (.*) from '\.(.*)';#import \1 from '.\2\.js';#g" {} +;

CMD [ "npm", "run", "start" ]

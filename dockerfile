FROM node:18

ENV PORT=80
EXPOSE 80

RUN npm install

CMD [ "npm", "run", "start" ]

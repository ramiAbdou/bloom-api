FROM node:12-alpine as build

WORKDIR /usr/app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 8080

FROM build as stage

RUN npm run build:stage

FROM build as prod

RUN npm run build:prod

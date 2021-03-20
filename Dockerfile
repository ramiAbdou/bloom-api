## Start from a base image which is Node 12.
FROM node:12-alpine as build

## Set the working directory of the Docker containner to /usr/app.
WORKDIR /usr/app

## Copy both package.json and package-lock.json to /usr/app.
COPY package*.json .

## Install all of the NPM dependencies.
RUN npm install

## Copy all of the contents of the project to the image.
COPY . .

## Exposes port 8080 in the Docker container.
EXPOSE 8080

## TARGET: DEV
FROM build as dev
RUN npm install -g nodemon
CMD ["nodemon", "-L"]

## TARGET: STAGE
FROM build as stage
RUN npm run build:stage

## TARGET: PROD
FROM build as prod
RUN npm run build:prod

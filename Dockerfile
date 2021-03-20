## Start from a base image which is Node 12.
FROM node:12-alpine as build

## Set the working directory of the Docker containner to /usr/app.
WORKDIR /usr/app

## Copy both package.json and package-lock.json to /usr/app.
COPY package*.json ./

## Install all of the NPM dependencies.
RUN npm install

## Copy all of the contents of the project to the image.
COPY . .

## Exposes port 8080 in the Docker container.
EXPOSE 8080

## TARGET: TEST - Need to install dockerize to run the tests.
FROM build as test
ENV DOCKERIZE_VERSION v0.6.0
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && tar -C /usr/local/bin -xzvf dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
  && rm dockerize-alpine-linux-amd64-$DOCKERIZE_VERSION.tar.gz

## TARGET: DEV
FROM build as dev
RUN npm install -g nodemon
CMD ["nodemon", "-L"]

## TARGET: STAGE
FROM build as stage
RUN npm run build:stage
CMD ["npm", "run", "start:stage"]

## TARGET: PROD
FROM build as prod
RUN npm run build:prod
CMD ["npm", "run", "start:prod"]

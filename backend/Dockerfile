# Build Stage 1
# Create a staging docker image
#
FROM node:18-alpine as build
RUN apk add --no-cache bash
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY tsconfig.json ./
# Install packages
RUN npm install

COPY ./src ./src
RUN npm run build

# Build Stage 2
# Production build from staging build
#
FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
# Installing dependencies for production
RUN npm ci --only=production
COPY --from=build /usr/src/app/dist ./dist

EXPOSE 3000
CMD [ "npm", "start" ]

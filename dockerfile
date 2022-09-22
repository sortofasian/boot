FROM node:18-alpine as build
COPY package.json yarn.lock build ./
RUN yarn install --production
CMD node --experimental-specifier-resolution=node /index.js
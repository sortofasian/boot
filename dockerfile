FROM node:18-alpine as build
ENV NODE_ENV production
COPY package.json build ./
RUN yarn install --production
CMD node --experimental-specifier-resolution=node /index.js
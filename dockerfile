FROM alpine
RUN apk add nodejs yarn
COPY package.json yarn.lock build ./
RUN yarn install --production
CMD node --experimental-specifier-resolution=node /index.js
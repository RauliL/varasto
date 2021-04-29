FROM node:14

# Create volume for storing the data.
RUN mkdir /data
VOLUME ["/data"]

# Create app directory
WORKDIR /usr/src/app

# Install application dependencies.
COPY ./packages/server/package.json ./packages/server/yarn.lock ./
RUN yarn install

# Bundle application source and transpile sources.
COPY ./packages/server ./
RUN yarn build

EXPOSE 3000

CMD ["yarn", "start", "/data"]

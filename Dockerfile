FROM node:12

# Create volume
RUN mkdir /data
VOLUME ["/data"]

# Create app directory
WORKDIR /usr/src/app

# Bundle app source
COPY . .

# Install dependencies.
WORKDIR /usr/src/app/packages/varasto-server
RUN yarn install

EXPOSE 3000
CMD ["yarn", "start", "/data"]

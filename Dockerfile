FROM node:18

# Working directory for the app
ENV NODE_OPTIONS=--openssl-legacy-provider
WORKDIR /usr/src/app

# Copy package and package-lock onto the image
COPY package*.json ./

RUN npm install

# Copy source code into container's working directory

COPY . .

EXPOSE 8082

CMD npm start

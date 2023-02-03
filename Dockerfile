FROM alpine:latest
RUN apk update && apk upgrade
RUN apk add --no-cache \
    python3 \
    openjdk11 \
    g++ \
    npm \
    nodejs

WORKDIR /app

COPY package*.json ./
COPY ./src/server ./src/server
RUN npm i --quiet --only=production

# environment variables
ENV PORT=8888
EXPOSE 8888
CMD [ "node", "src/server/index.js" ]
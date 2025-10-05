FROM ghcr.io/puppeteer/puppeteer:24.23.0

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

CMD ["node", "index.js"]

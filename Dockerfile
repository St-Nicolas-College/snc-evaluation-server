FROM node:20-slim

RUN apt-get update \
    && apt-get install -y libvips-dev \
    && rm -rf /var/lib/apt/lists/*

ARG NODE_ENV=production

WORKDIR /usr/src/app

COPY package*.json ./

ENV HOST=0.0.0.0
ENV PORT=1334

RUN npm install

COPY . ./

RUN npm run build

EXPOSE 1334

CMD ["npm", "run", "start"]
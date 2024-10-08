FROM node:20

WORKDIR /app

COPY . .

RUN npm update -g npm

RUN npm install

RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "build"]


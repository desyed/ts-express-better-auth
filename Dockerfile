FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm i

COPY . /app/

EXPOSE 3000

RUN chmod +x /app/entrypoint.sh

ENTRYPOINT [ "/app/entrypoint.sh" ]

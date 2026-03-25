FROM node:22-alpine

# Install MariaDB (MySQL-compatible) + utilities
RUN apk add --no-cache mariadb mariadb-client mariadb-server-utils

WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev
COPY . .
RUN chmod +x /app/start.sh

# Bot HTTP port + MySQL port
EXPOSE 3000 3306

CMD ["/app/start.sh"]

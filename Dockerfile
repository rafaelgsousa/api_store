# Development Stage
FROM node:latest AS development

WORKDIR /app

COPY package*.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "start:dev"]

# Production Internship
# FROM node:alpine AS production

# WORKDIR /app

# COPY package*.json yarn.lock ./

# RUN yarn install --production

# COPY . .

# CMD ["npm", "run", "start:prod"]

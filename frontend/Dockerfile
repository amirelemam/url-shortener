FROM node:22-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

### Build ###
FROM node:22-alpine AS builder

WORKDIR /app

COPY . .

COPY --from=deps /app/node_modules ./node_modules

RUN yarn build


### Production image ###
FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/yarn.lock ./

RUN yarn install --frozen-lockfile --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./

EXPOSE 3000

CMD ["yarn", "start"] 
FROM node:22-alpine AS builder
WORKDIR /app

# install deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# copy Prisma schema and generate the client
COPY prisma ./prisma
RUN yarn prisma generate

# copy the rest of files
COPY . .
RUN yarn build

FROM node:22-alpine
WORKDIR /app

# copy production deps
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY prisma ./prisma

# copy the generated Prisma client 
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

COPY --from=builder /app/dist ./dist

EXPOSE 3001
CMD ["sh","-c","until nc -z db 5432; do sleep 1; done; npx prisma migrate deploy --schema=./prisma/schema.prisma && node dist/main.js"]

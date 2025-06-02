# ------------ Build Stage ------------
FROM node:24-alpine AS build

# Install tools required for Prisma engine builds
RUN apk add --no-cache openssl

WORKDIR /app

# Copy and install dependencies
COPY package*.json tsconfig.json ./
RUN npm ci

# Copy code and Prisma schema
COPY prisma ./prisma
COPY src ./src

# Generate the Prisma client for type support (TS build)
ENV NODE_ENV=development
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ------------ Production Stage ------------
FROM node:24-alpine AS runner

WORKDIR /app

# Copy only runtime essentials
COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma

# Re-run generate for runtime
ENV NODE_ENV=production
ENV DATABASE_URL="postgresql://adminHu101:pass101@postgres:5432/notes"
RUN npx prisma generate

# Create logs dir if needed
RUN mkdir logs

EXPOSE 5000

CMD ["node", "dist/server.js"]

FROM node:24.1-slim

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install

# Copy all other files including prisma/
COPY . .

# Copy .env temporarily (optional but recommended for Prisma generate)
COPY .env .env

# Generate Prisma client **before** building TypeScript
RUN npx prisma generate

# Now build the TypeScript code
RUN npm run build

# Optionally remove .env if you're concerned about secrets
# RUN rm .env

# Expose the app port
EXPOSE 5000

# Start the app
CMD ["npm", "run", "start"]

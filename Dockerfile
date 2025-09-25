# Build stage
FROM node:18-alpine AS build

# Build arguments for environment variables
ARG REACT_APP_CLAUDE_API_KEY
ARG REACT_APP_SUPABASE_URL
ARG REACT_APP_SUPABASE_ANON_KEY

# Set environment variables from build arguments
ENV REACT_APP_CLAUDE_API_KEY=$REACT_APP_CLAUDE_API_KEY
ENV REACT_APP_SUPABASE_URL=$REACT_APP_SUPABASE_URL
ENV REACT_APP_SUPABASE_ANON_KEY=$REACT_APP_SUPABASE_ANON_KEY

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the React app
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built React app and server
COPY --from=build /app/build ./build
COPY server.js ./

# Expose port 8080 (Cloud Run requirement)
EXPOSE 8080

# Start Express server
CMD ["node", "server.js"]
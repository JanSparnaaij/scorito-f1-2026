FROM node:20-slim AS base
RUN npm install -g pnpm@8.15.4

WORKDIR /app

# Copy manifests
COPY package.json pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/db/package.json packages/db/
COPY packages/core/package.json packages/core/

# Install production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy source files
COPY . .

# Build server
RUN pnpm --filter server run build

EXPOSE 3000
CMD ["node", "apps/server/dist/index.js"]

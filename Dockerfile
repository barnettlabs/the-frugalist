# syntax=docker/dockerfile:1

# One image, two services.
#
# The API and the BullMQ worker ship the same build and differ only in start
# command - that is the whole trick, and it is why the worker costs no extra
# build time or registry space. Render runs `node dist/server.js` for the web
# service and `node dist/worker.js` for the background worker.
#
# Node 24 LTS is the deploy target even though development happens on 22:
# it is what the runtime recommendation settled on, and pinning it here means
# the container is the source of truth rather than whatever is on a laptop.

FROM node:24-alpine AS base
ENV PNPM_HOME=/pnpm
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# ---- dependencies -----------------------------------------------------------
# Copied separately from source so a code change does not invalidate the
# install layer.
FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY server/package.json ./server/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @frugalist/server... --prod=false

# ---- build ------------------------------------------------------------------
FROM deps AS build
COPY packages/contracts ./packages/contracts
COPY server ./server
RUN pnpm --filter @frugalist/server build

# ---- production dependencies ------------------------------------------------
FROM base AS prod-deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY server/package.json ./server/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile --filter @frugalist/server... --prod

# ---- runtime ----------------------------------------------------------------
FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# tini reaps zombies and forwards signals, so SIGTERM reaches Node and the
# graceful shutdown in server.ts actually runs on deploy.
RUN apk add --no-cache tini && \
    addgroup -g 1001 -S nodejs && \
    adduser -u 1001 -S frugalist -G nodejs

COPY --from=prod-deps --chown=frugalist:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=frugalist:nodejs /app/server/node_modules ./server/node_modules
COPY --from=prod-deps --chown=frugalist:nodejs /app/packages/contracts ./packages/contracts
COPY --from=build --chown=frugalist:nodejs /app/server/dist ./dist
COPY --chown=frugalist:nodejs server/package.json ./package.json

USER frugalist
EXPOSE 8787

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "dist/server.js"]

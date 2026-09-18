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
# contracts is built first: its package exports point at dist, and the server
# imports it as a normal dependency. tsx and vitest transpile TypeScript on the
# fly so this is invisible in development - plain Node in the container is not
# so forgiving, which is why the image gets built in CI rather than assumed.
RUN pnpm --filter @frugalist/contracts build && pnpm --filter @frugalist/server build

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

# The workspace layout is preserved rather than flattened.
#
# pnpm installs one content-addressed store at the root and symlinks each
# package's direct dependencies into its own node_modules. Copying dist to
# /app/dist while its dependencies lived in /app/server/node_modules broke
# resolution outright - Node walks up from the file, found the root store with
# no direct links, and failed on the first import. Keeping the same shape the
# build used means resolution works for the same reason it works locally.
COPY --from=prod-deps --chown=frugalist:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=frugalist:nodejs /app/server/node_modules ./server/node_modules
COPY --from=prod-deps --chown=frugalist:nodejs /app/package.json ./package.json
COPY --from=prod-deps --chown=frugalist:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=prod-deps --chown=frugalist:nodejs /app/server/package.json ./server/package.json
# contracts has its own direct dependencies (zod, @internationalized/date), so
# it needs its own symlink tree just like server does.
COPY --from=prod-deps --chown=frugalist:nodejs /app/packages/contracts/node_modules ./packages/contracts/node_modules
COPY --from=build --chown=frugalist:nodejs /app/packages/contracts/dist ./packages/contracts/dist
COPY --from=build --chown=frugalist:nodejs /app/packages/contracts/package.json ./packages/contracts/package.json
COPY --from=build --chown=frugalist:nodejs /app/server/dist ./server/dist
# The migration SQL ships with the image so the pre-deploy command can apply it.
COPY --from=build --chown=frugalist:nodejs /app/server/drizzle ./server/drizzle

USER frugalist
EXPOSE 8787

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/dist/server.js"]

# syntax=docker/dockerfile:1
#
# Multi-stage build for E-Assurance.
# Produces a single image that serves both the built React frontend and the
# Express API from one process/port (backend/src/app.js serves frontend/dist
# with an SPA fallback when NODE_ENV=production).
#
# Neither backend/package.json nor frontend/package.json declares an
# "engines" field, so this pins to the current Node LTS (20.x).

##############################
# Stage 1: build the frontend
##############################
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend

# Install deps first so this layer is cached unless package*.json changes.
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Now bring in the rest of the frontend source and build it.
COPY frontend/ ./
RUN npm run build
# -> produces /app/frontend/dist

##############################
# Stage 2: install backend production deps
##############################
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend

# `bcrypt` is a native addon (node-gyp) - Alpine's musl libc means prebuilt
# binaries usually don't match, so npm has to compile it from source. Alpine's
# base image doesn't ship the toolchain needed for that; without these,
# `npm ci` either fails outright or silently produces a broken binding that
# crashes the very first time bcrypt.compare/hash actually runs at runtime.
RUN apk add --no-cache python3 make g++

COPY backend/package.json backend/package-lock.json ./
# sequelize-cli is a devDependency, but this app runs
# `sequelize-cli db:migrate` at container boot (see CMD below), so it must
# be present in the final image. Install full deps here (skip --omit=dev)
# rather than silently breaking the migrate-on-boot step.
RUN npm ci

##############################
# Stage 3: final runtime image
##############################
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app

# Backend source + its node_modules (including sequelize-cli for migrations).
COPY backend/ ./backend/
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Built frontend, placed as a sibling of backend/ so the relative path
# resolution in backend/src/app.js (path.resolve(__dirname, '../../frontend/dist'))
# resolves identically to how it does when run un-containerized from the repo root.
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

WORKDIR /app/backend

# backend/.env.example documents PORT=5000 as the default (backend/src/config/env.js
# falls back to 5000 when PORT is unset).
EXPOSE 5000

# Check the database is actually reachable (and log exactly why, in detail, if it's
# not - sequelize-cli's own migration errors have proven to print as a bare "ERROR: "
# with no message in production, which is undiagnosable) before running migrations,
# then start the server. Migrations run on every container start so a fresh deploy's
# schema is always current; the seeder is intentionally NOT run here (see
# DEPLOYMENT.md) since it's a one-time step, not something to repeat on every deploy.
CMD ["sh", "-c", "node scripts/check-db.js && npx sequelize-cli db:migrate && node src/server.js"]

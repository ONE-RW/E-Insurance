# Deploying E-Assurance to Railway

A short checklist for deploying this app (single container serving both the
API and the built frontend) to Railway.

## 1. Push to GitHub

This repo already has a remote configured. Confirm it and push your current
branch:

```
git remote -v
git push origin <your-branch>
```

No need to `git remote add` unless `origin` is missing.

## 2. Create the Railway project

1. Sign in to Railway and start a **New Project**.
2. Choose "Deploy from GitHub repo" and select this repository.
3. Railway will detect the root `Dockerfile` and build the image from it
   automatically — no extra build configuration should be needed.

## 3. Add a MySQL database

Add Railway's MySQL plugin/service to the project. It will generate its own
connection variables on that service (Railway names these things like
`MYSQLHOST`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`, `MYSQLPORT` —
check the exact current variable names in your project's Variables tab
for the MySQL service, since Railway occasionally changes naming).

This app's own config (`backend/config/config.js` and
`backend/src/config/env.js`) expects these exact variable names instead:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

On your **backend service** (not the MySQL service), set those five
variables to point at the MySQL service's values. Railway supports
referencing another service's variables directly, e.g.:

```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
```

(Adjust the `MySQL.` prefix to match whatever name you gave the database
service.) If that reference syntax doesn't work as expected, just copy the
values shown on the MySQL service's Variables tab directly.

## 4. Set the remaining environment variables

On the backend service, set:

- `NODE_ENV=production`
- `JWT_SECRET` — a long random value. Generate one locally, e.g. with
  `openssl rand -base64 48`, or with Node: `node -e "console.log(require('crypto').randomUUID()+require('crypto').randomUUID())"`.
- `PUBLIC_URL` — this service's public HTTPS URL. If Railway hasn't assigned
  one yet, look in the service's Settings under Networking for an option to
  generate a public domain, then set this variable to that `*.up.railway.app`
  URL.
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` — used by the seeder (step 5) to create
  the first admin account.
- `FRONTEND_ORIGIN` — read by the CORS setup in `backend/src/app.js`
  (`cors({ origin: env.frontendOrigin, credentials: true })`). Since the
  backend now serves the built frontend itself, API calls will be
  same-origin in production and this value isn't load-bearing for CORS
  the way it was when frontend and backend were hosted separately. It's
  still simplest to set it to the same value as `PUBLIC_URL` rather than
  leaving it unset.

Also double check `PORT` — Railway sets this automatically for containers
that expose a port, and `backend/src/config/env.js` already falls back to
`5000` if it's unset, so you generally don't need to set it yourself.

## 5. First deploy: run migrations and seed

Migrations run automatically on every container start (see the `CMD` in the
root `Dockerfile`: `sequelize-cli db:migrate` runs before the server
starts), so the schema will always be up to date after a deploy — no manual
step needed for that part.

The seeder is **not** run automatically, since it's meant to run once, not
on every deploy. After the first successful deploy, run it manually via
Railway's CLI or web shell for the backend service:

```
railway run npm run seed
```

(run from the `backend/` directory, or wherever your Railway CLI context is
scoped to this service).

## 6. Later: error monitoring

Adding Sentry for error monitoring is a small follow-up, not a rearchitecture
— once you have a free Sentry.io account and a DSN key, it's a clean
drop-in on top of the structured `pino` logging already being added to the
backend.

# E-Assurance Backend

Vehicle-insurance verification system backend for Rwanda National Police (RNP).
Node.js + Express + MySQL (Sequelize ORM).

## Roles

- **Admin** (RNP HQ) — manages insurance companies, users, vehicles, policies, and can view the audit log.
- **Insurer** (per insurance company) — manages their own company's policies and can look up / register vehicles.
- **Officer** (traffic officer) — read-only vehicle lookup by plate number or owner TIN via `/api/search`.

Every login, logout, search, and data mutation is recorded in an insert-only `activity_logs` table.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Copy the environment template and fill in your values:

   ```
   copy .env.example .env
   ```

   (On macOS/Linux: `cp .env.example .env`)

   Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`, `FRONTEND_ORIGIN`,
   and the default admin credentials `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

3. Create the MySQL database (name must match `DB_NAME` in your `.env`):

   ```sql
   CREATE DATABASE eassurance;
   ```

4. Run migrations to create all tables:

   ```
   npx sequelize-cli db:migrate
   ```

5. Seed the default Admin user:

   ```
   npx sequelize-cli db:seed:all
   ```

6. Start the dev server (auto-reload with nodemon):

   ```
   npm run dev
   ```

   Or start it normally:

   ```
   npm start
   ```

The API is served under `http://localhost:5000/api` by default (configurable via `PORT`).

## Default admin login

The seeder creates one Admin account using the credentials from your `.env` file
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`). With the values from `.env.example` unchanged, this is:

- **Email:** `admin@rnp.gov.rw`
- **Password:** `ChangeMe123!`

Change these in `.env` before seeding a real deployment, and change the password again after first login.

## npm scripts

- `npm run dev` — start with nodemon (auto-restart on changes)
- `npm start` — start with node
- `npm run migrate` — run all pending Sequelize migrations
- `npm run seed` — run all Sequelize seeders (creates the default Admin user)

## Project layout

```
backend/
  src/
    config/       Sequelize DB connection + env loader
    middleware/    auth (requireAuth/requireRole), activityLogger, errorHandler
    models/        Sequelize models + associations
    controllers/    request handlers per resource
    routes/         one router per resource, mounted under /api
    validators/     express-validator chains per route
    app.js          Express app wiring
    server.js       entrypoint (loads dotenv, connects DB, starts server)
  migrations/       sequelize-cli migrations for all 5 tables
  seeders/          default Admin user seeder
  config/config.js  sequelize-cli DB config (reads .env)
  .sequelizerc      sequelize-cli path configuration
  .env.example      environment variable template
```

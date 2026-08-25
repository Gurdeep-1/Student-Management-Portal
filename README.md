# Student Portal

This project is an academic portal built with React + Vite (frontend) and an Express API server using SQLite by default. Optional Postgres support is available for production setups.

# Project Link - https://student-management-portal-unqf.onrender.com


## Run (development)

Install dependencies and start both servers (frontend + API):

```bash
npm install
npm run dev
```

## Postgres (optional)

The app uses SQLite by default. To use Postgres instead, set `DATABASE_URL` in `portal.env` (or `.env`):

```bash
DATABASE_URL=postgres://USER:PASSWORD@HOST:5432/studentportal
```

That's it — no separate migration step is needed. `server.js` automatically creates all required tables (`CREATE TABLE IF NOT EXISTS ...`) and seeds demo data on first run, against whichever database `DATABASE_URL` points to. Make sure the target database itself already exists (e.g. `createdb studentportal`); the app creates tables inside it but not the database itself.

If you're connecting to a managed/cloud Postgres that requires SSL, also set:

```bash
PGSSL=true
```

To go back to SQLite, just remove or comment out `DATABASE_URL` and restart the server.

Demo accounts (seeded automatically on first run, for either database):
- student@college.edu / student123
- faculty@college.edu / faculty123
- admin@college.edu / admin123

## Environment variables

Copy `.env.example` to `portal.env` (or `.env`) and fill in real values before deploying anywhere beyond your own machine. See `.env.example` for details on `JWT_SECRET`, `ALLOWED_ORIGINS`, `TRUST_PROXY`, and `PORT`.

**Never commit a filled-in `portal.env` or `.env` file.** Both are gitignored. If real credentials were ever committed to this repo's history, rotate them (change `JWT_SECRET`, DB passwords, etc.) and scrub them from git history (e.g. with `git filter-repo` or BFG) — removing the file in a new commit is not enough, since old commits still contain it.

## Security notes

- **Public registration** (`POST /api/auth/register`) can only create `student` accounts. Faculty and admin accounts must be created by an existing admin via `POST /api/admin/users` (requires an admin's auth token).
- **Passwords** must be at least 8 characters and include an uppercase letter, a lowercase letter, and a number.
- **Login attempts** are rate-limited per IP+email (8 attempts per 15 minutes) to slow down brute-force attempts. This is in-memory and per-process — fine for a single instance, but back it with Redis or similar if you run multiple instances behind a load balancer.
- **Logout** (`POST /api/auth/logout`) revokes the current token server-side via an in-memory blocklist, in addition to the client clearing its stored token.
- **CORS** only allows the origins listed in `ALLOWED_ORIGINS`.
- **Uploads** are limited to 15MB and a whitelist of document/image MIME types.
- The demo seed accounts (`student123`, `faculty123`, `admin123`) don't meet the password policy above — that's fine since they're inserted directly, but change them (or delete the seeded accounts) before any real deployment.

## Notes

The frontend proxies `/api` to the API server during development (see `vite.config.js`).

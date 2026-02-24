# Geek Chat

A messenger web app with a Laravel API and a Next.js frontend. You get user auth, direct chats, optional E2E-style encrypted dialogs, file sharing, and an admin panel. The app can be set up via a browser-based startup wizard.

**Stack:** Laravel 12 (API), Next.js 16 (React 19), Laravel Sanctum for auth. Backend supports MySQL, PostgreSQL, SQL Server, or SQLite. UI supports English and Persian (fa).

## Requirements

- **PHP** 8.2+ (with extensions used by Laravel: curl, gd, pdo, etc.)
- **Node.js** (v18+ recommended for Next 16)
- **Composer**
- A database (MySQL, PostgreSQL, SQL Server, or SQLite)

## Getting started

1. Clone the repo and install dependencies:

   ```bash
   cd geek-chat
   npm install
   cd laravel-app && composer install && cd ..
   cd next-app && npm install && cd ..
   ```

2. Run both backend and frontend (from repo root):

   ```bash
   npm run dev
   ```

   This starts the Laravel server and the Next.js dev server (see root `package.json`). Open the frontend URL (e.g. `http://localhost:3000`). The first time you run the app, you’ll go through the startup flow: set database and env, run migrations/seed, and create the first admin user. After that the app is ready to use.

3. For production you’ll need to build the Next app (`npm run build` in `next-app`), point your web server at the Laravel `laravel-app/public` (or your API URL), and set `APP_URL` and `APP_FRONTEND_URL` in Laravel’s `.env`. There’s a script under `scripts/laravel-writable-permissions.sh` for making Laravel’s writable paths correct on Linux (database, storage, `.env`, etc.) when deploying.

## Project layout

- `laravel-app/` — Laravel API (auth, chat, profile, admin, startup, captcha, etc.)
- `next-app/` — Next.js app (login/signup, chat UI, admin pages, optional Capacitor for mobile)
- `scripts/` — Deployment helpers (e.g. Laravel permissions)

Auth is session/cookie-based via Sanctum. Chat features include one-to-one dialogs, optional encrypted dialogs, and file attachments. Admin can manage users and chats and change system settings.

## License

ISC. Author: Mahdi Khansari.

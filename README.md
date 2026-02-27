# Geek Chat


Easy to deploy web-based messenger app, powered by Laravel API and Next.js frontend.

**With this source code, you get:**
- One-click startup wizard (Inspired by Wordpress)
- Direct chats with file sending
- Optional E2E encrypted dialogs
- An admin panel to manage users and chats
- Efficient live polling system

**Stack:** Laravel 12 (API), Next.js 16 (React 19), Laravel Sanctum for auth. Backend supports MySQL, PostgreSQL, SQL Server, or SQLite. UI supports English and Persian (fa).

## Requirements

- **PHP** 8.2+ (with extensions used by Laravel: curl, gd, pdo, etc.)
- **Node.js** (v20+)
- **Composer**
- A database (MySQL, PostgreSQL, SQL Server) Or optionally automatic SQLite database generation is available. 

## Getting started with prebuilt (ready-to-deploy version)

1. **Download** the latest release from the [Releases](https://github.com/mahdi-g01/geek-chat/releases) page and extract the archive (e.g. into `/var/www/geek-chat` or your web root).

2. Open the app in a browser. You’ll be guided through the **startup wizard**, which sets database connection, creates the database (or uses SQLite), and lets you create the first admin user. No manual `.env` editing required.

3. **Laravel writable paths (Linux):** So Laravel can write to storage, logs, and database, run from the project root:
   ```bash
   bash scripts/laravel-writable-permissions.sh
   ```
   Adjust the script path if your `api` folder lives elsewhere.

### Apache / shared hosting

Extract the archive and point your document root at the extracted folder (or at the folder that contains `api/` and the frontend files). Open the site in a browser and **follow the wizard** (database config and admin user/password). The build includes an `api/.htaccess` that blocks direct access to everything except `api/public/` and routes requests to `api/public/index.php`. No extra server configuration is needed—copy, run, and use the wizard.

### Nginx

Nginx does not use `.htaccess`. You must configure the server so that only `api/public` is used for the API; otherwise `.env`, `config/`, and other sensitive files could be exposed. Add a snippet like this to your server block (set `root` to your deployment path, e.g. `/var/www/geek-chat`):

```nginx
root /var/www/geek-chat;

# Block direct access to anything under /api that is not in api/public/
location ~ ^/api/(?!public($|/)).+ {
    return 403;
}

location /api {
    try_files $uri $uri/ /api/public/index.php?$query_string;
}

location ~ ^/api/public/index\.php$ {
    fastcgi_pass unix:/var/run/php/php-fpm.sock;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    include fastcgi_params;
}
```

Then open the app in a browser and **follow the wizard** (database and admin setup).

## Wanna make your own version of GeekChat?

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

'use strict';

import * as fs from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from 'node:url';
import {execSync} from "child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.info('Building static project...\n\n');

const buildDist = "dist";
const nextOutDir = "next-app/out";

await fs.rmSync(buildDist, { recursive: true, force: true });

const laravelProductionFilesForCopy = [
    "app",
    "bootstrap",
    "config",
    "database/factories",
    "database/migrations",
    "database/seeders",
    "lang",
    "public/.htaccess",
    "public/index.php",
    "resources",
    "routes",
    "vendor",
    ".env.template",
    "artisan",
    "composer.json",
    "composer.lock",
    "package.json",
    "phpunit.xml",
    "vite.config.js",
];

const laravelProductionFilesForGenerate = [
    "storage",
    "storage/app",
    "storage/app/private",
    "storage/app/public",
    "storage/logs",
];

console.info('Building Next.js app...');

await execSync('npm run build', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..', 'next-app'),
});

console.info('Next.js app built successfully\n\nCopying Next.js output to dist...\n\n');

await fs.cpSync(nextOutDir, buildDist, { recursive: true });

console.info('Copying laravel project to dist...\n\n');

for (const src of laravelProductionFilesForCopy) {
    fs.cpSync(
        path.join("laravel-app", src),
        path.join(buildDist, "api", src),
        { recursive: true }
    );
}

for (const src of laravelProductionFilesForGenerate) {
    fs.mkdirSync(path.join(buildDist, "api", src), { recursive: true });
}

console.info('Making default env file...');

await fs.cpSync(
    "laravel-app/.env.default", 
    path.join(buildDist, "api", ".env")
);

await fs.writeFileSync(path.join(buildDist, "api", ".htaccess"), `
    <IfModule mod_rewrite.c>
        RewriteEngine On

        # Deny direct access to any real file/dir that is NOT under public/
        RewriteCond %{REQUEST_FILENAME} -f [OR]
        RewriteCond %{REQUEST_FILENAME} -d
        RewriteCond %{REQUEST_URI} !^/api/public(/|$) [NC]
        RewriteRule ^ - [F,L]

        # Pass auth headers to PHP
        RewriteCond %{HTTP:Authorization} .
        RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
        RewriteCond %{HTTP:x-xsrf-token} .
        RewriteRule .* - [E=HTTP_X_XSRF_TOKEN:%{HTTP:X-XSRF-Token}]

        # Trailing slash redirect
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_URI} (.+)/$
        RewriteRule ^ %1 [L,R=301]

        # Front controller: send non-file requests to Laravel
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^(.*)$ public/index.php [L,QSA]
    </IfModule>
`);

console.info('Copying script files...');

await fs.cpSync(
    "scripts/laravel-writable-permissions.sh",
    path.join(buildDist, "scripts", "laravel-writable-permissions.sh")
);

console.info('Static project built successfully');

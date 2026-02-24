#!/usr/bin/env bash
#
# Laravel writable permissions script (Linux)
#
# For the final static build only. This script is placed in the built output
# next to the static Next app and the api/ folder. Expected layout:
#
#   index.html
#   _next/...
#   api/           <- Laravel app (database/, storage/, .env, gc.lock, etc.)
#   scripts/
#     laravel-writable-permissions.sh
#
# Grants the web server user write access to paths used by Laravel and the
# startup service: database/, storage/, .env, gc.lock, bootstrap/cache, public/
#
# Usage: sudo ./laravel-writable-permissions.sh [DEPLOY_ROOT] [WEB_USER]
#   DEPLOY_ROOT  Path to deployment root (default: parent dir of this script)
#                Must contain api/ (Laravel app).
#   WEB_USER     Web server user, e.g. www-data, nginx (default: www-data)
#
# Example:
#   sudo ./laravel-writable-permissions.sh
#   sudo ./laravel-writable-permissions.sh /var/www/geek-chat
#   sudo ./laravel-writable-permissions.sh /var/www/geek-chat nginx

set -e

# Require root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run with sudo (or as root)." >&2
   echo "Usage: sudo $0 [DEPLOY_ROOT] [WEB_USER]" >&2
   exit 1
fi

# Resolve deploy root: arg, or parent of directory containing this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_ROOT="${1:-$(dirname "$SCRIPT_DIR")}"
WEB_USER="${2:-www-data}"

LARAVEL_APP="${DEPLOY_ROOT}/api"

if [[ ! -d "$LARAVEL_APP" ]]; then
   echo "Laravel app directory not found: $LARAVEL_APP (expected api/ inside deploy root)" >&2
   exit 1
fi

if ! id "$WEB_USER" &>/dev/null; then
   echo "User '$WEB_USER' does not exist. Use: $0 [DEPLOY_ROOT] [WEB_USER]" >&2
   exit 1
fi

echo "Deploy root:  $DEPLOY_ROOT"
echo "Laravel app:  $LARAVEL_APP (api/)"
echo "Web user:     $WEB_USER"
echo ""

# Directories that must be writable (recursive)
for dir in database storage bootstrap/cache public; do
   path="${LARAVEL_APP}/${dir}"
   if [[ -d "$path" ]]; then
      chown -R "${WEB_USER}:${WEB_USER}" "$path"
      chmod -R u+rwX,g+rwX "$path"
      echo "OK (dir)  $path"
   else
      mkdir -p "$path"
      chown -R "${WEB_USER}:${WEB_USER}" "$path"
      chmod -R u+rwX,g+rwX "$path"
      echo "OK (new)  $path"
   fi
done

# Files used by startup service (create if missing, then set owner)
# .env and gc.lock: create if missing; .env.template: only fix permissions if present
for file in .env gc.lock; do
   path="${LARAVEL_APP}/${file}"
   [[ -f "$path" ]] || touch "$path"
   chown "${WEB_USER}:${WEB_USER}" "$path"
   chmod u+rw "$path"
   echo "OK (file) $path"
done
if [[ -f "${LARAVEL_APP}/.env.template" ]]; then
   chown "${WEB_USER}:${WEB_USER}" "${LARAVEL_APP}/.env.template"
   chmod u+rw "${LARAVEL_APP}/.env.template"
   echo "OK (file) ${LARAVEL_APP}/.env.template"
fi

# Ensure storage subdirs exist (Laravel expects these)
for sub in storage/framework/sessions storage/framework/cache/data storage/framework/views storage/logs storage/app/public storage/app/private; do
   path="${LARAVEL_APP}/${sub}"
   if [[ ! -d "$path" ]]; then
      mkdir -p "$path"
      chown -R "${WEB_USER}:${WEB_USER}" "$path"
      chmod -R u+rwX,g+rwX "$path"
      echo "OK (new)  $path"
   fi
done

echo ""
echo "Done. Laravel writable paths are owned by ${WEB_USER} and writable."

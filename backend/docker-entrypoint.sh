#!/bin/sh
set -eu

UPLOAD_DIR="${UPLOAD_DIR:-/var/www/html/uploads}"

mkdir -p "$UPLOAD_DIR"

if [ -f /usr/local/share/trendlama-upload.htaccess ]; then
  cp /usr/local/share/trendlama-upload.htaccess "$UPLOAD_DIR/.htaccess"
fi

chown -R www-data:www-data "$UPLOAD_DIR" || true

exec "$@"
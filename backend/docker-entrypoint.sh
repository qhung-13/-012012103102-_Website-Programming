#!/bin/sh
set -eu

runtime_port="${PORT:-10000}"

case "$runtime_port" in
  ''|*[!0-9]*)
    echo "PORT phải là số nguyên." >&2
    exit 1
    ;;
esac

echo "Listen ${runtime_port}" > /etc/apache2/ports.conf

sed -ri \
  "s#<VirtualHost \*:[0-9]+>#<VirtualHost *:${runtime_port}>#" \
  /etc/apache2/sites-available/000-default.conf

upload_root="${UPLOAD_DIR:-/var/www/html/uploads}"

mkdir -p \
  "${upload_root}/products" \
  "${upload_root}/blog" \
  "${upload_root}/avatars"

if [ ! -f "${upload_root}/.htaccess" ]; then
  cp /usr/local/share/trendlama-upload.htaccess \
    "${upload_root}/.htaccess"
fi

chown -R www-data:www-data "${upload_root}"

exec apache2-foreground
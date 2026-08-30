FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite headers expires

WORKDIR /var/www/html

COPY . /var/www/html/

COPY docker-entrypoint.sh /usr/local/bin/roxbusi-entrypoint

COPY uploads/.htaccess /usr/local/share/roxbusi-upload.htaccess

RUN find /var/www/html -type d -exec chmod 0755 {} \; \
    && find /var/www/html -type f -exec chmod 0644 {} \; \
    && chmod 0755 /usr/local/bin/roxbusi-entrypoint \
    && chown -R www-data:www-data /var/www/html/uploads

# Render secret files (/etc/secrets/*) are readable by group 1000.
# Add Apache/PHP user (www-data) to that group.
RUN if getent group 1000 >/dev/null; then \
        SECRET_GROUP="$(getent group 1000 | cut -d: -f1)"; \
    else \
        groupadd -g 1000 rendersecrets; \
        SECRET_GROUP="rendersecrets"; \
    fi \
    && usermod -aG "$SECRET_GROUP" www-data

ENV PORT=10000

EXPOSE 10000

CMD ["roxbusi-entrypoint"]
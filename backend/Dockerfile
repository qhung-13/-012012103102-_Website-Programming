FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
    && a2enmod rewrite headers expires

WORKDIR /var/www/html

COPY . /var/www/html/
COPY docker-entrypoint.sh /usr/local/bin/trendlama-entrypoint
COPY uploads/.htaccess /usr/local/share/trendlama-upload.htaccess

RUN find /var/www/html -type d -exec chmod 0755 {} \; \
    && find /var/www/html -type f -exec chmod 0644 {} \; \
    && chmod 0755 /usr/local/bin/trendlama-entrypoint \
    && chown -R www-data:www-data /var/www/html/uploads

ENV PORT=10000

EXPOSE 10000

CMD ["trendlama-entrypoint"]
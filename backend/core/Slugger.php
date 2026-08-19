<?php

class Slugger
{
    public static function make(string $value, string $fallback = 'item'): string
    {
        $value = trim($value);
        $ascii = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
        $source = $ascii !== false && $ascii !== '' ? $ascii : $value;
        $slug = strtolower(trim((string) preg_replace('/[^a-zA-Z0-9]+/', '-', $source), '-'));

        return $slug !== '' ? $slug : $fallback;
    }
}

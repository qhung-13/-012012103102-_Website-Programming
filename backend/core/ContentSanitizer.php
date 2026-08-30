<?php

class ContentSanitizer
{
    /**
     * Rich text tối giản: chỉ giữ các thẻ định dạng an toàn.
     * Các liên kết chỉ nhận http(s)/mailto và được gắn thuộc tính an toàn cố định.
     */
    public static function richText(?string $html): string
    {
        $html = str_replace("\0", '', (string) $html);
        $html = preg_replace(
            '#<(script|style|iframe|object|embed|svg|math|form|input|button)[^>]*>.*?</\1\s*>#is',
            '',
            $html
        ) ?? '';
        $html = strip_tags(
            $html,
            '<p><br><strong><em><b><i><u><s><ul><ol><li><h2><h3><h4><blockquote><pre><code><hr><a>'
        );
        $html = preg_replace_callback(
            '/<([a-z][a-z0-9]*)\b([^>]*)>/i',
            static function (array $matches): string {
                $tag = strtolower($matches[1]);
                if ($tag !== 'a') return '<' . $tag . '>';

                if (preg_match('/\bhref\s*=\s*["\']([^"\']+)["\']/i', $matches[2], $href)) {
                    $url = trim($href[1]);
                    if (preg_match('#^(?:https?://|mailto:)[^\s]+$#i', $url)) {
                        return '<a href="' . htmlspecialchars($url, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '" target="_blank" rel="noopener noreferrer">';
                    }
                }
                return '<a>';
            },
            $html
        ) ?? '';

        return trim($html);
    }
}

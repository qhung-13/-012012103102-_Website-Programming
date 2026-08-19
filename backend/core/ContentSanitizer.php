<?php

class ContentSanitizer
{
    /**
     * Rich text tối giản: chỉ giữ các thẻ định dạng an toàn và xóa toàn bộ thuộc tính.
     * Việc xóa thuộc tính loại bỏ event handler, style, URL javascript và tracking HTML.
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
            '<p><br><strong><em><b><i><u><s><ul><ol><li><h2><h3><h4><blockquote><pre><code><hr>'
        );
        $html = preg_replace_callback(
            '/<([a-z][a-z0-9]*)\b[^>]*>/i',
            static fn (array $matches): string => '<' . strtolower($matches[1]) . '>',
            $html
        ) ?? '';

        return trim($html);
    }
}

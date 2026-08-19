<?php
/**
 * Minimal HS256 JWT implementation — no external dependencies required,
 * so this runs on plain PHP/XAMPP without Composer.
 */

class JWT
{
    private static function secret(): string
    {
        $secret = trim((string) env('JWT_SECRET', ''));
        $blockedValues = ['change-this-secret-in-env', 'your-secret-key', 'secret'];

        if (strlen($secret) < 32 || in_array(strtolower($secret), $blockedValues, true)) {
            throw new RuntimeException('JWT_SECRET chưa được cấu hình an toàn (tối thiểu 32 ký tự).');
        }

        return $secret;
    }

    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): ?string
    {
        $padded = str_pad($data, strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=');
        $decoded = base64_decode(strtr($padded, '-_', '+/'), true);
        return $decoded === false ? null : $decoded;
    }

    public static function encode(array $payload, ?int $expiresInSeconds = null): string
    {
        $secret = self::secret();

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload['iat'] = time();
        if ($expiresInSeconds !== null) {
            $payload['exp'] = time() + $expiresInSeconds;
        }

        $segments = [
            self::base64UrlEncode(json_encode($header, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)),
            self::base64UrlEncode(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)),
        ];

        $signature = hash_hmac('sha256', implode('.', $segments), $secret, true);
        $segments[] = self::base64UrlEncode($signature);

        return implode('.', $segments);
    }

    /**
     * Returns the decoded payload, or null if the token is invalid/expired.
     */
    public static function decode(string $token): ?array
    {
        $secret = self::secret();
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $headerJson = self::base64UrlDecode($headerB64);
        $payloadJson = self::base64UrlDecode($payloadB64);
        $actualSignature = self::base64UrlDecode($signatureB64);
        if ($headerJson === null || $payloadJson === null || $actualSignature === null) {
            return null;
        }

        $header = json_decode($headerJson, true);
        if (!is_array($header) || ($header['alg'] ?? null) !== 'HS256' || ($header['typ'] ?? null) !== 'JWT') {
            return null;
        }

        $expectedSignature = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);

        if (!hash_equals($expectedSignature, $actualSignature)) {
            return null;
        }

        $payload = json_decode($payloadJson, true);

        if (!is_array($payload)) {
            return null;
        }

        if (
            !isset($payload['sub'], $payload['iat'], $payload['exp'])
            || !is_numeric($payload['sub'])
            || !is_numeric($payload['iat'])
            || !is_numeric($payload['exp'])
            || (int) $payload['sub'] < 1
        ) {
            return null;
        }

        $now = time();
        if ((int) $payload['iat'] > $now + 60 || (int) $payload['exp'] <= (int) $payload['iat'] || $now >= (int) $payload['exp']) {
            return null;
        }

        return $payload;
    }
}

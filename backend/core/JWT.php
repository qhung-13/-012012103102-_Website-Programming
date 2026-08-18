<?php
/**
 * Minimal HS256 JWT implementation — no external dependencies required,
 * so this runs on plain PHP/XAMPP without Composer.
 */

class JWT
{
    private static function base64UrlEncode(string $data): string
    {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }

    private static function base64UrlDecode(string $data): string
    {
        $padded = str_pad($data, strlen($data) % 4 === 0 ? strlen($data) : strlen($data) + (4 - strlen($data) % 4), '=');
        return base64_decode(strtr($padded, '-_', '+/'));
    }

    public static function encode(array $payload, ?int $expiresInSeconds = null): string
    {
        $secret = env('JWT_SECRET', 'change-this-secret-in-env');

        $header = ['alg' => 'HS256', 'typ' => 'JWT'];
        $payload['iat'] = time();
        if ($expiresInSeconds !== null) {
            $payload['exp'] = time() + $expiresInSeconds;
        }

        $segments = [
            self::base64UrlEncode(json_encode($header)),
            self::base64UrlEncode(json_encode($payload)),
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
        $secret = env('JWT_SECRET', 'change-this-secret-in-env');
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return null;
        }

        [$headerB64, $payloadB64, $signatureB64] = $parts;

        $expectedSignature = hash_hmac('sha256', "$headerB64.$payloadB64", $secret, true);
        $actualSignature = self::base64UrlDecode($signatureB64);

        if (!hash_equals($expectedSignature, $actualSignature)) {
            return null;
        }

        $payload = json_decode(self::base64UrlDecode($payloadB64), true);

        if (!is_array($payload)) {
            return null;
        }

        if (isset($payload['exp']) && time() > $payload['exp']) {
            return null; // expired
        }

        return $payload;
    }
}

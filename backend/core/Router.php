<?php
/**
 * Tiny router — maps "METHOD /path/{param}" to a controller callback.
 * Good enough for a REST API without pulling in a full framework.
 */

class Router
{
    private array $routes = [];

    public function get(string $path, $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, $handler): void
    {
        $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', trim($path, '/'));
        preg_match_all('#\{([a-zA-Z_]+)\}#', $path, $matches);
        $paramNames = $matches[1];

        $this->routes[] = [
            'method' => $method,
            'pattern' => '#^' . $pattern . '$#',
            'paramNames' => $paramNames,
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = trim(parse_url($uri, PHP_URL_PATH), '/');

        $path = preg_replace('#^(backend/)?api(?:/|$)#', '', $path);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (preg_match($route['pattern'], $path, $matches)) {
                array_shift($matches);
                $params = $route['paramNames'] ? array_combine($route['paramNames'], $matches) : [];

                if (!is_callable($route['handler'])) {
                    error_log('Route handler is not callable: ' . self::describeHandler($route['handler']));
                    Response::error('Cấu hình route không hợp lệ.', 500);
                    return;
                }

                if ($params) {
                    call_user_func($route['handler'], $params);
                } else {
                    call_user_func($route['handler']);
                }

                return;
            }
        }

        Response::error('Không tìm thấy API: ' . $method . ' /' . $path, 404);
    }

    private static function describeHandler($handler): string
    {
        if (is_array($handler) && count($handler) === 2) {
            $target = is_object($handler[0]) ? get_class($handler[0]) : (string) $handler[0];
            return $target . '::' . (string) $handler[1];
        }

        if (is_string($handler)) {
            return $handler;
        }

        if (is_object($handler)) {
            return get_class($handler);
        }

        return gettype($handler);
    }
}
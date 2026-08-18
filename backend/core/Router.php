<?php
/**
 * Tiny router — maps "METHOD /path/{param}" to a controller callback.
 * Good enough for a REST API without pulling in a full framework.
 */

class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function delete(string $path, callable $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', trim($path, '/'));
        $paramNames = [];
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
        // Strip a leading "api" or "backend/api" prefix so this works
        // whether the app is served from the domain root or a subfolder.
        $path = preg_replace('#^(backend/)?api/#', '', $path);

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }
            if (preg_match($route['pattern'], $path, $matches)) {
                array_shift($matches);
                $params = array_combine($route['paramNames'], $matches);
                call_user_func($route['handler'], $params);
                return;
            }
        }

        Response::error('Route not found: ' . $method . ' /' . $path, 404);
    }
}

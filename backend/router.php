<?php
// Dev-only router for php -S
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api/process-wish') {
    require __DIR__ . '/api/process-wish.php';
    return true;
}

return false;

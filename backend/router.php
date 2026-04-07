<?php
// Dev-only router for php -S
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

if ($uri === '/api/process-wish') {
    require __DIR__ . '/api/process-wish.php';
    return true;
}

if ($uri === '/api/generate-visualizations') {
    require __DIR__ . '/api/generate-visualizations.php';
    return true;
}

if ($uri === '/api/generate-affirmation') {
    require __DIR__ . '/api/generate-affirmation.php';
    return true;
}

return false;

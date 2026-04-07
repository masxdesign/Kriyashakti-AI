<?php

// Load .env file (one.com shared hosting doesn't expose env vars automatically)
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim(str_replace(["\r", "\n"], '', $value)));
    }
}

// CORS headers — sent on every request including preflight
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: 'https://masxdesign.github.io';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
} else {
    header("Access-Control-Allow-Origin: {$allowedOrigin}");
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Max-Age: 86400');
header('Content-Type: application/json');

// Handle CORS preflight — must respond before any other logic
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed.']);
    exit;
}

require_once __DIR__ . '/../lib/OpenRouterClient.php';
require_once __DIR__ . '/../lib/WishExtractor.php';
require_once __DIR__ . '/../lib/KriyashaktiGenerator.php';
require_once __DIR__ . '/../lib/VisualizationGenerator.php';

function jsonError(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

// Parse request body
$body = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($body)) {
    jsonError('Invalid request body.');
}
$wish = trim($body['wish'] ?? '');

if (!$wish) {
    jsonError('Please describe a personal goal or desire.');
}

// Bootstrap
$apiKey = getenv('OPENROUTER_API_KEY');
if (!$apiKey) {
    jsonError('API key not configured. ENV file found: ' . (file_exists(__DIR__ . '/../.env') ? 'yes' : 'no'), 500);
}

$client = new OpenRouterClient($apiKey);
$extractor = new WishExtractor($client);
$kriyashaktiGen = new KriyashaktiGenerator($client);
$visualizationGen = new VisualizationGenerator($client);

// Run pipeline
try {
    // Stage 1: extract wishes
    $extractedWishes = $extractor->extract($wish);

    // Stage 2 + 3: generate Kriyashakti and visualizations for each wish
    $data = [];
    foreach ($extractedWishes as $extractedWish) {
        $options = $kriyashaktiGen->generate($extractedWish);
        $visualizations = $visualizationGen->generate($options);
        $data[] = [
            'wish' => $extractedWish,
            'options' => $options,
            'visualizations' => $visualizations,
        ];
    }

    echo json_encode([
        'wish' => $wish,
        'data' => $data,
    ]);

} catch (RuntimeException $e) {
    $msg = $e->getMessage();
    if ($msg === 'Please describe a personal goal or desire.') {
        jsonError($msg, 400);
    } else {
        jsonError('Something went wrong. Please try again.', 500);
    }
}

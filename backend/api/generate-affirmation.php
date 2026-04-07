<?php

$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#')) continue;
        if (!str_contains($line, '=')) continue;
        [$key, $value] = explode('=', $line, 2);
        putenv(trim($key) . '=' . trim(str_replace(["\r", "\n"], '', $value)));
    }
}

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
require_once __DIR__ . '/../lib/AffirmationGenerator.php';

function jsonError(string $message, int $status = 400): void
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true);
if (json_last_error() !== JSON_ERROR_NONE || !is_array($body)) {
    jsonError('Invalid request body.');
}

$option = trim($body['option'] ?? '');
if (!$option) {
    jsonError('option must be a non-empty string.');
}
$visualization = isset($body['visualization']) ? trim($body['visualization']) : null;

$apiKey = getenv('OPENROUTER_API_KEY');
if (!$apiKey) {
    jsonError('Something went wrong. Please try again.', 500);
}

try {
    $client = new OpenRouterClient($apiKey);
    $affirmationGen = new AffirmationGenerator($client);
    $affirmation = $affirmationGen->generate($option, $visualization ?: null);

    echo json_encode(['affirmation' => $affirmation]);
} catch (RuntimeException $e) {
    jsonError($e->getMessage(), 500);
}

<?php

// CORS: allow only from the configured GitHub Pages origin
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedOrigin && $origin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
} elseif (!$allowedOrigin) {
    // Dev fallback: allow all origins when ALLOWED_ORIGIN is not set
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Handle CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
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
$wish = trim($body['wish'] ?? '');

if (!$wish) {
    jsonError('Please describe a personal goal or desire.');
}

// Bootstrap
$apiKey = getenv('OPENROUTER_API_KEY');
if (!$apiKey) {
    jsonError('Something went wrong. Please try again.', 500);
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
    // Known user-facing messages pass through; all others become generic
    $userFacing = ['Please describe a personal goal or desire.', 'Something went wrong. Please try again.'];
    if (!in_array($msg, $userFacing, true)) {
        $msg = 'Something went wrong. Please try again.';
    }
    jsonError($msg, 400);
}

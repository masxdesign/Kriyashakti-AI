<?php

require_once __DIR__ . '/JsonParser.php';

class KriyashaktiGenerator
{
    private $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    /**
     * Generate exactly 5 Kriyashakti statements for one wish.
     *
     * @param string $wish A single extracted wish ("I want ...")
     * @return string[] Array of exactly 5 Kriyashakti statements
     * @throws RuntimeException on parse error or wrong count
     */
    public function generate(string $wish): array
    {
        $system = <<<PROMPT
You are a Kriyashakti statement writer. A Kriyashakti statement is a short, positive, present-tense or completed-state sentence expressing a desire as already fulfilled.

Rules:
- Generate EXACTLY 5 Kriyashakti statements for the given wish
- Each must be one sentence
- Use simple, heartfelt language
- Use a variety of openers such as: "So happy and grateful that", "So blessed that", "I feel fantastic that", "I am so thankful that", "I celebrate that"
- Express the end-state as already achieved
- Preserve the intent of the source wish
- Return ONLY valid JSON in this exact format, with no markdown fences:
{"options": ["...", "...", "...", "...", "..."]}
PROMPT;

        $raw = $this->client->complete($system, $wish);
        $parsed = JsonParser::parse($raw, ['options']);

        if (!is_array($parsed['options']) || count($parsed['options']) !== 5) {
            throw new RuntimeException('Something went wrong. Please try again.');
        }

        return array_map(
            fn($s) => rtrim($s, '.!') . '. So happy and grateful that this has materialized properly and rapidly!',
            $parsed['options']
        );
    }
}

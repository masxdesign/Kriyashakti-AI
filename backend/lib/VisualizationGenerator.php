<?php

require_once __DIR__ . '/JsonParser.php';

class VisualizationGenerator
{
    private $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    /**
     * Generate exactly 5 visualizations aligned by position to 5 Kriyashakti statements.
     *
     * @param string[] $options Array of exactly 5 Kriyashakti statements
     * @return string[] Array of exactly 5 visualization strings
     * @throws RuntimeException on parse error or wrong count
     */
    public function generate(array $options): array
    {
        $optionsJson = json_encode($options, JSON_UNESCAPED_UNICODE);

        $system = <<<PROMPT
You are a visualization writer. For each Kriyashakti statement provided, write a paired visualization — a short, sensory, grounded scene (1–3 sentences) that places the reader inside the fulfilled state described by that statement.

Rules:
- Generate EXACTLY 5 visualizations
- Each visualization aligns by position to one Kriyashakti statement in the input array
- Write in second person ("You are...", "You feel...")
- Use specific sensory detail: sights, sounds, physical sensations, emotions
- The tone should be calm, certain, and already arrived
- Return ONLY valid JSON in this exact format, with no markdown fences:
{"visualizations": ["...", "...", "...", "...", "..."]}
PROMPT;

        $userMessage = "Kriyashakti statements: {$optionsJson}";
        $raw = $this->client->complete($system, $userMessage);
        $parsed = JsonParser::parse($raw, ['visualizations']);

        if (!is_array($parsed['visualizations']) || count($parsed['visualizations']) !== 5) {
            throw new RuntimeException('Something went wrong. Please try again.');
        }

        return $parsed['visualizations'];
    }
}

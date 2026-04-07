<?php

require_once __DIR__ . '/JsonParser.php';

class WishExtractor
{
    private $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    /**
     * Extract distinct wishes from raw user input.
     *
     * @param string $rawWish Raw user text
     * @return string[] Array of extracted wish strings
     * @throws RuntimeException if input is not a valid personal desire, or on parse error
     */
    public function extract(string $rawWish): array
    {
        $system = <<<PROMPT
You are a wish extraction assistant. Your job is to read a user's free-text expression of desire and extract distinct personal wishes from it.

Rules:
- If the input does not contain a valid personal desire or goal, respond ONLY with: {"error": "Please describe a personal goal or desire."}
- Otherwise, extract each distinct wish as a simple first-person statement starting with "I want"
- Group dependent wishes together into one item
- Remove duplicates
- Normalize wording to be simple and clear
- Return ONLY valid JSON in this exact format, with no markdown fences:
{"options": ["I want ...", "I want ..."]}
PROMPT;

        $raw = $this->client->complete($system, $rawWish);
        $parsed = JsonParser::parse($raw, []);

        if (isset($parsed['error'])) {
            throw new RuntimeException($parsed['error']);
        }

        if (!isset($parsed['options']) || !is_array($parsed['options']) || count($parsed['options']) === 0) {
            throw new RuntimeException('Something went wrong. Please try again.');
        }

        return $parsed['options'];
    }
}

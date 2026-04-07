<?php

require_once __DIR__ . '/JsonParser.php';

class AffirmationGenerator
{
    private $client;

    public function __construct($client)
    {
        $this->client = $client;
    }

    /**
     * Generate a Rev. Ike-style affirmation for a single Kriyashakti statement.
     *
     * @param string $option The Kriyashakti statement
     * @return string The affirmation text (newline-separated lines)
     * @throws RuntimeException on parse error
     */
    public function generate(string $option, ?string $visualization = null): string
    {
        $system = <<<'PROMPT'
You write short affirmations in a Rev. Ike style: bold, grateful, abundant.

Input:
- Statement
- Optional visualization

Rules:
- First person, present tense
- 2–4 lines total (each sentence on a new line)
- No headings or explanations
- Tone: certain, wealthy, empowered
- Each sentence MUST be on its own line
- End with a strong closing line (e.g. "And so it is.")

Structure:
1. Gratitude + expand statement
2. Affirm abundance as natural/increasing
3. Close with certainty

Style:
Use phrases like "I give thanks," "This is my natural state."
No negativity or doubt.

OUTPUT FORMAT (STRICT):
Output ONLY raw JSON. No markdown. No explanation.

{"affirmation": "Line one.\nLine two.\nAnd so it is."}
PROMPT;

        $input = ['statement' => $option];
        if ($visualization) {
            $input['visualization'] = $visualization;
        }
        $userMessage = json_encode($input, JSON_UNESCAPED_UNICODE);

        $raw = $this->client->complete($system, $userMessage);
        $parsed = JsonParser::parse($raw, ['affirmation']);

        if (empty($parsed['affirmation']) || !is_string($parsed['affirmation'])) {
            throw new RuntimeException('Something went wrong. Please try again.');
        }

        return $parsed['affirmation'];
    }
}

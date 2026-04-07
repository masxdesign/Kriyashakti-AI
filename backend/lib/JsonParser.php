<?php

class JsonParser
{
    /**
     * Strip markdown code fences, decode JSON, and validate that expected keys exist.
     *
     * @param string $raw Raw string from LLM response
     * @param string[] $requiredKeys Keys that must exist in the decoded object
     * @return array Decoded associative array
     * @throws RuntimeException if decoding fails or required keys are missing
     */
    public static function parse(string $raw, array $requiredKeys = []): array
    {
        // Strip markdown fences: ```json ... ``` or ``` ... ```
        $stripped = preg_replace('/^```(?:json)?\s*/i', '', trim($raw));
        $stripped = preg_replace('/\s*```\s*$/', '', $stripped);
        $stripped = trim($stripped);

        $decoded = json_decode($stripped, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new RuntimeException('JSON decode error: ' . json_last_error_msg());
        }

        if (!is_array($decoded)) {
            throw new RuntimeException('Expected JSON object, got: ' . gettype($decoded));
        }

        foreach ($requiredKeys as $key) {
            if (!array_key_exists($key, $decoded)) {
                throw new RuntimeException("Missing required key: {$key}");
            }
        }

        return $decoded;
    }
}

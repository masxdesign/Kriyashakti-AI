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

        // Try direct decode first
        $decoded = json_decode($stripped, true);

        // If that fails, extract the first {...} block from the string (handles prose wrapping)
        if (json_last_error() !== JSON_ERROR_NONE) {
            $start = strpos($stripped, '{');
            $end   = strrpos($stripped, '}');
            if ($start !== false && $end !== false && $end > $start) {
                $stripped = substr($stripped, $start, $end - $start + 1);
                $decoded = json_decode($stripped, true);
            }
        }

        // If still failing, sanitize unescaped control characters inside string values
        if (json_last_error() !== JSON_ERROR_NONE) {
            $sanitized = preg_replace_callback(
                '/"(?:[^"\\\\]|\\\\.)*"/s',
                fn($m) => str_replace(["\n", "\r", "\t"], ['\n', '\r', '\t'], $m[0]),
                $stripped
            );
            $decoded = json_decode($sanitized, true);
        }

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

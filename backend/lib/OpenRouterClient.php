<?php

class OpenRouterClient
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct(string $apiKey, string $model = 'google/gemini-2.5-flash')
    {
        $this->apiKey = $apiKey;
        $this->model = $model;
    }

    /**
     * Send a prompt and return the raw text content from the first choice.
     *
     * @param string $systemPrompt
     * @param string $userMessage
     * @return string Raw text response from the model
     * @throws RuntimeException on HTTP or API error
     */
    public function complete(string $systemPrompt, string $userMessage): string
    {
        $payload = json_encode([
            'model' => $this->model,
            'messages' => [
                ['role' => 'system', 'content' => $systemPrompt],
                ['role' => 'user', 'content' => $userMessage],
            ],
        ]);

        $ch = curl_init($this->baseUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $payload,
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $this->apiKey,
                'HTTP-Referer: kriyashakti-ai',
                'X-Title: Kriyashakti AI',
            ],
            CURLOPT_TIMEOUT => 60,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            throw new RuntimeException('cURL error: ' . $curlError);
        }

        $decoded = json_decode($response, true);

        if ($httpCode !== 200 || isset($decoded['error'])) {
            $msg = $decoded['error']['message'] ?? "HTTP {$httpCode}";
            throw new RuntimeException('OpenRouter error: ' . $msg);
        }

        $content = $decoded['choices'][0]['message']['content'] ?? null;
        if ($content === null) {
            // Log full response for debugging
            file_put_contents(__DIR__ . '/../../debug.log', date('Y-m-d H:i:s') . "\nHTTP: {$httpCode}\nRESPONSE: " . $response . "\n\n", FILE_APPEND);
            throw new RuntimeException('OpenRouter error: empty response content. HTTP=' . $httpCode);
        }
        // Log content for debugging
        file_put_contents(__DIR__ . '/../../debug.log', date('Y-m-d H:i:s') . "\nCONTENT: " . $content . "\n\n", FILE_APPEND);
        return $content;
    }
}

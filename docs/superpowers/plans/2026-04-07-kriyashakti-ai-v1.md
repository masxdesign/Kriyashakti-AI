# Kriyashakti AI v1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a stateless web app where users write a messy wish in free text and receive structured Kriyashakti statements with paired visualizations.

**Architecture:** React/Vite SPA on GitHub Pages calls a single PHP endpoint (`POST /api/process-wish`) on an existing server; the PHP backend runs a three-stage AI pipeline against OpenRouter (Gemini 2.5 Flash) and returns structured JSON; the frontend renders each extracted wish with 5 Kriyashakti options and 5 visualizations in a card/slider layout.

**Tech Stack:** React 19, Vite 6, React Router (hash), TanStack Query v5, Tailwind CSS v4, PHP 8, OpenRouter (Gemini 2.5 Flash), GitHub Actions, GitHub Pages.

---

## File Map

### Frontend (`frontend/`)

| File | Responsibility |
|---|---|
| `frontend/package.json` | NPM dependencies and scripts |
| `frontend/vite.config.js` | Vite config with base path for GitHub Pages |
| `frontend/tailwind.config.js` | Tailwind config |
| `frontend/index.html` | HTML entry point |
| `frontend/src/main.jsx` | React entry, HashRouter, QueryClientProvider |
| `frontend/src/App.jsx` | Route definitions (`/` and `/result`) |
| `frontend/src/api/processWish.js` | Single fetch call to `/api/process-wish` |
| `frontend/src/pages/InputPage.jsx` | Page with WishForm; navigates to /result with response data |
| `frontend/src/pages/ResultPage.jsx` | Page that renders result data passed via router state |
| `frontend/src/components/WishForm.jsx` | Textarea + submit button; shows loading state inline |
| `frontend/src/components/OriginalWishCard.jsx` | Displays original wish text |
| `frontend/src/components/CoreIntentionsChips.jsx` | Renders extracted wish labels as pill chips |
| `frontend/src/components/ClarifiedWishSection.jsx` | One section per extracted wish with its suggestion slider |
| `frontend/src/components/SuggestionSlider.jsx` | Carousel/card navigation through 5 Kriyashakti+Visualization pairs |
| `.github/workflows/deploy.yml` | GitHub Actions: build Vite, publish to GitHub Pages |

### Backend (`backend/`)

| File | Responsibility |
|---|---|
| `backend/api/process-wish.php` | Entry point: validate, orchestrate pipeline, return JSON |
| `backend/lib/OpenRouterClient.php` | HTTP wrapper: POST to OpenRouter, return decoded array |
| `backend/lib/WishExtractor.php` | Stage 1: extract distinct wishes from raw input |
| `backend/lib/KriyashaktiGenerator.php` | Stage 2: generate 5 Kriyashakti statements for one wish |
| `backend/lib/VisualizationGenerator.php` | Stage 3: generate 5 visualizations for one set of statements |
| `backend/lib/JsonParser.php` | Strip markdown fences, JSON decode, validate fields |
| `backend/.env.example` | Template showing required env vars (no real key) |

---

## Task 1: Frontend scaffolding

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/vite.config.js`
- Create: `frontend/tailwind.config.js`
- Create: `frontend/index.html`
- Create: `frontend/src/main.jsx`
- Create: `frontend/src/App.jsx`

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "kriyashakti-ai",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^7.0.0",
    "@tanstack/react-query": "^5.0.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "vite": "^6.0.0"
  }
}
```

- [ ] **Step 2: Create `frontend/vite.config.js`**

The `base` path must match your GitHub Pages repo path (e.g. `/kriyashakti-ai/`). Update it after you know the repo name.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/kriyashakti-ai/', // update to match your GitHub repo name
})
```

- [ ] **Step 3: Create `frontend/tailwind.config.js`**

```js
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
}
```

- [ ] **Step 4: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Kriyashakti AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `frontend/src/main.jsx`**

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <App />
      </HashRouter>
    </QueryClientProvider>
  </StrictMode>
)
```

- [ ] **Step 6: Create `frontend/src/index.css`**

```css
@import "tailwindcss";
```

- [ ] **Step 7: Create `frontend/src/App.jsx`**

```jsx
import { Routes, Route } from 'react-router-dom'
import InputPage from './pages/InputPage.jsx'
import ResultPage from './pages/ResultPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<InputPage />} />
      <Route path="/result" element={<ResultPage />} />
    </Routes>
  )
}
```

- [ ] **Step 8: Install dependencies and verify dev server starts**

```bash
cd frontend
npm install
npm run dev
```

Expected: Vite dev server running at `http://localhost:5173` (or similar). No errors.

- [ ] **Step 9: Commit**

```bash
cd ..
git add frontend/
git commit -m "feat: scaffold React/Vite/Tailwind frontend"
```

---

## Task 2: API client module

**Files:**
- Create: `frontend/src/api/processWish.js`

This is the only place the backend URL is referenced on the frontend.

- [ ] **Step 1: Create `frontend/src/api/processWish.js`**

```js
const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://your-php-server.com'

/**
 * @param {string} wish
 * @returns {Promise<{ wish: string, data: Array<{ wish: string, options: string[], visualizations: string[] }> }>}
 */
export async function processWish(wish) {
  const response = await fetch(`${API_BASE}/api/process-wish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wish }),
  })

  const json = await response.json()

  if (!response.ok || json.error) {
    throw new Error(json.error ?? 'Something went wrong. Please try again.')
  }

  return json
}
```

- [ ] **Step 2: Create `frontend/.env.example`**

```
VITE_API_BASE=https://your-php-server.com
```

- [ ] **Step 3: Create `frontend/.env.local` with real value**

```
VITE_API_BASE=https://your-actual-server.com
```

(Do not commit `.env.local`. Add it to `.gitignore`.)

- [ ] **Step 4: Create `frontend/.gitignore`**

```
node_modules/
dist/
.env.local
.env
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/ frontend/.env.example frontend/.gitignore
git commit -m "feat: add API client module for process-wish endpoint"
```

---

## Task 3: WishForm component and InputPage

**Files:**
- Create: `frontend/src/components/WishForm.jsx`
- Create: `frontend/src/pages/InputPage.jsx`

- [ ] **Step 1: Create `frontend/src/components/WishForm.jsx`**

```jsx
export default function WishForm({ onSubmit, isLoading }) {
  function handleSubmit(e) {
    e.preventDefault()
    const wish = e.target.wish.value.trim()
    if (wish) onSubmit(wish)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-xl">
      <textarea
        name="wish"
        rows={6}
        disabled={isLoading}
        placeholder="Write your wish however it comes to you…"
        className="w-full rounded-2xl border border-stone-200 bg-white/70 p-4 text-base text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-300 resize-none disabled:opacity-50"
        required
      />
      <button
        type="submit"
        disabled={isLoading}
        className="self-end rounded-full bg-violet-600 px-8 py-3 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Shaping…' : 'Shape my wish'}
      </button>
    </form>
  )
}
```

- [ ] **Step 2: Create `frontend/src/pages/InputPage.jsx`**

```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { processWish } from '../api/processWish.js'
import WishForm from '../components/WishForm.jsx'

export default function InputPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(wish) {
    setIsLoading(true)
    setError(null)
    try {
      const result = await processWish(wish)
      navigate('/result', { state: { result } })
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-stone-50 flex flex-col items-center justify-center px-4 py-16 gap-8">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-2">Kriyashakti AI</h1>
        <p className="text-stone-500 text-base">
          Say it however it comes. We'll shape it into a clear Kriyashakti.
        </p>
      </div>

      <WishForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <p role="alert" className="text-sm text-red-600 max-w-xl text-center">
          {error}
        </p>
      )}
    </main>
  )
}
```

- [ ] **Step 3: Verify in browser**

Run `npm run dev` in `frontend/`. Open the app. You should see the headline, tagline, textarea, and button. The button should show "Shaping…" when clicked (it will fail with a network error since backend doesn't exist yet — that's fine).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/WishForm.jsx frontend/src/pages/InputPage.jsx
git commit -m "feat: add WishForm component and InputPage"
```

---

## Task 4: Result page components

**Files:**
- Create: `frontend/src/components/OriginalWishCard.jsx`
- Create: `frontend/src/components/CoreIntentionsChips.jsx`
- Create: `frontend/src/components/SuggestionSlider.jsx`
- Create: `frontend/src/components/ClarifiedWishSection.jsx`
- Create: `frontend/src/pages/ResultPage.jsx`

- [ ] **Step 1: Create `frontend/src/components/OriginalWishCard.jsx`**

```jsx
export default function OriginalWishCard({ wish }) {
  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-2">
        Your Original Wish
      </h2>
      <blockquote className="rounded-2xl border border-stone-100 bg-white/80 px-6 py-4 text-stone-700 text-base italic leading-relaxed">
        "{wish}"
      </blockquote>
    </section>
  )
}
```

- [ ] **Step 2: Create `frontend/src/components/CoreIntentionsChips.jsx`**

Each chip label is the `wish` string from each item in `data`.

```jsx
export default function CoreIntentionsChips({ wishes }) {
  return (
    <section className="w-full max-w-2xl">
      <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-3">
        Your Core Intentions
      </h2>
      <div className="flex flex-wrap gap-2">
        {wishes.map((wish, i) => (
          <span
            key={i}
            className="rounded-full bg-violet-100 px-4 py-1.5 text-sm text-violet-700 font-medium"
          >
            {wish}
          </span>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 3: Create `frontend/src/components/SuggestionSlider.jsx`**

This renders one card at a time from the 5 options+visualizations pairs with prev/next navigation.

```jsx
import { useState } from 'react'

export default function SuggestionSlider({ options, visualizations }) {
  const [index, setIndex] = useState(0)
  const total = options.length

  function prev() {
    setIndex(i => (i - 1 + total) % total)
  }
  function next() {
    setIndex(i => (i + 1) % total)
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border border-stone-100 bg-white/90 px-6 py-6 flex flex-col gap-4 min-h-[200px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-violet-400 mb-1">
            Kriyashakti Statement
          </p>
          <p className="text-stone-800 text-base font-medium leading-snug">
            {options[index]}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-400 mb-1">
            Visualization
          </p>
          <p className="text-stone-600 text-sm leading-relaxed">
            {visualizations[index]}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 px-1">
        <button
          onClick={prev}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          ← Prev
        </button>
        <span className="text-xs text-stone-400">
          {index + 1} / {total}
        </span>
        <button
          onClick={next}
          className="rounded-full px-4 py-1.5 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `frontend/src/components/ClarifiedWishSection.jsx`**

```jsx
import SuggestionSlider from './SuggestionSlider.jsx'

export default function ClarifiedWishSection({ item, index }) {
  return (
    <section className="w-full max-w-2xl">
      <h3 className="text-sm font-semibold text-stone-600 mb-3">
        Wish {index + 1}: {item.wish}
      </h3>
      <SuggestionSlider options={item.options} visualizations={item.visualizations} />
    </section>
  )
}
```

- [ ] **Step 5: Create `frontend/src/pages/ResultPage.jsx`**

If the user navigates to `/result` with no state (e.g. direct URL), redirect to `/`.

```jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import OriginalWishCard from '../components/OriginalWishCard.jsx'
import CoreIntentionsChips from '../components/CoreIntentionsChips.jsx'
import ClarifiedWishSection from '../components/ClarifiedWishSection.jsx'

export default function ResultPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const result = location.state?.result

  useEffect(() => {
    if (!result) navigate('/', { replace: true })
  }, [result, navigate])

  if (!result) return null

  const coreWishes = result.data.map(item => item.wish)

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-50 to-stone-50 flex flex-col items-center px-4 py-16 gap-10">
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-semibold text-stone-800 mb-1">Your Kriyashakti</h1>
        <p className="text-stone-400 text-sm">Here's what we shaped from your wish.</p>
      </div>

      <OriginalWishCard wish={result.wish} />
      <CoreIntentionsChips wishes={coreWishes} />

      {result.data.map((item, i) => (
        <ClarifiedWishSection key={i} item={item} index={i} />
      ))}

      <button
        onClick={() => navigate('/')}
        className="rounded-full border border-stone-200 px-6 py-2.5 text-sm text-stone-500 hover:bg-stone-100 transition-colors"
      >
        Start over
      </button>
    </main>
  )
}
```

- [ ] **Step 6: Smoke test with mock data**

In `InputPage.jsx`, temporarily hardcode a call result to verify the result page renders correctly. Replace the `handleSubmit` body with:

```js
// TEMP: mock result for UI testing
navigate('/result', {
  state: {
    result: {
      wish: "I want £10k per month, a successful business, and a big house in London.",
      data: [
        {
          wish: "I want £10k per month",
          options: [
            "So happy and grateful that I receive £10,000 every month with ease.",
            "So blessed that £10k flows to me monthly through my fulfilling work.",
            "I feel fantastic that £10,000 arrives in my account each month.",
            "So happy and grateful that my income exceeds £10k every single month.",
            "So blessed that financial abundance of £10k a month is my reality."
          ],
          visualizations: [
            "You sit at your kitchen table, phone in hand, seeing the bank notification: £10,000 received. Your chest feels light.",
            "It's the first of the month and you calmly pay every bill, knowing more is coming. There is no tension.",
            "A friend asks how business is going. You smile and say honestly: 'Really well.' You mean it.",
            "You book a weekend away without checking your balance first. The freedom feels natural now.",
            "You open your laptop, check your dashboard, and the month's total has already passed £10k. You close it and go for a walk."
          ]
        }
      ]
    }
  }
})
```

Run `npm run dev`, click submit, verify the result page looks correct.

- [ ] **Step 7: Remove the mock from `InputPage.jsx` (restore real handleSubmit)**

Restore the original `handleSubmit` from Task 3 Step 2.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ frontend/src/pages/ResultPage.jsx
git commit -m "feat: add result page components and ResultPage"
```

---

## Task 5: PHP — JsonParser utility

**Files:**
- Create: `backend/lib/JsonParser.php`

This is the most critical utility in the backend. The LLM often wraps JSON in markdown code fences. This class strips fences and validates the parsed result.

- [ ] **Step 1: Create `backend/lib/JsonParser.php`**

```php
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
```

- [ ] **Step 2: Write a quick manual test to verify parsing works**

Create `backend/test-json-parser.php` (delete after testing):

```php
<?php
require_once __DIR__ . '/lib/JsonParser.php';

// Test 1: clean JSON
$result = JsonParser::parse('{"options": ["a", "b"]}', ['options']);
assert($result['options'] === ['a', 'b'], 'Test 1 failed');
echo "Test 1 passed\n";

// Test 2: JSON wrapped in fences
$result = JsonParser::parse("```json\n{\"options\": [\"a\"]}\n```", ['options']);
assert($result['options'] === ['a'], 'Test 2 failed');
echo "Test 2 passed\n";

// Test 3: missing required key throws
try {
    JsonParser::parse('{"foo": "bar"}', ['options']);
    echo "Test 3 FAILED (should have thrown)\n";
} catch (RuntimeException $e) {
    echo "Test 3 passed: {$e->getMessage()}\n";
}

// Test 4: invalid JSON throws
try {
    JsonParser::parse('{not valid json}', []);
    echo "Test 4 FAILED (should have thrown)\n";
} catch (RuntimeException $e) {
    echo "Test 4 passed: {$e->getMessage()}\n";
}

echo "All tests passed.\n";
```

Run: `php backend/test-json-parser.php`

Expected output:
```
Test 1 passed
Test 2 passed
Test 3 passed: Missing required key: options
Test 4 passed: JSON decode error: Syntax error
All tests passed.
```

- [ ] **Step 3: Delete test file**

```bash
rm backend/test-json-parser.php
```

- [ ] **Step 4: Commit**

```bash
git add backend/lib/JsonParser.php
git commit -m "feat: add JsonParser utility for LLM response handling"
```

---

## Task 6: PHP — OpenRouterClient

**Files:**
- Create: `backend/lib/OpenRouterClient.php`

- [ ] **Step 1: Create `backend/lib/OpenRouterClient.php`**

```php
<?php

class OpenRouterClient
{
    private string $apiKey;
    private string $model;
    private string $baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

    public function __construct(string $apiKey, string $model = 'google/gemini-2.5-flash-preview')
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

        return $decoded['choices'][0]['message']['content'] ?? '';
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/lib/OpenRouterClient.php
git commit -m "feat: add OpenRouterClient HTTP wrapper"
```

---

## Task 7: PHP — WishExtractor (Stage 1)

**Files:**
- Create: `backend/lib/WishExtractor.php`

- [ ] **Step 1: Create `backend/lib/WishExtractor.php`**

```php
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/lib/WishExtractor.php
git commit -m "feat: add WishExtractor for Stage 1 pipeline"
```

---

## Task 8: PHP — KriyashaktiGenerator (Stage 2)

**Files:**
- Create: `backend/lib/KriyashaktiGenerator.php`

- [ ] **Step 1: Create `backend/lib/KriyashaktiGenerator.php`**

```php
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

        return $parsed['options'];
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add backend/lib/KriyashaktiGenerator.php
git commit -m "feat: add KriyashaktiGenerator for Stage 2 pipeline"
```

---

## Task 9: PHP — VisualizationGenerator (Stage 3)

**Files:**
- Create: `backend/lib/VisualizationGenerator.php`

- [ ] **Step 1: Create `backend/lib/VisualizationGenerator.php`**

```php
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
```

- [ ] **Step 2: Commit**

```bash
git add backend/lib/VisualizationGenerator.php
git commit -m "feat: add VisualizationGenerator for Stage 3 pipeline"
```

---

## Task 10: PHP — process-wish endpoint

**Files:**
- Create: `backend/api/process-wish.php`
- Create: `backend/.env.example`

This is the entry point that wires everything together.

- [ ] **Step 1: Create `backend/.env.example`**

```
OPENROUTER_API_KEY=your_openrouter_key_here
ALLOWED_ORIGIN=https://your-github-pages-url.github.io
```

- [ ] **Step 2: Create `backend/api/process-wish.php`**

```php
<?php

// Allow from GitHub Pages origin only
$allowedOrigin = getenv('ALLOWED_ORIGIN') ?: '';
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedOrigin && $origin === $allowedOrigin) {
    header("Access-Control-Allow-Origin: {$origin}");
} elseif (!$allowedOrigin) {
    // Dev fallback: allow all (remove in production)
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
```

- [ ] **Step 3: Set up `.env` on your PHP server**

SSH into your server and create the `.env` file (or set environment variables through your server's control panel):

```
OPENROUTER_API_KEY=sk-or-...your-real-key...
ALLOWED_ORIGIN=https://yourusername.github.io
```

The PHP script reads these via `getenv()`. If your server doesn't support dotenv files natively, you may need to set these in Apache's `VirtualHost` config using `SetEnv`, or in your PHP-FPM pool config.

- [ ] **Step 4: Test endpoint with curl**

```bash
curl -X POST https://your-server.com/api/process-wish \
  -H "Content-Type: application/json" \
  -d '{"wish": "I want £10k per month and a house in London"}'
```

Expected: JSON response with `wish`, `data` array containing `wish`, `options` (5 items), `visualizations` (5 items).

Test error case:

```bash
curl -X POST https://your-server.com/api/process-wish \
  -H "Content-Type: application/json" \
  -d '{"wish": "what is the capital of France"}'
```

Expected: `{"error":"Please describe a personal goal or desire."}`

- [ ] **Step 5: Commit**

```bash
git add backend/
git commit -m "feat: add PHP process-wish endpoint and pipeline orchestration"
```

---

## Task 11: GitHub Actions deployment workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci
        working-directory: frontend

      - name: Build
        run: npm run build
        working-directory: frontend
        env:
          VITE_API_BASE: ${{ secrets.VITE_API_BASE }}

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/dist

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Add `VITE_API_BASE` secret to your GitHub repo**

In your GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**

Name: `VITE_API_BASE`
Value: `https://your-actual-server.com`

- [ ] **Step 3: Enable GitHub Pages in repository settings**

In your GitHub repo: **Settings → Pages**
- Source: **GitHub Actions**

- [ ] **Step 4: Update `vite.config.js` base path**

Edit `frontend/vite.config.js` and set `base` to match your GitHub repo name:

```js
base: '/your-repo-name/', // e.g. '/kriyashakti-ai/'
```

- [ ] **Step 5: Commit and push to trigger deployment**

```bash
git add .github/ frontend/vite.config.js
git commit -m "feat: add GitHub Actions deploy workflow for GitHub Pages"
git push origin main
```

- [ ] **Step 6: Verify deployment**

Go to your GitHub repo → **Actions** tab. Watch the `Deploy to GitHub Pages` workflow run. When it completes, visit `https://yourusername.github.io/your-repo-name/` and confirm the app loads.

---

## Task 12: End-to-end smoke test

- [ ] **Step 1: Full flow test**

Open `https://yourusername.github.io/your-repo-name/` in a browser.

Enter this wish:
```
I want £10k per month, a successful business, and a house in London near my family.
```

Click "Shape my wish".

Expected:
- Loading state ("Shaping…") shows
- After ~10–30 seconds, result page renders
- "Your Original Wish" section shows the original text
- "Your Core Intentions" shows 2–3 pill chips (one per extracted wish)
- Each extracted wish has its own section with a SuggestionSlider
- Each slider shows a Kriyashakti statement and a visualization
- Prev/Next navigation works, showing 1/5 through 5/5

- [ ] **Step 2: Error case test**

Enter:
```
Who won the 2022 World Cup?
```

Expected:
- Error message appears: "Please describe a personal goal or desire."

- [ ] **Step 3: Empty input test**

Click submit with empty textarea.

Expected: Browser native validation prevents submission (due to `required` attribute on textarea).

- [ ] **Step 4: Start over test**

On the result page, click "Start over". Expected: navigates back to `/` (input page) with the textarea empty.

---

## Self-Review

### Spec coverage check

| Requirement | Covered in |
|---|---|
| User writes wish in free text | Task 3 — WishForm |
| Frontend sends wish to PHP backend | Task 2 — processWish.js |
| Stage 1: wish extraction | Task 7 — WishExtractor.php |
| Stage 2: Kriyashakti generation (5 per wish) | Task 8 — KriyashaktiGenerator.php |
| Stage 3: visualization generation (5 per set) | Task 9 — VisualizationGenerator.php |
| Backend returns structured JSON | Task 10 — process-wish.php |
| Frontend renders original wish | Task 4 — OriginalWishCard |
| Frontend renders core intentions as chips | Task 4 — CoreIntentionsChips |
| Frontend renders suggestion carousel | Task 4 — SuggestionSlider |
| JSON parsing with fence stripping | Task 5 — JsonParser.php |
| OpenRouter key stays on server | Task 6 — OpenRouterClient.php (server-side only) |
| CORS locked to GitHub Pages origin | Task 10 — process-wish.php CORS headers |
| Frontend deployed to GitHub Pages | Task 11 — deploy.yml |
| Hash routing for GitHub Pages | Task 1 — HashRouter in main.jsx |
| No accounts/DB/history | Entire plan — stateless throughout |
| Error responses | Task 10 — jsonError() + Task 3 — error state |
| Graceful failure on invalid model output | Task 5 — JsonParser throws, Task 10 catches |

All spec requirements are covered.

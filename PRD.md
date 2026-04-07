# Kriyashakti AI

## Product Requirements Document — Prototype v1

## 1. Product overview

Kriyashakti AI helps users turn a messy, diary-like expression of desire into:

* clear core intentions
* Kriyashakti statements
* paired visualizations

The product is not a chatbot. It is a focused transformation tool that takes unclear input and returns a structured result.

## 2. Product goal

Help users who struggle to clearly define what they want by allowing them to:

* write naturally, without pressure
* receive a breakdown of the main wishes inside their input
* get suggested Kriyashakti statements for each wish
* get matching visualizations that make the result feel real

## 3. Core user insight

Users often do not begin with a clean goal.

Their input is usually:

* vague
* emotional
* bundled
* repetitive
* more like a journal sketch than a clear request

The system must accept this and create clarity from it.

## 4. Prototype scope

This prototype should be:

* very low cost
* simple to deploy
* stateless
* easy to rebuild later in a larger architecture

For v1, there will be:

* no accounts
* no database
* no saved history
* no background jobs
* no email delivery requirement

## 5. Technical architecture

### Frontend

* React
* Vite
* static SPA
* deployed to GitHub Pages

GitHub Pages can publish from a branch or via GitHub Actions, and GitHub’s docs note that GitHub Actions is the recommended approach when you want a custom build process. ([GitHub Docs][2])

### Backend

* existing PHP server
* a few lightweight API endpoints
* server-side OpenRouter calls
* no framework required beyond whatever is simplest on your server

### AI layer

* OpenRouter
* Gemini 2.5 Flash

## 6. High-level system flow

1. User opens the SPA
2. User writes a wish in free text
3. SPA sends the wish to the PHP backend
4. Backend runs the AI pipeline
5. Backend returns structured JSON
6. SPA renders the results

## 7. Recommended deployment setup

### Frontend

Use GitHub Pages for the SPA.

Why:

* free static hosting
* suitable for React/Vite output
* simple Git-based deployment
* custom domain support is available if needed later ([GitHub Docs][1])

### Backend

Use your existing PHP server for:

* `/api/process-wish`
* optional split endpoints later if needed

Why:

* avoids paying for a Node host
* avoids cold-start issues from free app platforms
* keeps the OpenRouter key off the frontend

## 8. Product flow

### Step 1: user input

The user writes a wish in natural language.

Example:
“I want £10k per month, a successful business, and a big house in London near my family.”

### Step 2: backend processing

The PHP endpoint receives the wish and runs:

1. wish extraction
2. Kriyashakti generation
3. visualization generation

### Step 3: frontend rendering

The SPA shows:

* original wish
* core intentions as chips
* one section per clarified wish
* a suggestion slider or card stack

## 9. Backend API design

## Primary endpoint

### `POST /api/process-wish`

Request:

```json
{
  "wish": "string"
}
```

Response:

```json
{
  "wish": "string",
  "data": [
    {
      "wish": "string",
      "options": ["string", "string", "string", "string", "string"],
      "visualizations": ["string", "string", "string", "string", "string"]
    }
  ]
}
```

## Error response

```json
{
  "error": "Please describe a personal goal or desire."
}
```

or

```json
{
  "error": "Something went wrong. Please try again."
}
```

## 10. Backend responsibilities

The PHP backend should:

* validate incoming request body
* call OpenRouter for wish extraction
* parse and validate returned JSON
* loop through extracted wishes
* call OpenRouter for Kriyashakti generation per wish
* call OpenRouter for visualization generation per generated set
* merge everything into one response
* return JSON to the SPA

## 11. Internal processing pipeline

## Stage 1: wish extraction

Input:

* raw user wish

Output:

```json
{
  "options": [
    "I want ...",
    "I want ..."
  ]
}
```

Responsibilities:

* check whether input contains a valid personal desire
* split distinct wishes
* keep dependent wishes grouped where needed
* normalize wording into simple, first-person form
* remove duplicates

## Stage 2: Kriyashakti generation

Input:

* one extracted wish

Output:

```json
{
  "options": [
    "So happy and grateful that ...",
    "So blessed that ...",
    "I feel fantastic that ...",
    "So happy and grateful that ...",
    "So blessed that ..."
  ]
}
```

Requirements:

* exactly 5 outputs
* one sentence each
* simple language
* present or completed end-state
* preserve intent of the source wish

## Stage 3: visualization generation

Input:

* array of generated Kriyashakti statements

Output:

```json
{
  "visualizations": [
    "...",
    "...",
    "...",
    "...",
    "..."
  ]
}
```

Requirements:

* exactly 5 visualizations
* each visualization aligns by position to one Kriyashakti option
* sensory, grounded, emotionally certain
* 1–3 sentences

## 12. Frontend requirements

## Routes

### `/`

Main input screen with:

* title
* tagline
* textarea
* submit button

### `/result`

Result screen that renders the returned JSON

You can also do this as a single-page flow without separate routes if you want the simplest prototype.

## Components

* `WishForm`
* `LoadingState`
* `OriginalWishCard`
* `CoreIntentionsChips`
* `ClarifiedWishSection`
* `SuggestionSlider`

## 13. UX requirements

The experience should feel:

* calm
* guided
* low-pressure
* clear

The user should never feel they need to “get it right” before submitting.

Suggested top-line copy:
**Say it however it comes. We’ll shape it into a clear Kriyashakti.**

## 14. UI output structure

### Section 1

**Your Original Wish**

### Section 2

**Your Core Intentions**

* rendered as pill chips, not bullets

### Section 3

For each clarified wish:

* section title
* suggestion carousel or stacked cards
* each suggestion includes:

  * **Kriyashakti Statement**
  * **Visualization**

## 15. JSON parsing requirements

Because LLMs may return malformed JSON or wrap JSON in code fences, the backend must:

* strip markdown fences if present
* parse JSON safely
* validate expected fields
* fail gracefully on invalid model output

This is critical.

## 16. Security requirements

* OpenRouter API key must remain on the PHP server
* frontend must never call OpenRouter directly
* sanitize displayed text before rendering into HTML
* enable CORS on the PHP endpoint only for your GitHub Pages origin

## 17. Deployment requirements

## Frontend deployment

Deploy the Vite `dist` output to GitHub Pages.

GitHub Pages supports publishing from a chosen branch/folder or via GitHub Actions. For a Vite SPA, GitHub Actions is usually the cleaner route because it handles the build before publish. ([GitHub Docs][2])

## Backend deployment

Deploy PHP scripts to your existing server.

Minimum requirement:

* HTTPS enabled
* JSON request handling
* outbound HTTP requests to OpenRouter
* CORS headers for your Pages domain

## 18. GitHub Pages caveats

GitHub Pages is a strong fit for the SPA, but keep these constraints in mind:

* it is **static hosting only**
* it does **not** run PHP or other server-side languages
* you may need SPA routing handling for refreshes on deep links
* GitHub Pages has usage limits such as a recommended source repository size limit of 1 GB ([GitHub Docs][1])

For the prototype, the easiest setup is often:

* use hash routing in React, or
* keep the app mostly single-route

## 19. Out of scope for v1

* authentication
* persistence
* history
* analytics dashboard
* admin tools
* email delivery
* saved favorites
* user accounts

## 20. Success criteria

The prototype is successful if:

* a user can write one messy wish
* the frontend sends it to the PHP backend
* the backend returns structured extracted wishes
* for each wish, 5 Kriyashakti statements are generated
* for each set, 5 visualizations are generated
* the SPA renders the result clearly
* the full system runs at effectively zero hosting cost beyond your existing PHP server

## 21. Recommended final setup

### Best setup for your current situation

* **SPA:** React + Vite on **GitHub Pages**
* **API:** PHP on your existing server
* **AI calls:** OpenRouter from PHP
* **Routing:** keep simple; preferably single-screen or hash router
* **State:** local component state only, unless TanStack Query already helps your UI flow

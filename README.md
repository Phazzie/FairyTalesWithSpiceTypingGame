# 🐺 Fairytales with Spice

A single-player AI-powered werewolf romance typing game built with SvelteKit.

## What is it?

Configure a 3-chapter werewolf romance story, watch the server generate and grade it via xAI Grok, then play through the chapters by typing phrases before **Shiva the wolf** escapes. Catching phrases reveals prose; missing them doesn't. Build combos for bonus points.

## Core loop

```
Select settings → Generate story → Type phrases → Chapter results → Final story reveal
```

1. Choose a **spice level** (1–5), **game speed**, and exactly **3 themes**
2. Optionally add character/setting details
3. Hit **Generate My Story** — the server generates, grades (up to 3 retries), and falls back to a built-in demo story if needed
4. Type phrases before Shiva crosses the escape threshold
5. Caught phrases reveal prose segments and award score/combo
6. Missed phrases reset your combo
7. Three chapters → final story screen

## Setup

```sh
npm install
```

### Required environment variable

| Variable | Description |
|---|---|
| `GROK_API_KEY` | xAI API key — **server-side only**, never exposed to the browser |

Create a `.env` file in the project root:

```
GROK_API_KEY=your_key_here
```

## Developing

```sh
npm run dev
```

## Building

```sh
npm run build
npm run preview
```

## Testing

```sh
npm test
```

Unit tests cover: AI response parser, schema validators, phrase fallback extraction, scoring/combo utilities, and localStorage save/resume.

## Architecture highlights

- **Server-side AI only**: `/api/generate-story` and `/api/extract-phrases` routes call xAI; the browser never touches the provider
- **Defensive parsing**: AI responses are fence-stripped, JSON-extracted, repaired, and schema-validated before use; malformed output triggers fallback
- **Strict phase machine**: `START → GENERATING → GRADING → EXTRACTING → GAMEPLAY → CHAPTER_COMPLETE → STORY_COMPLETE`
- **Local save/resume**: auto-saves every 5 seconds during gameplay; rejects saves older than 24 h or structurally corrupt


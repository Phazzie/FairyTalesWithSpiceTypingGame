# Fairytales with Spice

**Steam.** A werewolf romance typing game set on a fogged-up bathroom mirror at night. You tell the mirror what you want (three themes, plus who she is, who he is, where, and what starts it), and xAI Grok writes a spicy three-night story from it. Each line shows up through the steam; type it before Shiva slips into the fog bank. Whatever you miss is **[fogged over]** for good, and at the end you see how much of the night is still on the glass.

A Skeptical Wombat production. Game by Phazzie.

## How a game runs

```
Tell the mirror → Running the water (story is written) → Night One → End of the night → Night Two → … → Night Three → The whole mirror
```

1. **The start page**: "Tell the mirror what you want" is up front: pick exactly three themes, and optionally fill in Her, Him, Where and What starts it. All of it goes into the story prompt. Then pick how hot the water is (spice 1-5, Lukewarm to "Don't touch the dial") and how fast the fog comes back (game speed).
2. **Running the water**: the server asks xAI (grok-3-mini) for a fresh 3-chapter story, about 40 seconds, plus a few seconds to pick the lines for Night One. If every attempt fails it uses a built-in story.
3. **Each night** (a chapter): type the line before Shiva reaches the steam. Kept lines add Heat (score); a streak ("Don't stop ×N") adds more. Enter on a wrong line, or letting him vanish, fogs the line over.
4. **Water's off**: Escape, the Pause button, or leaving the tab pauses. "Leave it for later" saves; the start page offers "Pick up where you left off".
5. **End of the night**: the night's tally and the night's story, with missed lines shown as [fogged over: N words].
6. **The whole mirror**: CRYSTAL CLEAR, STEAMY, HAZY or FOGGED OVER depending on accuracy, then all three nights. It prints cleanly ("Print what's left").

## Setup

```sh
npm install
```

### Required environment variable

| Variable | Description |
|---|---|
| `XAI_API_KEY` | xAI API key (`GROK_API_KEY` also works) — **server-side only**, never exposed to the browser |

Create a `.env` file in the project root:

```
XAI_API_KEY=your_key_here
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

`npm test` starts Vitest in watch mode. CI runs `npm run test:run` (`vitest run`) so the job exits.

End-to-end tests (`npm run test:e2e`, Playwright) build the app and play it in a real browser with no AI key: theme picking, a full three-chapter run, misses and combo breaks, pause/quit/resume, the error screen, and the phone layout.

Unit tests cover: AI response parser, schema validators, phrase fallback extraction, scoring/combo utilities, and localStorage save/resume.

## Architecture highlights

- **Server-side AI only**: `/api/generate-story` and `/api/extract-phrases` routes call xAI; the browser never touches the provider
- **Defensive parsing**: AI responses are fence-stripped, JSON-extracted, repaired, and schema-validated before use; malformed output triggers fallback
- **Strict phase machine**: `START → GENERATING → GRADING → EXTRACTING → GAMEPLAY → CHAPTER_COMPLETE → STORY_COMPLETE`
- **Local save/resume**: auto-saves every 5 seconds during gameplay; rejects saves older than 24 h or structurally corrupt


## Design notes

- The whole game is one bathroom mirror: dark teal tile, a brass-framed fogged glass with droplets, words you type look wiped through the steam with a fingertip (Nothing You Could Do), story prose in Cormorant Garamond, labels in Jost. One candle lights it. Fonts load from Google Fonts.
- All the game's wording lives in `src/lib/steam.ts`. The transcript logic (what was fogged, final verdicts) is in `src/lib/utils/transcript.ts`.

## What's still rough

- **The first story takes about a minute to arrive.** The loading screen keeps the joke going, but it is a long "All rise". Without `XAI_API_KEY` every trial is the same built-in story (Elara and Caden).
- The game needs a keyboard. It works on a phone with the on-screen keyboard, but it's cramped.
- Line numbers in the margin are decorative; they don't line up exactly with every line of text the way real pleading paper does.
- Accuracy on the verdict counts lines (phrases), while the transcript counts words lost. They can disagree slightly.

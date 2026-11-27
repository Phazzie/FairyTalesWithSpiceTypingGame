# Fairytales with Spice

**In re Fairytales with Spice.** A werewolf romance typing game, dressed as a court case. You are the court reporter at the trial of *The People of Moonfall County v. Shiva, a wolf*. The testimony is a spicy three-chapter werewolf romance written by xAI Grok. Type each line off the stenograph tape before Shiva reaches the courtroom door. Whatever you miss goes into the official record as **[INAUDIBLE]**, and at the end the jury rules on how much of the romance survived.

A Skeptical Wombat production. Game by Phazzie.

## How a trial runs

```
Filing → All rise (story is written) → Day One → Adjourned → Day Two → Adjourned → Day Three → Verdict + certified transcript
```

1. **The filing** (start screen): pick the rating of the proceedings (spice 1-5, from "G: family court" to "SEALED: clear the gallery"), the rate of speech (game speed), and exactly three counts charged (story themes). Exhibits A-D are optional story details.
2. **All rise**: the server writes the story, has it graded (up to 3 tries) and falls back to a built-in story if needed.
3. **Each day of testimony** (a chapter): type the line on the tape before Shiva reaches the EXIT. Caught lines go on the record and earn the reporter's fee (score); an unbroken run (combo) pays more. Enter on a wrong line, or letting Shiva reach the door, strikes the line: "Objection!", and it goes in as [INAUDIBLE].
4. **Recess**: Escape, the Recess button, or leaving the tab pauses. "Adjourn & save" saves for later; the start screen offers to reconvene.
5. **Adjourned**: the day's tally and the day's transcript, with your missed lines struck out and a word count of what was lost.
6. **Verdict**: GUILTY, HUNG JURY or CASE DISMISSED depending on accuracy, then the full certified transcript of all three days. It prints cleanly (Print the transcript).

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

- Everything is pleading paper: numbered left margin, double red rule, Courier Prime testimony, Libre Caslon court headings, rubber stamps (CSS masks for uneven ink). The desk around the paper is walnut. Fonts load from Google Fonts.
- All court wording lives in `src/lib/court.ts`. The transcript logic (what was struck, verdicts) is in `src/lib/utils/transcript.ts`.

## What's still rough

- **Without `XAI_API_KEY` every trial is the same built-in story** (Elara and Caden). The game works, but replays get repetitive. Add the key in Vercel to get a new story each time.
- The game needs a keyboard. It works on a phone with the on-screen keyboard, but it's cramped.
- Line numbers in the margin are decorative; they don't line up exactly with every line of text the way real pleading paper does.
- Accuracy on the verdict counts lines (phrases), while the transcript counts words lost. They can disagree slightly.

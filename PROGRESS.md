# PROGRESS: Fairytales with Spice (typing game)

## Morning report

**Fairytales with Spice: DONE** by the definition, with one caveat below.
- **World:** you're the court reporter at *The People of Moonfall County v. Shiva, a wolf*. The romance is the testimony; every line you miss goes on the record as [INAUDIBLE], and a jury rules on what survived.
- **Private preview:** https://fairytales-typing-game-git-claude-proj-a34dad-phazzies-projects.vercel.app (branch `claude/project-thread-eozle3`). **Update:** PR #5 was merged to main on 27 Nov, so the courtroom version is now the live, public site at https://fairytales-typing-game.vercel.app.
- **Honest score: 8/10.** The world runs every screen and the joke lands. It loses points because without your xAI key every trial is the same story, and on a phone it's playable but cramped.
- **Still rough:** same story every time until `GROK_API_KEY` is set; phone play is tight with the keyboard up; margin line numbers are decorative and don't line up with every line of text.
- **Boldest bit:** the "CONTAINS EXPLICIT TESTIMONY" stamp on the front page and the SEALED rating ("minors and grandmothers must leave"). This is the one that could embarrass you.
- **Caveat on "nothing public":** the production site at https://fairytales-typing-game.vercel.app is public. Since PR #5 merged it serves the courtroom version.

**What I tested by hand (laptop 1280px and iPhone 13 size, real Chromium):** filing with all four sections and exhibits; the refusal when fewer than three counts; All rise loading; typing lines (caught, wrong letters, Enter on a wrong line, the wolf reaching the door); OBJECTION! slam; recess by Escape and by leaving the tab; reconvene refocuses typing; adjourn and save, then reconvene from the start page with progress kept; all three days to the verdict; 3 misses produce exactly 3 [INAUDIBLE] marks on that day's transcript; certified transcript; mistrial when the server fails, and a retrial keeps your choices. No console errors, no sideways scroll on either size. Plus 69 unit tests and 13 end-to-end browser tests, all passing.


## The world

- **Core idea, one sentence:** a spicy werewolf romance you only get to keep the parts of that you typed fast enough.
- **Obvious version (not building it):** a dark purple night-sky page with a glowing wolf, a moon hero banner, a "Start your story" button and three feature cards.
- **Three pitches:**
  1. **Court stenographer.** You are the court reporter at a scandalous werewolf trial. Every line you fail to type enters the official record as [INAUDIBLE].
  2. **1-900-WEREWOLF.** A late-night premium-rate hotline infomercial. You're the operator typing up the caller's fantasy before they hang up.
  3. **Drugstore paperback.** A mass-market clinch-cover romance you typeset yourself; missed lines print as misprints.
- **Picked: the court stenographer.** Typing is literally a court reporter's job, so the game and the world are the same thing, and every screen has a reason to exist (recess, mistrial, certified transcript). Missing a line finally *means* something: it's a hole in the record. And reading spicy werewolf testimony into a dead-serious legal transcript in Courier is the joke that could embarrass you. Spice level 5 is "SEALED: clear the gallery".

## Choices I made on my own (check these)

- Opened PR #5 so the bots review it, but did **not** merge it. Merge it when you like the preview; that will replace the public version.
- The branch had old commits from PR #4 that were already squash-merged. Instead of force-pushing I recorded them with a no-change merge commit, so nothing was deleted.
- Score is shown as the "reporter's fee" in dollars, and combos as an "unbroken record".
- Verdict thresholds: 100% flawless GUILTY, 80%+ GUILTY, 50%+ HUNG JURY, below that CASE DISMISSED.
- Fonts (Courier Prime, Libre Caslon Text, Mrs Saint Delafield) load from Google Fonts. Free.
- Spent $0. Didn't use RunPod.

- Branch `claude/project-thread-eozle3`, restarted from `main` after PR #4 merged. Nothing goes to `main` from here; the overnight brief replaced the old merge rule.
- The live site (https://fairytales-typing-game.vercel.app) is **public** and shows the pre-world version from PR #4. I left it alone. The new world is only on the private branch preview.
- Shiva the wolf becomes the defendant: "The People of Moonfall County v. Shiva, a wolf". Story themes become the counts on the charge sheet.
- Game speeds renamed by who's talking: Retired judge / Sworn witness / Auctioneer / Defense attorney on espresso.

## Log

- 2026-11-27 12:15 UTC: picked the world, started the build.
- 12:20: finished the missing feature: missed lines are tracked, saved, and struck from the transcript.
- 12:30: drafted every screen in the world. Round 1 review found 7 problems: stamps too faint, a gavel that looked broken, list numbers missing, a space missing in the form notes, a doubled "(3/3 selected)", a miss that didn't feel like anything, and a real bug (a missed line that crossed a paragraph break never showed as [INAUDIBLE]). Fixed all.
- 12:35: round 2: OBJECTION! covered the next line too long, verdict said "flawless" at 95%. Fixed.
- 12:40: round 3: on a phone the typing line was pushed below the fold. Tightened the trial screen. Re-shot both sizes.
- 12:45: pushed, PR #5 opened, preview deploying.

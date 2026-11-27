# GRUDGES: things that failed silently or lied

Check this before every deploy.

1. **GitHub Actions never runs.** The account is billing-locked and `.depot/workflows/ci.yml` only runs on Depot after the repo leaves GitHub. A PR shows no CI at all, which looks like "nothing failed". Only the Vercel status is real. Run `npm run check`, `npm run test:run`, `npm run test:e2e` and `npm run build` yourself.
2. **First Vercel deploy through the API went to production.** `create_deployment` with no `target` on a brand-new project made a *production* deploy of a feature branch. Always pass the target you mean, or deploy by pushing a branch (which makes a preview).
3. **The production URL served the old build after the new deploy finished.** `fairytales-typing-game.vercel.app` kept returning the previous version (empty page title) until I added `?v=2`. After any deploy, check a detail that only the new version has (page title, a new string), with a cache-busting query.
4. **No GROK_API_KEY means every player gets the same demo story, silently.** The API returns `usedFallback: true` and the UI never says so.
5. **A theme reskin can hide features without breaking a test.** The courtroom version tucked the four story details behind a collapsed "Exhibits" toggle; every test still passed because they clicked it open. A test now checks the details are visible on load and actually reach `/api/generate-story`.
6. **Full-page screenshots lie about fixed backgrounds.** `background-attachment: fixed` made the tile stop halfway down in Playwright full-page shots. Removed it rather than trust the screenshot.

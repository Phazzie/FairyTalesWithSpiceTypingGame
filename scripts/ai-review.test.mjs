import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { clipDiff, commentDestination, originCliMissing, reviewDecision, reviewPrompt } from "./ai-review.mjs";

const scriptPath = fileURLToPath(new URL("./ai-review.mjs", import.meta.url));

describe("ai review", () => {
  it("skips when the key is missing and reviews when it is set", () => {
    assert.equal(reviewDecision({}).action, "skip");
    assert.equal(reviewDecision({ XAI_API_KEY: "  " }).action, "skip");
    assert.equal(reviewDecision({ XAI_API_KEY: "xai-test" }).action, "review");
  });

  it("exits 0 when the script runs without XAI_API_KEY", () => {
    const result = spawnSync(process.execPath, [scriptPath], {
      env: { ...process.env, XAI_API_KEY: "" },
      encoding: "utf8",
    });
    assert.equal(result.status, 0);
    assert.match(result.stdout, /XAI_API_KEY is not set/);
  });

  it("clips a huge diff and keeps a short one", () => {
    assert.equal(clipDiff("small"), "small");
    const huge = "a".repeat(20_000);
    const clipped = clipDiff(huge);
    assert.equal(clipped.endsWith("[diff truncated]"), true);
    assert.equal(clipped.length < huge.length, true);
  });

  it("comments on Origin when there is a pull request and no GitHub token", () => {
    assert.equal(commentDestination({ PR_NUMBER: "8" }), "origin");
    assert.equal(commentDestination({}), "stdout");
    assert.equal(
      commentDestination({
        PR_NUMBER: "8",
        GITHUB_TOKEN: "ghs",
        GITHUB_REPOSITORY: "Phazzie/FairyTalesWithSpiceTypingGame",
      }),
      "github",
    );
  });

  it("treats a missing origin binary as a non-fatal skip", () => {
    const missing = new Error("spawn origin ENOENT");
    missing.code = "ENOENT";
    assert.equal(originCliMissing(missing), true);
    assert.equal(originCliMissing(new Error("origin pr comment failed")), false);
  });

  it("asks for bugs rather than style notes", () => {
    const prompt = reviewPrompt("diff --git a/src/lib/utils/scoring.ts");
    assert.match(prompt, /security|scoring|save\/resume/i);
    assert.match(prompt, /diff --git a\/src\/lib\/utils\/scoring.ts/);
  });
});

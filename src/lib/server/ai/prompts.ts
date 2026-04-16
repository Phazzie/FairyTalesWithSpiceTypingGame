import type { Story, GradeReport } from '../../types/domain';

export function jsonSuffix(): string {
  return 'Respond ONLY with valid JSON. No markdown fences. No explanation.';
}

export function buildStoryPrompt(
  spiceLevel: number,
  themes: string[],
  customization: {
    characterIdea?: string;
    loveInterestIdea?: string;
    setting?: string;
    plotHook?: string;
  }
): string {
  const spiceDesc = ['', 'very mild', 'mild', 'moderate', 'spicy', 'very explicit'][spiceLevel] ?? 'moderate';
  const themeList = themes.join(', ');
  const charHint = customization.characterIdea ? `Protagonist concept: ${customization.characterIdea}.` : '';
  const liHint = customization.loveInterestIdea ? `Love interest concept: ${customization.loveInterestIdea}.` : '';
  const settingHint = customization.setting ? `Setting: ${customization.setting}.` : '';
  const plotHint = customization.plotHook ? `Plot hook: ${customization.plotHook}.` : '';

  return `You are a creative fiction writer. Write a werewolf romance story with exactly 3 chapters.
Themes: ${themeList}
Romance intensity: ${spiceDesc} (spice level ${spiceLevel}/5)
${charHint} ${liHint} ${settingHint} ${plotHint}

Requirements:
- Each chapter: 400-600 words
- Chapters 1 and 2 must end with a cliffhanger
- Chapter 3 has a satisfying resolution (cliffhanger: null)
- Include werewolf transformation elements
- Build romantic tension throughout

Return this exact JSON structure:
{
  "chapters": [
    {
      "number": 1,
      "title": "Chapter title",
      "prose": "Full chapter text 400-600 words",
      "cliffhanger": "Cliffhanger sentence or null"
    },
    {
      "number": 2,
      "title": "Chapter title",
      "prose": "Full chapter text 400-600 words",
      "cliffhanger": "Cliffhanger sentence or null"
    },
    {
      "number": 3,
      "title": "Chapter title",
      "prose": "Full chapter text 400-600 words",
      "cliffhanger": null
    }
  ],
  "metadata": {
    "characterNames": {
      "alpha": "Alpha werewolf name",
      "protagonist": "Protagonist name"
    },
    "storyArc": "One sentence describing the story arc"
  }
}

${jsonSuffix()}`;
}

export function buildGradePrompt(story: Story): string {
  const storyText = story.chapters.map(c => `Chapter ${c.number}: ${c.prose}`).join('\n\n');
  return `Grade this werewolf romance story on a scale of 0-10 in these categories:
- structure: Does it have proper 3-chapter arc?
- chemistry: Is the romantic chemistry believable?
- dialogue: Is dialogue natural and engaging?
- coherence: Is the plot coherent?
- typeability: Are sentences varied and good for typing practice (2-8 word chunks)?

Story:
${storyText}

Return JSON:
{
  "overallScore": <number 0-10>,
  "passed": <true if overallScore >= 6>,
  "categoryScores": {
    "structure": <0-10>,
    "chemistry": <0-10>,
    "dialogue": <0-10>,
    "coherence": <0-10>,
    "typeability": <0-10>
  },
  "strengths": ["strength1", "strength2"],
  "flaggedIssues": ["issue1"],
  "recommendations": ["rec1"]
}

${jsonSuffix()}`;
}

export function buildRetryPrompt(story: Story, gradeReport: GradeReport): string {
  const issues = gradeReport.flaggedIssues?.join(', ') ?? 'quality below threshold';
  const recs = gradeReport.recommendations?.join('; ') ?? 'improve overall quality';
  const storyText = story.chapters.map(c => `Chapter ${c.number}: ${c.prose}`).join('\n\n');
  
  return `The following werewolf romance story scored ${gradeReport.overallScore}/10, which is below the passing score of 6.
Issues found: ${issues}
Recommendations: ${recs}

Original story:
${storyText}

Please rewrite the story addressing these issues. Maintain the same JSON structure with exactly 3 chapters (400-600 words each), cliffhangers for chapters 1 and 2, and null cliffhanger for chapter 3.

Return the same JSON structure as before.

${jsonSuffix()}`;
}

export function buildPhrasePrompt(chapterProse: string): string {
  return `Extract 12-20 typeable phrases from this story chapter for a typing game.

Chapter:
${chapterProse}

Requirements:
- Each phrase must be 2-8 words from the actual text
- Include the surrounding sentence as proseSegment
- Phrases should be interesting and varied
- Order them by their appearance in the text

Return JSON array:
[
  {
    "text": "phrase from text",
    "proseSegment": "The full sentence containing the phrase.",
    "order": 1
  }
]

${jsonSuffix()}`;
}

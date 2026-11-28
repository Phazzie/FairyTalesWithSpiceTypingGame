export type AppPhase = 
  | 'START' | 'GENERATING' | 'GRADING' | 'EXTRACTING' 
  | 'GAMEPLAY' | 'CHAPTER_COMPLETE' | 'STORY_COMPLETE' | 'ERROR';

export type SpiceLevel = 1 | 2 | 3 | 4 | 5;
export type SpeedSetting = 'relaxed' | 'normal' | 'fast' | 'intense';

export interface StoryCustomization {
  spiceLevel: SpiceLevel;
  speedSetting: SpeedSetting;
  selectedThemes: string[];
  characterIdea?: string;
  loveInterestIdea?: string;
  setting?: string;
  plotHook?: string;
  /** Set when two players wrote the two sides (see utils/couple.ts). */
  couple?: import('../utils/couple').CoupleState;
}

export interface StoryChapter {
  number: 1 | 2 | 3;
  title: string;
  prose: string;
  cliffhanger: string | null;
}

export interface StoryMetadata {
  characterNames: { alpha: string; protagonist: string };
  storyArc: string;
}

export interface Story {
  chapters: StoryChapter[];
  metadata: StoryMetadata;
}

export interface Phrase {
  text: string;
  proseSegment: string;
  order: number;
}

export interface GradeReport {
  overallScore: number;
  passed: boolean;
  categoryScores: Record<string, number>;
  flaggedIssues?: string[];
  strengths?: string[];
  recommendations?: string[];
}

export interface ChapterStats {
  chapter: number;
  caught: number;
  missed: number;
  total: number;
  accuracy: number;
  score: number;
  bestCombo: number;
}

/** What the player kept and lost for one night (chapter) of the story. */
export interface ChapterRecord {
  chapter: number;
  caughtSegments: string[];
  missedSegments: string[];
}

export interface SaveState {
  phase: AppPhase;
  story: Story;
  currentChapter: number;
  phrases: Phrase[];
  currentPhraseIndex: number;
  revealedSegments: string[];
  caughtIndices: number[];
  missedIndices: number[];
  score: number;
  combo: number;
  bestCombo: number;
  chapterStats: ChapterStats[];
  settings: StoryCustomization;
  /** Finished chapters' records. Optional so saves from before it existed still load. */
  transcript?: ChapterRecord[];
  savedAt: number;
}

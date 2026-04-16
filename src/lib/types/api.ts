import type { Story, GradeReport, Phrase } from './domain';

export interface GenerateStoryRequest {
  spiceLevel: number;
  customization: {
    selectedThemes: string[];
    characterIdea?: string;
    loveInterestIdea?: string;
    setting?: string;
    plotHook?: string;
  };
}

export interface GenerateStoryResponse {
  story: Story;
  gradeReport: GradeReport;
  usedFallback: boolean;
  attempts: number;
}

export interface ExtractPhrasesRequest {
  chapterProse: string;
}

export interface ExtractPhrasesResponse {
  phrases: Phrase[];
  usedFallback: boolean;
}

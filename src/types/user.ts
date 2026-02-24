import { LangSlug } from "./languages";

interface UserPreferences {
  preferredLanguage?: LangSlug;
  theme?: "light" | "dark" | "system";
}

export interface User {
  // doc ID = firebase auth uid
  completedProblems: string[]; // titleSlugs
  preferences: UserPreferences;
  savedProblems: string[]; // titleSlugs
}

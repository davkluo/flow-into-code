import { LangSlug } from "./languages";

export type UserRole = "user" | "power" | "admin";

interface UserPreferences {
  preferredLanguage?: LangSlug;
  theme?: "light" | "dark" | "system";
}

interface DailySessions {
  date: string; // UTC date string, e.g. "2026-02-27"
  count: number;
}

export interface User {
  // doc ID = firebase auth uid
  completedProblems: string[]; // titleSlugs
  preferences: UserPreferences;
  savedProblems: string[]; // titleSlugs
  role: UserRole;
  dailySessions?: DailySessions;
}

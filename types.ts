export interface User {
  id: string;
  name: string;
  isGuest: boolean;
  city?: string;
  region?: string;
  totalKarma: number;
  hasDismissedAuth?: boolean;
}

export interface Dilemma {
  id: string;
  scenario: string;
  context: string;
  optionsHint?: string;
}

export interface KarmicEvaluation {
  feedback: string;
  karma_score: number;
  board_movement: number;
  pragmatism: number;
  empathy: number;
  chaos: number;
  // Gita Wisdom fields
  gitaVerse: string;
  gitaCitation: string;
  gitaImagePrompt: string;
}

export interface TurnLog {
  turnNumber: number;
  tile: number;
  dilemma: string;
  response: string;
  feedback: string;
  karmaDelta: number;
  movement: number;
  gitaVerse?: string;
  gitaCitation?: string;
  gitaImageUrl?: string;
  analytics: {
    pragmatism: number;
    empathy: number;
    chaos: number;
  };
}

export interface GameState {
  currentTile: number;
  turnCount: number;
  history: TurnLog[];
  shieldActive: boolean;
  hasTagLifeline: boolean;
  stamina: number;
  isGridExpanded: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  karma: number;
  city: string;
  region: string;
  virtue?: string;
  vice?: string;
}
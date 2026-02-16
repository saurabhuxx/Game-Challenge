
export interface User {
  id: string;
  name: string;
  isGuest: boolean;
  city?: string;
  region?: string;
  totalKarma: number;
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
}

export interface TurnLog {
  turnNumber: number;
  tile: number;
  dilemma: string;
  response: string;
  feedback: string;
  karmaDelta: number;
  movement: number;
}

export interface GameState {
  currentTile: number;
  turnCount: number;
  history: TurnLog[];
  shieldActive: boolean;
  hasTagLifeline: boolean;
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
